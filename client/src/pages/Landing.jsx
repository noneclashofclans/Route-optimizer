import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { useNavigate } from 'react-router-dom'

const Landing = () => {
  const navigate = useNavigate()
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) setLoggedIn(true)
  }, [])

  return (
    <div style={styles.page}>
      <Navbar />

      {/* HERO */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <p style={styles.tag}>SMART ROUTING PLATFORM</p>

          <h1 style={styles.title}>
            Optimize routes.<br />
            <span style={styles.highlight}>Save hours daily.</span>
          </h1>

          <p style={styles.subtitle}>
            Plan smarter multi-stop journeys with real-time optimization.
            Built for speed, clarity, and efficiency.
          </p>

          <div style={styles.ctaRow}>
            {loggedIn ? (
              <button onClick={() => navigate('/map')} style={styles.primaryBtn}>
                Open Dashboard →
              </button>
            ) : (
              <>
                <button onClick={() => navigate('/sign-up')} style={styles.primaryBtn}>
                  Get Started Free
                </button>
                <button onClick={() => navigate('/sign-in')} style={styles.secondaryBtn}>
                  Login
                </button>
              </>
            )}
          </div>
        </div>

        {/* gradient blob */}
        <div style={styles.blob}></div>
      </section>

      {/* STATS */}
      <section style={styles.stats}>
        {[
          { value: '38%', label: 'time saved' },
          { value: '3x', label: 'route comparisons' },
          { value: '1.2s', label: 'avg calculation' }
        ].map((s, i) => (
          <div key={i}>
            <h2 style={styles.statValue}>{s.value}</h2>
            <p style={styles.statLabel}>{s.label}</p>
          </div>
        ))}
      </section>

      {/* FEATURES */}
      <section style={styles.features}>
        {[
          {
            title: 'Smart Optimization',
            desc: 'Automatically finds the most efficient path using real-time data.'
          },
          {
            title: 'Multi-Route Compare',
            desc: 'Compare multiple routes instantly and choose the best one.'
          },
          {
            title: 'Lightning Fast',
            desc: 'Built for speed with minimal load times and smooth UX.'
          }
        ].map((f, i) => (
          <div key={i} style={styles.card}>
            <h3 style={styles.cardTitle}>{f.title}</h3>
            <p style={styles.cardDesc}>{f.desc}</p>
          </div>
        ))}
      </section>

      {/* FINAL CTA */}
      <section style={styles.cta}>
        <h2 style={styles.ctaTitle}>Start optimizing your routes today</h2>
        <button
          onClick={() => navigate('/sign-up')}
          style={styles.primaryBtn}
        >
          Get Started →
        </button>
      </section>
    </div>
  )
}

const styles = {
  page: {
    fontFamily: 'DM Sans, sans-serif',
    background: '#ffffff',
    color: '#111'
  },

  hero: {
    minHeight: '85vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    padding: '4rem 2rem'
  },

  heroContent: {
    maxWidth: '700px',
    textAlign: 'center',
    zIndex: 2
  },

  tag: {
    fontSize: '12px',
    letterSpacing: '2px',
    color: '#888',
    marginBottom: '1rem'
  },

  title: {
    fontSize: '3.5rem',
    lineHeight: 1.1,
    marginBottom: '1rem'
  },

  highlight: {
    color: '#185FA5'
  },

  subtitle: {
    color: '#666',
    fontSize: '1.1rem',
    marginBottom: '2rem'
  },

  ctaRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem'
  },

  primaryBtn: {
    background: '#185FA5',
    color: '#fff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 500
  },

  secondaryBtn: {
    background: 'transparent',
    border: '1px solid #ddd',
    padding: '12px 24px',
    borderRadius: '6px',
    cursor: 'pointer'
  },

  blob: {
    position: 'absolute',
    width: '500px',
    height: '500px',
    background: 'radial-gradient(circle, #e6f0ff, transparent)',
    borderRadius: '50%',
    filter: 'blur(80px)',
    zIndex: 1
  },

  stats: {
    display: 'flex',
    justifyContent: 'space-around',
    padding: '3rem 1rem',
    background: '#fafafa',
    textAlign: 'center'
  },

  statValue: {
    fontSize: '2rem',
    color: '#185FA5'
  },

  statLabel: {
    color: '#777',
    fontSize: '0.9rem'
  },

  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    padding: '3rem 2rem'
  },

  card: {
    padding: '2rem',
    border: '1px solid #eee',
    borderRadius: '8px',
    transition: '0.2s',
  },

  cardTitle: {
    marginBottom: '0.5rem'
  },

  cardDesc: {
    color: '#666'
  },

  cta: {
    textAlign: 'center',
    padding: '4rem 2rem',
    background: '#111',
    color: '#fff'
  },

  ctaTitle: {
    marginBottom: '1.5rem'
  }
}

export default Landing