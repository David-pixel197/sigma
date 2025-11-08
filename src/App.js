import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navigate } from 'react-router-dom'; 
import './App.css';

import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext'; 
import { PrivateRoute } from './components/Header/PrivateRoute'; 

import Header from './components/Header/Header';
import Formulario from './pages/Formulario/Formulario';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';


function AppContent() {
    const { isLoading, isLoggedIn } = useAuth(); 

    if (isLoading) {
        return <div style={{padding: '50px', textAlign: 'center'}}>Carregando...</div>; 
    }

    return (
        <>
            <Header /> 
            <Routes>
                <Route path="/" element={<Formulario />} />
                <Route path="/login" element={<Login />} />
                
                <Route 
                    path="/dashboard" 
                    element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    } 
                />
                <Route 
                    path="*" 
                    element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} replace />} 
                />
            </Routes>
        </>
    );
}

function App() {
    return (
        <ThemeProvider>
            <BrowserRouter>
                <AuthProvider>
                    <AppContent />
                </AuthProvider>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;