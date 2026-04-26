import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Login from './pages/Login';
import Map from './pages/Map';

const App = () => {

  const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Access denied. Please login/register first.');
    return <Navigate to="/sign-in" replace />;
  }
  return children;
};

  return (    
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/sign-up" element={<Register />} />
      <Route path="/sign-in" element={<Login />} />
      <Route path="/map" element={
        <ProtectedRoute>
          <Map />
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default App