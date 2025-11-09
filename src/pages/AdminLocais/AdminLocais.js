import React, { useState, useEffect, useRef } from 'react';
import './AdminLocais.css'; // Usaremos um CSS separado (mas parecido)

// ===================================================================
const MODO_MOCK = true;
const API_BASE_URL = process.env.REACT_APP_API_URL;
// ===================================================================

const formInicial = {
  idLocal: null, // Usado apenas para edição
  nome: '',
  descricao: '',
};

function AdminLocais() {
  const [locais, setLocais] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Estados do Formulário ---
  const [formData, setFormData] = useState(formInicial);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const topRef = useRef(null);

  // --- Efeito: Buscar dados (GET) ---
  useEffect(() => {
    const fetchLocais = async () => {
      setIsLoading(true);
      const url = MODO_MOCK ? '/mock/locais.json' : `${API_BASE_URL}/locais`;
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Falha ao carregar locais.');
        const data = await response.json();
        setLocais(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLocais();
  }, []);

  // --- Handlers do Formulário ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const metodo = isEditing ? 'PUT' : 'POST';
    let url = `${API_BASE_URL}/locais`;
    if (isEditing) {
      url += `/${formData.idLocal}`;
    }

    try {
      if (MODO_MOCK) {
        await new Promise(res => setTimeout(res, 500));
        if (isEditing) {
          // Lógica de ATUALIZAR (PUT)
          console.log('MOCK PUT:', formData);
          setLocais(prev =>
            prev.map(l => (l.idLocal === formData.idLocal ? formData : l))
          );
        } else {
          // Lógica de CRIAR (POST)
          const novoLocal = { ...formData, idLocal: `l${Math.random().toString(36).substr(2, 9)}` };
          console.log('MOCK POST:', novoLocal);
          setLocais(prev => [...prev, novoLocal]);
        }
      } else {
        // --- MODO REAL ---
        const response = await fetch(url, {
          method: metodo,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!response.ok) throw new Error(`Falha ao ${isEditing ? 'atualizar' : 'criar'} local.`);
        const data = await response.json();
        
        if (isEditing) {
          setLocais(prev => prev.map(l => (l.idLocal === data.idLocal ? data : l)));
        } else {
          setLocais(prev => [...prev, data]);
        }
      }
      handleCancelEdit();
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Handlers da Lista (CRUD) ---
  const handleEdit = (local) => {
    setFormData(local);
    setIsEditing(true);
    setSubmitError(null);
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setFormData(formInicial);
    setIsEditing(false);
    setSubmitError(null);
  };

  const handleDelete = async (idLocal) => {
    if (!window.confirm('Tem certeza que deseja deletar este local?')) {
      return;
    }

    try {
      if (MODO_MOCK) {
        await new Promise(res => setTimeout(res, 500));
        console.log('MOCK DELETE:', idLocal);
        setLocais(prev => prev.filter(l => l.idLocal !== idLocal));
      } else {
        // --- MODO REAL ---
        const url = `${API_BASE_URL}/locais/${idLocal}`;
        const response = await fetch(url, { method: 'DELETE' });
        if (!response.ok) throw new Error('Falha ao deletar local.');
        setLocais(prev => prev.filter(l => l.idLocal !== idLocal));
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
      <h1>Gerenciar Locais</h1>

      {/* --- Formulário de Adicionar/Editar --- */}
      <form onSubmit={handleSubmit} className="admin-form">
        <h2>{isEditing ? 'Editar Local' : 'Adicionar Novo Local'}</h2>
        
        {submitError && <div className="form-error">{submitError}</div>}
        
        <div className="form-group">
          <label htmlFor="nome">Nome do Local (Ex: Sala 101)</label>
          <input type="text" id="nome" name="nome" value={formData.nome} onChange={handleInputChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="descricao">Descrição (Ex: Segundo andar, ala oeste, na frente...)</label>
          <textarea id="descricao" name="descricao" rows="4" value={formData.descricao} onChange={handleInputChange} required />
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

      {/* --- Lista de Locais --- */}
      <h2>Locais Existentes</h2>
      <ul className="admin-list">
        {locais.map(local => (
          <li key={local.idLocal} className="admin-list-item">
            <div className="item-info">
              <strong>{local.nome}</strong>
              <small>{local.descricao.substring(0, 100)}...</small>
            </div>
            <div className="item-actions">
              <button className="edit-button" onClick={() => handleEdit(local)}>Editar</button>
              <button className="delete-button" onClick={() => handleDelete(local.idLocal)}>Deletar</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminLocais;