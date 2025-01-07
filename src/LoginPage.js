// LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = ({ setAuth }) => {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault(); // Prevent the form from refreshing the page
    const hardcodedPassword = '@simple'; // Set your password here

    if (password === hardcodedPassword) {
      setAuth(true);
      navigate('/'); // Navigate to the main page after login
    } else {
      alert('Incorrect Password!'); // Alert for incorrect password
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="p-8 bg-white shadow-md rounded">
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Log in
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
