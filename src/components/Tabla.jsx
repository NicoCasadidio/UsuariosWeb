import React, { useState, useEffect } from 'react';
import UsuariosTable from './UsuariosTable';

const Tabla = () => {
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

  const back = 'http://200.3.127.46:30012';

  useEffect(() => {
    const buscar = () => {
      fetch(`${back}/buscar?campo=${campo}&criterio=${criterio}&valor=${busqueda}`)
        .then(response => response.json())
        .then(data => setUsuarios(data))
        .catch(error => console.error('Error al buscar usuarios:', error));
    };

    if (busqueda) {
      buscar();
    } else {
      traer();
    }
  }, [busqueda, criterio, campo]);

  const traer = () => {
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
  };

  const guardar = () => {
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
  };

  const handleEdit = (mail, campo) => {
    if (campo !== 'mail') {
      setEditando({ campo, mail });
    }
  };
  
  const handleBlur = (mail, campo, valor) => {
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
  };

  const handleKeyDown = (event, mail, campo, valor) => {
    if (event.key === 'Enter') {
      handleBlur(mail, campo, valor);
    }
  };

  return (
    <div className="container mx-auto p-4 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-center mb-4">Gestión de Usuarios</h1>
      {error && <div className="text-red-500 text-center mb-4">{error}</div>}
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          className="border border-gray-300 p-2 rounded w-full"
        />
        <input
          type="text"
          placeholder="Apellido"
          value={apellido}
          onChange={e => setApellido(e.target.value)}
          className="border border-gray-300 p-2 rounded w-full"
        />
        <input
          type="text"
          placeholder="Correo Electrónico"
          value={mail}
          onChange={e => setMail(e.target.value)}
          className="border border-gray-300 p-2 rounded w-full"
        />
        <input
          type="text"
          placeholder="Número de Teléfono"
          value={numeroTelefono}
          onChange={e => setNumeroTelefono(e.target.value)}
          className="border border-gray-300 p-2 rounded w-full"
        />
        <button
          onClick={guardar}
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          {elegido ? 'Actualizar' : 'Agregar'}
        </button>
      </div>
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Buscar"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="border border-gray-300 p-2 rounded w-full"
        />
        <select
          value={criterio}
          onChange={e => setCriterio(e.target.value)}
          className="border border-gray-300 p-2 rounded"
        >
          <option value="comienza">Comienza con</option>
          <option value="contiene">Contiene</option>
          <option value="termina">Termina con</option>
        </select>
        <select
          value={campo}
          onChange={e => setCampo(e.target.value)}
          className="border border-gray-300 p-2 rounded"
        >
          <option value="nombre">Nombre</option>
          <option value="apellido">Apellido</option>
          <option value="mail">Correo</option>
          <option value="numero_telefono">Número de Teléfono</option>
        </select>
      </div>
      <UsuariosTable usuarios={usuarios} onEdit={handleEdit} onBlur={handleBlur} onKeyDown={handleKeyDown} />
    </div>
  );
};

export default Tabla;