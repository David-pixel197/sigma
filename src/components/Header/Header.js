import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

function Header() {
  const { isDarkMode, toggleTheme } = useTheme();
  
  // Hooks que leem os contextos globais
  const { isLoggedIn, logout } = useAuth(); // Pega o status de login
  const location = useLocation(); // Pega a URL atual

  /**
   * Renderiza o botão de Login ou Sair, dependendo da página e do status de login
   */
  const renderAuthButton = () => {
    
    // 1. Se estiver na página de login, não mostre nenhum botão
    if (location.pathname === '/login') {
      return null;
    }
    
    // 2. Se estiver logado, mostre o botão "Sair"
    if (isLoggedIn) {
      return (
        <button className="logout-button" onClick={logout}>
          Sair
        </button>
      );
    }

    // 3. Se não estiver logado (e não no /login), mostre o botão "Login"
    return (
      <Link to="/login">
        <button className="login-button">Login de Funcionário</button>
      </Link>
    );
  };

  return (
    <header className="app-header">
      <div className="logo">
        {/* --- CORREÇÃO ESTÁ AQUI ---
          Usamos um ternário:
          - Se (if) isLoggedIn for true, o link aponta para "/dashboard"
          - Senão (else), o link aponta para "/"
        */}
        <Link to={isLoggedIn ? '/dashboard' : '/'}>
          SIGMA
        </Link>
      </div>

      <nav className="header-nav">
        {/* Botão de Tema */}
        <button className="theme-toggle-button" onClick={toggleTheme}>
          {isDarkMode ? '☀️' : '🌙'}
        </button>

        {/* Botão de Login/Sair (que a nossa função decide) */}
        {renderAuthButton()}
      </nav>
    </header>
  );
}

export default Header;