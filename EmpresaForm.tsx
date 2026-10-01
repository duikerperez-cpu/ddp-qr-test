'use client'
import { useState, useEffect } from 'react'
import { Empresa } from '../types'

export function EmpresaForm({ initial, onSave, onClose }: { initial?: Empresa | null, onSave: (d: any) => void, onClose: () => void }) {
  const [form, setForm] = useState({ razon_social: '', Pais: 'Chile', Sector: '' })
  useEffect(() => { if (initial) setForm({ razon_social: initial.razon_social, Pais: initial.Pais || 'Chile', Sector: initial.Sector || '' }) }, [initial])
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
      <div style={{ background: '#18181b', padding: 24, borderRadius: 12, border: '1px solid #27272a', width: 360 }}>
        <h3 style={{ margin: 0 }}>{initial? 'Editar' : 'Nueva'} Empresa</h3>
        <input value={form.razon_social} onChange={e => setForm({...form, razon_social: e.target.value })} placeholder="Razón Social" style={{ width: '100%', marginTop: 16, background: '#09090b', border: '1px solid #27272a', borderRadius: 8, padding: '10px', color: 'white' }} />
        <input value={form.Sector} onChange={e => setForm({...form, Sector: e.target.value })} placeholder="Sector" style={{ width: '100%', marginTop: 8, background: '#09090b', border: '1px solid #27272a', borderRadius: 8, padding: '10px', color: 'white' }} />
        <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ background: '#27272a', border: 0, borderRadius: 8, padding: '8px 14px', color: 'white', cursor: 'pointer' }}>Cancelar</button>
          <button onClick={() => onSave(form)} style={{ background: '#ff6a00', border: 0, borderRadius: 8, padding: '8px 14px', color: 'white', fontWeight: 700, cursor: 'pointer' }}>Guardar</button>
        </div>
      </div>
    </div>
  )
}
