import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

// Import shared contexts from packages
import { AuthProvider } from '../../packages/shared/src/context/AuthContext.jsx';
import { AppProvider } from '../../packages/shared/src/context/AppContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <AppProvider>
                    <App />
                </AppProvider>
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);
