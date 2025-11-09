import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PrivateRoute } from './PrivateRoute'; // Importamos nossa rota privada padrão

/**
 * Esta rota verifica DUAS coisas:
 * 1. O usuário está logado? (usando <PrivateRoute>)
 * 2. O usuário logado tem 'autoridade'?
 */
export function AdminRoute({ children }) {
  const { user } = useAuth();

  // Se o usuário não tiver autoridade, manda ele para o Dashboard normal
  if (user && !user.autoridade) {
    // Você pode criar uma página "Acesso Negado" ou só redirecionar
    return <Navigate to="/dashboard" replace />;
  }

  // Se ele tiver autoridade, mostramos a página de admin
  // O PrivateRoute interno vai cuidar de checar se ele está logado
  return (
    <PrivateRoute>
      {children}
    </PrivateRoute>
  );
}