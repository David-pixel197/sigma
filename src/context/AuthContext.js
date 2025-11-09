import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. Criar o Contexto
const AuthContext = createContext();

// 2. Criar o Provedor
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Para o AppContent
  const navigate = useNavigate();

  // Efeito que roda na inicialização, simulando a verificação de um token
  useEffect(() => {
    // No MODO_MOCK, apenas dizemos que a verificação terminou.
    // O usuário começa deslogado.
    setIsLoading(false);
  }, []);

  /**
   * Função para LOGAR. Chamada pelo Login.js.
   * Recebe o objeto do usuário (seja mock ou real)
   */
  const login = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    navigate('/dashboard'); // Redireciona APÓS o estado ser atualizado
  };

  /**
   * Função para DESLOGAR. Chamada pelo Header.
   */
  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    navigate('/'); // Redireciona para a home
  };

  // Valor a ser compartilhado
  const value = {
    user,
    isLoggedIn,
    isLoading, // Exporta o isLoading para o AppContent
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