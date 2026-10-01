'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import QRWithLogo from '../../components/QRWithLogo'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

const PLANTILLAS: any = {
  kombucha: {
    label: 'AUKA - Kombucha',
    logo: '/auka-logo.png',
    fallback: '/vinculab-logo.png',
    prefix: 'DPP-AUKA',
    color: '#15803d',
    fields: [
      { key: 'sabor', label: 'Sabor', placeholder: 'Ej: Berries, Original' },
      { key: 'lote', label: 'Lote', placeholder: 'Ej: 2024-001' },
      { key: 'fecha_vencimiento', label: 'Vencimiento', type: 'date' },
      { key: 'ingredientes', label: 'Ingredientes', placeholder: 'Té, azúcar...' },
      { key: 'azucar_g', label: 'Azúcar (g/L)' },
      { key: 'temperatura_conservacion', label: 'Conservación', placeholder: '2-6°C' },
      { key: 'resolucion_sanitaria', label: 'Res. Sanitaria' },
      { key: 'certificacion', label: 'Certificación' },
    ]
  },
  perno: {
    label: 'HERCOM - Perno',
    logo: '/hercom-logo.png',
    fallback: '/vinculab-logo.png',
    prefix: 'DPP-HERCOM',
    color: '#ff6a00',
    fields: [
      { key: 'medida', label: 'Medida', placeholder: 'Ej: 3/4 x 3' },
      { key: 'norma', label: 'Norma', placeholder: 'ASTM A325' },
      { key: 'lote_acero', label: 'Lote Acero' },
      { key: 'certificado_url', label: 'URL Certificado' },
    ]
  }
}

export default function CrearDPP() {
  const [tipo, setTipo] = useState('kombucha')
  const [form, setForm] = useState<any>({})
  const [creado, setCreado] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const plantilla = PLANTILLAS[tipo]

  const crear = async () => {
    setLoading(true)
    const codigo = `${plantilla.prefix}-${Math.floor(1000 + Math.random()*9000)}`
    const { data, error } = await supabase.from('dpps').insert({
      codigo,
      plantilla: tipo,
      descripcion: form.sabor || form.medida || 'Producto',
      datos: form
    }).select().single()

    if (!error) setCreado(data)
    setLoading(false)
  }

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Crear DPP con QR y Logo</h1>
      <p style={{ color: '#71717a', fontSize: 13, marginBottom: 20 }}>Selecciona plantilla → completa → genera QR con logo central</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {Object.entries(PLANTILLAS).map(([k, v]: any) => (
          <button key={k} onClick={() => { setTipo(k); setCreado(null) }} style={{
            padding: '10px 16px', borderRadius: 10, border: '1px solid #e4e4e7',
            background: tipo === k? '#09090b' : 'white', color: tipo === k? 'white' : 'black',
            fontWeight: 700, cursor: 'pointer'
          }}>{v.label}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
        <div style={{ background: 'white', padding: 20, borderRadius: 16, border: '1px solid #e4e4e7' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {plantilla.fields.map((f: any) => (
              <div key={f.key} style={{ gridColumn: f.key === 'ingredientes'? '1 / -1' : 'auto' }}>
                <label style={{ fontSize: 11, fontWeight: 800, color: '#71717a', textTransform: 'uppercase' }}>{f.label}</label>
                <input
                  type={f.type || 'text'}
                  placeholder={f.placeholder}
                  value={form[f.key] || ''}
                  onChange={e => setForm({...form, [f.key]: e.target.value })}
                  style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e4e4e7', marginTop: 4, fontSize: 13 }}
                />
              </div>
            ))}
          </div>
          <button onClick={crear} disabled={loading} style={{ marginTop: 20, width: '100%', padding: 14, background: plantilla.color, color: 'white', border: 0, borderRadius: 10, fontWeight: 900, cursor: 'pointer' }}>
            {loading? 'Creando...' : `CREAR ${plantilla.prefix} + QR CON LOGO`}
          </button>
        </div>

        <div style={{ background: 'white', padding: 20, borderRadius: 16, border: '1px solid #e4e4e7', textAlign: 'center' }}>
          {creado? (
            <>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#15803d', marginBottom: 10 }}>✅ CREADO: {creado.codigo}</div>
              <QRWithLogo data={`https://vinculab.cl/p/${creado.codigo}`} logo={plantilla.logo} fallback={plantilla.fallback} size={300} />
              <a href={`/p/${creado.codigo}`} target="_blank" style={{ display: 'block', marginTop: 12, fontSize: 12, color: '#2563eb', textDecoration: 'none' }}>Ver ficha pública →</a>
            </>
          ) : (
            <div style={{ padding: 40, color: '#a1a1aa', fontSize: 12 }}>El QR con logo aparecerá aquí al crear</div>
          )}
        </div>
      </div>
    </div>
  )
}
