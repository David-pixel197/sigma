import React, { createContext, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. Criar o Contexto
const AuthContext = createContext();

// 2. Criar o Provedor
export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Função que será chamada pela página de Login
  const login = () => {
    // (No futuro, você receberá um token aqui)
    setIsLoggedIn(true);
    navigate('/dashboard'); // Redireciona para o dashboard
  };

  // Função que será chamada pelo botão Sair no Header
  const logout = () => {
    // (No futuro, você limpará o token aqui)
    setIsLoggedIn(false);
    navigate('/'); // Redireciona para a home (formulário)
  };

  // Valor a ser compartilhado
  const value = {
    isLoggedIn,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 3. Hook customizado para facilitar o uso
export function useAuth() {
  return useContext(AuthContext);
}