import React, { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { useNavigate } from 'react-router-dom'

const Landing = () => {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setLoggedIn(true);
  }, []);

  return (
    <div>
      <Navbar />
      <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#fff', color: '#1a1a1a' }}>

        {/* Hero */}
        <div style={{ minHeight: '88vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'clamp(2rem, 8vw, 6rem) clamp(1.5rem, 8vw, 5rem) 4rem', maxWidth: '860px' }}>
          <div style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#aaa', marginBottom: '2rem' }}>
            Route Optimizer — Smarter logistics
          </div>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(2.4rem, 6vw, 5rem)', fontWeight: 400, lineHeight: 1.08, margin: '0 0 1.5rem', color: '#0f0f0f' }}>
            Find the <em style={{ fontStyle: 'italic', color: '#185FA5' }}>fastest</em><br />path, every time.
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#666', lineHeight: 1.75, maxWidth: '480px', marginBottom: '2.5rem' }}>
            Plan multi-stop routes intelligently. Save time, cut costs, and move with precision — whether you're managing deliveries or daily commutes.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {loggedIn ? (
              <button onClick={() => navigate('/map')} style={{ background: '#0f0f0f', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: '4px', fontSize: '15px', fontWeight: 500, cursor: 'pointer' }}>
                Go to map
              </button>
            ) : (
              <>
                <button onClick={() => navigate('/sign-up')} style={{ background: '#0f0f0f', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: '4px', fontSize: '15px', fontWeight: 500, cursor: 'pointer' }}>
                  Sign up
                </button>
                <button onClick={() => navigate('/sign-in')} style={{ background: 'transparent', color: '#0f0f0f', border: '1.5px solid #ddd', padding: '13px 28px', borderRadius: '4px', fontSize: '15px', fontWeight: 500, cursor: 'pointer' }}>
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
            
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0' }}>
          {[
            { n: '01', title: 'Smart routing', desc: 'Optimal stop order using real-world distance data.' },
            { n: '02', title: 'Multi-stop support', desc: 'Compare upto 3 routes' },
            { n: '03', title: 'Fast & lightweight', desc: 'Built to load fast and get out of to your way.' },
          ].map((f, i, arr) => (
            <div key={f.n} style={{ padding: '2.2rem 2rem', borderRight: i < arr.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '2rem', color: '#185FA5', marginBottom: '0.5rem' }}>{f.n}</div>
              <div style={{ fontSize: '13px', fontWeight: 500, color: '#0f0f0f', marginBottom: '0.35rem' }}>{f.title}</div>
              <div style={{ fontSize: '12px', color: '#999', lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Landing