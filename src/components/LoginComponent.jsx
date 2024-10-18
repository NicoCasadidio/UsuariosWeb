import React, { useState } from 'react';

const LoginComponent = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const response = await fetch('http://186.136.155.242:30012/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      onLoginSuccess(data);  // Maneja el inicio de sesión exitoso (almacena el token, etc.)
    } else {
      setError(data.error);
    }
  };

  const handleForgotPassword = async () => {
    const response = await fetch('http://186.136.155.242:30012/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
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
      <form onSubmit={handleSubmit} className="space-y-6">
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
            <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
          </div>
        </div>
        <div className="mt-8 flex justify-center">
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-6 text-lg rounded-lg hover:bg-blue-600 transition-colors duration-300"
          >
            Iniciar Sesión
          </button>
        </div>
      </form>
      <button
        onClick={handleForgotPassword}
        className="mt-4 text-sm text-blue-500 hover:text-blue-600 transition-colors duration-300"
      >
        Olvidé mi contraseña
      </button>
    </div>
  );
};

export default LoginComponent;
