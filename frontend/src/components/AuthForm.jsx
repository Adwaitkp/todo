import React, { useState } from 'react';
import { login, register } from '../utils/api';
import { setToken } from '../utils/auth';

export default function AuthForm({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const fn = mode === 'login' ? login : register;
      const res = await fn(username, password);
      if (mode === 'login') {
        setToken(res.data.token);
        onAuth(res.data.username);
      } else {
        setMode('login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-green-100">
      <form className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md border border-blue-100" onSubmit={handleSubmit}>
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-700 tracking-wide drop-shadow">{mode === 'login' ? 'Login' : 'Register'}</h2>
        <input
          type="text"
          placeholder="Username"
          className="w-full mb-4 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-lg"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-lg"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {error && <div className="text-red-500 mb-3 text-center font-semibold">{error}</div>}
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-bold hover:bg-blue-700 transition mb-2 shadow">
          {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}
        </button>
        <div className="mt-4 text-center">
          {mode === 'login' ? (
            <span>New user? <button type="button" className="text-blue-600 underline font-semibold" onClick={() => setMode('register')}>Register</button></span>
          ) : (
            <span>Already have an account? <button type="button" className="text-blue-600 underline font-semibold" onClick={() => setMode('login')}>Login</button></span>
          )}
        </div>
      </form>
    </div>
  );
} 