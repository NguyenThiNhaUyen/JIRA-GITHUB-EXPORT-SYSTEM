import { useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/toast';

/**
 * useSignalR - Hook to manage SignalR connection and real-time notifications
 */
export function useSignalR() {
  const { isAuthenticated, user } = useAuth();
  const { info, success, warning } = useToast();
  const connectionRef = useRef(null);

  useEffect(() => {
    // Only connect if authenticated
    if (!isAuthenticated || !user) {
      if (connectionRef.current) {
        connectionRef.current.stop();
        connectionRef.current = null;
      }
      return;
    }

    const token = localStorage.getItem('accessToken');
    const hubUrl = `${import.meta.env.VITE_API_URL}/notificationHub`;

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
      
      const { type, payload } = notification;
      
      if (type === 'NEW_ALERT') {
        const severity = payload.severity?.toUpperCase();
        const message = `[${payload.projectName}] ${payload.message}`;
        
        if (severity === 'HIGH' || severity === 'CRITICAL') {
          warning(message, { title: 'Cảnh báo quan trọng', duration: 10000 });
        } else {
          info(message, { title: 'Thông báo mới' });
        }
      } else {
        info(notification.message || 'Bạn có thông báo mới');
      }
    });

    connection.on('AlertResolved', (data) => {
      console.log('Alert Resolved:', data);
      success(`Một cảnh báo đã được xử lý.`, { id: `resolve-${data.alertId}` });
    });

    // Start connection
    const startConnection = async () => {
      try {
        await connection.start();
        console.log('SignalR Connected to Hub');
        
        // After connecting, if student/lecturer, join project groups would be good
        // But BE currently also pushes to .User(id), so groups are optional but safer
      } catch (err) {
        console.error('SignalR Connection Error: ', err);
      }
    };

    startConnection();

    // Cleanup on unmount or logout
    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop();
        connectionRef.current = null;
      }
    };
  }, [isAuthenticated, user, info, success, warning]);

  return connectionRef.current;
}
