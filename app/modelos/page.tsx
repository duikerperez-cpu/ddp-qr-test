'use client'
import { useEffect, useState } from 'react'
import { ModelosTable } from './components/ModelosTable'
import { ModeloForm } from './components/ModeloForm'
import { getModelos, getEmpresas, getProductos, createModelo, updateModelo, deleteModelo } from './lib/queries'
import { Modelo } from './types'

export default function ModelosPage() {
  const [modelos, setModelos] = useState<Modelo[]>([])
  const [empresas, setEmpresas] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Modelo | null>(null)

  const cargar = async () => {
    const { data } = await getModelos()
    if (data) setModelos(data as any)
    const e = await getEmpresas()
    if (e.data) setEmpresas(e.data)
    const p = await getProductos()
    if (p.data) setProductos(p.data)
  }
  useEffect(() => { cargar() }, [])

  const handleSave = async (formData: any) => {
    if (editing) await updateModelo(editing.id, formData)
    else await createModelo(formData)
    setShowForm(false); setEditing(null); cargar()
  }

  return (
    <div style={{ padding: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Modelos</h1>
        <button onClick={() => { setEditing(null); setShowForm(true) }} style={{ background: '#ff6a00', border: 0, borderRadius: 8, padding: '10px 18px', color: 'white', fontWeight: 700, cursor: 'pointer' }}>+ Nuevo</button>
      </div>
      <div style={{ marginTop: 20 }}><ModelosTable modelos={modelos} onEdit={(m) => { setEditing(m); setShowForm(true) }} onDelete={async (id) => { if (confirm('¿Borrar?')) { await deleteModelo(id); cargar() } }} /></div>
      {showForm && <ModeloForm initial={editing} empresas={empresas} productos={productos} onSave={handleSave} onClose={() => { setShowForm(false); setEditing(null) }} />}
    </div>
  )
}
