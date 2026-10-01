'use client'
import { useState, useEffect } from 'react'
import { Modelo } from '../types'
export function ModeloForm({ initial, empresas, productos, onSave, onClose }: { initial?: Modelo | null, empresas: any[], productos: any[], onSave: (d: any) => void, onClose: () => void }) {
  const [form, setForm] = useState({ nombre: '', Descripcion: '', Categoria: 'Bateria', empresa_id: '', producto_id: '' })
  useEffect(() => { if (initial) setForm({ nombre: initial.nombre, Descripcion: initial.Descripcion || '', Categoria: initial.Categoria || 'Bateria', empresa_id: initial.empresa_id || '', producto_id: initial.producto_id || '' }) }, [initial])
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
      <div style={{ background: '#18181b', padding: 24, borderRadius: 12, border: '1px solid #27272a', width: 380 }}>
        <h3 style={{ margin: 0 }}>{initial? 'Editar' : 'Nuevo'} Modelo</h3>
        <input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Nombre modelo" style={{ width: '100%', marginTop: 16, background: '#09090b', border: '1px solid #27272a', borderRadius: 8, padding: '10px', color: 'white' }} />
        <input value={form.Descripcion} onChange={e => setForm({...form, Descripcion: e.target.value})} placeholder="Descripcion" style={{ width: '100%', marginTop: 8, background: '#09090b', border: '1px solid #27272a', borderRadius: 8, padding: '10px', color: 'white' }} />
        <select value={form.empresa_id} onChange={e => setForm({...form, empresa_id: e.target.value})} style={{ width: '100%', marginTop: 8, background: '#09090b', border: '1px solid #27272a', borderRadius: 8, padding: '10px', color: 'white' }}>
          <option value="">Empresa...</option>{empresas.map((em: any) => <option key={em.id} value={em.id}>{em.razon_social}</option>)}
        </select>
        <select value={form.producto_id} onChange={e => setForm({...form, producto_id: e.target.value})} style={{ width: '100%', marginTop: 8, background: '#09090b', border: '1px solid #27272a', borderRadius: 8, padding: '10px', color: 'white' }}>
          <option value="">Producto...</option>{productos.map((p: any) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>
        <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ background: '#27272a', border: 0, borderRadius: 8, padding: '8px 14px', color: 'white', cursor: 'pointer' }}>Cancelar</button>
          <button onClick={() => onSave(form)} style={{ background: '#ff6a00', border: 0, borderRadius: 8, padding: '8px 14px', color: 'white', fontWeight: 700, cursor: 'pointer' }}>Guardar</button>
        </div>
      </div>
    </div>
  )
}
