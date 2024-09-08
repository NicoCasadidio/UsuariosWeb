import React, { useState, useEffect } from 'react';

export default function UsuariosApp() {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [mail, setMail] = useState('');
  const [numeroTelefono, setNumeroTelefono] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [elegido, setElegido] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [criterio, setCriterio] = useState('comienza');
  const [campo, setCampo] = useState('nombre');
  const [editando, setEditando] = useState({ campo: null, mail: null });
  const [error, setError] = useState('');

  const back = 'http://200.3.127.46:30012'; // Ruta al backend

  useEffect(() => {
    if (busqueda) {
      buscar();
    } else {
      traer();
    }
  }, [busqueda, criterio, campo]);

  function traer() {
    fetch(`${back}/usuarios`)
      .then(response => response.json())
      .then(data => {
        setUsuarios(data);
        setElegido(null);
        setNombre('');
        setApellido('');
        setMail('');
        setNumeroTelefono('');
      })
      .catch(error => console.error('Error al traer usuarios:', error));
  }

  function guardar() {
    if (!nombre || !apellido || !numeroTelefono) {
      setError('Todos los campos son obligatorios');
      return;
    }

    if (nombre.length < 3) {
      setError('El nombre debe tener al menos 3 caracteres');
      return;
    }

    if (apellido.length < 3) {
      setError('El apellido debe tener al menos 3 caracteres');
      return;
    }

    if (!/^\d{10}$/.test(numeroTelefono)) {
      setError('El número de teléfono debe tener 10 dígitos');
      return;
    }

    const usuario = { nombre, apellido, mail, numero_telefono: numeroTelefono };

    const metodo = elegido ? 'PUT' : 'POST';
    const url = elegido ? `${back}/usuarios/${mail}` : `${back}/usuarios`;

    fetch(url, {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(usuario)
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => { throw err; });
        }
        return response.json();
      })
      .then(() => {
        setError('');
        traer();
      })
      .catch(error => {
        setError(error.error || 'Error al guardar usuario');
        console.error('Error al guardar usuario:', error);
      });
  }

  function elegir(mail) {
    const usuario = usuarios.find(u => u.mail === mail);
    if (usuario) {
      setNombre(usuario.nombre);
      setApellido(usuario.apellido);
      setMail(usuario.mail);
      setNumeroTelefono(usuario.numero_telefono);
      setElegido(usuario.mail);
    }
  }

  function buscar() {
    fetch(`${back}/buscar?campo=${campo}&criterio=${criterio}&valor=${busqueda}`)
      .then(response => response.json())
      .then(data => setUsuarios(data))
      .catch(error => console.error('Error al buscar usuarios:', error));
  }

  function handleEdit(mail, campo) {
    if (campo !== 'mail') {
      setEditando({ campo, mail });
    }
  }

  function handleBlur(mail, campo, valor) {
    if (!valor) {
      setError(`El campo ${campo} no puede ser nulo`);
      return;
    }
  
    if (campo === 'numero_telefono' && !/^\d{10}$/.test(valor)) {
      setError('El número de teléfono debe tener 10 dígitos');
      return;
    }
  
    const usuario = usuarios.find(u => u.mail === mail);
    if (usuario) {
      usuario[campo] = valor;
      setEditando({ campo: null, mail: null });
  
      fetch(`${back}/usuarios/${mail}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuario)
      })
        .then(response => {
          if (!response.ok) {
            return response.json().then(err => { throw err; });
          }
          return response.json();
        })
        .then(() => {
          setError('');
          traer();
        })
        .catch(error => {
          setError('Error al actualizar usuario');
          console.error('Error al actualizar usuario:', error);
        });
    }
  }

  function handleKeyDown(event, mail, campo, valor) {
    if (event.key === 'Enter') {
      handleBlur(mail, campo, valor);
    }
  }

  function renderCampo(usuario, campo) {
    if (editando.campo === campo && editando.mail === usuario.mail) {
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
          className="w-1/4"
          required
        />
      );
    }
    return (
      <span onClick={() => handleEdit(usuario.mail, campo)}>{usuario[campo]}</span>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <div className="w-full max-w-4xl p-5 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl text-center font-bold text-gray-800 mb-5">Gestión de Usuarios</h1>
        {error && <div className="text-red-500 mb-3">{error}</div>}
        <div className="flex space-x-2 mb-5">
          <input
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            className="flex-1 border border-gray-300 rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="Apellido"
            value={apellido}
            onChange={e => setApellido(e.target.value)}
            className="flex-1 border border-gray-300 rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="Mail"
            value={mail}
            onChange={e => setMail(e.target.value)}
            disabled={elegido !== null}
            className="flex-1 border border-gray-300 rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="Número de Teléfono"
            value={numeroTelefono}
            onChange={e => setNumeroTelefono(e.target.value)}
            className="flex-1 border border-gray-300 rounded px-3 py-2"
          />
          <button
            onClick={guardar}
            className="bg-blue-500 text-white rounded px-5 py-2 hover:bg-blue-700 transition"
          >
            Guardar
          </button>
        </div>

        <div className="mb-5">
          <input
            type="text"
            placeholder="Buscar"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div className="mb-5 flex space-x-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="criterio"
              value="comienza"
              checked={criterio === 'comienza'}
              onChange={e => setCriterio(e.target.value)}
              className="mr-2"
            />
            Comienza con
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="criterio"
              value="termina"
              checked={criterio === 'termina'}
              onChange={e => setCriterio(e.target.value)}
              className="mr-2"
            />
            Termina con
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="criterio"
              value="contiene"
              checked={criterio === 'contiene'}
              onChange={e => setCriterio(e.target.value)}
              className="mr-2"
            />
            Contiene
          </label>
        </div>

        <div className="mb-5 flex space-x-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="campo"
              value="nombre"
              checked={campo === 'nombre'}
              onChange={e => setCampo(e.target.value)}
              className="mr-2"
            />
            Nombre
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="campo"
              value="apellido"
              checked={campo === 'apellido'}
              onChange={e => setCampo(e.target.value)}
              className="mr-2"
            />
            Apellido
          </label>
        </div>

        <table className="w-full border border-gray-300 rounded-lg">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border-b border-gray-300">Nombre</th>
              <th className="px-4 py-2 border-b border-gray-300">Apellido</th>
              <th className="px-4 py-2 border-b border-gray-300">Mail</th>
              <th className="px-4 py-2 border-b border-gray-300">Teléfono</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(usuario => (
              <tr key={usuario.mail} className="text-center">
                <td className="px-4 py-2 border-b border-gray-300">
                  {renderCampo(usuario, 'nombre')}
                </td>
                <td className="px-4 py-2 border-b border-gray-300">
                  {renderCampo(usuario, 'apellido')}
                </td>
                <td className="px-4 py-2 border-b border-gray-300">
                  {renderCampo(usuario, 'mail')}
                </td>
                <td className="px-4 py-2 border-b border-gray-300">
                  {renderCampo(usuario, 'numero_telefono')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
