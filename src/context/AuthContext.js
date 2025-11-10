import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'userAuthData';
// 1. Criar o Contexto
const AuthContext = createContext();

// 2. Criar o Provedor
export function AuthProvider({ children }) {
  //const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Para o AppContent
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  // Efeito que roda na inicialização, simulando a verificação de um token
  useEffect(() => {
        const storedData = localStorage.getItem(STORAGE_KEY);
        
        if (storedData) {
            try {
                const data = JSON.parse(storedData);
                
                // Verifica se os dados são válidos e estão logados
                if (data.isLoggedIn && data.user) {
                    setIsLoggedIn(true);
                    setUserData(data.user);
                }
            } catch (error) {
                // Se houver erro ao parsear (dado corrompido), limpa o storage
                console.error("Erro ao carregar dados do localStorage:", error);
                localStorage.removeItem(STORAGE_KEY);
            }
        }
        
        // Finaliza o carregamento, liberando o AppContent para renderizar
        setIsLoading(false); 
    }, []);

  /**
   * Função para LOGAR. Chamada pelo Login.js.
   * Recebe o objeto do usuário (seja mock ou real)
   */
  const login = (user) => {
    /*setUser(userData);
    setIsLoggedIn(true);
    navigate('/dashboard'); // Redireciona APÓS o estado ser atualizado*/

    if (!user || !user.idFunci) return;
    setIsLoggedIn(true);
    setUserData(user);
    const authData = { isLoggedIn: true, user: user };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
    navigate('/dashboard'); 
  };

  /**
   * Função para DESLOGAR. Chamada pelo Header.
   */
  const logout = () => {
    /*setUser(null);
    setIsLoggedIn(false);
    navigate('/'); // Redireciona para a home*/

    setIsLoggedIn(false);
    setUserData(null);
    localStorage.removeItem(STORAGE_KEY);
    navigate('/'); 
  };

  // Valor a ser compartilhado
  const value = {
    isLoggedIn,
    isLoading, // Exporta o isLoading para o AppContent
    login,
    logout,
    userData,
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