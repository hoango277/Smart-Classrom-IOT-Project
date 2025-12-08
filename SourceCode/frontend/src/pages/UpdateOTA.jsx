import React, { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import axiosInstance from '../config/axios';
import mqttService from '../services/mqtt';

const UpdateOTA = () => {
    const [file, setFile] = useState(null);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('idle'); // idle, uploading, mqtt-sending, success, error
    const [errorMessage, setErrorMessage] = useState('');
    const [uploadResponse, setUploadResponse] = useState(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];

            // Validate file extension
            if (!selectedFile.name.endsWith('.bin') && !selectedFile.name.endsWith('.hex')) {
                setErrorMessage('Please select a .bin or .hex file');
                return;
            }

            setFile(selectedFile);
            setStatus('idle');
            setProgress(0);
            setErrorMessage('');
            setUploadResponse(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setStatus('uploading');
        setErrorMessage('');
        setProgress(0);

        try {
            // Step 1: Upload file to backend
            const formData = new FormData();
            formData.append('file', file);

            const response = await axiosInstance.post('/firmware/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setProgress(percentCompleted);
                },
            });

            // Check response
            if (response.status === 'ok' && response.download_url) {
                setUploadResponse(response);
                setStatus('mqtt-sending');

                // Step 2: Send MQTT message to ESP32
                await mqttService.connect();

                const otaTopic = 'classroom/ota/update';
                const otaMessage = {
                    url: response.download_url
                };

                await mqttService.publish(otaTopic, JSON.stringify(otaMessage));

                // Success
                setStatus('success');
                setProgress(100);
            } else {
                throw new Error(response.message || 'Upload failed');
            }

        } catch (error) {
            console.error('Upload error:', error);
            setStatus('error');
            setErrorMessage(error.message || 'Failed to upload firmware. Please try again.');
        }
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
                                    <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-xs font-bold text-text-muted">
                                        {file.name.endsWith('.bin') ? 'BIN' : 'HEX'}
                                    </div>
                                    <div>
                                        <p className="text-sm text-white font-medium">{file.name}</p>
                                        <p className="text-xs text-text-muted">{(file.size / 1024).toFixed(2)} KB</p>
                                    </div>
                                </div>
                                {status === 'success' && <span className="text-green-500 text-xs font-bold">✓ Sent</span>}
                            </div>
                        )}

                        {/* Error Message */}
                        {errorMessage && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-500 text-sm">
                                {errorMessage}
                            </div>
                        )}

                        {/* Upload Response Info */}
                        {uploadResponse && status === 'success' && (
                            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 space-y-2">
                                <div className="flex items-center gap-2 text-green-500 font-bold text-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    OTA Update Sent Successfully!
                                </div>
                                <div className="text-xs text-text-muted space-y-1">
                                    <p><strong className="text-white">Filename:</strong> {uploadResponse.filename}</p>
                                    <p><strong className="text-white">Size:</strong> {(uploadResponse.size / 1024).toFixed(2)} KB</p>
                                </div>
                            </div>
                        )}

                        {/* Progress Bar */}
                        {(status === 'uploading' || status === 'mqtt-sending') && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-white">
                                        {status === 'uploading' ? 'Uploading firmware...' : 'Sending OTA command via MQTT...'}
                                    </span>
                                    {status === 'uploading' && <span className="text-primary">{progress}%</span>}
                                </div>
                                <div className="h-2 bg-background rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-300 ease-out ${status === 'mqtt-sending' ? 'bg-secondary animate-pulse' : 'bg-primary'}`}
                                        style={{ width: status === 'uploading' ? `${progress}%` : '100%' }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        {/* Action Button */}
                        <button
                            onClick={handleUpload}
                            disabled={!file || status === 'uploading' || status === 'mqtt-sending' || status === 'success'}
                            className={`w-full py-4 rounded-xl font-bold transition-all ${!file || status === 'uploading' || status === 'mqtt-sending'
                                ? 'bg-background text-text-muted cursor-not-allowed'
                                : status === 'success'
                                    ? 'bg-green-600 text-white cursor-not-allowed'
                                    : status === 'error'
                                        ? 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 cursor-pointer'
                                        : 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 cursor-pointer'
                                }`}
                        >
                            {status === 'uploading'
                                ? 'Uploading Firmware...'
                                : status === 'mqtt-sending'
                                    ? 'Sending OTA Command...'
                                    : status === 'success'
                                        ? '✓ Update Sent Successfully'
                                        : status === 'error'
                                            ? 'Retry Upload'
                                            : 'Start OTA Update'}
                        </button>

                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default UpdateOTA;
