import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css'; // Importa os estilos

// ===================================================================
// CONFIGURAÇÃO
const MODO_MOCK = process.env.REACT_APP_MODO_MOCK === 'true';
const API_BASE_URL = process.env.REACT_APP_API_URL;
// ===================================================================

/**
 * Componente Principal do Dashboard
 */
function Dashboard() {
  // --- ESTADOS GLOBAIS ---
  const { user } = useAuth(); // Pega o usuário logado (com 'autoridade')

  // --- ESTADOS DE DADOS ---
  const [chamados, setChamados] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [locais, setLocais] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- ESTADOS DE UI E FILTROS ---
  const [filtroStatus, setFiltroStatus] = useState('abertos'); // 'abertos', 'fechados', 'todos'
  const [filtroAtribuicao, setFiltroAtribuicao] = useState('todos'); // 'todos', 'meus', 'nao_atribuidos'
  const [ordenacao, setOrdenacao] = useState('dataAbertura_desc'); // 'dataAbertura_desc', 'dataAbertura_asc', 'local_asc'
  const [expandedCardId, setExpandedCardId] = useState(null); // ID do card expandido
  const [updatingChamadoId, setUpdatingChamadoId] = useState(null); // ID do card sendo atualizado (PATCH)

  // --- LÓGICA DE BUSCA DE DADOS (GET) ---
  useEffect(() => {
    // Função para buscar múltiplos endpoints
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      const urls = {
        chamados: MODO_MOCK ? '/mock/chamados.json' : `${API_BASE_URL}/chamados`,
        funcionarios: MODO_MOCK ? '/mock/funcionarios.json' : `${API_BASE_URL}/funcionarios`,
        locais: MODO_MOCK ? '/mock/locais.json' : `${API_BASE_URL}/locais`,
      };

      try {
        // Busca todos os dados em paralelo
        const [chamadosRes, funcionariosRes, locaisRes] = await Promise.all([
          fetch(urls.chamados),
          fetch(urls.funcionarios),
          fetch(urls.locais),
        ]);

        if (!chamadosRes.ok || !funcionariosRes.ok || !locaisRes.ok) {
          throw new Error('Falha ao buscar dados do dashboard.');
        }

        const chamadosData = await chamadosRes.json();
        const funcionariosData = await funcionariosRes.json();
        const locaisData = await locaisRes.json();

        // Salva os dados nos estados
        setChamados(chamadosData);
        setFuncionarios(funcionariosData);
        setLocais(locaisData);

      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); // Roda só uma vez

  // --- LÓGICA DE ATUALIZAÇÃO DE DADOS (PATCH / PUT) ---

  /**
   * (PATCH) Função para atribuir ou alterar o funcionário de um chamado.
   */
  const handleAtribuir = useCallback(async (idChamado, idFunc) => {
    console.log(`Atribuindo chamado ${idChamado} ao funcionário ${idFunc}`);
    setUpdatingChamadoId(idChamado); // Mostra "carregando" no card

    const url = MODO_MOCK ? `/mock/chamados/${idChamado}` : `${API_BASE_URL}/chamados/${idChamado}`;
    const payload = { fk_Funcionario_idFunci: idFunc };

    try {
      if (MODO_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simula rede
        // Atualiza a lista de chamados no front-end (simulação)
        setChamados(prevChamados =>
          prevChamados.map(c =>
            c.idChamado === idChamado ? { ...c, fk_Funcionario_idFunci: idFunc } : c
          )
        );
      } else {
        // --- MODO REAL ---
        const response = await fetch(url, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error('Falha ao atribuir chamado.');
        const chamadoAtualizado = await response.json();
        // Atualiza a lista com o retorno da API
        setChamados(prevChamados =>
          prevChamados.map(c =>
            c.idChamado === idChamado ? chamadoAtualizado : c
          )
        );
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      alert(err.message); // Mostra erro para o usuário
    } finally {
      setUpdatingChamadoId(null); // Para de carregar
    }
  }, []);

  /**
   * (PATCH) Função para fechar ou reabrir um chamado.
   */
  const handleToggleAberto = useCallback(async (chamado) => {
    const novoStatus = !chamado.aberto;
    console.log(`Mudando status do chamado ${chamado.idChamado} para ${novoStatus ? 'aberto' : 'fechado'}`);
    setUpdatingChamadoId(chamado.idChamado);

    const url = MODO_MOCK ? `/mock/chamados/${chamado.idChamado}` : `${API_BASE_URL}/chamados/${chamado.idChamado}`;
    const payload = { aberto: novoStatus };

    try {
      if (MODO_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 500));
        // Atualiza o chamado no front-end (simulação)
        setChamados(prevChamados =>
          prevChamados.map(c =>
            c.idChamado === chamado.idChamado ? { ...c, aberto: novoStatus } : c
          )
        );
      } else {
        // --- MODO REAL ---
        const response = await fetch(url, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error('Falha ao atualizar status.');
        const chamadoAtualizado = await response.json();
        // Atualiza a lista com o retorno da API
        setChamados(prevChamados =>
          prevChamados.map(c =>
            c.idChamado === chamado.idChamado ? chamadoAtualizado : c
          )
        );
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setUpdatingChamadoId(null);
    }
  }, []);

  // --- LÓGICA DE FILTRO E ORDENAÇÃO ---

  // Função auxiliar para buscar o nome do local (otimizada)
  const getLocal = useCallback((idLocal) => {
    return locais.find(l => l.idLocal === idLocal);
  }, [locais]);

  // Aplica os filtros (memoizado para performance)
  const chamadosFiltrados = useMemo(() => {
    return chamados.filter(c => {
      // Filtro 1: Status (Abertos / Fechados / Todos)
      if (filtroStatus === 'abertos' && !c.aberto) return false;
      if (filtroStatus === 'fechados' && c.aberto) return false;

      // Filtro 2: Atribuição (Meus / Não Atribuídos / Todos)
      if (filtroAtribuicao === 'meus' && c.fk_Funcionario_idFunci !== user?.idFunci) return false;
      if (filtroAtribuicao === 'nao_atribuidos' && c.fk_Funcionario_idFunci !== null) return false;

      return true;
    });
  }, [chamados, filtroStatus, filtroAtribuicao, user]);

  // Aplica a ordenação (memoizado para performance)
  const chamadosOrdenados = useMemo(() => {
    const chamadosComLocal = chamadosFiltrados.map(c => ({
      ...c,
      _localNome: getLocal(c.fk_Local_idLocal)?.nome || '' // Adiciona nome do local para ordenar
    }));

    return chamadosComLocal.sort((a, b) => {
      switch (ordenacao) {
        case 'dataAbertura_desc':
          return new Date(b.dataAbertura + 'T' + b.horaAbertura) - new Date(a.dataAbertura + 'T' + a.horaAbertura);
        case 'dataAbertura_asc':
          return new Date(a.dataAbertura + 'T' + a.horaAbertura) - new Date(b.dataAbertura + 'T' + b.horaAbertura);
        case 'local_asc':
          return a._localNome.localeCompare(b._localNome);
        default:
          return 0;
      }
    });
  }, [chamadosFiltrados, ordenacao, getLocal]);

  // --- LÓGICA DE UI (EVENT HANDLERS) ---

  // Função para expandir/recolher card
  const handleToggleExpand = (idChamado) => {
    setExpandedCardId(prevId => (prevId === idChamado ? null : idChamado));
  };

  // --- RENDERIZAÇÃO ---

  if (isLoading) {
    return <div className="page-container"><p>Carregando Dashboard...</p></div>;
  }

  if (error) {
    return <div className="page-container"><p>Erro: {error}</p></div>;
  }

  return (
    <div className="dashboard-container">
      {/* --- Cabeçalho do Dashboard --- */}
      <header className="dashboard-header">
        <div className="welcome-message">
          Olá, <strong>{user?.nome || 'Usuário'}</strong>
          {user?.autoridade && <span className="admin-badge">Autoridade</span>}
        </div>
        {/* Botões de CRUD (Admin) */}
        {user?.autoridade && (
          <div className="admin-actions">
            <Link to="/admin/funcionarios" className="admin-button">Gerenciar Funcionários</Link>
            <Link to="/admin/locais" className="admin-button">Gerenciar Locais</Link>
          </div>
        )}
      </header>

      {/* --- Filtros e Ordenação --- */}
      <div className="filtros-container">
        {/* Filtro de Status */}
        <div className="filtro-grupo">
          <label htmlFor="filtro-status">Mostrar:</label>
          <select id="filtro-status" value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}>
            <option value="abertos">Abertos</option>
            <option value="fechados">Fechados</option>
            <option value="todos">Todos</option>
          </select>
        </div>
        
        {/* Filtro de Atribuição */}
        <div className="filtro-grupo">
          <label htmlFor="filtro-atribuicao">Atribuição:</label>
          <select id="filtro-atribuicao" value={filtroAtribuicao} onChange={e => setFiltroAtribuicao(e.target.value)}>
            <option value="todos">Todos</option>
            <option value="meus">Meus Chamados</option>
            <option value="nao_atribuidos">Não Atribuídos</option>
          </select>
        </div>

        {/* Ordenação */}
        <div className="filtro-grupo">
          <label htmlFor="ordenacao">Ordenar por:</label>
          <select id="ordenacao" value={ordenacao} onChange={e => setOrdenacao(e.target.value)}>
            <option value="dataAbertura_desc">Mais Recentes</option>
            <option value="dataAbertura_asc">Mais Antigos</option>
            <option value="local_asc">Local (A-Z)</option>
          </select>
        </div>
      </div>

      {/* --- Lista de Chamados --- */}
      <div className="chamado-list">
        {chamadosOrdenados.length === 0 && (
          <p className="no-results">Nenhum chamado encontrado para os filtros selecionados.</p>
        )}
        {chamadosOrdenados.map(chamado => (
          <ChamadoCard
            key={chamado.idChamado}
            chamado={chamado}
            local={getLocal(chamado.fk_Local_idLocal)}
            funcionarios={funcionarios}
            // --- MUDANÇA AQUI ---
            // Passamos o 'user' logado para o card poder tomar decisões
            user={user}
            // --- FIM DA MUDANÇA ---
            isExpanded={expandedCardId === chamado.idChamado}
            onToggleExpand={() => handleToggleExpand(chamado.idChamado)}
            onAtribuir={handleAtribuir}
            onToggleAberto={handleToggleAberto}
            isUpdating={updatingChamadoId === chamado.idChamado}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Sub-Componente para o Card do Chamado
 */
function ChamadoCard({
  chamado,
  local,
  funcionarios,
  user,
  isExpanded,
  onToggleExpand,
  onAtribuir,
  onToggleAberto,
  isUpdating,
}) {
  const {
    idChamado,
    descricao,
    dataAbertura,
    horaAbertura,
    aberto,
    fk_Funcionario_idFunci,
  } = chamado;

  // Busca o nome do funcionário atribuído
  const funcionarioAtribuido = useMemo(() => {
    return funcionarios.find(f => f.idFunci === fk_Funcionario_idFunci);
  }, [funcionarios, fk_Funcionario_idFunci]);

  // Formata a data/hora
  const dataHoraFormatada = useMemo(() => {
    try {
      const data = new Date(`${dataAbertura}T${horaAbertura}`);
      return data.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
    } catch (e) {
      return 'Data inválida';
    }
  }, [dataAbertura, horaAbertura]);

  // Handler para o <select> de admin
  const handleAdminAtribuir = (e) => {
    const idFunc = e.target.value === 'null' ? null : e.target.value;
    onAtribuir(idChamado, idFunc);
  };

  // Handler para o botão "Atribuir a mim"
  const handleAtribuirParaMim = () => {
    if (user) {
      onAtribuir(idChamado, user.idFunci);
    }
  };

  // Handler para o botão de status
  const handleToggleClick = () => {
    onToggleAberto(chamado);
  };

  // --- MUDANÇA AQUI ---
  // Verifica se o usuário logado pode alterar o status do chamado.
  // Regra: Ele pode se for admin (autoridade=true) OU
  // se o chamado estiver atribuído a ele (e não for nulo).
  const podeAlterarStatus = user?.autoridade || (fk_Funcionario_idFunci === user?.idFunci && fk_Funcionario_idFunci !== null);
  // --- FIM DA MUDANÇA ---

  return (
    <div className={`chamado-card ${aberto ? 'status-aberto' : 'status-fechado'}`}>
      {/* Cabeçalho (resumo) */}
      <div className="card-header">
        <div className="card-info-header">
          <span className="info-local">{local?.nome || 'Local não encontrado'}</span>
          <span className="info-data">{dataHoraFormatada}</span>
          <span className={`info-status ${aberto ? 'aberto' : 'fechado'}`}>
            {aberto ? 'Aberto' : 'Fechado'}
          </span>
        </div>
        <button onClick={onToggleExpand} className="expand-button">
          {isExpanded ? 'Recolher' : 'Expandir'}
        </button>
      </div>

      {/* Corpo (detalhes) - Mostrado apenas se expandido */}
      {isExpanded && (
        <div className="card-body">
          <strong>Descrição do Problema:</strong>
          <p>{descricao}</p>
          <strong>Localização (Detalhes):</strong>
          <p>{local?.descricao || 'Sem detalhes de localização.'}</p>
        </div>
      )}

      {/* Rodapé (ações) */}
      <div className="card-footer">
        <div className="atribuicao-info">
          <strong>Atribuído a:</strong>
          {/* Lógica de atribuição (Admin vs Funcionário) */}
          {user?.autoridade ? (
            // ADMIN: Mostra um <select>
            <select
              className="atribuir-select"
              value={fk_Funcionario_idFunci || 'null'}
              onChange={handleAdminAtribuir}
              disabled={isUpdating}
            >
              <option value="null">--- Ninguém ---</option>
              {funcionarios.map(f => (
                <option key={f.idFunci} value={f.idFunci}>{f.nome}</option>
              ))}
            </select>
          ) : (
            // FUNCIONÁRIO: Mostra texto ou botão
            <>
              <span>{funcionarioAtribuido?.nome || 'Ninguém'}</span>
              {!funcionarioAtribuido && (
                <button
                  className="atribuir-button"
                  onClick={handleAtribuirParaMim}
                  disabled={isUpdating}
                >
                  Atribuir a mim
                </button>
              )}
            </>
          )}
        </div>

        {/* --- MUDANÇA AQUI: Botão Fechar/Reabrir (com lógica de permissão) --- */}
        {/* O botão só é renderizado se o usuário tiver permissão */}
        {podeAlterarStatus && (
          <button
            className={`toggle-status-button ${aberto ? 'fechado' : 'aberto'}`}
            onClick={handleToggleClick}
            disabled={isUpdating} // Desabilita apenas enquanto está atualizando
          >
            {isUpdating ? 'Atualizando...' : (aberto ? 'Fechar Chamado' : 'Reabrir Chamado')}
          </button>
        )}
        {/* --- FIM DA MUDANÇA --- */}

      </div>
    </div>
  );
}

export default Dashboard;