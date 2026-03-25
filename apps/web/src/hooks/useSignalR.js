import { useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/toast';

/**
 * useSignalR - Hook to manage SignalR connection and real-time notifications
 */
export function useSignalR() {
    const queryClient = useQueryClient();
    const { isAuthenticated, user } = useAuth();
    const { info, success, warning } = useToast();
    const connectionRef = useRef(null);
    const startPromiseRef = useRef(null);

    useEffect(() => {
        let didCancel = false;
        const safeStop = (conn) => {
            const startPromise = startPromiseRef.current;
            void (async () => {
                try { await startPromise; } catch { /* ignore */ }
                try { await conn.stop(); } catch { /* ignore */ }
            })();
        };
        // Only connect if authenticated
        if (!isAuthenticated || !user) {
            if (connectionRef.current) {
                safeStop(connectionRef.current);
                connectionRef.current = null;
            }
            return;
        }

        const token = localStorage.getItem('accessToken');
        const envUrl = import.meta.env.VITE_API_URL || "https://jira-github-export-system-production.up.railway.app";
        const baseUrl = envUrl.replace(/\/api\/?$/, '');
        const hubUrl = `${baseUrl}/notificationHub`;

        // Create connection
        const connection = new signalR.HubConnectionBuilder()
            .withUrl(hubUrl, {
                accessTokenFactory: () => token,
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets
            })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();

        connectionRef.current = connection;

        // Set up listeners
        connection.on('ReceiveNotification', (notification) => {
            console.log('SignalR Notification:', notification);

            // Invalidate queries to refresh UI automatically
            queryClient.invalidateQueries(["student"]);
            queryClient.invalidateQueries(["projects"]);
            queryClient.invalidateQueries(["alerts"]);
            queryClient.invalidateQueries(["activity-logs"]);
            queryClient.invalidateQueries(["notifications"]);

            const { type, payload } = notification;
            const title = type === 'LINKS_SUBMITTED' ? 'Duyệt tích hợp'
                : type === 'GROUP_CREATED' ? 'Nhóm mới'
                    : 'Thông báo hệ thống';

            const msg = notification.message || notification.Message || payload?.message || payload?.Message || 'Bạn có thông báo mới';

            if (type === 'NEW_ALERT') {
                const severity = payload?.severity?.toUpperCase() || 'INFO';
                if (severity === 'HIGH' || severity === 'CRITICAL') {
                    warning(msg, { title: 'Cảnh báo quan trọng', duration: 10000 });
                } else {
                    info(msg, { title: 'Thông báo mới' });
                }
            } else if (type === 'LINKS_SUBMITTED') {
                info(msg, { title, duration: 8000 });
            } else if (type === 'LINKS_APPROVED') {
                success(msg, { title: 'Thành công' });
            } else if (type === 'SYNC_SUCCESS') {
                success(msg, { title: 'Đồng bộ thành công', duration: 5000 });
            } else if (type === 'SYNC_ERROR') {
                warning(msg, { title: 'Đồng bộ thất bại', duration: 10000 });
            } else {
                info(msg, { title });
            }
        });

        connection.on('AlertResolved', (data) => {
            console.log('Alert Resolved:', data);
            queryClient.invalidateQueries(["alerts"]);
            success(`Một cảnh báo đã được xử lý.`, { id: `resolve-${data.alertId}` });
        });

        // Start connection
        const startConnection = async () => {
            try {
                const p = connection.start();
                startPromiseRef.current = p;
                await p;
                if (didCancel) return;
                console.log('SignalR Connected to Hub');
            } catch (err) {
                if (didCancel) return;
                if (err?.name === 'AbortError') return;
                console.error('SignalR Connection Error: ', err);
            }
        };

        startConnection();

        // Cleanup on unmount or logout
        return () => {
            didCancel = true;
            if (connectionRef.current) {
                safeStop(connectionRef.current);
                connectionRef.current = null;
            }
        };
    }, [isAuthenticated, user, info, success, warning, queryClient]);

    return connectionRef.current;
}
