'use client'
import { useEffect, useState } from 'react'
import { EmpresasTable } from './components/EmpresasTable'
import { EmpresaForm } from './components/EmpresaForm'
import { getEmpresas, createEmpresa, updateEmpresa, deleteEmpresa } from './lib/queries'
import { Empresa } from './types'

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Empresa | null>(null)

  const cargar = async () => {
    const { data } = await getEmpresas()
    if (data) setEmpresas(data as any)
  }

  useEffect(() => { cargar() }, [])

  const handleSave = async (formData: any) => {
    if (editing) {
      await updateEmpresa(editing.id, formData)
    } else {
      await createEmpresa({ ...formData, Estado: 'Activa' })
    }
    setShowForm(false)
    setEditing(null)
    cargar()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro borrar esta empresa?')) return
    await deleteEmpresa(id)
    cargar()
  }

  const handleEdit = (emp: Empresa) => {
    setEditing(emp)
    setShowForm(true)
  }

  return (
    <div style={{ padding: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Empresas</h1>
          <p style={{ opacity: 0.5, fontSize: 12, margin: '4px 0 0 0' }}>{empresas.length} empresas registradas</p>
        </div>
        <button 
          onClick={() => { setEditing(null); setShowForm(true) }} 
          style={{ background: '#ff6a00', border: 0, borderRadius: 8, padding: '10px 18px', color: 'white', fontWeight: 700, cursor: 'pointer' }}
        >
          + Nueva
        </button>
      </div>

      <div style={{ marginTop: 20 }}>
        <EmpresasTable empresas={empresas} onEdit={handleEdit} onDelete={handleDelete} />
      </div>

      {showForm && (
        <EmpresaForm 
          initial={editing} 
          onSave={handleSave} 
          onClose={() => { setShowForm(false); setEditing(null) }} 
        />
      )}
    </div>
  )
}
