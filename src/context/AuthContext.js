import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'userAuthData';
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Efeito que roda na inicialização, lendo do localStorage
  useEffect(() => {
        const storedData = localStorage.getItem(STORAGE_KEY);
        
        if (storedData) {
            try {
                const data = JSON.parse(storedData);
                
                // Verifica se os dados são válidos (usa a chave padronizada 'idFunc')
                if (data.isLoggedIn && data.user && data.user.idFunc) {
                    setIsLoggedIn(true);
                    setUser(data.user); 
                }
            } catch (error) {
                console.error("Erro ao carregar dados do localStorage:", error);
                localStorage.removeItem(STORAGE_KEY);
            }
        }
        
        setIsLoading(false); 
    }, []);

  /**
   * Função para LOGAR. Chamada pelo Login.js.
   */
  const login = (loggedInUser) => {
    
    // --- INÍCIO DA CORREÇÃO ---

    // 1. Verifica se o usuário é válido (aceita idFunc do MOCK ou idFunci da API REAL)
    if (!loggedInUser || (!loggedInUser.idFunc && !loggedInUser.idFunci)) {
      console.error("Tentativa de login falhou: objeto de usuário inválido", loggedInUser);
      return;
    }

    // 2. Cria um objeto padronizado (o app sempre usará 'idFunc' internamente)
    //    Ele pega o valor de loggedInUser.idFunc OU loggedInUser.idFunci
    const standardizedUser = {
      idFunc: loggedInUser.idFunc || loggedInUser.idFunci,
      nome: loggedInUser.nome,
      autoridade: loggedInUser.autoridade
    };
    
    // --- FIM DA CORREÇÃO ---

    setIsLoggedIn(true);
    setUser(standardizedUser); // 3. Salva o usuário padronizado
    const authData = { isLoggedIn: true, user: standardizedUser };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
    navigate('/dashboard'); 
  };

  /**
   * Função para DESLOGAR. Chamada pelo Header.
   */
  const logout = () => {
    setIsLoggedIn(false);
    setUser(null); 
    localStorage.removeItem(STORAGE_KEY);
    navigate('/'); 
  };

  // Valor a ser compartilhado
  const value = {
    isLoggedIn,
    isLoading, 
    login,
    logout,
    user, // Exporta o usuário padronizado
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