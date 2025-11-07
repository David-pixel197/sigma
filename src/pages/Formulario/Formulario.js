import React from 'react';

function Formulario() {
  
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Chamado enviado! (Em breve, isso irá para o banco de dados)');
  }

  return (
    <div className="page-container">
      <form className="chamado-form" onSubmit={handleSubmit}>
        <h1>Abrir Novo Chamado</h1>
        
        <div className="form-group">
          <label htmlFor="local">Local</label>
          <select id="local" required>
            <option value="">Selecione o local...</option>
            {/* TODO: Esses dados virão do banco */}
            <option value="1">Sala 101</option>
            <option value="2">Copa</option>
            <option value="3">Banheiro 2º Andar</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="descricao">Descreva o Problema</label>
          <textarea
            id="descricao"
            rows="5"
            placeholder="Ex: A luz do projetor não está ligando."
            required
          />
        </div>

        <button type="submit" className="submit-button">
          Enviar Chamado
        </button>
      </form>
    </div>
  );
}

export default Formulario;