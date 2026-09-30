'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const cargar = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('empresas').select('*').order('razon_social')
    console.log('data', data, 'error', error)
    if (data) setEmpresas(data)
    setLoading(false)
  }

  useEffect(() => { cargar() }, [])

  return (
    <div style={{ padding: '10px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 800 }}>Empresas</h1>
      <p style={{ opacity: 0.5, fontSize: 12 }}>{empresas.length} empresas</p>

      <div style={{ marginTop: 24, background: '#18181b', borderRadius: 12, border: '1px solid #232326' }}>
        {loading ? <div style={{ padding: 24, opacity: 0.5 }}>Cargando...</div> :
          empresas.map(e => (
            <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #232326' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{e.razon_social || e.nombre}</div>
                <div style={{ opacity: 0.4, fontSize: 11 }}>{e.Pais} - {e.Sector} - {e.Estado}</div>
              </div>
              <span style={{ opacity: 0.4, fontSize: 11 }}>{e.id.slice(0,8)}</span>
            </div>
          ))}
      </div>
    </div>
  )
}
