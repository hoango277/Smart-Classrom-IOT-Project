import React from 'react';

const DeviceCard = ({ title, subtitle, icon, children, className = '' }) => {
    return (
        <div className={`bg-surface rounded-3xl p-6 flex flex-col justify-between shadow-lg relative overflow-hidden group ${className}`}>
            <div className="flex justify-between items-start mb-4">
                {/* Icon Container */}
                <div className="w-12 h-12 rounded-2xl bg-background flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    {icon}
                </div>

                {/* Optional top-right status or menu dots */}
                <div className="text-text-muted">
                    {/* status or simple dot */}
                </div>
            </div>

            <div>
                <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
                {subtitle && <p className="text-sm text-text-muted">{subtitle}</p>}
            </div>

            <div className="mt-6">
                {children}
            </div>
        </div>
    );
};

export default DeviceCard;
