import React, { useState, useEffect } from 'react';

// ===================================================================
// CONFIGURAÇÃO
// Mude esta variável para 'false' quando sua API real estiver pronta
const MODO_MOCK = true;
// URL base da API (lida do arquivo .env na raiz do projeto)
const API_BASE_URL = process.env.REACT_APP_API_URL;
// ===================================================================

function Formulario() {

  // -----------------------------------------------------------------
  // ESTADOS (STATES)
  // -----------------------------------------------------------------
  
  // Estados para o Carregamento da Lista de Locais (GET)
  const [locais, setLocais] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para controlar os campos do formulário (Controlled Components)
  const [localSelecionado, setLocalSelecionado] = useState('');
  const [descricao, setDescricao] = useState('');

  // Estados para o Envio do Formulário (POST)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // -----------------------------------------------------------------
  // LÓGICA DE BUSCA DE DADOS (GET)
  // -----------------------------------------------------------------
  
  // Este useEffect roda UMA VEZ quando o componente é montado
  useEffect(() => {
    // Definimos as duas URLs
    const urlApiReal = `${API_BASE_URL}/locais`; // URL Real: http://localhost:5000/api/locais
    const urlApiMock = '/mock/locais.json';    // URL Falsa: public/mock/locais.json
    
    // O seletor escolhe qual URL usar
    const apiUrl = MODO_MOCK ? urlApiMock : urlApiReal;

    async function fetchLocais() {
      try {
        // Para simular a demora de uma rede real e testar o "loading"
        if (MODO_MOCK) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Simula 1s de espera
        }

        // 1. A Requisição (Ida)
        const response = await fetch(apiUrl);
        
        // 2. A Verificação
        if (!response.ok) {
          throw new Error('Falha ao buscar dados dos locais.');
        }
        
        // 3. A Resposta (Volta)
        const data = await response.json();
        
        // 4. A Atualização do Estado
        setLocais(data);

      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false); // Para de carregar (com sucesso ou erro)
      }
    }

    fetchLocais(); // Chama a função
  }, []); // O '[]' vazio garante que isso rode só uma vez

  // -----------------------------------------------------------------
  // LÓGICA DE ENVIO DE DADOS (POST)
  // -----------------------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault(); // Impede o recarregamento da página

    setIsSubmitting(true); // 1. Começa o envio
    setSubmitError(null);  // 2. Limpa erros antigos

    // 3. Coleta os dados do formulário
    const dadosDoChamado = {
      idLocal: localSelecionado,
      descricao: descricao,
    };

    try {
      if (MODO_MOCK) {
        // --- MODO MOCK (Simulação) ---
        console.log('MODO MOCK: Enviando dados...', dadosDoChamado);
        
        // Simula uma demora de rede de 1.5 segundos
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simule um erro descomentando a linha abaixo:
        // throw new Error('Falha simulada de rede!');

        console.log('MODO MOCK: Envio concluído com sucesso.');

      } else {
        // --- MODO REAL (Quando o Back-end estiver pronto) ---
        const urlApiReal = `${API_BASE_URL}/chamados`; // Endpoint de POST
        
        // 4. A Requisição (Ida)
        const response = await fetch(urlApiReal, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dadosDoChamado),
        });

        // 5. A Verificação
        if (!response.ok) {
          throw new Error('Houve um problema ao enviar o chamado. Tente novamente.');
        }

        // (Opcional) Ler a resposta, se a API retornar o chamado criado
        // const chamadoCriado = await response.json(); 
      }

      // 6. Sucesso (seja mock ou real)
      alert('Chamado enviado com sucesso!');
      setLocalSelecionado('');
      setDescricao('');

    } catch (err) {
      // 7. Erro (seja mock ou real)
      console.error(err);
      setSubmitError(err.message); // Guarda o erro para exibir ao usuário
      
    } finally {
      // 8. Finalização (sempre roda, com sucesso ou erro)
      setIsSubmitting(false); // Libera o formulário
    }
  }

  // -----------------------------------------------------------------
  // RENDERIZAÇÃO
  // -----------------------------------------------------------------

  // 1. Renderização de Carregamento (Loading da lista de locais)
  if (isLoading) {
    return <div className="page-container"><p>Carregando locais...</p></div>;
  }

  // 2. Renderização de Erro (Erro no GET da lista de locais)
  if (error) {
    return <div className="page-container"><p>Erro: {error}</p></div>;
  }

  // 3. Renderização Principal (Formulário)
  return (
    <div className="page-container">
      <form className="chamado-form" onSubmit={handleSubmit}>
        <h1>Abrir Novo Chamado</h1>
        
        <div className="form-group">
          <label htmlFor="local">Local</label>
          <select 
            id="local" 
            required
            value={localSelecionado} // Ligado ao estado
            onChange={(e) => setLocalSelecionado(e.target.value)} // Atualiza o estado
            disabled={isSubmitting} // Desabilita enquanto envia
          >
            <option value="">Selecione o local...</option>
            {locais.map((local) => (
              <option key={local.idLocal} value={local.idLocal}>
                {local.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="descricao">Descreva o Problema</label>
          <textarea
            id="descricao"
            rows="5"
            placeholder="Ex: A luz do projetor não está ligando."
            required
            value={descricao} // Ligado ao estado
            onChange={(e) => setDescricao(e.target.value)} // Atualiza o estado
            disabled={isSubmitting} // Desabilita enquanto envia
          />
        </div>

        {/* Exibe o erro de POST, se houver */}
        {submitError && (
          <div className="form-error">
            {submitError}
          </div>
        )}

        <button 
          type="submit" 
          className="submit-button" 
          disabled={isSubmitting} // Desabilita o botão
        >
          {isSubmitting ? 'Enviando...' : 'Enviar Chamado'}
        </button>
      </form>
    </div>
  );
}

export default Formulario;