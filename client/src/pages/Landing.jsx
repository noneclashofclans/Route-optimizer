import React, { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { useNavigate } from 'react-router-dom'

const features = [
  { n: '01', title: 'Smart routing', desc: 'Optimal stop order using real-world distance data and live traffic signals.' },
  { n: '02', title: 'Multi-stop support', desc: 'Compare up to 3 routes side-by-side and pick the winner in seconds.' },
  { n: '03', title: 'Fast & lightweight', desc: 'Built to load instantly and stay out of your way. No bloat, no friction.' },
]

const stats = [
  { n: '38%', label: 'avg. time saved per route' },
  { n: '3×',  label: 'routes compared at once' },
  { n: '1.2s', label: 'median route calculation' },
]

const Landing = () => {
  const navigate = useNavigate()
  const [loggedIn, setLoggedIn] = useState(false)
  const [hoveredFeat, setHoveredFeat] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) setLoggedIn(true)
  }, [])

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#fff', color: '#1a1a1a', overflow: 'hidden' }}>
      <Navbar />

      {/* Hero */}
      <div style={{ minHeight: '86vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'clamp(3rem,8vw,5rem) clamp(1.5rem,6vw,4rem) 5rem', maxWidth: '900px', position: 'relative' }}>

        {/* Ambient orb */}
        <div style={{
          position: 'absolute', right: -210,
          width: 520, height: 520, borderRadius: '50%',
          background: 'radial-gradient(circle at 40% 40%, #d6e8ff 0%, #e8f2ff 40%, transparent 70%)',
          opacity: 0.6, pointerEvents: 'none',
          animation: 'float 8s ease-in-out infinite',
        }} />

        <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#aaa', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ display: 'inline-block', width: 20, height: 1, background: '#ccc' }} />
          Route Optimizer — Smarter logistics
        </div>

        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(2.6rem, 5.5vw, 4.8rem)', fontWeight: 400, lineHeight: 1.07, margin: '0 0 1.5rem', color: '#0f0f0f', letterSpacing: '-0.02em' }}>
          Find the <em style={{ fontStyle: 'italic', color: '#185FA5' }}>fastest</em><br />path, every time.
        </h1>

        <p style={{ fontSize: '1rem', color: '#777', lineHeight: 1.8, maxWidth: '440px', marginBottom: '2.8rem', fontWeight: 300 }}>
          Plan multi-stop routes intelligently. Save time, cut costs, and move with precision — whether you're managing deliveries or daily commutes.
        </p>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          {loggedIn ? (
            <button onClick={() => navigate('/map')} style={btnPrimary}>Go to map</button>
          ) : (
            <>
              <button onClick={() => navigate('/sign-up')} style={btnPrimary}>Get started free</button>
              <button onClick={() => navigate('/sign-in')} style={btnGhost}>Sign in</button>
            </>
          )}
        </div>

        {/* Social proof */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '2.2rem' }}>
          <div style={{ display: 'flex' }}>
            {['JK','RM','AL','+'].map((label, i) => (
              <div key={i} style={{ width: 26, height: 26, borderRadius: '50%', border: '2px solid #fff', background: '#e0e8f5', marginLeft: i === 0 ? 0 : -6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 500, color: '#185FA5' }}>{label}</div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: '#aaa', lineHeight: 1.4 }}>
            Trusted by <strong style={{ color: '#666', fontWeight: 500 }}>50+ clients</strong>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderTop: '1px solid #f0f0f0', background: '#fafafa' }}>
        {stats.map(s => (
          <div key={s.n} style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '2.4rem', color: '#0f0f0f', lineHeight: 1 }}>
              {s.n.replace(/[%×s]/, '')}<span style={{ color: '#185FA5' }}>{s.n.match(/[%×s]/)?.[0]}</span>
            </div>
            <div style={{ fontSize: '11.5px', color: '#aaa', marginTop: '0.35rem', letterSpacing: '0.04em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Feature cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0' }}>
        {features.map((f, i, arr) => (
          <div
            key={f.n}
            onMouseEnter={() => setHoveredFeat(i)}
            onMouseLeave={() => setHoveredFeat(null)}
            style={{
              padding: '2.4rem 2rem 2.2rem',
              borderRight: i < arr.length - 1 ? '1px solid #f0f0f0' : 'none',
              position: 'relative', overflow: 'hidden',
              background: hoveredFeat === i ? '#fafafa' : '#fff',
              transition: 'background 0.25s', cursor: 'default',
            }}
          >
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.8rem', color: '#185FA5', marginBottom: '0.6rem', lineHeight: 1 }}>{f.n}</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#0f0f0f', marginBottom: '0.4rem' }}>{f.title}</div>
            <div style={{ fontSize: 12, color: '#999', lineHeight: 1.65 }}>{f.desc}</div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, height: 2, background: '#185FA5', width: hoveredFeat === i ? '100%' : 0, transition: 'width 0.4s ease' }} />
          </div>
        ))}
      </div>

      <style>{`@keyframes float { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-16px) scale(1.02)} }`}</style>
    </div>
  )
}

const btnPrimary = {
  background: '#0f0f0f', color: '#fff', border: 'none',
  padding: '13px 26px', borderRadius: 4, fontSize: 14.5,
  fontWeight: 500, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
}

const btnGhost = {
  background: 'transparent', color: '#0f0f0f', border: '1.5px solid #e0e0e0',
  padding: '12px 26px', borderRadius: 4, fontSize: 14.5,
  fontWeight: 500, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
}

export default Landing