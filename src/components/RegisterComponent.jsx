import React, { useState } from 'react';

const RegisterComponent = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const response = await fetch('http://200.3.127.46:30012/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, name, surname, phone }),
    });

    const data = await response.json();

    if (response.ok) {
      setSuccess(data.message);
    } else {
      setError(data.error);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Registrar Usuario</h2>
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label htmlFor="email" className="block">Correo Electrónico</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300"
            required
          />
        </div>
        <div>
          <label htmlFor="name" className="block">Nombre</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border border-gray-300"
            required
          />
        </div>
        <div>
          <label htmlFor="surname" className="block">Apellido</label>
          <input
            type="text"
            id="surname"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            className="w-full p-2 border border-gray-300"
            required
          />
        </div>
        <div>
          <label htmlFor="phone" className="block">Número de Teléfono</label>
          <input
            type="text"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-2 border border-gray-300"
            required
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2">Registrarse</button>
      </form>
    </div>
  );
};

export default RegisterComponent;
