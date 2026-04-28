import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { useNavigate } from 'react-router-dom'

const COLORS = ['#185FA5', '#e63946', '#2a9d8f'];
const API = import.meta.env.VITE_API_URL;

const History = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/sign-in'); return; }
    fetch(`${API}/api/history`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => { setHistory(data); setLoading(false); })
      .catch(() => { setError('Failed to load history.'); setLoading(false); });
  }, []);

  const deleteEntry = async (id) => {
    setDeletingId(id);
    const token = localStorage.getItem('token');
    await fetch(`${API}/api/history/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    setHistory(h => h.filter(e => e._id !== id));
    setDeletingId(null);
  };


  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) +
      ' · ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>

        {/* Page header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#aaa', marginBottom: '0.5rem' }}>
            Your account
          </div>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '2rem', fontWeight: 400, color: '#0f0f0f', margin: 0 }}>
            Route history
          </h1>
          <p style={{ fontSize: '13px', color: '#aaa', marginTop: '0.4rem' }}>
            Your last 50 searches, saved across devices.
          </p>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa', fontSize: '14px' }}>
            Loading your history...
          </div>
        )}

        {error && (
          <div style={{ background: '#fff5f5', border: '1px solid #fdd', borderRadius: '10px', padding: '1rem', color: '#c0392b', fontSize: '13px' }}>
            {error}
          </div>
        )}

        {!loading && !error && history.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#fff', borderRadius: '14px', border: '1px solid #f0f0f0' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🗺️</div>
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#0f0f0f', marginBottom: '0.35rem' }}>No routes yet</div>
            <div style={{ fontSize: '13px', color: '#aaa', marginBottom: '1.5rem' }}>
              Your searches will appear here after you plan a route.
            </div>
            <button onClick={() => navigate('/map')}
              style={{ background: '#0f0f0f', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
              Plan a route
            </button>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {history.map((entry) => (
            <div key={entry._id} style={{ background: '#fff', borderRadius: '14px', border: '1px solid #f0f0f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>

              {/* Card header */}
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f6f6f6', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ flex: 1, minWidth: 0 }}>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f0f0f' }}>
                      {entry.from}
                    </span>
                    {entry.stops?.map((s, i) => (
                      <React.Fragment key={i}>
                        <span style={{ color: '#ccc', fontSize: '12px' }}>→</span>
                        <span style={{ fontSize: '12px', color: '#888' }}>{s}</span>
                      </React.Fragment>
                    ))}
                    <span style={{ color: '#ccc', fontSize: '12px' }}>→</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f0f0f' }}>
                      {entry.to}
                    </span>
                  </div>

                  <div style={{ fontSize: '11px', color: '#bbb' }}>{formatDate(entry.createdAt)}</div>
                </div>

                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <button
                    onClick={() => deleteEntry(entry._id)}
                    disabled={deletingId === entry._id}
                    style={{ fontSize: '12px', padding: '6px 10px', background: '#fff5f5', color: '#e63946', border: '1px solid #fdd', borderRadius: '7px', cursor: 'pointer' }}>
                    {deletingId === entry._id ? '...' : '✕'}
                  </button>
                </div>
              </div>

              {entry.routes?.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1px', background: '#f6f6f6' }}>
                  {entry.routes.map((r, i) => (
                    <div key={i} style={{ background: '#fff', padding: '0.85rem 1.1rem' }}>

                      {/* Route label + via */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: COLORS[i] ?? '#aaa', flexShrink: 0 }} />
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#0f0f0f' }}>{r.label}</span>
                        {r.via && (
                          <span style={{ fontSize: '10px', color: '#bbb', marginLeft: 'auto' }}>via {r.via}</span>
                        )}
                      </div>

                      {/* Stats */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                        {[
                          { label: 'Duration', val: r.duration },
                          { label: 'Distance', val: r.distance },
                          { label: 'Arrives',  val: r.arrivalTime },
                          r.fuelCost ? { label: 'Fuel', val: r.fuelCost } : null,
                        ].filter(Boolean).map(item => (
                          <div key={item.label} style={{ background: '#f8f8f8', borderRadius: '5px', padding: '5px 7px' }}>
                            <div style={{ fontSize: '9px', color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>
                              {item.label}
                            </div>
                            <div style={{ fontSize: '11px', fontWeight: 700, color: '#0f0f0f' }}>
                              {item.val ?? '—'}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Leg breakdown (only if multi-stop) */}
                      {r.legs?.length > 1 && (
                        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #f0f0f0' }}>
                          <div style={{ fontSize: '9px', fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                            Breakdown
                          </div>

                          {/* Start */}
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '12px', flexShrink: 0 }}>
                              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#185FA5', marginTop: '2px' }} />
                              <div style={{ flex: 1, width: '1.5px', background: '#e8e8e8', margin: '3px 0' }} />
                            </div>
                            <div style={{ flex: 1, paddingBottom: '8px' }}>
                              <div style={{ fontSize: '11px', fontWeight: 500, color: '#0f0f0f' }}>{entry.from}</div>
                              <div style={{ fontSize: '10px', color: '#bbb' }}>Depart now</div>
                            </div>
                          </div>

                          {/* Intermediate stops */}
                          {r.legs.slice(0, -1).map((leg, legIdx) => (
                            <div key={legIdx} style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '12px', flexShrink: 0 }}>
                                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#aaa', marginTop: '2px' }} />
                                <div style={{ flex: 1, width: '1.5px', background: '#e8e8e8', margin: '3px 0' }} />
                              </div>
                              <div style={{ flex: 1, paddingBottom: '8px' }}>
                                <div style={{ fontSize: '11px', fontWeight: 500, color: '#0f0f0f' }}>{leg.to}</div>
                                <div style={{ fontSize: '10px', color: '#bbb' }}>+{leg.duration} · {leg.distance}</div>
                                <div style={{ fontSize: '10px', color: '#185FA5', fontWeight: 500 }}>arrives ~{leg.arrivalTime}</div>
                              </div>
                            </div>
                          ))}

                          {/* Destination */}
                          {(() => {
                            const last = r.legs[r.legs.length - 1];
                            return (
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '12px', flexShrink: 0 }}>
                                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#e63946', marginTop: '2px' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: '11px', fontWeight: 500, color: '#0f0f0f' }}>{last.to}</div>
                                  <div style={{ fontSize: '10px', color: '#bbb' }}>+{last.duration} · {last.distance}</div>
                                  <div style={{ fontSize: '10px', color: '#185FA5', fontWeight: 500 }}>arrives ~{last.arrivalTime}</div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default History;