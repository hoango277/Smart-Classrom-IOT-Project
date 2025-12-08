import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

const Portal = ({ children }) => {
    return createPortal(children, document.body);
};

const CustomDropdown = ({ label, options, value, onChange, placeholder = 'Select...' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
    const buttonRef = useRef(null);

    useEffect(() => {
        const handleResize = () => {
            if (isOpen && buttonRef.current) {
                const rect = buttonRef.current.getBoundingClientRect();
                setCoords({
                    top: rect.bottom + window.scrollY + 8, // 8px Gap
                    left: rect.left + window.scrollX,
                    width: rect.width
                });
            }
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', handleResize, true); // true for capture to catch all scrolls
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleResize, true);
        };
    }, [isOpen]);

    const handleOpen = () => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + window.scrollY + 8,
                left: rect.left + window.scrollX,
                width: rect.width
            });
        }
        setIsOpen(!isOpen);
    };

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className="relative">
            {label && <label className="text-xs text-text-muted block mb-1">{label}</label>}

            <button
                ref={buttonRef}
                onClick={handleOpen}
                className={`w-full bg-background border text-white text-sm rounded-lg px-3 py-2.5 flex items-center justify-between transition-all duration-200 outline-none hover:border-primary/50 cursor-pointer
                    ${isOpen ? 'border-primary shadow-[0_0_0_2px_rgba(108,93,211,0.2)]' : 'border-text-muted/20'}
                `}
            >
                <span className={selectedOption ? 'text-white' : 'text-text-muted'}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <svg
                    className={`w-4 h-4 text-text-muted transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <Portal>
                    {/* Backdrop for click outside */}
                    <div className="fixed inset-0 z-[9998] cursor-default" onClick={() => setIsOpen(false)} />

                    {/* Dropdown Menu */}
                    <div
                        className="fixed z-[9999] bg-background border border-surface rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top"
                        style={{
                            top: coords.top,
                            left: coords.left,
                            width: coords.width,
                            maxHeight: '240px'
                        }}
                    >
                        <div className="overflow-y-auto max-h-[240px] py-1 custom-scrollbar">
                            {options.map((option) => (
                                <div
                                    key={option.value}
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={`px-3 py-2.5 text-sm cursor-pointer transition-colors duration-150 flex items-center justify-between
                                        ${option.value === value
                                            ? 'bg-primary/10 text-primary font-medium'
                                            : 'text-text-muted hover:bg-surface hover:text-white'
                                        }`}
                                >
                                    {option.label}
                                    {option.value === value && (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </Portal>
            )}
        </div>
    );
};

export default CustomDropdown;
