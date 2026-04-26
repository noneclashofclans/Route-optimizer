import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import axios from "axios";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormdata] = useState({
    email: '',
    password: '',
    username: ''
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    // handling input change
    setFormdata({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post('https://route-optimizer-back-vj4v.onrender.com/api/auth/register', {
        username: formData.username,
        password: formData.password,
        email: formData.email
      });

      if (res.status === 201) {
        alert('Registration successfull');
        setTimeout(() => {
          navigate('/sign-in');
        }, 3000);
      }
    }
    catch (err) {
      console.log(err.message);
      setLoading(false);
    }
  }


  return (
    <>
      <Navbar></Navbar>

      <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '12px' }}>
        <div style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', border: '1px solid #f0f0f0', borderRadius: '12px' }}>

          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '2rem', fontWeight: 400, margin: '0 0 0.4rem', color: '#0f0f0f' }}>
            Create account
          </h2>
          <p style={{ fontSize: '13px', color: '#999', margin: '0 0 2rem' }}>Sign up to get started</p>

          <label style={{ fontSize: '12px', fontWeight: 500, color: '#555', marginBottom: '6px', display: 'block', letterSpacing: '0.04em' }}>Username</label>
          <input type="text" name="username" placeholder="johndoe" onChange={handleInputChange}
            style={{ width: '100%', boxSizing: 'border-box', padding: '11px 14px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', marginBottom: '1.2rem', outline: 'none', fontFamily: "'DM Sans', sans-serif" }} />

          <label style={{ fontSize: '12px', fontWeight: 500, color: '#555', marginBottom: '6px', display: 'block', letterSpacing: '0.04em' }}>Email</label>
          <input type="text" name="email" placeholder="you@example.com" onChange={handleInputChange}
            style={{ width: '100%', boxSizing: 'border-box', padding: '11px 14px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', marginBottom: '1.2rem', outline: 'none', fontFamily: "'DM Sans', sans-serif" }} />

          <label style={{ fontSize: '12px', fontWeight: 500, color: '#555', marginBottom: '6px', display: 'block', letterSpacing: '0.04em' }}>Password</label>
          <input type="password" name="password" placeholder="••••••••" onChange={handleInputChange}
            style={{ width: '100%', boxSizing: 'border-box', padding: '11px 14px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', marginBottom: '1.2rem', outline: 'none', fontFamily: "'DM Sans', sans-serif" }} />

          <button onClick={handleSubmit} disabled={loading}
            style={{ width: '100%', padding: '13px', background: '#0f0f0f', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '15px', fontWeight: 500, cursor: 'pointer', marginTop: '0.5rem', fontFamily: "'DM Sans', sans-serif" }}>
            {loading ? 'Creating account...' : 'Register'}
          </button>

          <div style={{ textAlign: 'center', fontSize: '13px', color: '#999', marginTop: '1.5rem' }}>
            Already have an account? <a href="/sign-in" style={{ color: '#185FA5', textDecoration: 'none', fontWeight: 500 }}>Sign in</a>
          </div>

        </div>
      </div>

    </>
  )
}

export default Register