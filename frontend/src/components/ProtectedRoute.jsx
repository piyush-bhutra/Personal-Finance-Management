import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const location = useLocation();
    const userString = localStorage.getItem('user');

    // Basic validation: user string exists and is a valid JSON object
    let isAuthenticated = false;
    if (userString) {
        try {
            const user = JSON.parse(userString);
            // Ensure it has basic expected token/id structure from authService response
            if (user && user.token) {
                isAuthenticated = true;
            }
        } catch (e) {
            // JSON parse error means invalid user state
            isAuthenticated = false;
        }
    }

    // If not authenticated, redirect to login page
    // We use the `state` prop to maintain the user's intended destination so they
    // could potentially be redirected back there after a successful login (if implemented).
    if (!isAuthenticated) {
        // If there's an invalid user object in localStorage, clear it
        if (userString) {
            localStorage.removeItem('user');
        }
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If authenticated, render the protected component
    return children;
};

export default ProtectedRoute;
