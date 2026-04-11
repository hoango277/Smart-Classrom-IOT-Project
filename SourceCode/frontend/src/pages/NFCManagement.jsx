import React, { useState, useEffect, useRef, useCallback } from 'react';
import MainLayout from '../components/layout/MainLayout';
import mqttService from '../services/mqtt';
import nfcAPI from '../services/nfcAPI';

const TOPIC_NFC_SCANNED = 'classroom/nfc/scanned';
const TOPIC_NFC_SYNC = 'classroom/nfc/sync';
const MAX_SCAN_LOGS = 50;

const NFCManagement = () => {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fullName, setFullName] = useState('');
    const [studentId, setStudentId] = useState('');

    // Registration flow
    const [registering, setRegistering] = useState(false);
    const [scannedUid, setScannedUid] = useState(null);
    const [regStatus, setRegStatus] = useState('idle');
    const [errorMessage, setErrorMessage] = useState('');

    // Live scan log
    const [scanLogs, setScanLogs] = useState([]);
    const [liveConnected, setLiveConnected] = useState(false);
    const liveHandlerRef = useRef(null);
    const regHandlerRef = useRef(null);
    const cardsRef = useRef(cards);
    const lastScanRef = useRef({ uid: '', time: 0 });

    // Sync state
    const [syncing, setSyncing] = useState(false);

    // Attendance history
    const [historyDate, setHistoryDate] = useState(new Date().toISOString().split('T')[0]);
    const [historyLogs, setHistoryLogs] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    useEffect(() => { cardsRef.current = cards; }, [cards]);

    useEffect(() => {
        fetchCards();
        startLiveFeed();
        fetchHistory(historyDate);
        return () => stopLiveFeed();
    }, []);

    const fetchCards = async () => {
        setLoading(true);
        try {
            const res = await nfcAPI.getCards();
            setCards(res.cards || []);
        } catch (err) {
            console.error('Failed to load cards:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async (date) => {
        setHistoryLoading(true);
        try {
            const res = await nfcAPI.getLogs(date);
            setHistoryLogs(res.logs || []);
        } catch (err) {
            console.error('Failed to load history:', err);
        } finally {
            setHistoryLoading(false);
        }
    };

    // ── Live Scan Feed ──
    const startLiveFeed = async () => {
        // Cleanup any existing handler first (React Strict Mode calls useEffect twice)
        if (liveHandlerRef.current) {
            const client = mqttService.getClient();
            if (client) client.removeListener('message', liveHandlerRef.current);
            liveHandlerRef.current = null;
        }

        try {
            await mqttService.connect();
            await mqttService.subscribe(TOPIC_NFC_SCANNED);

            liveHandlerRef.current = (topic, message) => {
                if (topic === TOPIC_NFC_SCANNED) {
                    try {
                        const data = JSON.parse(message.toString());
                        if (data.uid) {
                            // Dedup: ignore same UID within 3s
                            const now = Date.now();
                            if (data.uid === lastScanRef.current.uid && now - lastScanRef.current.time < 3000) return;
                            lastScanRef.current = { uid: data.uid, time: now };

                            const card = cardsRef.current.find(
                                c => c.card_uid.toUpperCase() === data.uid.toUpperCase()
                            );
                            if (card) {
                                // Save to DB first to get checkin/checkout action
                                nfcAPI.logScan({
                                    card_uid: data.uid,
                                    student_id: card.student_id,
                                    full_name: card.full_name,
                                }).then(res => {
                                    setScanLogs(prev => [{
                                        uid: data.uid,
                                        student_id: card.student_id,
                                        full_name: card.full_name,
                                        action: res.action,
                                        timestamp: new Date(),
                                        id: now + Math.random(),
                                    }, ...prev].slice(0, MAX_SCAN_LOGS));
                                }).catch(err => console.error('[NFC] Log save failed:', err));
                            }
                        }
                    } catch (e) { /* ignore */ }
                }
            };
            mqttService.on('message', liveHandlerRef.current);
            setLiveConnected(true);
        } catch (err) {
            console.error('[NFC Live] Failed to connect:', err);
            setLiveConnected(false);
        }
    };

    const stopLiveFeed = () => {
        if (liveHandlerRef.current) {
            const client = mqttService.getClient();
            if (client) client.removeListener('message', liveHandlerRef.current);
            liveHandlerRef.current = null;
        }
        setLiveConnected(false);
    };

    // ── Registration Flow ──
    const startRegistration = async () => {
        if (!fullName.trim() || !studentId.trim()) {
            setErrorMessage('Vui long nhap ma sinh vien va ho ten');
            return;
        }
        setErrorMessage('');
        setScannedUid(null);
        setRegStatus('waiting');
        setRegistering(true);

        regHandlerRef.current = (topic, message) => {
            if (topic === TOPIC_NFC_SCANNED) {
                try {
                    const data = JSON.parse(message.toString());
                    if (data.uid) {
                        setScannedUid(data.uid);
                        setRegStatus('scanned');
                    }
                } catch (e) { /* ignore */ }
            }
        };
        mqttService.on('message', regHandlerRef.current);
    };

    const cancelRegistration = () => {
        if (regHandlerRef.current) {
            const client = mqttService.getClient();
            if (client) client.removeListener('message', regHandlerRef.current);
            regHandlerRef.current = null;
        }
        setRegistering(false);
        setRegStatus('idle');
        setScannedUid(null);
        setErrorMessage('');
    };

    const confirmRegistration = async () => {
        if (!scannedUid) return;
        setRegStatus('saving');
        try {
            await nfcAPI.registerCard({
                card_uid: scannedUid,
                student_id: studentId.trim(),
                full_name: fullName.trim(),
            });
            await mqttService.publish(TOPIC_NFC_SYNC, JSON.stringify({
                action: 'add',
                uid: scannedUid,
                username: fullName.trim(),
            }));
            setRegStatus('success');

            if (regHandlerRef.current) {
                const client = mqttService.getClient();
                if (client) client.removeListener('message', regHandlerRef.current);
                regHandlerRef.current = null;
            }
            await fetchCards();

            setTimeout(() => {
                setRegistering(false);
                setRegStatus('idle');
                setScannedUid(null);
                setFullName('');
                setStudentId('');
            }, 2000);
        } catch (err) {
            setRegStatus('error');
            setErrorMessage(err.message || 'Dang ky that bai');
        }
    };

    // ── Sync all cards to ESP8266 ──
    const syncToEsp = async () => {
        setSyncing(true);
        try {
            await mqttService.connect();
            const syncData = await nfcAPI.getSyncData();
            await mqttService.publish(TOPIC_NFC_SYNC, JSON.stringify({
                action: 'sync_all',
                cards: syncData,
            }));
            alert(`Dong bo thanh cong ${syncData.length} the den ESP8266`);
        } catch (err) {
            alert('Dong bo that bai: ' + err.message);
        } finally {
            setSyncing(false);
        }
    };

    const handleDelete = async (card) => {
        if (!confirm(`Xoa the ${card.card_uid} (${card.student_id} - ${card.full_name})?`)) return;
        try {
            await nfcAPI.deleteCard(card.id);
            await mqttService.publish(TOPIC_NFC_SYNC, JSON.stringify({
                action: 'remove',
                uid: card.card_uid,
            }));
            await fetchCards();
        } catch (err) {
            alert('Xoa that bai: ' + err.message);
        }
    };

    const formatTime = (date) => {
        if (typeof date === 'string') date = new Date(date);
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    return (
        <MainLayout>
            <div className="max-w-6xl mx-auto space-y-8">
                <header>
                    <h1 className="text-3xl font-bold text-white mb-2">NFC Card Management</h1>
                    <p className="text-text-muted text-sm">Dang ky, quan ly the NFC va theo doi diem danh realtime.</p>
                </header>

                {/* ── Live Scan Dashboard ── */}
                <div className="bg-surface rounded-3xl p-8 border border-white/5">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-bold text-white">Live Scan Monitor</h2>
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                                liveConnected ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                            }`}>
                                <div className={`w-2 h-2 rounded-full ${
                                    liveConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                                }`} />
                                {liveConnected ? 'LIVE' : 'DISCONNECTED'}
                            </div>
                        </div>
                        <button
                            onClick={() => setScanLogs([])}
                            className="text-text-muted text-xs hover:text-white transition-colors"
                        >
                            Clear
                        </button>
                    </div>

                    <div
                        className="bg-background rounded-2xl border border-white/5 overflow-hidden"
                        style={{ maxHeight: '280px', overflowY: 'auto' }}
                    >
                        {scanLogs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-text-muted">
                                <NfcIcon className="w-10 h-10 mb-3 opacity-30" />
                                <p className="text-sm">Dang cho quet the...</p>
                                <p className="text-xs mt-1 opacity-50">Chi hien thi the da dang ky, tu dong luu diem danh</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {scanLogs.map((log) => {
                                    const isCheckin = log.action === 'checkin';
                                    return (
                                        <div key={log.id} className="flex items-center justify-between px-5 py-3 hover:bg-white/[0.02] transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                                    isCheckin ? 'bg-green-500/15' : 'bg-orange-500/15'
                                                }`}>
                                                    {isCheckin
                                                        ? <CheckIcon className="w-4 h-4 text-green-500" />
                                                        : <LogoutIcon className="w-4 h-4 text-orange-500" />
                                                    }
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-white text-sm font-medium">
                                                            {log.student_id} - {log.full_name}
                                                        </span>
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                                            isCheckin
                                                                ? 'bg-green-500/10 text-green-500'
                                                                : 'bg-orange-500/10 text-orange-500'
                                                        }`}>
                                                            {isCheckin ? 'CHECK IN' : 'CHECK OUT'}
                                                        </span>
                                                    </div>
                                                    <p className="text-text-muted text-xs font-mono mt-0.5">{log.uid}</p>
                                                </div>
                                            </div>
                                            <span className="text-text-muted text-xs font-mono">{formatTime(log.timestamp)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Two Column: Register + Card List ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Registration */}
                    <div className="bg-surface rounded-3xl p-8 border border-white/5">
                        <h2 className="text-lg font-bold text-white mb-6">Dang Ky The Moi</h2>
                        {!registering ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-text-muted mb-2">Ma sinh vien</label>
                                    <input
                                        type="text"
                                        value={studentId}
                                        onChange={(e) => setStudentId(e.target.value)}
                                        placeholder="VD: B22DCCN326"
                                        className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white placeholder-text-muted/50 focus:outline-none focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-text-muted mb-2">Ho va ten</label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="VD: Ngo Xuan Hoa"
                                        className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white placeholder-text-muted/50 focus:outline-none focus:border-primary"
                                    />
                                </div>
                                {errorMessage && (
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-500 text-sm">{errorMessage}</div>
                                )}
                                <button
                                    onClick={startRegistration}
                                    className="w-full py-4 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all"
                                >
                                    Bat Dau Dang Ky
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="text-center py-6">
                                    {regStatus === 'waiting' && (
                                        <>
                                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                                                <NfcIcon className="w-8 h-8 text-primary" />
                                            </div>
                                            <p className="text-white font-medium">Dang cho quet the...</p>
                                            <p className="text-text-muted text-xs mt-2">
                                                Dang ky cho: <span className="text-white">{studentId} - {fullName}</span>
                                            </p>
                                        </>
                                    )}
                                    {regStatus === 'scanned' && (
                                        <>
                                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                                                <CheckIcon className="w-8 h-8 text-green-500" />
                                            </div>
                                            <p className="text-white font-medium">Da quet the!</p>
                                            <div className="mt-3 bg-background rounded-xl p-3 inline-block">
                                                <p className="text-text-muted text-[10px]">UID</p>
                                                <p className="text-white text-xl font-mono font-bold tracking-wider">{scannedUid}</p>
                                            </div>
                                            <p className="text-text-muted text-sm mt-3">
                                                Gan cho: <span className="text-white font-medium">{studentId} - {fullName}</span>
                                            </p>
                                        </>
                                    )}
                                    {regStatus === 'saving' && (
                                        <>
                                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/20 flex items-center justify-center animate-pulse">
                                                <NfcIcon className="w-8 h-8 text-secondary" />
                                            </div>
                                            <p className="text-white font-medium">Dang luu & dong bo...</p>
                                        </>
                                    )}
                                    {regStatus === 'success' && (
                                        <>
                                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                                                <CheckIcon className="w-8 h-8 text-green-500" />
                                            </div>
                                            <p className="text-green-500 font-bold">Dang ky thanh cong!</p>
                                        </>
                                    )}
                                    {regStatus === 'error' && (
                                        <>
                                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                                                <XIcon className="w-8 h-8 text-red-500" />
                                            </div>
                                            <p className="text-red-500 font-bold">Dang ky that bai</p>
                                            <p className="text-text-muted text-xs mt-1">{errorMessage}</p>
                                        </>
                                    )}
                                </div>
                                <div className="flex gap-3">
                                    {regStatus === 'scanned' && (
                                        <button onClick={confirmRegistration} className="flex-1 py-3 rounded-xl font-bold bg-green-600 text-white hover:bg-green-700 transition-all">
                                            Xac Nhan
                                        </button>
                                    )}
                                    {(regStatus === 'waiting' || regStatus === 'scanned' || regStatus === 'error') && (
                                        <button onClick={cancelRegistration} className="flex-1 py-3 rounded-xl font-bold bg-background text-text-muted hover:text-white border border-white/10 transition-all">
                                            Huy
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Card List */}
                    <div className="bg-surface rounded-3xl p-8 border border-white/5">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-white">Danh Sach The</h2>
                            <div className="flex items-center gap-3">
                                <span className="text-text-muted text-sm">{cards.length} the</span>
                                <button
                                    onClick={syncToEsp}
                                    disabled={syncing || cards.length === 0}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                        syncing
                                            ? 'bg-primary/20 text-primary/50 cursor-wait'
                                            : 'bg-primary/20 text-primary hover:bg-primary/30'
                                    }`}
                                >
                                    {syncing ? 'Dang dong bo...' : 'Sync to ESP'}
                                </button>
                            </div>
                        </div>
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {loading ? (
                                <div className="text-center py-8 text-text-muted">Dang tai...</div>
                            ) : cards.length === 0 ? (
                                <div className="text-center py-8 text-text-muted">Chua co the nao</div>
                            ) : (
                                <div className="space-y-3">
                                    {cards.map((card) => (
                                        <div key={card.id} className="bg-background rounded-xl p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
                                                    <NfcIcon className="w-4 h-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-white text-sm font-medium">{card.student_id} - {card.full_name}</p>
                                                    <p className="text-text-muted text-xs font-mono">{card.card_uid}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => handleDelete(card)} className="text-red-500/60 hover:text-red-500 transition-colors p-2">
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Attendance History ── */}
                <div className="bg-surface rounded-3xl p-8 border border-white/5">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-bold text-white">Lich Su Diem Danh</h2>
                            <span className="text-text-muted text-sm">{historyLogs.length} luot</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="date"
                                value={historyDate}
                                onChange={(e) => {
                                    setHistoryDate(e.target.value);
                                    fetchHistory(e.target.value);
                                }}
                                className="bg-background border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-primary [color-scheme:dark]"
                            />
                            <button
                                onClick={() => fetchHistory(historyDate)}
                                className="bg-primary/20 text-primary px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/30 transition-colors"
                            >
                                Tai lai
                            </button>
                        </div>
                    </div>

                    <div className="bg-background rounded-2xl border border-white/5 overflow-hidden" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {historyLoading ? (
                            <div className="text-center py-8 text-text-muted">Dang tai...</div>
                        ) : historyLogs.length === 0 ? (
                            <div className="text-center py-8 text-text-muted">Khong co du lieu diem danh ngay nay</div>
                        ) : (
                            <table className="w-full">
                                <thead className="sticky top-0 bg-background border-b border-white/5">
                                    <tr className="text-text-muted text-xs text-left">
                                        <th className="px-5 py-3 font-medium">#</th>
                                        <th className="px-5 py-3 font-medium">Ma SV</th>
                                        <th className="px-5 py-3 font-medium">Ho ten</th>
                                        <th className="px-5 py-3 font-medium">Trang thai</th>
                                        <th className="px-5 py-3 font-medium text-right">Thoi gian</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {historyLogs.map((log, idx) => (
                                        <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-5 py-3 text-text-muted text-xs">{idx + 1}</td>
                                            <td className="px-5 py-3 text-white text-sm font-medium">{log.student_id}</td>
                                            <td className="px-5 py-3 text-white text-sm">{log.full_name}</td>
                                            <td className="px-5 py-3">
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                                    log.action === 'checkin'
                                                        ? 'bg-green-500/10 text-green-500'
                                                        : 'bg-orange-500/10 text-orange-500'
                                                }`}>
                                                    {log.action === 'checkin' ? 'CHECK IN' : 'CHECK OUT'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-text-muted text-xs font-mono text-right">{formatTime(log.scanned_at)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

// Icons
const NfcIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 8.32a7.43 7.43 0 0 1 0 7.36" /><path d="M9.46 6.21a11.76 11.76 0 0 1 0 11.58" />
        <path d="M12.91 4.1a15.91 15.91 0 0 1 .01 15.8" /><path d="M16.37 2a20.16 20.16 0 0 1 0 20" />
    </svg>
);
const CheckIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);
const XIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);
const LogoutIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);
const TrashIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
);

export default NFCManagement;
