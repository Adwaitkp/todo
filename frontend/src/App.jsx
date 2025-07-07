import React, { useState } from 'react';
import AuthForm from './components/AuthForm';
import Board from './components/Board';
import ActivityLog from './components/ActivityLog';
import { isLoggedIn, removeToken } from './utils/auth';

function App() {
  const [user, setUser] = useState(isLoggedIn() ? 'User' : null);

  const handleLogout = () => {
    removeToken();
    setUser(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-blue-700 text-white p-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Real-Time Collaborative To-Do Board</h1>
        {user && <button className="bg-white text-blue-700 px-4 py-2 rounded hover:bg-blue-100" onClick={handleLogout}>Logout</button>}
      </header>
      <main className="flex-1 flex flex-col md:flex-row gap-4 p-4">
        {!user ? (
          <AuthForm onAuth={u => setUser(u)} />
        ) : (
          <>
            <div className="flex-1">
              <Board username={user} />
            </div>
            <ActivityLog />
          </>
        )}
      </main>
      <footer className="bg-blue-700 text-white text-center py-2 text-xs">
        Custom UI, Responsive, Real-Time, Tailwind CSS
      </footer>
    </div>
  );
}

export default App;
