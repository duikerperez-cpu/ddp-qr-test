'use client'
import { useEffect, useState } from 'react'
import { getLotes, createLote, updateLote, deleteLote } from './lib/queries'
import { LoteForm } from './components/LoteForm'

export default function LotesPage(){
  const [lotes, setLotes] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)

  const load = async ()=>{ const {data} = await getLotes(); if(data) setLotes(data) }
  useEffect(()=>{ load() }, [])

  const handleSave = async (data:any)=>{
    if(editing) await updateLote(editing.id, data)
    else await createLote(data)
    setShowForm(false); setEditing(null); load()
  }

  return (
    <div style={{ padding:24, background:'#09090b', minHeight:'100vh', color:'white' }}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h1>Lotes / QR - Trazabilidad</h1>
        <button onClick={()=>{ setEditing(null); setShowForm(true) }} style={{background:'#ff6a00', border:0, borderRadius:8, padding:'10px 16px', color:'white', fontWeight:700}}> + Nuevo Lote</button>
      </div>

      <div style={{ marginTop:20, border:'1px solid #27272a', borderRadius:12, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead style={{ background:'#18181b' }}>
            <tr><th style={{padding:10, textAlign:'left'}}>Código</th><th>Cantidad</th><th>Estado</th><th>QR</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {lotes.map(l=>(
              <tr key={l.id} style={{ borderTop:'1px solid #27272a' }}>
                <td style={{padding:10}}><a href={`/p/${l.codigo}`} target="_blank" style={{color:'#ff6a00'}}>{l.codigo}</a></td>
                <td style={{padding:10}}>{l.cantidad}</td>
                <td style={{padding:10}}>{l.estado}</td>
                <td style={{padding:10}}>
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=https://vinculab.cl/p/${l.codigo}`} alt="qr" />
                </td>
                <td style={{padding:10, display:'flex', gap:8}}>
                  <a href={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=https://vinculab.cl/p/${l.codigo}`} target="_blank" style={{background:'#27272a', padding:'6px 10px', borderRadius:6, color:'white', textDecoration:'none'}}>Descargar QR</a>
                  <button onClick={()=>{ setEditing(l); setShowForm(true) }} style={{background:'#27272a', border:0, borderRadius:6, padding:'6px 10px', color:'white'}}>Editar</button>
                  <button onClick={async()=>{ if(confirm('Borrar?')){ await deleteLote(l.id); load() } }} style={{background:'#7f1d1d', border:0, borderRadius:6, padding:'6px 10px', color:'white'}}>Borrar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showForm && <LoteForm initial={editing} onSave={handleSave} onClose={()=>{ setShowForm(false); setEditing(null) }} />}
    </div>
  )
}
