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

    const response = await fetch('http://200.3.127.46:30012/login', {
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
    const response = await fetch('http://200.3.127.46:30012/forgot-password', {
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
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Iniciar Sesión</h2>
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
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
          <label htmlFor="password" className="block">Contraseña</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300"
            required
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2">Iniciar Sesión</button>
      </form>
      <button onClick={handleForgotPassword} className="mt-2 text-red-500">Olvidé mi contraseña</button>
    </div>
  );
};

export default LoginComponent;
