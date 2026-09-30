export default function Page() {
  return (
    <div style={{ padding: '10px 20px' }}>
      <h1 style={{ fontSize: 20, fontWeight: 800 }}>Dashboard</h1>
      <p style={{ opacity: 0.6, fontSize: 13, marginTop: 4 }}>Vista general de la plataforma Vinculab.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 24 }}>
        {[
          { k: 'EMPRESAS', v: '2' },
          { k: 'PRODUCTOS', v: '2' },
          { k: 'MODELOS', v: '5' },
          { k: 'LOTES', v: '10' },
        ].map(c => (
          <div key={c.k} style={{ background: '#18181b', borderLeft: '3px solid #ff6a00', borderRadius: 10, padding: 20 }}>
            <div style={{ fontSize: 10, letterSpacing: 1, opacity: 0.5 }}>{c.k}</div>
            <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>{c.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
