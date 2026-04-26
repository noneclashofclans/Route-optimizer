import React, { useState, useCallback } from 'react'
import Navbar from '../components/Navbar'
import { GoogleMap, useJsApiLoader, DirectionsRenderer } from '@react-google-maps/api'

const center = { lat: 20.5937, lng: 78.9629 };
const COLORS = ['#185FA5', '#e63946', '#2a9d8f'];
const libraries = ['places'];

const Map = () => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries
  });

  const [map, setMap] = useState(null);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [numRoutes, setNumRoutes] = useState(1);
  const [panelOpen, setPanelOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [directions, setDirections] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);

  const onLoad = useCallback((m) => setMap(m), []);
  const onUnmount = useCallback(() => setMap(null), []);

  const calculateRoutes = () => {
    if (!start || !end) return alert('Enter both locations');
    setLoading(true);
    setRoutes([]);
    setDirections([]);

    new window.google.maps.DirectionsService().route({
      origin: start,
      destination: end,
      travelMode: window.google.maps.TravelMode.DRIVING,
      provideRouteAlternatives: true,
    }, (result, status) => {
      setLoading(false);
      if (status !== 'OK') return alert('Cannot find routes: ' + status);

      const available = result.routes.slice(0, numRoutes);

      setDirections(available.map((_, i) => ({ ...result, routes: [result.routes[i]] })));

      setRoutes(available.map((r, i) => ({
        label: `Route ${i + 1}`,
        via: r.summary,
        distance: r.legs[0].distance.text,
        duration: r.legs[0].duration.text,
        durationVal: r.legs[0].duration.value,
        color: COLORS[i],
      })));
    });
  };

  const optimalIdx = routes.length
    ? routes.indexOf(routes.reduce((a, b) => a.durationVal < b.durationVal ? a : b))
    : -1;

  const inputPanel = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f0f0f', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Route Planner</div>

      <div>
        <label style={{ fontSize: '12px', fontWeight: 500, color: '#555', display: 'block', marginBottom: '5px' }}>Start</label>
        <input value={start} onChange={e => setStart(e.target.value)} placeholder="e.g. Bhubaneswar"
          style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '13px', outline: 'none' }} />
      </div>

      <div>
        <label style={{ fontSize: '12px', fontWeight: 500, color: '#555', display: 'block', marginBottom: '5px' }}>Destination</label>
        <input value={end} onChange={e => setEnd(e.target.value)} placeholder="e.g. Cuttack"
          style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '13px', outline: 'none' }} />
      </div>

      <div>
        <label style={{ fontSize: '12px', fontWeight: 500, color: '#555', display: 'block', marginBottom: '5px' }}>
          Routes to compare: <strong>{numRoutes}</strong>
        </label>
        <input type="range" min="1" max="3" value={numRoutes} onChange={e => setNumRoutes(Number(e.target.value))}
          style={{ width: '100%', accentColor: '#185FA5' }} />
      </div>

      <button onClick={calculateRoutes} disabled={loading}
        style={{ width: '100%', padding: '11px', background: '#0f0f0f', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>
        {loading ? 'Calculating...' : 'Show routes'}
      </button>

      {routes.map((r, i) => (
        <div key={i} onClick={() => setSelectedRoute({ ...r, dir: directions[i] })} style={{
          padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
          border: `2px solid ${i === optimalIdx ? r.color : '#eee'}`,
          background: i === optimalIdx ? '#f0f6ff' : '#fafafa',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: r.color, flexShrink: 0 }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f0f0f' }}>{r.label}</span>
            {i === optimalIdx && (
              <span style={{ marginLeft: 'auto', fontSize: '10px', fontWeight: 600, color: '#185FA5', background: '#dbeafe', padding: '2px 8px', borderRadius: '20px' }}>
                OPTIMAL
              </span>
            )}
          </div>
          <div style={{ fontSize: '11px', color: '#888', marginBottom: '2px' }}>via {r.via}</div>
          <div style={{ fontSize: '13px', color: '#333', fontWeight: 500 }}>{r.duration} · {r.distance}</div>
        </div>
      ))}
    </div>
  );

  if (!isLoaded) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: "'DM Sans', sans-serif" }}>
      Loading map...
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Navbar />

      {/* Desktop */}
      <div className="d-none d-lg-block" style={{ flex: 1, padding: '30px', background: '#f5f5f5', overflow: 'hidden', position: 'relative' }}>
        <div style={{ width: '100%', height: '100%', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}>
          <GoogleMap mapContainerStyle={{ width: '100%', height: '100%' }} center={center} zoom={6}
            onLoad={onLoad} onUnmount={onUnmount}
            options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false }}>
            {directions.map((dir, i) => (
              <DirectionsRenderer key={i} directions={dir}
                options={{ polylineOptions: { strokeColor: COLORS[i], strokeWeight: 5, strokeOpacity: 0.8 }, suppressMarkers: i !== 0 }} />
            ))}
          </GoogleMap>
        </div>
        <div style={{ position: 'absolute', top: '50px', left: '50px', zIndex: 10, background: '#fff', borderRadius: '10px', padding: '1.4rem', width: '280px', boxShadow: '0 4px 24px rgba(0,0,0,0.13)', maxHeight: 'calc(100vh - 140px)', overflowY: 'auto' }}>
          {inputPanel}
        </div>
      </div>

      {/* Mobile */}
      <div className="d-lg-none" style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <GoogleMap mapContainerStyle={{ width: '100%', height: '100%' }} center={center} zoom={6}
          onLoad={onLoad} onUnmount={onUnmount}
          options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false }}>
          {directions.map((dir, i) => (
            <DirectionsRenderer key={i} directions={dir}
              options={{ polylineOptions: { strokeColor: COLORS[i], strokeWeight: 5, strokeOpacity: 0.8 }, suppressMarkers: i !== 0 }} />
          ))}
        </GoogleMap>
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10,
          background: '#fff', borderRadius: '20px 20px 0 0',
          padding: panelOpen ? '1.5rem' : '1rem 1.5rem',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
          transition: 'max-height 0.3s ease',
          maxHeight: panelOpen ? '80vh' : '80px',
          overflow: panelOpen ? 'auto' : 'hidden',
        }}>
          <div onClick={() => setPanelOpen(!panelOpen)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', marginBottom: panelOpen ? '1rem' : 0 }}>
            <div style={{ width: '40px', height: '4px', background: '#ddd', borderRadius: '2px', marginBottom: '8px' }} />
            {!panelOpen && <div style={{ fontSize: '14px', fontWeight: 500, color: '#0f0f0f' }}>Plan your route</div>}
          </div>
          {panelOpen && inputPanel}
        </div>
      </div>

      {/* Route detail modal */}
      {selectedRoute && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'DM Sans', sans-serif"
        }} onClick={() => setSelectedRoute(null)}>
          <div style={{
            background: '#fff', borderRadius: '16px', width: '90%', maxWidth: '560px',
            overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.2)'
          }} onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{ padding: '1.2rem 1.4rem', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f0f0f' }}>{selectedRoute.label}</div>
                <div style={{ fontSize: '12px', color: '#888' }}>via {selectedRoute.via}</div>
              </div>
              <button onClick={() => setSelectedRoute(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#aaa' }}>×</button>
            </div>

            {/* Minimap */}
            <div style={{ height: '280px' }}>
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={center} zoom={9}
                options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false, zoomControl: false }}
              >
                <DirectionsRenderer
                  directions={selectedRoute.dir}
                  options={{ polylineOptions: { strokeColor: selectedRoute.color, strokeWeight: 5 } }}
                />
              </GoogleMap>
            </div>

            {/* Info cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1px', background: '#f0f0f0' }}>
              {[
                { label: 'Duration', value: selectedRoute.duration },
                { label: 'Distance', value: selectedRoute.distance },
                { label: 'Best mode', value: parseFloat(selectedRoute.distance) <= 10 ? '🛵 Bike/Auto' : '🚗 Drive' },
              ].map((item) => (
                <div key={item.label} style={{ background: '#fff', padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f0f0f' }}>{item.value}</div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default Map