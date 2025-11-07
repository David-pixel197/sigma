import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import { useTheme } from '../../context/ThemeContext';

function Header() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <header className="app-header">
      <div className="logo">
        <Link to="/">SIGMA</Link>
      </div>

      <nav className="header-nav">
        <button className="theme-toggle-button" onClick={toggleTheme}>
          {isDarkMode ? '☀️' : '🌙'}
        </button>

        <Link to="/login">
          <button className="login-button">Login de Funcionário</button>
        </Link>
      </nav>
    </header>
  );
}

export default Header;