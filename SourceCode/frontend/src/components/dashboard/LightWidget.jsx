import React, { useState } from 'react';
import DeviceCard from './DeviceCard';
import { publishLightCommand } from '../../services/mqttCommand';
import CustomDropdown from '../common/CustomDropdown';

const LightWidget = ({ totalDevices = 1 }) => {
    const [selectedId, setSelectedId] = useState(0);
    const [isOn, setIsOn] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleToggle = async (actionOverride) => {
        setLoading(true);
        // If actionOverride is a string (e.g. 'toggle'), use it. 
        // Otherwise if it's an event object or undefined, fallback to toggle logic
        const action = (typeof actionOverride === 'string') ? actionOverride : (isOn ? 'off' : 'on');

        try {
            await publishLightCommand(selectedId, action);
            if (action === 'on') setIsOn(true);
            if (action === 'off') setIsOn(false);
            if (action === 'toggle') setIsOn(!isOn);
        } catch (error) {
            console.error('Failed to toggle light:', error);
            alert(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const cleanTotal = Math.max(1, totalDevices);
    const ids = Array.from({ length: cleanTotal }, (_, i) => i);

    return (
        <DeviceCard
            title={`Light Control`}
            subtitle={isOn ? 'ON' : 'OFF'}
            icon={<LightIcon />}
        >
            <div className="mb-4">
                <label className="text-xs text-text-muted block mb-1">Select Device ID</label>
                <CustomDropdown
                    value={selectedId}
                    onChange={(val) => setSelectedId(val)}
                    options={ids.map(id => ({ value: id, label: `Light ${id}` }))}
                />
            </div>

            <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-text-muted">{loading ? 'Sending...' : 'Control'}</span>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleToggle('toggle')}
                        disabled={loading}
                        className="px-3 py-1 bg-surface border border-primary/50 rounded-lg text-xs hover:bg-primary hover:text-white transition-colors cursor-pointer"
                    >
                        Toggle
                    </button>

                    <button
                        onClick={() => handleToggle()} // Default toggle logic
                        disabled={loading}
                        className={`w-14 h-7 rounded-full p-1 flex items-center transition-colors duration-300 cursor-pointer ${isOn ? 'bg-primary justify-end' : 'bg-background justify-start'
                            }`}
                    >
                        <div className="w-5 h-5 rounded-full bg-white shadow-md"></div>
                    </button>
                </div>
            </div>
        </DeviceCard>
    );
};

const LightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" /><path d="M9 18h6" /><path d="M10 22h4" /></svg>
);

export default LightWidget;
