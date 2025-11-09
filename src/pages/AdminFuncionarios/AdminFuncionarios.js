import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import './AdminFuncionarios.css'; // Estilos para esta página

// ===================================================================
const MODO_MOCK = true;
const API_BASE_URL = process.env.REACT_APP_API_URL;
// ===================================================================

// Estado inicial do formulário (para limpar)
const formInicial = {
  idFunc: null, // Usado apenas para edição
  nome: '',
  email: '',
  senha: '',
  autoridade: false,
};

function AdminFuncionarios() {
  const { user } = useAuth();
  const [funcionarios, setFuncionarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Estados do Formulário ---
  const [formData, setFormData] = useState(formInicial);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Ref para o topo da página (para scrollar ao editar)
  const topRef = useRef(null);

  // --- Efeito: Buscar dados (GET) ---
  useEffect(() => {
    const fetchFuncionarios = async () => {
      setIsLoading(true);
      const url = MODO_MOCK ? '/mock/funcionarios.json' : `${API_BASE_URL}/funcionarios`;
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Falha ao carregar funcionários.');
        const data = await response.json();
        setFuncionarios(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFuncionarios();
  }, []);

  // --- Handlers do Formulário ---
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const metodo = isEditing ? 'PUT' : 'POST';
    let url = `${API_BASE_URL}/funcionarios`;
    if (isEditing) {
      url += `/${formData.idFunc}`;
    }

    try {
      if (MODO_MOCK) {
        await new Promise(res => setTimeout(res, 500)); // Simula rede
        if (isEditing) {
          // Lógica de ATUALIZAR (PUT)
          console.log('MOCK PUT:', formData);
          setFuncionarios(prev =>
            prev.map(f => (f.idFunc === formData.idFunc ? { ...f, ...formData } : f))
          );
        } else {
          // Lógica de CRIAR (POST)
          const novoFunc = { ...formData, idFunc: `f${Math.random().toString(36).substr(2, 9)}` }; // Gera ID falso
          console.log('MOCK POST:', novoFunc);
          setFuncionarios(prev => [...prev, novoFunc]);
        }
      } else {
        // --- MODO REAL ---
        const response = await fetch(url, {
          method: metodo,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!response.ok) throw new Error(`Falha ao ${isEditing ? 'atualizar' : 'criar'} funcionário.`);
        const data = await response.json();
        
        if (isEditing) {
          setFuncionarios(prev => prev.map(f => (f.idFunc === data.idFunc ? data : f)));
        } else {
          setFuncionarios(prev => [...prev, data]);
        }
      }
      handleCancelEdit(); // Limpa o formulário
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Handlers da Lista (CRUD) ---
  const handleEdit = (func) => {
    setFormData({ ...func, senha: '' }); // Não carregamos a senha por segurança
    setIsEditing(true);
    setSubmitError(null);
    topRef.current?.scrollIntoView({ behavior: 'smooth' }); // Scrolla para o topo
  };

  const handleCancelEdit = () => {
    setFormData(formInicial);
    setIsEditing(false);
    setSubmitError(null);
  };

  const handleDelete = async (idFunc) => {
    if (idFunc === user?.idFunc) {
      alert('Você não pode deletar a si mesmo.');
      return;
    }
    if (!window.confirm('Tem certeza que deseja deletar este funcionário?')) {
      return;
    }

    try {
      if (MODO_MOCK) {
        await new Promise(res => setTimeout(res, 500)); // Simula rede
        console.log('MOCK DELETE:', idFunc);
        setFuncionarios(prev => prev.filter(f => f.idFunc !== idFunc));
      } else {
        // --- MODO REAL ---
        const url = `${API_BASE_URL}/funcionarios/${idFunc}`;
        const response = await fetch(url, { method: 'DELETE' });
        if (!response.ok) throw new Error('Falha ao deletar funcionário.');
        setFuncionarios(prev => prev.filter(f => f.idFunc !== idFunc));
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // --- Renderização ---
  if (isLoading) return <div className="page-container"><p>Carregando...</p></div>;
  if (error) return <div className="page-container"><p>Erro: {error}</p></div>;

  return (
    <div className="admin-page-container" ref={topRef}>
      <h1>Gerenciar Funcionários</h1>

      {/* --- Formulário de Adicionar/Editar --- */}
      <form onSubmit={handleSubmit} className="admin-form">
        <h2>{isEditing ? 'Editar Funcionário' : 'Adicionar Novo Funcionário'}</h2>
        
        {submitError && <div className="form-error">{submitError}</div>}
        
        <div className="form-group">
          <label htmlFor="nome">Nome Completo</label>
          <input type="text" id="nome" name="nome" value={formData.nome} onChange={handleInputChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email (será usado para login)</label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="senha">Senha</label>
          <input type="password" id="senha" name="senha" value={formData.senha} onChange={handleInputChange} placeholder={isEditing ? 'Deixe em branco para não alterar' : ''} required={!isEditing} />
        </div>
        <div className="form-group form-check">
          <input type="checkbox" id="autoridade" name="autoridade" checked={formData.autoridade} onChange={handleInputChange} />
          <label htmlFor="autoridade">Conceder Autoridade (Admin)</label>
        </div>
        <div className="form-actions">
          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Adicionar')}
          </button>
          {isEditing && (
            <button type="button" className="cancel-button" onClick={handleCancelEdit}>
              Cancelar Edição
            </button>
          )}
        </div>
      </form>

      {/* --- Lista de Funcionários --- */}
      <h2>Funcionários Existentes</h2>
      <ul className="admin-list">
        {funcionarios.map(func => (
          <li key={func.idFunc} className="admin-list-item">
            <div className="item-info">
              <strong>{func.nome}</strong> {func.idFunc === user?.idFunc && '(Você)'} {func.autoridade && <span className="admin-badge-list">Autoridade</span>}
              <small>{func.email}</small>
            </div>
            <div className="item-actions">
              <button className="edit-button" onClick={() => handleEdit(func)}>Editar</button>
              <button className="delete-button" onClick={() => handleDelete(func.idFunc)} disabled={func.idFunc === user?.idFunc}>Deletar</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminFuncionarios;