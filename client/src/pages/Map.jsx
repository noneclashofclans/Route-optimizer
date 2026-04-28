import React, { useState, useCallback } from 'react'
import Navbar from '../components/Navbar'
import { GoogleMap, useJsApiLoader, DirectionsRenderer } from '@react-google-maps/api'

const center = { lat: 20.5937, lng: 78.9629 };
const COLORS = ['#185FA5', '#e63946', '#2a9d8f'];
const libraries = ['places'];

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '9px 12px',
  border: '1px solid #e8e8e8',
  borderRadius: '8px',
  fontSize: '13px',
  outline: 'none',
  background: '#fafafa',
  transition: 'border 0.2s',
};

const labelStyle = {
  fontSize: '11px',
  fontWeight: 600,
  color: '#999',
  display: 'block',
  marginBottom: '5px',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
};

const formatDuration = (totalSec) => {
  const h = Math.floor(totalSec / 3600);
  const m = Math.round((totalSec % 3600) / 60);
  return h > 0 ? `${h} hr ${m} min` : `${m} min`;
};

const Map = () => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries
  });

  const [map, setMap] = useState(null);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [stops, setStops] = useState([]);
  const [numRoutes, setNumRoutes] = useState(1);
  const [panelOpen, setPanelOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [directions, setDirections] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [mileage, setMileage] = useState('');
  const [fuelPrice, setFuelPrice] = useState(104);

  const onLoad = useCallback((m) => setMap(m), []);
  const onUnmount = useCallback(() => setMap(null), []);

  const addStop = () => setStops([...stops, '']);
  const updateStop = (i, val) => setStops(stops.map((s, idx) => idx === i ? val : s));
  const removeStop = (i) => setStops(stops.filter((_, idx) => idx !== i));

  const shareOnWhatsApp = (r) => {
    const fuelCost = mileage > 0
      ? `Fuel Cost: Rs.${((parseFloat(r.distance) / mileage) * fuelPrice).toFixed(0)}`
      : '';
    const stopsLine = stops.length > 0
      ? `Stops: ${stops.filter(s => s.trim()).join(' -> ')}\n`
      : '';
    const legLines = r.legs.length > 1
      ? '\nBreakdown:\n' + r.legs.map((leg, i) =>
          `  Leg ${i + 1}: ${leg.from} → ${leg.to} | ${leg.distance} | ${leg.duration} | arrives ~${leg.arrivalTime}`
        ).join('\n')
      : '';
    const message =
      `Route Details
--------------
From: ${start}
To: ${end}
${stopsLine}
Via: ${r.via}
Total Duration: ${r.duration}
Distance: ${r.distance}
Arrives At: ${r.arrivalTime}
${fuelCost}
${legLines}

Shared via Route-optimizer`;

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };


  const saveHistory = async (calculatedRoutes) => {
    const token = localStorage.getItem('token');
    if (!token) return; // not logged in, skip silently

    await fetch(`${import.meta.env.VITE_API_URL}/api/history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        from: start,
        to: end,
        stops: stops.filter(s => s.trim()),
        routes: calculatedRoutes.map(r => ({
          label: r.label,
          via: r.via,
          distance: r.distance,
          duration: r.duration,
          arrivalTime: r.arrivalTime,
          fuelCost: mileage > 0 ? `₹${((parseFloat(r.distance) / mileage) * fuelPrice).toFixed(0)}` : null,
          legs: r.legs,
        })),
      }),
    });
  };

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
    waypoints: stops.filter(s => s.trim()).map(s => ({ location: s, stopover: true })),
  }, (result, status) => {
    setLoading(false);
    if (status !== 'OK') return alert('Cannot find routes: ' + status);

    const available = result.routes.slice(0, numRoutes);
    setDirections(available.map((_, i) => ({ ...result, routes: [result.routes[i]] })));

    const departTime = Date.now();
    const allPoints = [start, ...stops.filter(s => s.trim()), end];

    const computedRoutes = available.map((r, i) => {
      const totalDistance = r.legs.reduce((sum, leg) => sum + leg.distance.value, 0);
      const totalDuration = r.legs.reduce((sum, leg) => sum + leg.duration.value, 0);

      const arrivalTime = new Date(departTime + totalDuration * 1000)
        .toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

      let cumulativeSec = 0;
      const legs = r.legs.map((leg, legIdx) => {
        cumulativeSec += leg.duration.value;
        const legArrival = new Date(departTime + cumulativeSec * 1000)
          .toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
        return {
          from: allPoints[legIdx],
          to: allPoints[legIdx + 1],
          distance: (leg.distance.value / 1000).toFixed(1) + ' km',
          duration: formatDuration(leg.duration.value),
          durationSec: leg.duration.value,
          arrivalTime: legArrival,
        };
      });

      return {
        label: `Route ${i + 1}`,
        via: r.summary,
        distance: (totalDistance / 1000).toFixed(1) + ' km',
        duration: formatDuration(totalDuration),
        durationVal: totalDuration,
        arrivalTime,
        color: COLORS[i],
        legs,
      };
    });

    setRoutes(computedRoutes);
    saveHistory(computedRoutes);
  });
};


  const optimalIdx = routes.length
    ? routes.indexOf(routes.reduce((a, b) => a.durationVal < b.durationVal ? a : b))
    : -1;

  const inputPanel = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '12px', borderBottom: '1px solid #f0f0f0' }}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f0f0f', letterSpacing: '0.03em' }}>Route Planner</div>
          <div style={{ fontSize: '11px', color: '#aaa' }}>Find & compare routes</div>
        </div>
      </div>

      {/* Route inputs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div>
          <label style={labelStyle}>From</label>
          <input value={start} onChange={e => setStart(e.target.value)} placeholder="Starting point"
            style={inputStyle} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{ width: '2px', height: '4px', background: '#ddd', borderRadius: '1px' }} />
            ))}
          </div>
        </div>

        {stops.map((s, i) => (
          <div key={i}>
            <label style={labelStyle}>Stop {i + 1}</label>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <input value={s} onChange={e => updateStop(i, e.target.value)} placeholder="e.g. Puri"
                style={{ ...inputStyle, flex: 1 }} />
              <button onClick={() => removeStop(i)}
                style={{ flexShrink: 0, width: '34px', height: '34px', background: '#fff5f5', border: '1px solid #fdd', borderRadius: '8px', cursor: 'pointer', color: '#ff0000', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                ✕
              </button>
            </div>
          </div>
        ))}

        {stops.length < 3 && (
          <button onClick={addStop}
            style={{ width: '100%', padding: '8px', background: '#fff', color: '#555', border: '1px dashed #d0d0d0', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: 500 }}>
            + Add Stop
          </button>
        )}

        <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{ width: '2px', height: '4px', background: '#ddd', borderRadius: '1px' }} />
            ))}
          </div>
        </div>

        <div>
          <label style={labelStyle}>To</label>
          <input value={end} onChange={e => setEnd(e.target.value)} placeholder="Destination"
            style={inputStyle} />
        </div>
      </div>

      <div style={{ height: '1px', background: '#f0f0f0' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={labelStyle}>Routes to compare</label>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f0f0f', background: '#f0f0f0', padding: '2px 8px', borderRadius: '20px' }}>{numRoutes}</span>
          </div>
          <input type="range" min="1" max="3" value={numRoutes} onChange={e => setNumRoutes(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#185FA5' }} />
        </div>

        <div>
          <label style={labelStyle}>Vehicle mileage (km/l)</label>
          <input type="number" value={mileage} onChange={e => setMileage(Number(e.target.value))}
            placeholder="e.g. 15" min="1" style={inputStyle} />
        </div>
      </div>

      {!loading && routes.length === 0 && (
        <button onClick={calculateRoutes}
          style={{ width: '100%', padding: '11px', background: '#0f0f0f', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', letterSpacing: '0.02em' }}>
          Get Routes →
        </button>
      )}

      {loading && (
        <div style={{ textAlign: 'center', fontSize: '13px', color: '#aaa', padding: '8px', background: '#fafafa', borderRadius: '8px' }}>
          ⏳ Fetching routes...
        </div>
      )}

      {/* Route cards */}
      {routes.length > 0 && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Results</div>
            <div style={{ fontSize: '11px', color: '#bbb' }}>{routes.length} route{routes.length > 1 ? 's' : ''} found</div>
          </div>

          {routes.map((r, i) => (
            <div key={i} onClick={() => setSelectedRoute({ ...r, dir: directions[i] })} style={{
              padding: '12px', borderRadius: '10px', cursor: 'pointer',
              border: `1.5px solid ${i === optimalIdx ? r.color : '#eee'}`,
              background: i === optimalIdx ? '#f0f6ff' : '#fff',
              boxShadow: i === optimalIdx ? `0 2px 12px ${r.color}22` : '0 1px 4px rgba(0,0,0,0.04)',
              transition: 'all 0.15s',
            }}>
              {/* Card header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: r.color, flexShrink: 0 }} />
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f0f0f' }}>{r.label}</span>
                {i === optimalIdx && (
                  <span style={{ marginLeft: 'auto', fontSize: '10px', fontWeight: 700, color: '#185FA5', background: '#dbeafe', padding: '2px 8px', borderRadius: '20px' }}>
                    ✓ OPTIMAL
                  </span>
                )}
              </div>

              <div style={{ fontSize: '11px', color: '#bbb', marginBottom: '8px' }}>via {r.via}</div>

              {/* Stats grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <div style={{ background: '#f8f8f8', borderRadius: '6px', padding: '6px 8px' }}>
                  <div style={{ fontSize: '10px', color: '#aaa', marginBottom: '2px' }}>TOTAL DURATION</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f0f0f' }}>{r.duration}</div>
                </div>
                <div style={{ background: '#f8f8f8', borderRadius: '6px', padding: '6px 8px' }}>
                  <div style={{ fontSize: '10px', color: '#aaa', marginBottom: '2px' }}>DISTANCE</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f0f0f' }}>{r.distance}</div>
                </div>
                <div style={{ background: '#f0faf8', borderRadius: '6px', padding: '6px 8px' }}>
                  <div style={{ fontSize: '10px', color: '#aaa', marginBottom: '2px' }}>ARRIVES AT</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#2a9d8f' }}>🕐 {r.arrivalTime}</div>
                </div>
                {mileage > 0 && (
                  <div style={{ background: '#f0faf8', borderRadius: '6px', padding: '6px 8px' }}>
                    <div style={{ fontSize: '10px', color: '#aaa', marginBottom: '2px' }}>FUEL COST</div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#2a9d8f' }}>⛽ ₹{((parseFloat(r.distance) / mileage) * fuelPrice).toFixed(0)}</div>
                  </div>
                )}
              </div>

              {/* Leg-by-leg breakdown — only when there are intermediate stops */}
              {r.legs && r.legs.length > 1 && (
                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #f0f0f0' }}
                  onClick={e => e.stopPropagation()}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                    Route Breakdown
                  </div>

                  {/* Start node */}
                  <div style={{ display: 'flex', alignItems: 'stretch', gap: '10px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '16px', flexShrink: 0 }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#185FA5', flexShrink: 0, marginTop: '2px' }} />
                      <div style={{ flex: 1, width: '1.5px', background: '#e8e8e8', margin: '3px 0' }} />
                    </div>
                    <div style={{ flex: 1, paddingBottom: '10px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 500, color: '#0f0f0f' }}>{start}</div>
                      <div style={{ fontSize: '11px', color: '#aaa', marginTop: '1px' }}>Starting point · depart now</div>
                    </div>
                  </div>

                  {/* Intermediate stops (all legs except last) */}
                  {r.legs.slice(0, -1).map((leg, legIdx) => (
                    <div key={legIdx} style={{ display: 'flex', alignItems: 'stretch', gap: '10px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '16px', flexShrink: 0 }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#aaa', flexShrink: 0, marginTop: '2px' }} />
                        <div style={{ flex: 1, width: '1.5px', background: '#e8e8e8', margin: '3px 0' }} />
                      </div>
                      <div style={{ flex: 1, paddingBottom: '10px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 500, color: '#0f0f0f' }}>{leg.to}</div>
                        <div style={{ fontSize: '11px', color: '#aaa', marginTop: '1px' }}>Stop {legIdx + 1} · {leg.distance}</div>
                        <div style={{ fontSize: '11px', color: '#185FA5', fontWeight: 500, marginTop: '2px' }}>
                          +{leg.duration} · arrives ~{leg.arrivalTime}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Destination node — uses last leg */}
                  {(() => {
                    const lastLeg = r.legs[r.legs.length - 1];
                    return (
                      <div style={{ display: 'flex', alignItems: 'stretch', gap: '10px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '16px', flexShrink: 0 }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#e63946', flexShrink: 0, marginTop: '2px' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '12px', fontWeight: 500, color: '#0f0f0f' }}>{lastLeg.to}</div>
                          <div style={{ fontSize: '11px', color: '#aaa', marginTop: '1px' }}>Destination · {lastLeg.distance}</div>
                          <div style={{ fontSize: '11px', color: '#185FA5', fontWeight: 500, marginTop: '2px' }}>
                            +{lastLeg.duration} · arrives ~{lastLeg.arrivalTime}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* WhatsApp share */}
              <button
                onClick={(e) => { e.stopPropagation(); shareOnWhatsApp(r); }}
                style={{
                  marginTop: '10px', width: '100%', padding: '7px',
                  background: '#07a140', color: '#fff', border: 'none',
                  borderRadius: '7px', fontSize: '12px', fontWeight: 600,
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: '6px'
                }}>
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                  style={{ width: '16px', height: '16px' }}
                  alt="whatsapp"
                />
                Share
              </button>
            </div>
          ))}

          {/* Recalculate */}
          <button onClick={() => { setRoutes([]); setDirections([]); }}
            style={{ width: '100%', padding: '9px', background: '#fff', color: '#555', border: '1px solid #e8e8e8', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
            ← Change route
          </button>
        </>
      )}
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
      <div className="d-none d-lg-block" style={{ flex: 1, padding: '30px', background: '#f0f2f5', overflow: 'hidden', position: 'relative' }}>
        <div style={{ width: '100%', height: '100%', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}>
          <GoogleMap mapContainerStyle={{ width: '100%', height: '100%' }} center={center} zoom={6}
            onLoad={onLoad} onUnmount={onUnmount}
            options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false }}>
            {directions.map((dir, i) => (
              <DirectionsRenderer key={i} directions={dir}
                options={{ polylineOptions: { strokeColor: COLORS[i], strokeWeight: 5, strokeOpacity: 0.8 }, suppressMarkers: i !== 0 }} />
            ))}
          </GoogleMap>
        </div>
        <div style={{ position: 'absolute', top: '50px', left: '50px', zIndex: 10, background: '#fff', borderRadius: '14px', padding: '1.4rem', width: '300px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', maxHeight: 'calc(100vh - 140px)', overflowY: 'auto' }}>
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
          padding: '1.5rem',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
          transition: 'max-height 0.3s ease',
          maxHeight: panelOpen ? '80vh' : '30vh',
          overflow: 'auto',
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

            <div style={{ padding: '1.2rem 1.4rem', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f0f0f' }}>{selectedRoute.label}</div>
                <div style={{ fontSize: '12px', color: '#888' }}>via {selectedRoute.via}</div>
              </div>
              <button onClick={() => setSelectedRoute(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#aaa' }}>x</button>
            </div>

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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1px', background: '#f0f0f0' }}>
              {[
                { label: 'Duration', value: selectedRoute.duration },
                { label: 'Distance', value: selectedRoute.distance },
                { label: 'Arrives At', value: selectedRoute.arrivalTime },
                { label: 'Fuel Cost', value: mileage > 0 ? `₹${((parseFloat(selectedRoute.distance) / mileage) * fuelPrice).toFixed(0)}` : '-' },
              ].map((item) => (
                <div key={item.label} style={{ background: '#fff', padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f0f0f' }}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* Breakdown inside modal too */}
            {selectedRoute.legs && selectedRoute.legs.length > 1 && (
              <div style={{ padding: '1.2rem 1.4rem', borderTop: '1px solid #f0f0f0' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
                  Route breakdown
                </div>

                <div style={{ display: 'flex', alignItems: 'stretch', gap: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '16px', flexShrink: 0 }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#185FA5', flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ flex: 1, width: '1.5px', background: '#e8e8e8', margin: '3px 0' }} />
                  </div>
                  <div style={{ flex: 1, paddingBottom: '12px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: '#0f0f0f' }}>{start}</div>
                    <div style={{ fontSize: '11px', color: '#aaa', marginTop: '1px' }}>Starting point · depart now</div>
                  </div>
                </div>

                {selectedRoute.legs.slice(0, -1).map((leg, legIdx) => (
                  <div key={legIdx} style={{ display: 'flex', alignItems: 'stretch', gap: '10px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '16px', flexShrink: 0 }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#aaa', flexShrink: 0, marginTop: '2px' }} />
                      <div style={{ flex: 1, width: '1.5px', background: '#e8e8e8', margin: '3px 0' }} />
                    </div>
                    <div style={{ flex: 1, paddingBottom: '12px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: '#0f0f0f' }}>{leg.to}</div>
                      <div style={{ fontSize: '11px', color: '#aaa', marginTop: '1px' }}>Stop {legIdx + 1} · {leg.distance}</div>
                      <div style={{ fontSize: '11px', color: '#185FA5', fontWeight: 500, marginTop: '2px' }}>
                        +{leg.duration} · arrives ~{leg.arrivalTime}
                      </div>
                    </div>
                  </div>
                ))}

                {(() => {
                  const lastLeg = selectedRoute.legs[selectedRoute.legs.length - 1];
                  return (
                    <div style={{ display: 'flex', alignItems: 'stretch', gap: '10px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '16px', flexShrink: 0 }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#e63946', flexShrink: 0, marginTop: '2px' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: 500, color: '#0f0f0f' }}>{lastLeg.to}</div>
                        <div style={{ fontSize: '11px', color: '#aaa', marginTop: '1px' }}>Destination · {lastLeg.distance}</div>
                        <div style={{ fontSize: '11px', color: '#185FA5', fontWeight: 500, marginTop: '2px' }}>
                          +{lastLeg.duration} · arrives ~{lastLeg.arrivalTime}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Map