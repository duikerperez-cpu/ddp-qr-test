'use client'
import { useEffect, useState } from 'react'
import { getDpps, createDpp, updateDpp, deleteDpp } from './lib/queries'
import { DppForm } from './components/DppForm'

export default function DppPage(){
  const [dpps, setDpps] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const load = async ()=>{ const {data}= await getDpps(); if(data) setDpps(data) }
  useEffect(()=>{ load() }, [])
  const handleSave = async (data:any)=>{
    if(editing) await updateDpp(editing.id, data)
    else await createDpp(data)
    setShowForm(false); setEditing(null); load()
  }
  return (
    <div style={{ padding:24, background:'#09090b', minHeight:'100vh', color:'white' }}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h1>DPP - Pasaporte Digital</h1>
        <button onClick={()=>{ setEditing(null); setShowForm(true) }} style={{background:'#ff6a00', border:0, borderRadius:8, padding:'10px 16px', color:'white', fontWeight:700}}> + Nuevo DPP</button>
      </div>
      <div style={{ marginTop:20, border:'1px solid #27272a', borderRadius:12, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead style={{ background:'#18181b' }}>
            <tr><th style={{padding:10, textAlign:'left'}}>Código</th><th>Lote</th><th>Materiales</th><th>Origen</th><th>QR</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {dpps.map(d=>(
              <tr key={d.id} style={{ borderTop:'1px solid #27272a' }}>
                <td style={{padding:10}}><a href={`/p/${d.codigo}`} target="_blank" style={{color:'#ff6a00'}}>{d.codigo}</a></td>
                <td style={{padding:10}}>{d.lote_id}</td>
                <td style={{padding:10}}>{d.materiales}</td>
                <td style={{padding:10}}>{d.origen}</td>
                <td style={{padding:10}}><img src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=https://vinculab.cl/p/${d.codigo}`} alt="qr" /></td>
                <td style={{padding:10, display:'flex', gap:6}}>
                  <button onClick={()=>{ setEditing(d); setShowForm(true) }} style={{background:'#27272a', border:0, borderRadius:6, padding:'6px 10px', color:'white'}}>Editar</button>
                  <button onClick={async()=>{ if(confirm('Borrar?')){ await deleteDpp(d.id); load() } }} style={{background:'#7f1d1d', border:0, borderRadius:6, padding:'6px 10px', color:'white'}}>Borrar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showForm && <DppForm initial={editing} onSave={handleSave} onClose={()=>{ setShowForm(false); setEditing(null) }} />}
    </div>
  )
}
