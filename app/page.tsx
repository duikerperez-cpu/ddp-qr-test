'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Page() {
  const [tab, setTab] = useState('productos')
  const [empresas, setEmpresas] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({nombre:'', sku:'', categoria:'', empresa_id:''})

  useEffect(()=>{
    async function init(){
      // Carga las 2 empresas reales con su ID real de la BD
      const {data: emp} = await supabase.from('empresas').select('*').in('nombre', ['Hercom Chile','Trimar Hotel'])
      if(emp && emp.length>0){
        setEmpresas(emp)
        setForm(f=>({...f, empresa_id: emp[0].id}))
      }
      const {data: prod} = await supabase.from('productos').select('*').order('created_at', {ascending:false})
      if(prod) setProductos(prod)
    }
    init()
  },[])

  async function crear(){
    if(!form.nombre ||!form.empresa_id) return alert('Falta nombre o empresa')
    const {error} = await supabase.from('productos').insert([{
      nombre: form.nombre,
      sku: form.sku,
      categoria: form.categoria,
      empresa_id: form.empresa_id
    }])
    if(error){
      alert('Error: '+error.message)
    } else {
      setShowNew(false)
      setForm({nombre:'', sku:'', categoria:'', empresa_id: empresas[0]?.id || ''})
      const {data} = await supabase.from('productos').select('*').order('created_at', {ascending:false})
      if(data) setProductos(data)
    }
  }

  return (
    <div style={{display:'flex', minHeight:'100vh', background:'#09090b', color:'white'}}>
      <div style={{width:240, background:'#0f1012', borderRight:'1px solid #1f1f23', padding:15}}>
        <div style={{fontWeight:900, fontSize:18}}>VINCULA<span style={{color:'#ff6a00'}}>B</span></div>
        <div style={{fontSize:10, color:'#666', margin:'10px 0 20px'}}>2 EMPRESAS ACTIVAS</div>
        {empresas.map(e=><div key={e.id} style={{fontSize:12, padding:'6px 0', color:'#aaa'}}>◫ {e.nombre}</div>)}
        <div style={{marginTop:20, padding:10, background:'#15161a', borderRadius:6, fontSize:11}}>Productos: {productos.length}<br/>Desde cero</div>
      </div>

      <div style={{flex:1, padding:25}}>
        <div style={{display:'flex', justifyContent:'space-between'}}>
          <h1 style={{margin:0}}>Productos ({productos.length})</h1>
          <button onClick={()=>setShowNew(true)} style={{background:'#ff6a00', border:'none', padding:'10px 18px', borderRadius:8, color:'white', fontWeight:800, cursor:'pointer'}}>+ Nuevo Producto</button>
        </div>

        {showNew && (
          <div style={{background:'#15161a', border:'1px solid #ff6a00', borderRadius:8, padding:20, marginTop:20, maxWidth:450}}>
            <h3 style={{marginTop:0}}>Crear desde cero</h3>
            <label style={{fontSize:10, color:'#666'}}>EMPRESA (solo 2)</label>
            <select value={form.empresa_id} onChange={e=>setForm({...form, empresa_id:e.target.value})} style={{width:'100%', padding:10, background:'#000', color:'white', marginBottom:12, border:'1px solid #333', borderRadius:6}}>
              {empresas.map(emp=><option key={emp.id} value={emp.id}>{emp.nombre}</option>)}
            </select>
            <label style={{fontSize:10, color:'#666'}}>NOMBRE</label>
            <input value={form.nombre} onChange={e=>setForm({...form, nombre:e.target.value})} placeholder="Ej: Toalla Premium" style={{width:'100%', padding:10, background:'#000', color:'white', marginBottom:12, border:'1px solid #333', borderRadius:6}}/>
            <label style={{fontSize:10, color:'#666'}}>SKU</label>
            <input value={form.sku} onChange={e=>setForm({...form, sku:e.target.value})} placeholder="Ej: HER-001" style={{width:'100%', padding:10, background:'#000', color:'white', marginBottom:12, border:'1px solid #333', borderRadius:6}}/>
            <label style={{fontSize:10, color:'#666'}}>CATEGORIA</label>
            <input value={form.categoria} onChange={e=>setForm({...form, categoria:e.target.value})} placeholder="Ej: Textil Hotelero" style={{width:'100%', padding:10, background:'#000', color:'white', marginBottom:12, border:'1px solid #333', borderRadius:6}}/>
            <button onClick={crear} style={{width:'100%', background:'#ff6a00', border:'none', padding:12, color:'white', fontWeight:800, borderRadius:6, cursor:'pointer'}}>Guardar en Supabase</button>
          </div>
        )}

        <div style={{background:'#15161a', border:'1px solid #1f1f23', borderRadius:8, marginTop:20, overflow:'hidden'}}>
          {productos.length===0? <div style={{padding:40, textAlign:'center', color:'#555'}}>0 productos. Crea el primero para Hercom o Trimar.</div> :
            productos.map((p,i)=><div key={i} style={{display:'grid', gridTemplateColumns:'2fr 1fr 1fr', padding:'14px 20px', borderTop: i===0?'none':'1px solid #1f1f23', fontSize:13}}><div><b>{p.nombre}</b><div style={{fontSize:10, color:'#666'}}>{p.categoria}</div></div><div style={{color:'#888'}}>{p.sku}</div><div style={{fontSize:10, color:'#22c55e'}}>{empresas.find(e=>e.id===p.empresa_id)?.nombre || p.empresa_id}</div></div>)
          }
        </div>
      </div>
    </div>
  )
}
