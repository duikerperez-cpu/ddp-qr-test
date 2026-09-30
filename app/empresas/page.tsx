'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Empresa = { id: string; nombre: string; created_at: string }

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [nombre, setNombre] = useState('')
  const [loading, setLoading] = useState(true)

  const cargar = async () => {
    setLoading(true)
    const { data } = await supabase.from('empresas').select('*').order('created_at', { ascending: false })
    if (data) setEmpresas(data)
    setLoading(false)
  }

  useEffect(() => { cargar() }, [])

  const crear = async () => {
    if (!nombre.trim()) return
    const { error } = await supabase.from('empresas').insert([{ nombre }])
    if (!error) { setNombre(''); cargar() }
  }

  return (
    <div style={{ padding: '10px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 800 }}>Empresas</h1>
      <p style={{ opacity: 0.5, fontSize: 12 }}>{empresas.length} empresas</p>

      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre empresa"
          style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, padding: '8px 12px', color: 'white' }} />
        <button onClick={crear} style={{ background: '#ff6a00', border: 0, borderRadius: 8, padding: '8px 16px', color: 'white', fontWeight: 700, cursor: 'pointer' }}>+ Nueva</button>
      </div>

      <div style={{ marginTop: 24, background: '#18181b', borderRadius: 12, border: '1px solid #232326' }}>
        {loading ? <div style={{ padding: 24, opacity: 0.5 }}>Cargando...</div> :
          empresas.map(e => (
            <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #232326' }}>
              <span>{e.nombre}</span>
              <span style={{ opacity: 0.4, fontSize: 11 }}>{new Date(e.created_at).toLocaleDateString()}</span>
            </div>
          ))}
      </div>
    </div>
  )
}
