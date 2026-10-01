export default function AdminDashboard() {
  const cards = [
    { label: 'EMPRESAS', value: 2, border: '#ff6a00' },
    { label: 'PRODUCTOS', value: 2, border: '#ff6a00' },
    { label: 'MODELOS', value: 5, border: '#ff6a00' },
    { label: 'LOTES', value: 10, border: '#ff6a00' },
  ]
  return (
    <div style={{ padding: 28 }}>
      <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>Dashboard</h1>
      <p style={{ color: '#71717a', fontSize: 13, marginTop: 6 }}>Vista general de la plataforma Vinculab.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 24 }}>
        {cards.map(c => (
          <div key={c.label} style={{
            background: '#18181b',
            borderLeft: `4px solid ${c.border}`,
            borderRadius: 12,
            padding: 20,
            color: 'white'
          }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: '#a1a1aa', letterSpacing: 1 }}>{c.label}</div>
            <div style={{ fontSize: 32, fontWeight: 900, marginTop: 8 }}>{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
