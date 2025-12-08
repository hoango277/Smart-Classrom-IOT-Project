import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import DoorWidget from '../components/dashboard/DoorWidget';
import WindowWidget from '../components/dashboard/WindowWidget';
import LightWidget from '../components/dashboard/LightWidget';
import TemperatureWidget from '../components/dashboard/TemperatureWidget';

const Home = () => {
    // Read config from env
    const numDoors = Number(import.meta.env.VITE_TOPIC_NUMBER_DOOR || 0);
    const numWindows = Number(import.meta.env.VITE_TOPIC_NUMBER_WINDOW || 0);
    const numLights = Number(import.meta.env.VITE_TOPIC_NUMBER_LIGHT || 0);

    return (
        <MainLayout>
            <div className="space-y-10">
                {/* Header Section */}
                <section className="bg-surface rounded-3xl p-10 relative overflow-hidden shadow-lg">
                    <div className="relative z-10 max-w-lg">
                        <h1 className="text-3xl font-bold text-white mb-2">Welcome home, Joe!</h1>
                        <p className="text-text-muted text-sm mb-6">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonummy nibh euismod.
                        </p>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-4xl font-bold text-white">+30°C</span>
                                <span className="text-2xl">☁️</span>
                            </div>
                            <div className="text-xs text-text-muted">
                                <div>Outdoor temperature</div>
                                <div>Fuzzy cloudy weather</div>
                            </div>
                        </div>
                    </div>
                    {/* Decorative blob */}
                    <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-primary/20 to-transparent"></div>
                </section>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-12 gap-10">
                    {/* Left Column (Widgets) */}
                    <div className="col-span-12 lg:col-span-12 flex flex-col gap-10">

                        {/* Temp & Status Row */}
                        <div className="grid grid-cols-1 gap-10 h-48">
                            {/* Keep Temperature Widget */}
                            <TemperatureWidget />
                        </div>

                        {/* Devices Row (Single Widget with Selector) */}
                        <div className="space-y-8">
                            <h2 className="text-xl font-bold text-white mt-20 ml-5">Rooms & Devices</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

                                {/* Render Door Control - Single Widget */}
                                <DoorWidget totalDevices={numDoors} />

                                {/* Render Window Control - Single Widget */}
                                <WindowWidget totalDevices={numWindows} />

                                {/* Render Light Control - Single Widget */}
                                <LightWidget totalDevices={numLights} />

                                {/* If no devices */}
                                {numDoors === 0 && numWindows === 0 && numLights === 0 && (
                                    <div className="col-span-full text-center text-text-muted py-10 bg-surface rounded-3xl">
                                        No devices configured in .env
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default Home;