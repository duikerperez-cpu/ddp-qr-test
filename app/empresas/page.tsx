'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Empresa = {
  id: string
  nombre: string
  rut?: string
  created_at: string
}

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [nombre, setNombre] = useState('')
  const [loading, setLoading] = useState(true)

  const cargar = async () => {
    setLoading(true)
    const { data } = await supabase.from('empresas').select('*').order('created_at', { ascending: false })
    if (data) setEmpresas(data as Empresa[])
    setLoading(false)
  }

  useEffect(() => { cargar() }, [])

  const crear = async () => {
    if (!nombre.trim()) return
    const { error } = await supabase.from('empresas').insert([{ nombre }])
    if (!error) {
      setNombre('')
      cargar()
    }
  }

  return (
    <div style={{ padding: '10px 10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Empresas</h1>
          <p style={{ opacity: 0.5, fontSize: 12, marginTop: 4 }}>{empresas.length} empresas registradas</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input 
            value={nombre} 
            onChange={e => setNombre(e.target.value)}
            placeholder="Nombre empresa"
            style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, padding: '8px 12px', color: 'white', fontSize: 13 }}
          />
          <button onClick={crear} style={{ background: '#ff6a00', border: 0, borderRadius: 8, padding: '8px 16px', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
            + Nueva
          </button>
        </div>
      </div>

      <div style={{ marginTop: 24, background: '#18181b', borderRadius: 12, border: '1px solid #232326', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 24, opacity: 0.5, fontSize: 13 }}>Cargando...</div>
        ) : empresas.length === 0 ? (
          <div style={{ padding: 24, opacity: 0.5, fontSize: 13 }}>No hay empresas aún</div>
        ) : (
          empresas.map(e => (
            <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #232326', fontSize: 13.5 }}>
              <span style={{ fontWeight: 600 }}>{e.nombre}</span>
              <span style={{ opacity: 0.4, fontSize: 11 }}>{new Date(e.created_at).toLocaleDateString()}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
