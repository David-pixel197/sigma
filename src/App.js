import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext'; // 1. IMPORTAR

import Header from './components/Header/Header';
import Formulario from './pages/Formulario/Formulario';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider> 
          <Header />
          <Routes>
            <Route path="/" element={<Formulario />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;