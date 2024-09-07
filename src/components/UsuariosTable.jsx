import React from 'react';

export default function UsuariosTable({
  usuarios,
  elegido,
  setElegido,
  editando = { campo: '', mail: '' },
  setEditando,
  handleEdit,
  handleBlur,
  handleKeyDown
}) {

  function renderCampo(usuario, campo) {
    if (editando && editando.campo === campo && editando.mail === usuario.mail) {
      return (
        <input
          type="text"
          defaultValue={usuario[campo]}
          onBlur={e => handleBlur(usuario.mail, campo, e.target.value)}
          onKeyDown={e => handleKeyDown(e, usuario.mail, campo, e.target.value)}
          onInput={e => {
            if (campo === 'numero_telefono') {
              e.target.value = e.target.value.replace(/\D/g, '');
            }
          }}
          maxLength={campo === 'numero_telefono' ? 10 : undefined}
          autoFocus
          className="w-1/4 border border-gray-300 p-1 rounded"
          required
        />
      );
    }
    return (
      <span onClick={() => handleEdit(usuario.mail, campo)} className="w-1/4 cursor-pointer">
        {usuario[campo]}
      </span>
    );
  }

  return (
    <div className="space-y-2">
      {usuarios.map(usuario => (
        <div
          key={usuario.mail}
          className={`flex justify-between p-2 border border-gray-300 rounded ${usuario.mail === elegido ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
        >
          {renderCampo(usuario, 'nombre')}
          {renderCampo(usuario, 'apellido')}
          {renderCampo(usuario, 'mail')}
          {renderCampo(usuario, 'numero_telefono')}
        </div>
      ))}
    </div>
  );
}
