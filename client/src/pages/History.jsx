import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { useNavigate } from 'react-router-dom'

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600&family=Playfair+Display:wght@600&display=swap');

.hist-page {
  min-height: 100vh;
  background: #f5f5f3;
  font-family: 'Sora', sans-serif;
}

.hist-inner {
  max-width: 820px;
  margin: 0 auto;
  padding: 2.5rem 1.25rem 4rem;
}

/* Header */
.hist-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 0.5px solid #e0e0e0;
}
.hist-header h1 {
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  font-weight: 600;
  color: #0f0f0f;
  line-height: 1.2;
}
.hist-header-sub {
  font-size: 11px;
  color: #aaa;
  margin-top: 4px;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}
.hist-count-badge {
  background: #fff;
  border: 0.5px solid #e0e0e0;
  border-radius: 20px;
  padding: 5px 14px;
  font-size: 12px;
  color: #888;
  font-weight: 500;
  white-space: nowrap;
}

/* Card */
.hist-card {
  background: #fff;
  border: 0.5px solid #e8e8e8;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 12px;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.hist-card:hover {
  border-color: #ccc;
  box-shadow: 0 4px 16px rgba(0,0,0,0.05);
}

/* Card header zone */
.hist-card-header {
  padding: 1rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.hist-route-meta { flex: 1; min-width: 0; }
.hist-route-title {
  font-size: 14px;
  font-weight: 600;
  color: #0f0f0f;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.hist-route-arrow { color: #bbb; margin: 0 5px; font-size: 12px; }
.hist-route-date {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: #aaa;
  margin-top: 3px;
}
.hist-date-dot {
  width: 3px; height: 3px;
  border-radius: 50%;
  background: #ccc;
  display: inline-block;
}
.hist-stops-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
}
.hist-stop-pill {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 20px;
  background: #f5f5f5;
  border: 0.5px solid #e8e8e8;
  color: #888;
}

/* Action buttons */
.hist-actions { display: flex; gap: 6px; flex-shrink: 0; }
.hist-btn {
  font-size: 11px;
  font-weight: 600;
  padding: 6px 13px;
  border-radius: 8px;
  cursor: pointer;
  border: 0.5px solid #e0e0e0;
  background: transparent;
  color: #0f0f0f;
  font-family: 'Sora', sans-serif;
  letter-spacing: 0.02em;
  transition: background 0.12s;
}
.hist-btn:hover { background: #f5f5f5; }
.hist-btn-del { color: #c0392b; border-color: #f5c6c6; }
.hist-btn-del:hover { background: #fff5f5; }

/* Routes row */
.hist-routes-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  border-top: 0.5px solid #f0f0f0;
}
.hist-route-cell {
  padding: 0.9rem 1.25rem;
  border-right: 0.5px solid #f0f0f0;
}
.hist-route-cell:last-child { border-right: none; }

.hist-route-label {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 8px;
}
.hist-color-pip {
  width: 7px; height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.hist-label-text {
  font-size: 10px;
  font-weight: 600;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.hist-stat-row { display: flex; flex-direction: column; gap: 4px; }
.hist-stat { display: flex; align-items: center; gap: 7px; }
.hist-stat-icon { font-size: 11px; width: 14px; text-align: center; }
.hist-stat-val { font-size: 12px; color: #0f0f0f; font-weight: 500; }

.hist-via {
  font-size: 11px;
  color: #bbb;
  margin-top: 7px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.hist-fuel-pill {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  margin-top: 7px;
  padding: 2px 9px;
  border-radius: 20px;
  background: #e8f5e9;
  border: 0.5px solid #a5d6a7;
  font-size: 11px;
  font-weight: 600;
  color: #2e7d32;
}

/* Legs expand */
.hist-legs-toggle {
  margin-top: 8px;
  font-size: 11px;
  background: none;
  border: none;
  color: #185FA5;
  cursor: pointer;
  font-family: 'Sora', sans-serif;
  padding: 0;
}
.hist-legs-list { margin-top: 7px; }
.hist-leg-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 5px 0;
  border-top: 0.5px solid #f5f5f5;
}
.hist-leg-dot {
  width: 5px; height: 5px;
  border-radius: 50%;
  background: #ccc;
  flex-shrink: 0;
  margin-top: 4px;
}
.hist-leg-text { font-size: 11px; color: #666; line-height: 1.5; }
.hist-leg-dur { font-size: 10px; color: #aaa; margin-top: 1px; }

/* Empty state */
.hist-empty {
  text-align: center;
  padding: 5rem 1rem;
  color: #bbb;
}
.hist-empty-icon { font-size: 2.5rem; margin-bottom: 0.75rem; opacity: 0.4; }
.hist-empty-msg { font-size: 14px; font-weight: 500; color: #aaa; }
.hist-empty-sub { font-size: 12px; color: #ccc; margin-top: 4px; }

/* Loading */
.hist-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 60px);
  font-size: 13px;
  color: #bbb;
  font-family: 'Sora', sans-serif;
}

@media (max-width: 520px) {
  .hist-inner { padding: 1.5rem 1rem 3rem; }
  .hist-header h1 { font-size: 1.6rem; }
  .hist-routes-row { grid-template-columns: 1fr; }
  .hist-route-cell { border-right: none; border-bottom: 0.5px solid #f0f0f0; }
  .hist-route-cell:last-child { border-bottom: none; }
}
`

if (typeof document !== 'undefined' && !document.getElementById('hist-style')) {
  const style = document.createElement('style')
  style.id = 'hist-style'
  style.innerHTML = CSS
  document.head.appendChild(style)
}

const COLORS = ['#185FA5', '#e63946', '#2a9d8f']
const API = import.meta.env.VITE_API_URL

const formatDate = (iso) => {
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

const History = () => {
  const navigate = useNavigate()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState({})
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return navigate('/sign-in')

    fetch(`${API}/api/history`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { setHistory(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const deleteEntry = async (id) => {
    setDeletingId(id)
    const token = localStorage.getItem('token')
    await fetch(`${API}/api/history/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    setHistory(prev => prev.filter(e => e._id !== id))
    setDeletingId(null)
  }

  const rerunRoute = (entry) => {
    navigate('/map', {
      state: { start: entry.from, end: entry.to, stops: entry.stops || [] },
    })
  }

  const toggleExpand = (key) =>
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }))

  if (loading) {
    return (
      <div className="hist-page">
        <Navbar />
        <div className="hist-loading">Loading history…</div>
      </div>
    )
  }

  return (
    <div className="hist-page">
      <Navbar />

      <div className="hist-inner">

        {/* ── Header ── */}
        <div className="hist-header">
          <div>
            <h1>Route history</h1>
            <div className="hist-header-sub">Your saved routes</div>
          </div>
          <div className="hist-count-badge">
            {history.length} {history.length === 1 ? 'route' : 'routes'}
          </div>
        </div>

        {/* ── Empty state ── */}
        {history.length === 0 && (
          <div className="hist-empty">
            <div className="hist-empty-icon">🗺️</div>
            <div className="hist-empty-msg">No routes yet</div>
            <div className="hist-empty-sub">Plan a route and it'll appear here</div>
          </div>
        )}

        {/* ── Cards ── */}
        {history.map((entry) => (
          <div key={entry._id} className="hist-card">

            {/* Top zone */}
            <div className="hist-card-header">
              <div className="hist-route-meta">
                <div className="hist-route-title">
                  {entry.from}
                  <span className="hist-route-arrow">→</span>
                  {entry.to}
                </div>
                <div className="hist-route-date">
                  <span className="hist-date-dot" />
                  {formatDate(entry.createdAt)}
                </div>
                {entry.stops?.length > 0 && (
                  <div className="hist-stops-row">
                    {entry.stops.map((s, i) => (
                      <span key={i} className="hist-stop-pill">{s}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="hist-actions">
                <button className="hist-btn" onClick={() => rerunRoute(entry)}>
                  Re-run ↗
                </button>
                <button
                  className="hist-btn hist-btn-del"
                  onClick={() => deleteEntry(entry._id)}
                >
                  {deletingId === entry._id ? '…' : '✕'}
                </button>
              </div>
            </div>

            {/* Routes row */}
            <div className="hist-routes-row">
              {entry.routes?.map((r, i) => {
                const key = `${entry._id}-${i}`
                return (
                  <div key={i} className="hist-route-cell">

                    <div className="hist-route-label">
                      <div
                        className="hist-color-pip"
                        style={{ background: COLORS[i] ?? '#888' }}
                      />
                      <span className="hist-label-text">{r.label}</span>
                    </div>

                    <div className="hist-stat-row">
                      <div className="hist-stat">
                        <span className="hist-stat-icon">⏱</span>
                        <span className="hist-stat-val">{r.duration}</span>
                      </div>
                      <div className="hist-stat">
                        <span className="hist-stat-icon">📍</span>
                        <span className="hist-stat-val">{r.distance}</span>
                      </div>
                      <div className="hist-stat">
                        <span className="hist-stat-icon">🕐</span>
                        <span className="hist-stat-val">{r.arrivalTime}</span>
                      </div>
                    </div>

                    {r.via && (
                      <div className="hist-via">via {r.via}</div>
                    )}

                    {r.fuelCost && (
                      <div className="hist-fuel-pill">⛽ {r.fuelCost}</div>
                    )}

                    {r.legs?.length > 1 && (
                      <>
                        <button
                          className="hist-legs-toggle"
                          onClick={() => toggleExpand(key)}
                        >
                          {expanded[key] ? '▲ Hide breakdown' : '▼ Show breakdown'}
                        </button>

                        {expanded[key] && (
                          <div className="hist-legs-list">
                            {r.legs.map((leg, idx) => (
                              <div key={idx} className="hist-leg-item">
                                <div className="hist-leg-dot" />
                                <div>
                                  <div className="hist-leg-text">
                                    {leg.from} → {leg.to}
                                  </div>
                                  <div className="hist-leg-dur">
                                    {leg.distance} · {leg.duration} · ~{leg.arrivalTime}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )
              })}
            </div>

          </div>
        ))}

      </div>
    </div>
  )
}

export default History