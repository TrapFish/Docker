import { useState } from 'react';

export default function UserForm() {
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError(true);
      setStatus('Please enter a user name.');
      return;
    }

    setError(false);
    setStatus('Adding user...');

    try {
      const response = await fetch('http://localhost:3001/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: trimmedName }),
      });

      if (!response.ok) {
        throw new Error('Failed to add user');
      }

      const user = await response.json();
      setStatus(`User "${user.name}" added successfully!`);
      setName('');
    } catch (err) {
      setError(true);
      setStatus('Could not add user. Please check the backend server.');
      console.error(err);
    }
  };

  return (
    <section className="user-form-card">
      <h1>Add User</h1>
      <div className="user-form">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter user name"
          aria-label="User name"
        />
        <button type="button" onClick={handleSubmit}>
          Add User
        </button>
      </div>
      {status && <p className={error ? 'status error' : 'status'}>{status}</p>}
    </section>
  );
}
