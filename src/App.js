import React, { useState } from 'react';
import LoginComponent from './components/LoginComponent';
import RegisterComponent from './components/RegisterComponent';
import Usuarios from './components/UsuariosApp';

function App() {
  const [showLogin, setShowLogin] = useState(true); // Controla qué componente mostrar
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Estado de autenticación

  const handleLoginSuccess = (data) => {
    // Maneja el éxito del inicio de sesión (almacena el token, redirige, etc.)
    console.log('Login success:', data);
    setIsAuthenticated(true); // Marca al usuario como autenticado
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-900 via-gray-800 to-black flex flex-col items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white shadow-lg rounded-lg p-6">
        {!isAuthenticated ? (
          <>
            <div className="flex justify-between mb-6">
              <button
                className={`w-full mr-2 px-6 py-3 font-semibold rounded-lg transition-colors duration-300 ${
                  showLogin
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => setShowLogin(true)}
              >
                Iniciar Sesión
              </button>
              <button
                className={`w-full ml-2 px-6 py-3 font-semibold rounded-lg transition-colors duration-300 ${
                  !showLogin
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
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