import React, { useState } from 'react';
import LoginComponent from './components/LoginComponent';
import RegisterComponent from './components/RegisterComponent';
import Usuarios from './components/UsuariosApp'

function App() {
  const [showLogin, setShowLogin] = useState(true); // Controla qué componente mostrar
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Estado de autenticación

  const handleLoginSuccess = (data) => {
    // Maneja el éxito del inicio de sesión (almacena el token, redirige, etc.)
    console.log('Login success:', data);
    setIsAuthenticated(true); // Marca al usuario como autenticado
  };

  return (
    <div className="min-h-screen bg-gray-400 flex flex-col items-center justify-center">
      <div className="max-w-lg w-full p-4 bg-white shadow-md rounded">
        {!isAuthenticated ? (
          <>
            <div className="flex justify-between mb-4">
              <button
                className={`px-4 py-2 ${showLogin ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} rounded`}
                onClick={() => setShowLogin(true)}
              >
                Iniciar Sesión
              </button>
              <button
                className={`px-4 py-2 ${!showLogin ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} rounded`}
                onClick={() => setShowLogin(false)}
              >
                Registrarse
              </button>
            </div>
            {showLogin ? (
              <LoginComponent onLoginSuccess={handleLoginSuccess} />
            ) : (
              <RegisterComponent />
            )}
          </>
        ) : (
          <Usuarios />
        )}
      </div>
    </div>
  );
}

export default App;
