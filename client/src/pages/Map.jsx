import React, { useState, useCallback, useRef, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { GoogleMap, useJsApiLoader, DirectionsRenderer } from '@react-google-maps/api'
import { useLocation } from 'react-router-dom'


const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
  .route-map-wrap { flex: 3; position: relative; }
  .route-desktop-panel {
    width: 400px; flex-shrink: 0;
    background: #fff;
    display: flex; flex-direction: column;
    overflow-y: auto;
    box-shadow: -2px 0 12px rgba(0,0,0,0.06);
  }
  .route-mobile-sheet {
    display: none;
    position: fixed; left: 0; right: 0; bottom: 0;
    background: #fff;
    border-radius: 20px 20px 0 0;
    box-shadow: 0 -4px 28px rgba(0,0,0,0.16);
    z-index: 100;
  }
  @media (max-width: 1024px) {
    .route-desktop-panel { display: none !important; }
    .route-mobile-sheet  { display: block !important; }
  }
`
if (typeof document !== 'undefined' && !document.getElementById('rp-styles')) {
  const el = document.createElement('style')
  el.id = 'rp-styles'
  el.textContent = CSS
  document.head.appendChild(el)
}

const MAP_CENTER = { lat: 20.5937, lng: 78.9629 }
const COLORS = ['#185FA5', '#e63946', '#2a9d8f']
const LIBRARIES = ['places']
const SNAP = { PEEK: 90, HALF: 52, FULL: 8 }

const formatDuration = (totalSec) => {
  const h = Math.floor(totalSec / 3600)
  const m = Math.round((totalSec % 3600) / 60)
  return h > 0 ? `${h} hr ${m} min` : `${m} min`
}

const inp = {
  width: '100%', boxSizing: 'border-box',
  padding: '9px 12px', border: '1px solid #e8e8e8',
  borderRadius: '8px', fontSize: '13px', outline: 'none',
  background: '#fafafa', fontFamily: 'inherit',
}
const lbl = {
  fontSize: '11px', fontWeight: 600, color: '#999',
  display: 'block', marginBottom: '5px',
  textTransform: 'uppercase', letterSpacing: '0.06em',
}
const dot = (sz, color) => ({
  width: sz, height: sz, borderRadius: '50%',
  background: color, flexShrink: 0, marginTop: '2px',
})
const divider = () => (
  <div style={{ paddingLeft: 14 }}>
    {[0,1,2].map(i => <div key={i} style={{ width: 2, height: 4, background: '#ddd', borderRadius: 1, marginBottom: 3 }} />)}
  </div>
)

const Map = () => {
  const location = useLocation()
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  })

  const [map, setMap] = useState(null)
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [stops, setStops] = useState([])
  const [numRoutes, setNumRoutes] = useState(1)
  const [loading, setLoading] = useState(false)
  const [directions, setDirections] = useState([])
  const [routes, setRoutes] = useState([])
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [mileage, setMileage] = useState('')
  const [fuelPrice, setFuelPrice] = useState(104)

  const [panelTop, setPanelTop] = useState(SNAP.PEEK)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartY = useRef(0)
  const dragStartTop = useRef(0)

  const onLoad = useCallback((m) => setMap(m), [])
  const onUnmount = useCallback(() => setMap(null), [])

  const addStop = () => setStops(s => [...s, ''])
  const updateStop = (i, v) => setStops(s => s.map((x, idx) => idx === i ? v : x))
  const removeStop = (i) => setStops(s => s.filter((_, idx) => idx !== i))

  const shareOnWhatsApp = (r) => {
    const fuelCost = mileage > 0
      ? `Fuel Cost: ₹${((r.distanceKm / mileage) * fuelPrice).toFixed(0)}` : ''
    const stopsLine = stops.length > 0
      ? `Stops: ${stops.filter(s => s.trim()).join(' → ')}\n` : ''
    const legLines = r.legs.length > 1
      ? '\nBreakdown:\n' + r.legs.map((leg, i) =>
          `  Leg ${i + 1}: ${leg.from} → ${leg.to} | ${leg.distance} | ${leg.duration} | arrives ~${leg.arrivalTime}`
        ).join('\n')
      : ''
    const msg = `Route Details\n--------------\nFrom: ${start}\nTo: ${end}\n${stopsLine}\nVia: ${r.via}\nTotal Duration: ${r.duration}\nDistance: ${r.distance}\nArrives At: ${r.arrivalTime}\n${fuelCost}${legLines}\n\nShared via Route-optimizer`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }


  useEffect(() => {
    if (location.state) {
      const { start: s, end: e, stops: st } = location.state
      if (s) setStart(s)
      if (e) setEnd(e)
      if (st?.length) setStops(st)
    }
  }, [])

  const saveHistory = async (computed) => {
  const token = localStorage.getItem('token')
  if (!token) return

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        from: start,
        to: end,
        stops: stops.filter(s => s.trim()),
        routes: computed.map(r => ({
          label: r.label,
          via: r.via,
          distance: r.distance,
          duration: r.duration,
          arrivalTime: r.arrivalTime,
          fuelCost: mileage > 0
            ? `₹${((r.distanceKm / mileage) * fuelPrice).toFixed(0)}`
            : null,
          legs: r.legs,
        })),
      }),
    })

    const data = await res.json()
    console.log("History saved:", data)

  } catch (err) {
    console.error("Error saving history:", err)
  }
}

  const calculateRoutes = useCallback(() => {
  if (!start || !end) return alert('Enter both locations')
  setLoading(true)
  setRoutes([])
  setDirections([])

  new window.google.maps.DirectionsService().route({
    origin: start,
    destination: end,
    travelMode: window.google.maps.TravelMode.DRIVING,
    provideRouteAlternatives: true,
    waypoints: stops.filter(s => s.trim()).map(s => ({ location: s, stopover: true })),
  }, async (result, status) => {
    setLoading(false)
    if (status !== 'OK') return alert('Cannot find routes: ' + status)

    const available = result.routes.slice(0, numRoutes)
    setDirections(available.map((_, i) => ({ ...result, routes: [result.routes[i]] })))

    if (map) {
      const bounds = new window.google.maps.LatLngBounds()
      result.routes[0].legs.forEach(leg => {
        bounds.extend(leg.start_location)
        bounds.extend(leg.end_location)
      })
      map.fitBounds(bounds)
    }

    const departTime = Date.now()
    const allPoints = [start, ...stops.filter(s => s.trim()), end]

    const computed = available.map((r, i) => {
      const distM = r.legs.reduce((sum, l) => sum + l.distance.value, 0)
      const dur   = r.legs.reduce((sum, l) => sum + l.duration.value, 0)
      const arrivalTime = new Date(departTime + dur * 1000)
        .toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })

      let cumSec = 0
      const legs = r.legs.map((leg, li) => {
        cumSec += leg.duration.value
        return {
          from: allPoints[li],
          to: allPoints[li + 1],
          distance: (leg.distance.value / 1000).toFixed(1) + ' km',
          duration: formatDuration(leg.duration.value),
          durationSec: leg.duration.value,
          arrivalTime: new Date(departTime + cumSec * 1000)
            .toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
        }
      })

      return {
        label: `Route ${i + 1}`,
        via: r.summary,
        distanceKm: distM / 1000,
        distance: (distM / 1000).toFixed(1) + ' km',
        duration: formatDuration(dur),
        durationVal: dur,
        arrivalTime,
        color: COLORS[i] ?? '#888',
        legs,
      }
    })

    setRoutes(computed)
    if (window.innerWidth <= 1024) setPanelTop(SNAP.HALF)


const token = localStorage.getItem('token')
console.log('=== SAVE DEBUG ===')
console.log('token:', token)
console.log('API URL:', import.meta.env.VITE_API_URL)
console.log('from:', start, '| to:', end)

if (token) {
  try {
    const payload = {
      from: start,
      to: end,
      stops: stops.filter(s => s.trim()),
      routes: computed.map(r => ({
        label: r.label,
        via: r.via,
        distance: r.distance,
        duration: r.duration,
        arrivalTime: r.arrivalTime,
        fuelCost: mileage > 0
          ? `₹${((r.distanceKm / mileage) * fuelPrice).toFixed(0)}`
          : null,
        legs: r.legs,
      })),
    }
    console.log('Payload:', JSON.stringify(payload))

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload),
    })

    console.log('Response status:', res.status)
    const data = await res.json()
    console.log('Response body:', data)

  } catch (err) {
    console.error('Save error:', err)
  }
}
  })
}, [start, end, stops, numRoutes, map, mileage, fuelPrice])  

  const snapNearest = (top) => {
    const snaps = [SNAP.PEEK, SNAP.HALF, SNAP.FULL]
    setPanelTop(snaps.reduce((p, c) => Math.abs(c - top) < Math.abs(p - top) ? c : p))
  }

  const onPointerDown = (e) => {
    if (window.innerWidth > 1024) return
    setIsDragging(true)
    dragStartY.current = e.clientY
    dragStartTop.current = panelTop
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = useCallback((e) => {
    if (!isDragging) return
    const pct = (e.clientY - dragStartY.current) / (window.innerHeight / 100)
    setPanelTop(Math.min(SNAP.PEEK, Math.max(SNAP.FULL, dragStartTop.current + pct)))
  }, [isDragging])

  const onPointerUp = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)
    snapNearest(panelTop)
  }, [isDragging, panelTop])

  useEffect(() => {
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [onPointerMove, onPointerUp])

  const optimalIdx = routes.length
    ? routes.indexOf(routes.reduce((a, b) => a.durationVal < b.durationVal ? a : b))
    : -1

  const RouteBreakdown = ({ r }) => (
    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #f0f0f0' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
        Route Breakdown
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 16, flexShrink: 0 }}>
          <div style={dot(8, '#185FA5')} /><div style={{ flex: 1, width: 1.5, background: '#e8e8e8', margin: '3px 0' }} />
        </div>
        <div style={{ flex: 1, paddingBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#0f0f0f' }}>{start}</div>
          <div style={{ fontSize: 11, color: '#aaa', marginTop: 1 }}>Starting point · depart now</div>
        </div>
      </div>

      {r.legs.slice(0, -1).map((leg, li) => (
        <div key={li} style={{ display: 'flex', gap: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 16, flexShrink: 0 }}>
            <div style={dot(6, '#aaa')} /><div style={{ flex: 1, width: 1.5, background: '#e8e8e8', margin: '3px 0' }} />
          </div>
          <div style={{ flex: 1, paddingBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#0f0f0f' }}>{leg.to}</div>
            <div style={{ fontSize: 11, color: '#aaa', marginTop: 1 }}>Stop {li + 1} · {leg.distance}</div>
            <div style={{ fontSize: 11, color: '#185FA5', fontWeight: 500, marginTop: 2 }}>
              +{leg.duration} · arrives ~{leg.arrivalTime}
            </div>
          </div>
        </div>
      ))}

      {(() => {
        const last = r.legs[r.legs.length - 1]
        return (
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 16, flexShrink: 0 }}>
              <div style={dot(8, '#e63946')} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#0f0f0f' }}>{last.to}</div>
              <div style={{ fontSize: 11, color: '#aaa', marginTop: 1 }}>Destination · {last.distance}</div>
              <div style={{ fontSize: 11, color: '#185FA5', fontWeight: 500, marginTop: 2 }}>
                +{last.duration} · arrives ~{last.arrivalTime}
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )

  
  const inputPanel = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontFamily: "'DM Sans', sans-serif", padding: '1.2rem' }}>

      <div style={{ paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#0f0f0f', letterSpacing: '0.03em' }}>Route Planner</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div>
          <label style={lbl}>From</label>
          <input value={start} onChange={e => setStart(e.target.value)} placeholder="Starting point" style={inp} />
        </div>

        {divider()}

        {stops.map((s, i) => (
          <div key={i}>
            <label style={lbl}>Stop {i + 1}</label>
            <div style={{ display: 'flex', gap: 6 }}>
              <input value={s} onChange={e => updateStop(i, e.target.value)} placeholder="e.g. Puri"
                style={{ ...inp, flex: 1 }} />
              <button onClick={() => removeStop(i)}
                style={{ width: 34, height: 34, background: '#fff5f5', border: '1px solid #fdd', borderRadius: 8, cursor: 'pointer', color: '#ff0000', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                ✕
              </button>
            </div>
          </div>
        ))}

        {stops.length < 3 && (
          <button onClick={addStop}
            style={{ width: '100%', padding: 8, background: '#fff', color: '#555', border: '1px dashed #d0d0d0', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>
            + Add Stop
          </button>
        )}

        {divider()}

        <div>
          <label style={lbl}>To</label>
          <input value={end} onChange={e => setEnd(e.target.value)} placeholder="Destination" style={inp} />
        </div>
      </div>

      <div style={{ height: 1, background: '#f0f0f0' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <label style={lbl}>Routes to compare</label>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#0f0f0f', background: '#f0f0f0', padding: '2px 8px', borderRadius: 20 }}>{numRoutes}</span>
          </div>
          <input type="range" min="1" max="3" value={numRoutes} onChange={e => setNumRoutes(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#185FA5' }} />
        </div>

        <div>
          <label style={lbl}>Vehicle mileage (km/l)</label>
          <input type="number" value={mileage} onChange={e => setMileage(Number(e.target.value))}
            placeholder="e.g. 15" min="1" style={inp} />
        </div>

        {mileage > 0 && (
          <div>
            <label style={lbl}>Fuel price (₹/l)</label>
            <input type="number" value={fuelPrice} onChange={e => setFuelPrice(Number(e.target.value))}
              placeholder="e.g. 104" min="1" style={inp} />
          </div>
        )}
      </div>

      {!loading && routes.length === 0 && (
        <button onClick={calculateRoutes}
          style={{ width: '100%', padding: 11, background: '#0864dc', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', letterSpacing: '0.02em' }}>
          Get Routes →
        </button>
      )}

      {loading && (
        <div style={{ textAlign: 'center', fontSize: 14, color: '#aaa', padding: 8, background: '#fafafa', borderRadius: 8 }}>
          Fetching routes…
        </div>
      )}

      {routes.length > 0 && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Results</div>
            <div style={{ fontSize: 11, color: '#bbb' }}>{routes.length} route{routes.length > 1 ? 's' : ''} found</div>
          </div>

          {routes.map((r, i) => (
            <div key={i} onClick={() => setSelectedRoute({ ...r, dir: directions[i] })}
              style={{
                padding: 12, borderRadius: 10, cursor: 'pointer',
                border: `1.5px solid ${i === optimalIdx ? r.color : '#eee'}`,
                background: i === optimalIdx ? '#f0f6ff' : '#fff',
                boxShadow: i === optimalIdx ? `0 2px 12px ${r.color}22` : '0 1px 4px rgba(0,0,0,0.04)',
                transition: 'all 0.15s',
              }}>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={dot(8, r.color)} />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#0f0f0f' }}>{r.label}</span>
                {i === optimalIdx && (
                  <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: '#185FA5', background: '#dbeafe', padding: '2px 8px', borderRadius: 20 }}>
                    ✓ OPTIMAL
                  </span>
                )}
              </div>

              <div style={{ fontSize: 11, color: '#bbb', marginBottom: 8 }}>via {r.via}</div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {[
                  { label: 'TOTAL DURATION', value: r.duration, bg: '#f8f8f8', color: '#0f0f0f' },
                  { label: 'DISTANCE', value: r.distance, bg: '#f8f8f8', color: '#0f0f0f' },
                  { label: 'ARRIVES AT', value: `🕐 ${r.arrivalTime}`, bg: '#f0faf8', color: '#2a499d' },
                  ...(mileage > 0 ? [{ label: 'FUEL COST', value: `₹${((r.distanceKm / mileage) * fuelPrice).toFixed(0)}`, bg: '#f0faf8', color: '#1e8100' }] : []),
                ].map(({ label, value, bg, color }) => (
                  <div key={label} style={{ background: bg, borderRadius: 6, padding: '6px 8px' }}>
                    <div style={{ fontSize: 10, color: '#aaa', marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color }}>{value}</div>
                  </div>
                ))}
              </div>

              {r.legs.length > 1 && (
                <div onClick={e => e.stopPropagation()}>
                  <RouteBreakdown r={r} />
                </div>
              )}

              <button onClick={e => { e.stopPropagation(); shareOnWhatsApp(r) }}
                style={{ marginTop: 10, width: '100%', padding: 7, background: '#07a140', color: '#fff', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" style={{ width: 16, height: 16 }} alt="" />
                Share on WhatsApp
              </button>
            </div>
          ))}

          <button onClick={() => { setRoutes([]); setDirections([]) }}
            style={{ width: '100%', padding: 9, background: '#fff', color: '#555', border: '1px solid #e8e8e8', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
            ← Change route
          </button>
        </>
      )}
    </div>
  )

  if (!isLoaded) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: "'DM Sans', sans-serif" }}>
      Loading map…
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Navbar />

      {/* ── Main area ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Map */}
        <div className="route-map-wrap">
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={MAP_CENTER} zoom={6}
            onLoad={onLoad} onUnmount={onUnmount}
            options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false }}
          >
            {directions.map((dir, i) => (
              <DirectionsRenderer key={i} directions={dir}
                options={{ polylineOptions: { strokeColor: COLORS[i], strokeWeight: 5, strokeOpacity: 0.8 }, suppressMarkers: i !== 0 }} />
            ))}
          </GoogleMap>
        </div>

        <div className="route-desktop-panel">
          {inputPanel}
        </div>
      </div>

      <div
        className="route-mobile-sheet"
        style={{
          top: `${panelTop}vh`,
          transition: isDragging ? 'none' : 'top 0.38s cubic-bezier(0.32,0.72,0,1)',
        }}
      >
        <div
          style={{ padding: '12px 0 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'grab', touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}
          onPointerDown={onPointerDown}
        >
          <div style={{ width: 40, height: 4, borderRadius: 2, background: '#d0d0d0' }} />
        </div>
        <div style={{ overflowY: 'auto', maxHeight: 'calc(92vh - 44px)', WebkitOverflowScrolling: 'touch' }}>
          {inputPanel}
        </div>
      </div>

      {/* ── Route detail modal ── */}
      {selectedRoute && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}
          onClick={() => setSelectedRoute(null)}
        >
          <div
            style={{ background: '#fff', borderRadius: 16, width: '90%', maxWidth: 560, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '1.2rem 1.4rem', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0f0f0f' }}>{selectedRoute.label}</div>
                <div style={{ fontSize: 12, color: '#888' }}>via {selectedRoute.via}</div>
              </div>
              <button onClick={() => setSelectedRoute(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#aaa' }}>✕</button>
            </div>

            <div style={{ height: 260 }}>
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={MAP_CENTER} zoom={9}
                options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false, zoomControl: false }}
              >
                <DirectionsRenderer
                  directions={selectedRoute.dir}
                  options={{ polylineOptions: { strokeColor: selectedRoute.color, strokeWeight: 5 } }}
                />
              </GoogleMap>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${mileage > 0 ? 4 : 3}, 1fr)`, gap: 1, background: '#f0f0f0' }}>
              {[
                { label: 'Duration', value: selectedRoute.duration },
                { label: 'Distance', value: selectedRoute.distance },
                { label: 'Arrives At', value: selectedRoute.arrivalTime },
                ...(mileage > 0 ? [{ label: 'Fuel Cost', value: `₹${((selectedRoute.distanceKm / mileage) * fuelPrice).toFixed(0)}` }] : []),
              ].map(item => (
                <div key={item.label} style={{ background: '#fff', padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#aaa', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0f0f0f' }}>{item.value}</div>
                </div>
              ))}
            </div>

            {selectedRoute.legs?.length > 1 && (
              <div style={{ padding: '1.2rem 1.4rem', borderTop: '1px solid #f0f0f0' }}>
                <RouteBreakdown r={selectedRoute} />
              </div>
            )}

            <div style={{ padding: '0 1.4rem 1.4rem' }}>
              <button onClick={() => shareOnWhatsApp(selectedRoute)}
                style={{ width: '100%', padding: 10, background: '#07a140', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" style={{ width: 16, height: 16 }} alt="" />
                Share on WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Map