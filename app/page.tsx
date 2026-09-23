'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function Page(){
  const [empresas, setEmpresas] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({nombre:'', sku:'', categoria:'', empresa_id:''})

  useEffect(()=>{
    (async()=>{
      const {data: emp} = await supabase.from('empresas').select('*')
      if(emp){
        const f = emp.filter((e:any)=> (e.razon_social||'').toLowerCase().includes('hercom') || (e.razon_social||'').toLowerCase().includes('trimar'))
        setEmpresas(f.length? f: emp)
        if(f[0]) setForm(s=>({...s, empresa_id: f[0].id}))
      }
      const {data: prod} = await supabase.from('productos').select('*').order('created_at',{ascending:false})
      if(prod) setProductos(prod)
    })()
  },[])

  async function crear(){
    if(!form.nombre ||!form.empresa_id) return alert('Falta datos')
    const {error} = await supabase.from('productos').insert([{
      id: crypto.randomUUID(),
      nombre: form.nombre,
      sku: form.sku,
      categoria: form.categoria,
      empresa_id: form.empresa_id
    }])
    if(error) return alert(error.message)
    setShowNew(false)
    const {data} = await supabase.from('productos').select('*').order('created_at',{ascending:false})
    if(data) setProductos(data)
  }

  return(
    <div style={{display:'flex', minHeight:'100vh', background:'#09090b', color:'white'}}>
      <div style={{width:240, background:'#0f1012', padding:15, borderRight:'1px solid #1f1f23'}}>
        <b>VINCULA<span style={{color:'#ff6a00'}}>B</span></b>
        <div style={{marginTop:15, fontSize:11, color:'#666'}}>{empresas.length} empresas</div>
        {empresas.map(e=><div key={e.id} style={{marginTop:8, background:'#1c1917', padding:8, borderRadius:6, borderLeft:'3px solid #ff6a00', fontSize:12}}>{e.razon_social}</div>)}
      </div>
      <div style={{flex:1, padding:25}}>
        <div style={{display:'flex', justifyContent:'space-between'}}><h1 style={{margin:0}}>Productos ({productos.length})</h1><button onClick={()=>setShowNew(true)} style={{background:'#ff6a00', border:'none', padding:'10px 16px', borderRadius:6, color:'white', fontWeight:800, cursor:'pointer'}}>+ Nuevo</button></div>
        {showNew && <div style={{background:'#15161a', padding:20, borderRadius:8, marginTop:15, maxWidth:400, border:'1px solid #ff6a00'}}>
          <select value={form.empresa_id} onChange={e=>setForm({...form, empresa_id:e.target.value})} style={{width:'100%', padding:10, background:'#000', color:'white', marginBottom:10, border:'1px solid #333'}}>
            {empresas.map(o=><option key={o.id} value={o.id}>{o.razon_social}</option>)}
          </select>
          <input value={form.nombre} onChange={e=>setForm({...form, nombre:e.target.value})} placeholder="Nombre" style={{width:'100%', padding:10, background:'#000', color:'white', marginBottom:10, border:'1px solid #333'}}/>
          <input value={form.sku} onChange={e=>setForm({...form, sku:e.target.value})} placeholder="SKU" style={{width:'100%', padding:10, background:'#000', color:'white', marginBottom:10, border:'1px solid #333'}}/>
          <input value={form.categoria} onChange={e=>setForm({...form, categoria:e.target.value})} placeholder="Categoria" style={{width:'100%', padding:10, background:'#000', color:'white', marginBottom:10, border:'1px solid #333'}}/>
          <button onClick={crear} style={{width:'100%', background:'#ff6a00', border:'none', padding:12, color:'white', fontWeight:800, borderRadius:6}}>Guardar</button>
        </div>}
        <div style={{marginTop:20, background:'#15161a', borderRadius:8, border:'1px solid #1f1f23'}}>
          {productos.map((p,i)=><div key={i} style={{padding:12, borderTop: i===0?'none':'1px solid #222', fontSize:13}}><b>{p.nombre}</b> - {p.sku} <span style={{color:'#666'}}>{p.categoria}</span></div>)}
        </div>
      </div>
    </div>
  )
}
