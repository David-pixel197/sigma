import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext'; // Importar nosso hook de autenticação

// ===================================================================
// Mude esta variável para 'false' quando sua API real estiver pronta
const MODO_MOCK = process.env.REACT_APP_MODO_MOCK === 'true';
// ===================================================================

// Lemos a URL base da nossa API do arquivo .env
const API_BASE_URL = process.env.REACT_APP_API_URL;

function Login() {
  
  // --- ESTADOS DO FORMULÁRIO ---
  const [email, setEmail] = useState(''); 
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // --- ESTADOS DE FEEDBACK DE ENVIO (POST) ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // --- CONTEXTO DE AUTENTICAÇÃO ---
  const { login } = useAuth(); // Pegamos a função 'login'

  /**
   * Função chamada quando o formulário é enviado
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const dadosLogin = { 
      idFunci: email, 
      senha: senha 
    };

    try {
      if (MODO_MOCK) {
        // --- MODO MOCK (CORRIGIDO) ---
        console.log('MODO MOCK: Autenticando...', dadosLogin);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 1. Busca o usuário mockado
        const response = await fetch('/mock/me.json');
        if (!response.ok) throw new Error('Arquivo mock/me.json não encontrado.');
        const user = await response.json();
        
        // 2. Chama a função login() do Contexto com o usuário mockado
        login(user);

      } else {
        // --- MODO REAL (Corrigido para segurança) ---
        const urlApiReal = `${API_BASE_URL}/login`;
        
        const response = await fetch(urlApiReal, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dadosLogin),
        });

        // 1. Checa o erro ANTES de tentar ler o .json()
        if (!response.ok) {
          throw new Error('Login ou senha inválidos.'); 
        }
        
        // 2. Se a resposta for OK, lê os dados
        const data = await response.json();
        
        // 3. Chama o login com o usuário (data.user)
        login(data.user);
      }

    } catch (err) {
      // Erro (Mock ou Real)
      console.error(err);
      setSubmitError(err.message);
      
    } finally {
      // Finalização (sempre roda)
      setIsSubmitting(false);
    }
  }

  // --- RENDERIZAÇÃO (Seu JSX está perfeito e não foi alterado) ---
  return (
    <div className="page-container">
      <form className="chamado-form" onSubmit={handleSubmit}>
        <h1>Login de Funcionário</h1>
        
        <div className="form-group">
          <label htmlFor="email">Email</label> 
          <input 
            type="email"
            id="email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            placeholder="seu.email@empresa.com"
          />
        </div>

        <div className="form-group password-wrapper">
          <label htmlFor="senha">Senha</label>
          <input
            type={showPassword ? 'text' : 'password'}
            id="senha"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            disabled={isSubmitting}
          />
          <button 
            type="button"
            className="password-toggle-btn"
            onClick={() => setShowPassword(prev => !prev)}
          >
            {showPassword ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>

        {submitError && (
          <div className="form-error">
            {submitError}
          </div>
        )}

        <button 
          type="submit" 
          className="submit-button" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </button>

      </form>
    </div>
  );
}

export default Login;