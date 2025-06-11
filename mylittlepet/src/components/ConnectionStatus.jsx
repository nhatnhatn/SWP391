// Connection Status Component
// This component monitors the backend connection status and provides user feedback

import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const ConnectionStatus = () => {
    const [connectionStatus, setConnectionStatus] = useState('checking'); // 'checking', 'connected', 'disconnected'
    const [lastChecked, setLastChecked] = useState(null);

    const checkConnection = async () => {
        try {
            setConnectionStatus('checking');
            await apiService.request('/health', { 
                method: 'GET',
                signal: AbortSignal.timeout(5000) // 5 second timeout
            });
            setConnectionStatus('connected');
        } catch (error) {
            console.warn('Backend connection check failed:', error.message);
            setConnectionStatus('disconnected');
        }
        setLastChecked(new Date());
    };

    useEffect(() => {
        checkConnection();
        
        // Check connection every 30 seconds
        const interval = setInterval(checkConnection, 30000);
        return () => clearInterval(interval);
    }, []);

    const getStatusDisplay = () => {
        switch (connectionStatus) {
            case 'checking':
                return {
                    color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
                    icon: '⏳',
                    text: 'Đang kiểm tra kết nối...',
                    description: 'Đang kiểm tra kết nối với máy chủ backend'
                };
            case 'connected':
                return {
                    color: 'text-green-600 bg-green-50 border-green-200',
                    icon: '✅',
                    text: 'Đã kết nối với máy chủ',
                    description: 'Dữ liệu thời gian thực từ cơ sở dữ liệu'
                };
            case 'disconnected':
                return {
                    color: 'text-orange-600 bg-orange-50 border-orange-200',
                    icon: '⚠️',
                    text: 'Chế độ ngoại tuyến',
                    description: 'Sử dụng dữ liệu cục bộ. Khởi động backend trên cổng 8080 để có đầy đủ chức năng.'
                };
            default:
                return null;
        }
    };

    const status = getStatusDisplay();
    if (!status) return null;

    return (
        <div className={`fixed top-4 right-4 max-w-sm p-3 rounded-lg border shadow-sm z-50 ${status.color}`}>
            <div className="flex items-start space-x-2">
                <span className="text-lg">{status.icon}</span>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{status.text}</p>
                    <p className="text-xs mt-1 opacity-75">{status.description}</p>
                    {lastChecked && (
                        <p className="text-xs mt-1 opacity-50">
                            Kiểm tra cuối: {lastChecked.toLocaleTimeString('vi-VN')}
                        </p>
                    )}
                </div>
                <button
                    onClick={checkConnection}
                    className="text-xs opacity-75 hover:opacity-100 px-2 py-1 rounded border border-current"
                    disabled={connectionStatus === 'checking'}
                >
                    Kiểm tra lại
                </button>
            </div>
        </div>
    );
};

export default ConnectionStatus;
