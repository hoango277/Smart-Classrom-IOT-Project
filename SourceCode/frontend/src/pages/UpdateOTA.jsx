import React, { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';

const UpdateOTA = () => {
    const [file, setFile] = useState(null);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('idle'); // idle, uploading, success, error

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStatus('idle');
            setProgress(0);
        }
    };

    const handleUpload = () => {
        if (!file) return;

        setStatus('uploading');
        // Simulate upload progress
        let currentProgress = 0;
        const interval = setInterval(() => {
            currentProgress += 10;
            setProgress(currentProgress);
            if (currentProgress >= 100) {
                clearInterval(interval);
                setStatus('success');
            }
        }, 500);
    };

    return (
        <MainLayout>
            <div className="max-w-2xl mx-auto space-y-8">
                <header>
                    <h1 className="text-3xl font-bold text-white mb-2">System Update</h1>
                    <p className="text-text-muted text-sm">Upload firmware file to update the device system via OTA.</p>
                </header>

                <div className="bg-surface rounded-3xl p-8 border border-white/5">
                    <div className="flex flex-col gap-6">

                        {/* File Drop Zone Visualization */}
                        <div className="border-2 border-dashed border-text-muted/30 rounded-2xl p-10 text-center hover:border-primary/50 transition-colors">
                            <input
                                type="file"
                                onChange={handleFileChange}
                                className="hidden"
                                id="firmware-upload"
                                accept=".bin,.hex"
                            />
                            <label htmlFor="firmware-upload" className="cursor-pointer flex flex-col items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>
                                <div>
                                    <span className="text-white font-medium">Click to upload firmware</span>
                                    <p className="text-xs text-text-muted mt-1">.bin or .hex files only</p>
                                </div>
                            </label>
                        </div>

                        {/* Selected File Info */}
                        {file && (
                            <div className="bg-background rounded-xl p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-xs font-bold text-text-muted">BIN</div>
                                    <div>
                                        <p className="text-sm text-white font-medium">{file.name}</p>
                                        <p className="text-xs text-text-muted">{(file.size / 1024).toFixed(2)} KB</p>
                                    </div>
                                </div>
                                {status === 'success' && <span className="text-green-500 text-xs font-bold">Ready</span>}
                            </div>
                        )}

                        {/* Progress Bar */}
                        {status === 'uploading' && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-white">Uploading...</span>
                                    <span className="text-primary">{progress}%</span>
                                </div>
                                <div className="h-2 bg-background rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-300 ease-out"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        {/* Action Button */}
                        <button
                            onClick={handleUpload}
                            disabled={!file || status === 'uploading'}
                            className={`w-full py-4 rounded-xl font-bold transition-all ${!file || status === 'uploading'
                                ? 'bg-background text-text-muted cursor-not-allowed'
                                : 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 cursor-pointer'
                                }`}
                        >
                            {status === 'uploading' ? 'Updating System...' : status === 'success' ? 'Update Completed' : 'Start Update'}
                        </button>

                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default UpdateOTA;
