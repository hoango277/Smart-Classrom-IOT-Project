import React, { useEffect, useMemo, useState } from 'react';
import mqttService, { topics } from '../../services/mqtt.js';
import environmentAPI from '../../services/environmentAPI';

const formatNumber = (value, unit) => {
    if (value === null || Number.isNaN(value)) return '--';
    return `${value.toFixed(1)}${unit}`;
};

const TemperatureWidget = () => {
    const [envData, setEnvData] = useState(() => {
        // Load from localStorage on mount
        try {
            const saved = localStorage.getItem('currentEnvData');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.error('[LocalStorage] Failed to load env data', error);
        }
        return {
            temperature: null,
            humidity: null,
            updatedAt: null,
        };
    });
    const [status, setStatus] = useState('connecting'); // connecting | connected | error

    // Save to localStorage whenever envData changes
    useEffect(() => {
        try {
            localStorage.setItem('currentEnvData', JSON.stringify(envData));
        } catch (error) {
            console.error('[LocalStorage] Failed to save env data', error);
        }
    }, [envData]);

    useEffect(() => {
        const parsePayload = (payload) => {
            if (typeof payload === 'string') return payload;
            if (payload instanceof Uint8Array) {
                return new TextDecoder().decode(payload);
            }
            try {
                return payload?.toString?.() ?? '';
            } catch {
                return '';
            }
        };

        const onMessage = (topic, payload) => {
            if (topic !== topics.events) return;
            const raw = parsePayload(payload);
            try {
                const data = JSON.parse(raw);
                if (data?.type === 'environment') {
                    const newData = {
                        temperature: Number(data.temperature),
                        humidity: Number(data.humidity),
                        updatedAt: Date.now(),
                    };
                    setEnvData(newData);

                    // Save to backend (single save, not batch)
                    environmentAPI.saveData(newData.temperature, newData.humidity)
                        .catch(err => console.error('Failed to save to backend:', err));
                }
            } catch (error) {
                console.error('[MQTT] Failed to parse env payload', error, raw);
            }
        };

        const setup = async () => {
            try {
                await mqttService.connect();
                await mqttService.subscribe(topics.events);
                mqttService.on('message', onMessage);
                setStatus('connected');
            } catch (error) {
                console.error('[MQTT] Failed to subscribe temperature widget', error);
                setStatus('error');
            }
        };

        setup();

        return () => {
            const client = mqttService.getClient();
            if (client?.off) client.off('message', onMessage);
            else if (client?.removeListener) client.removeListener('message', onMessage);
        };
    }, []);

    const statusColor = useMemo(() => {
        if (status === 'connected') return 'bg-secondary';
        if (status === 'error') return 'bg-red-500';
        return 'bg-amber-400';
    }, [status]);

    return (
        <div className="bg-surface rounded-3xl p-6 shadow-lg h-full flex flex-col justify-between">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold text-white">Temperature &amp; Humidity</h3>
                    <p className="text-xs text-text-muted">Real-time from ESP8266</p>
                </div>
                <div className="flex items-center gap-2 bg-background px-3 py-1 rounded-full">
                    <span className={`w-2 h-2 rounded-full ${statusColor}`}></span>
                    <span className="text-xs font-semibold capitalize">{status}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-background rounded-2xl p-4 text-center shadow-inner">
                    <div className="text-sm text-text-muted mb-1">Temperature</div>
                    <div className="text-3xl font-bold text-white">
                        {formatNumber(envData.temperature, '°C')}
                    </div>
                </div>
                <div className="bg-background rounded-2xl p-4 text-center shadow-inner">
                    <div className="text-sm text-text-muted mb-1">Humidity</div>
                    <div className="text-3xl font-bold text-white">
                        {formatNumber(envData.humidity, '%')}
                    </div>
                </div>
            </div>

            <div className="text-xs text-text-muted mt-4 text-right">
                {envData.updatedAt ? `Updated: ${new Date(envData.updatedAt).toLocaleTimeString()}` : 'Waiting for data...'}
            </div>
        </div>
    );
};

export default TemperatureWidget;
