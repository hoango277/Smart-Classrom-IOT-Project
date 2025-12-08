import React, { useState } from 'react';
import DeviceCard from './DeviceCard';
import { publishWindowCommand } from '../../services/mqttCommand';
import CustomDropdown from '../common/CustomDropdown';

const WindowWidget = ({ totalDevices = 1 }) => {
    const [selectedId, setSelectedId] = useState(0);
    const [status, setStatus] = useState('closed');
    const [loading, setLoading] = useState(false);

    const handleCommand = async (cmd) => {
        setLoading(true);
        try {
            await publishWindowCommand(selectedId, cmd);
            setStatus(cmd === 'open' ? 'open' : cmd === 'close' ? 'closed' : 'stopped');
        } catch (error) {
            console.error('Failed to control window:', error);
            alert(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const cleanTotal = Math.max(1, totalDevices);
    const ids = Array.from({ length: cleanTotal }, (_, i) => i);

    return (
        <DeviceCard
            title={`Window Control`}
            subtitle={status.toUpperCase()}
            icon={<WindowIcon />}
        >
            <div className="mb-4">
                <label className="text-xs text-text-muted block mb-1">Select Device ID</label>
                <CustomDropdown
                    value={selectedId}
                    onChange={(val) => setSelectedId(val)}
                    options={ids.map(id => ({ value: id, label: `Window ${id}` }))}
                />
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => handleCommand('open')}
                    disabled={loading}
                    className="flex-1 py-2 rounded-xl bg-background text-xs font-bold hover:bg-primary hover:text-white transition-colors cursor-pointer"
                >
                    OPEN
                </button>
                <button
                    onClick={() => handleCommand('stop')}
                    disabled={loading}
                    className="flex-1 py-2 rounded-xl bg-background text-xs font-bold hover:bg-yellow-600 hover:text-white transition-colors cursor-pointer"
                >
                    STOP
                </button>
                <button
                    onClick={() => handleCommand('close')}
                    disabled={loading}
                    className="flex-1 py-2 rounded-xl bg-background text-xs font-bold hover:bg-secondary hover:text-white transition-colors cursor-pointer"
                >
                    CLOSE
                </button>
            </div>
        </DeviceCard>
    );
};

const WindowIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18" /><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 12h18" /></svg>
);

export default WindowWidget;
