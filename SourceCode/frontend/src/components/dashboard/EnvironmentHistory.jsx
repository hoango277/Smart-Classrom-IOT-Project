import React, { useEffect, useMemo, useState } from 'react';
import mqttService, { topics } from '../../services/mqtt.js';

const RANGE_CONFIG = {
    today: { label: 'Hôm nay', windowMs: 24 * 60 * 60 * 1000 },
    week: { label: 'Tuần này', windowMs: 7 * 24 * 60 * 60 * 1000 },
    month: { label: 'Tháng này', windowMs: 30 * 24 * 60 * 60 * 1000 },
};

const MAX_POINTS = 1800; // ~2.5h if sending every 5s. Trim to avoid memory bloat.

const parsePayload = (payload) => {
    if (typeof payload === 'string') return payload;
    if (payload instanceof Uint8Array) return new TextDecoder().decode(payload);
    try {
        return payload?.toString?.() ?? '';
    } catch {
        return '';
    }
};

const normalizeTimestamp = (ts) => {
    const numeric = Number(ts);
    if (Number.isFinite(numeric) && numeric > 1e12) return numeric; // looks like epoch ms
    // If firmware only sends uptime (ms), anchor to "now" so charts look real-time
    return Date.now();
};

const buildPath = (points, key, width, height, padding = 12) => {
    if (points.length < 2) return '';

    const xs = points.map((p) => p.ts);
    const ys = points.map((p) => p[key]).filter((v) => Number.isFinite(v));
    if (!ys.length) return '';

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const xSpan = maxX === minX ? 1 : maxX - minX;
    const ySpan = maxY === minY ? 1 : maxY - minY;

    const mapPoint = (p) => {
        const x = padding + ((p.ts - minX) / xSpan) * (width - padding * 2);
        const y =
            height -
            padding -
            ((p[key] - minY) / ySpan) * (height - padding * 2);
        return { x, y };
    };

    return points
        .map(mapPoint)
        .map((pt, idx) => `${idx === 0 ? 'M' : 'L'}${pt.x},${pt.y}`)
        .join(' ');
};

const EnvironmentHistory = () => {
    const [range, setRange] = useState('today');
    const [samples, setSamples] = useState([]);

    useEffect(() => {
        const onMessage = (topic, payload) => {
            if (topic !== topics.events) return;
            const raw = parsePayload(payload);
            try {
                const data = JSON.parse(raw);
                if (data?.type !== 'environment') return;
                const ts = normalizeTimestamp(data.ts);
                setSamples((prev) => {
                    const next = [...prev, {
                        ts,
                        temperature: Number(data.temperature),
                        humidity: Number(data.humidity),
                    }];
                    if (next.length > MAX_POINTS) next.shift();
                    return next;
                });
            } catch (error) {
                console.error('[MQTT] History parse error', error, raw);
            }
        };

        const setup = async () => {
            try {
                await mqttService.connect();
                await mqttService.subscribe(topics.events);
                mqttService.on('message', onMessage);
            } catch (error) {
                console.error('[MQTT] Failed to init env history', error);
            }
        };

        setup();

        return () => {
            const client = mqttService.getClient();
            if (client?.off) client.off('message', onMessage);
            else if (client?.removeListener) client.removeListener('message', onMessage);
        };
    }, []);

    const filtered = useMemo(() => {
        const now = Date.now();
        const windowMs = RANGE_CONFIG[range].windowMs;
        return samples.filter((s) => now - s.ts <= windowMs);
    }, [samples, range]);

    const latest = filtered[filtered.length - 1];
    const width = 520;
    const height = 180;
    const tempPath = useMemo(
        () => buildPath(filtered, 'temperature', width, height),
        [filtered]
    );
    const humidityPath = useMemo(
        () => buildPath(filtered, 'humidity', width, height),
        [filtered]
    );

    return (
        <div className="bg-surface rounded-3xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-white">Biểu đồ nhiệt độ / độ ẩm</h3>
                    <p className="text-xs text-text-muted">Real-time + bộ lọc thời gian</p>
                </div>
                <div className="flex bg-background rounded-2xl p-1">
                    {Object.entries(RANGE_CONFIG).map(([key, cfg]) => (
                        <button
                            key={key}
                            onClick={() => setRange(key)}
                            className={`px-3 py-1 text-sm rounded-xl transition-colors ${
                                range === key
                                    ? 'bg-primary text-white'
                                    : 'text-text-muted hover:text-white'
                            }`}
                        >
                            {cfg.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-6 bg-background rounded-2xl p-4 overflow-hidden">
                <div className="flex gap-4 text-sm text-text-muted mb-3">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-secondary"></span>
                        <span>
                            Nhiệt độ: {latest?.temperature != null ? `${latest.temperature.toFixed(1)}°C` : '--'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-cyan-400"></span>
                        <span>
                            Độ ẩm: {latest?.humidity != null ? `${latest.humidity.toFixed(1)}%` : '--'}
                        </span>
                    </div>
                    <div className="ml-auto">
                        {filtered.length ? `Điểm dữ liệu: ${filtered.length}` : 'Chờ dữ liệu...'}
                    </div>
                </div>
                <svg width={width} height={height} className="w-full">
                    <rect x="0" y="0" width={width} height={height} fill="transparent" />
                    {humidityPath && (
                        <path
                            d={humidityPath}
                            fill="none"
                            stroke="#22d3ee"
                            strokeWidth="2"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                        />
                    )}
                    {tempPath && (
                        <path
                            d={tempPath}
                            fill="none"
                            stroke="#9f7aea"
                            strokeWidth="2"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                        />
                    )}
                </svg>
            </div>
        </div>
    );
};

export default EnvironmentHistory;

