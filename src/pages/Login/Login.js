import React, { useState } from 'react';
// useNavigate não é mais necessário aqui, o AuthContext cuida disso
import { useAuth } from '../../context/AuthContext'; // Importar nosso hook de autenticação

// ===================================================================
// Mude esta variável para 'false' quando sua API real estiver pronta
const MODO_MOCK = true;
// ===================================================================

// Lemos a URL base da nossa API do arquivo .env
const API_BASE_URL = process.env.REACT_APP_API_URL;

function Login() {
  
  // --- ESTADOS DO FORMULÁRIO ---
  // O estado interno ainda se chama 'email', pois é o que o <input> representa
  const [email, setEmail] = useState(''); 
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Para o botão "Mostrar Senha"

  // --- ESTADOS DE FEEDBACK DE ENVIO (POST) ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // --- CONTEXTO DE AUTENTICAÇÃO ---
  const { login } = useAuth(); // Pegamos a função 'login' do nosso cérebro global

  /**
   * Função chamada quando o formulário é enviado
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    // Montamos o JSON com a chave 'idFunci', exatamente como o back-end espera.
    const dadosLogin = { 
      idFunci: email, // O valor do estado 'email' é enviado na chave 'idFunci'
      senha: senha 
    };

    try {
      if (MODO_MOCK) {
        // --- MODO MOCK (Simulação) ---
        console.log('MODO MOCK: Autenticando...', dadosLogin); // Agora mostrará 'idFunci'
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('MODO MOCK: Autenticado com sucesso.');

      } else {
        // --- MODO REAL (Quando o Back-end estiver pronto) ---
        const urlApiReal = `${API_BASE_URL}/login`;
        
        const response = await fetch(urlApiReal, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dadosLogin), // Envia o JSON com 'idFunci'
        });

        if (!response.ok) {
          throw new Error('Login ou senha inválidos.'); // Mensagem genérica por segurança
        }
        
        // const { token } = await response.json(); 
      }

      // SUCESSO! (Mock ou Real)
      login();

    } catch (err) {
      // Erro (Mock ou Real)
      console.error(err);
      setSubmitError(err.message);
      
    } finally {
      // Finalização (sempre roda)
      setIsSubmitting(false);
    }
  }

  // --- RENDERIZAÇÃO ---
  return (
    <div className="page-container">
      <form className="chamado-form" onSubmit={handleSubmit}>
        <h1>Login de Funcionário</h1>
        
        <div className="form-group">
          {/* A label continua "Email" para o usuário */}
          <label htmlFor="email">Email / ID do Funcionário</label> 
          <input 
            type="email" // O 'type' email ajuda na validação/teclado mobile
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