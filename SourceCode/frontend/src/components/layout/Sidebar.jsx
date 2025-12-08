import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;
    const userRole = localStorage.getItem('role');

    // Base nav items
    const baseNavItems = [
        { path: '/dashboard', icon: <HomeIcon />, label: 'Home' },
    ];

    // Admin-only items
    const adminNavItems = [
        { path: '/ota', icon: <UpdateIcon />, label: 'OTA Update' },
    ];

    // Combine nav items based on role (only admin can access OTA)
    const navItems = userRole === 'admin'
        ? [...baseNavItems, ...adminNavItems]
        : baseNavItems;

    return (
        <div className="h-screen w-24 bg-background border-r border-surface flex flex-col items-center py-8 fixed left-0 top-0 z-50">
            {/* Brand / Logo */}
            <div className="mb-12">
                {/* Simple dot or logo */}
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                    S
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-8 w-full items-center">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors duration-200 group relative
              ${isActive(item.path) ? 'text-primary' : 'text-text-muted hover:text-white'}
            `}
                    >
                        {/* Active Indicator Line */}
                        {isActive(item.path) && (
                            <div className="absolute right-[-18px] top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-l-full" />
                        )}

                        <div className="w-6 h-6">
                            {item.icon}
                        </div>
                        <span className="text-[10px] font-medium tracking-wide">{item.label.toUpperCase()}</span>
                    </Link>
                ))}
            </nav>

            {/* Profile at bottom */}
            <div className="mt-auto">
                <div className="w-10 h-10 rounded-full bg-surface border-2 border-primary overflow-hidden">
                    <img src="https://ui-avatars.com/api/?name=Joe&background=6C5DD3&color=fff" alt="Profile" />
                </div>
                <div className="text-[10px] text-text-muted text-center mt-1">PROFILE</div>
            </div>
        </div>
    );
};

// Simple SVG Icons
const HomeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
);

const UpdateIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
);

export default Sidebar;
