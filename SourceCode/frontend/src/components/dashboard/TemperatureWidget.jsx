import React from 'react';

const TemperatureWidget = () => {
    return (
        <div className="bg-surface rounded-3xl p-6 shadow-lg h-full flex flex-col justify-between">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold text-white">Temperature</h3>
                    <p className="text-xs text-text-muted">Master bed room</p>
                </div>
                <div className="flex items-center gap-1 bg-background px-2 py-1 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-secondary"></span>
                    <span className="text-xs font-bold">50%</span>
                </div>
            </div>

            {/* Circular Dial Mockup */}
            <div className="relative w-40 h-40 mx-auto my-4 flex items-center justify-center">
                {/* Background Circle */}
                <div className="absolute inset-0 rounded-full border-8 border-background border-t-primary border-r-secondary rotate-45 transform"></div>
                {/* Center Text */}
                <div className="text-center z-10">
                    <div className="text-3xl font-bold text-white">25°C</div>
                    <div className="text-xs text-text-muted">Celcious</div>
                </div>
            </div>
        </div>
    );
};

export default TemperatureWidget;
