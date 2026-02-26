import React, { useState } from 'react';

export default function AuthForm({ onSuccess }) {
  const [mode, setMode] = useState('login'); // or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setError(null);
    const path = mode === 'login' ? '/auth/login' : '/auth/signup';
    try {
      const res = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'failed');
      localStorage.setItem('token', data.token);
      onSuccess(data.user);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h2>{mode === 'login' ? 'Log in' : 'Sign up'}</h2>
      <form onSubmit={submit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">{mode === 'login' ? 'Log in' : 'Sign up'}</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p>
        {mode === 'login' ? 'New user?' : 'Already have an account?'}{' '}
        <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
          {mode === 'login' ? 'Sign up' : 'Log in'}
        </button>
      </p>
    </div>
  );
}
