import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'userAuthData';
const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // NOVO ESTADO
    const navigate = useNavigate();

    // --- EFEITO PARA CARREGAR DADOS DO localStorage NA INICIALIZAÇÃO ---
    useEffect(() => {
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (storedData) {
            try {
                const data = JSON.parse(storedData);
                if (data.isLoggedIn && data.user) {
                    setIsLoggedIn(true);
                    setUserData(data.user);
                }
            } catch (error) {
                localStorage.removeItem(STORAGE_KEY);
            }
        }
        setIsLoading(false); // MARCA O CARREGAMENTO COMO CONCLUÍDO
    }, []);
    // ------------------------------------------------------------------

    const login = (user) => {
        // ... (seu código de login, que salva no localStorage) ...
        if (!user || !user.idFunci) return;

        setIsLoggedIn(true);
        setUserData(user);

        const authData = { isLoggedIn: true, user: user };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));

        navigate('/dashboard'); 
    };

    const logout = () => {
        // ... (seu código de logout, que limpa o localStorage) ...
        setIsLoggedIn(false);
        setUserData(null);
        localStorage.removeItem(STORAGE_KEY);
        navigate('/'); 
    };

    const value = {
        isLoggedIn,
        userData,
        login,
        logout,
        isLoading, // EXPÕE O NOVO ESTADO
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}