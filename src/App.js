import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navigate } from 'react-router-dom'; 
import './App.css';

import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext'; 
import { PrivateRoute } from './components/PrivateRoute'; 
import { AdminRoute } from './components/AdminRoute'; // 1. IMPORTAR

import Header from './components/Header/Header';
import Formulario from './pages/Formulario/Formulario';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
// 2. IMPORTAR AS NOVAS PÁGINAS
import AdminFuncionarios from './pages/AdminFuncionarios/AdminFuncionarios';
import AdminLocais from './pages/AdminLocais/AdminLocais';


function AppContent() {
    const { isLoading, isLoggedIn } = useAuth(); 

    if (isLoading) {
        return <div style={{padding: '50px', textAlign: 'center'}}>Carregando...</div>; 
    }

    return (
        <>
            <Header /> 
            <Routes>
                {/* --- Rotas Públicas --- */}
                <Route path="/" element={<Formulario />} />
                <Route path="/login" element={<Login />} />
                
                {/* --- Rota Privada (Logado) --- */}
                <Route 
                    path="/dashboard" 
                    element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    } 
                />

                {/* --- Rotas de Admin (Logado + Autoridade) --- */}
                <Route 
                    path="/admin/funcionarios" 
                    element={
                        <AdminRoute>
                            <AdminFuncionarios />
                        </AdminRoute>
                    } 
                />
                <Route 
                    path="/admin/locais" 
                    element={
                        <AdminRoute>
                            <AdminLocais />
                        </AdminRoute>
                    } 
                />

                {/* --- Rota Curinga --- */}
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