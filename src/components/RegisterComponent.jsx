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

    const response = await fetch('http://186.136.155.242:30012/register', {
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
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg">
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {success && <p className="text-green-500 text-center mb-4">{success}</p>}
      <form onSubmit={handleRegister} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="correo@ejemplo.com"
              required
            />
          </div>
          <div>
            <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">Nombre</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Juan"
              required
            />
          </div>
          <div>
            <label htmlFor="surname" className="block text-gray-700 font-semibold mb-2">Apellido</label>
            <input
              type="text"
              id="surname"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Pérez"
              required
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-gray-700 font-semibold mb-2">Número de Teléfono</label>
            <input
              type="text"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+54 9 11 1234-5678"
              required
            />
          </div>
        </div>
        <div className="mt-3">
          <button type="submit" className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300">
            Registrarse
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterComponent;
