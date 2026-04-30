import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import axios from "axios"

const Register = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.username || !formData.email || !formData.password) {
      return setError('All fields are required')
    }

    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters')
    }

    setLoading(true)

    try {
      await axios.post(
        'https://route-optimizer-back-vj4v.onrender.com/api/auth/register',
        formData
      )

      navigate('/sign-in')
    } catch (err) {
      setError(
        err.response?.data?.message || 'Registration failed. Try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />

      <div style={styles.wrapper}>
        <form onSubmit={handleSubmit} style={styles.card}>
          <h2 style={styles.title}>Create account</h2>
          <p style={styles.subtitle}>Start optimizing your routes</p>

          {error && <div style={styles.error}>{error}</div>}

          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            style={styles.input}
          />

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Creating account...' : 'Register'}
          </button>

          <p style={styles.footer}>
            Already have an account?{' '}
            <Link to="/sign-in" style={styles.link}>
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </>
  )
}

const styles = {
  wrapper: {
    minHeight: '85vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#fafafa',
    fontFamily: 'DM Sans, sans-serif'
  },

  card: {
    width: '100%',
    maxWidth: '380px',
    background: '#fff',
    padding: '2.5rem',
    borderRadius: '10px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },

  title: {
    fontSize: '1.8rem'
  },

  subtitle: {
    fontSize: '0.9rem',
    color: '#777',
    marginBottom: '1rem'
  },

  input: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none'
  },

  button: {
    padding: '12px',
    background: '#185FA5',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 500
  },

  error: {
    background: '#ffe5e5',
    color: '#d8000c',
    padding: '10px',
    borderRadius: '6px',
    fontSize: '13px'
  },

  footer: {
    fontSize: '13px',
    textAlign: 'center',
    marginTop: '1rem',
    color: '#777'
  },

  link: {
    color: '#185FA5',
    textDecoration: 'none',
    fontWeight: 500
  }
}

export default Register