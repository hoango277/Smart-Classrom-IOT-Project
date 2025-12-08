import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const MainLayout = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-background text-text-main overflow-hidden">
            {/* Sidebar - Fixed width */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col ml-24"> {/* ml-24 matches sidebar width */}

                {/* Top Navbar */}
                <Navbar />

                {/* Dynamic Content */}
                <div className="flex-1 p-10 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default MainLayout;
