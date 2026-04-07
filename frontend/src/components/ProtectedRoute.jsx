import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const location = useLocation();
    const userString = localStorage.getItem('user');

    let isAuthenticated = false;
    if (userString) {
        try {
            const user = JSON.parse(userString);
            if (user && user.token) {
                isAuthenticated = true;
            }
        } catch {
            isAuthenticated = false;
        }
    }

    if (!isAuthenticated) {
        if (userString) {
            localStorage.removeItem('user');
        }
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
