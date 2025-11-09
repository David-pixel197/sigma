import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // O caminho de import muda

export function PrivateRoute({ children }) {
  const { isLoggedIn, isLoading } = useAuth(); 

  // Se o AuthContext ainda está verificando, mostre um loading
  if (isLoading) {
    return <div className="page-container"><p>Carregando...</p></div>;
  }

  // Se não estiver logado, redireciona para o formulário
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  // Se estiver logado, mostra a página
  return children;
}