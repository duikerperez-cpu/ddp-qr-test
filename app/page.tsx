'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Page() {
  const [empresas, setEmpresas] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({nombre:'', sku:'', categoria:'', empresa_id:''})

  useEffect(()=>{
    async function init(){
      const {data: emp} = await supabase.from('empresas').select('*')
      if(emp){
        const filtradas = emp.filter((e:any)=> (e.razon_social||'').toLowerCase().includes('hercom') || (e.razon_social||'').toLowerCase().includes('trimar'))
        const lista = filtradas.length>0? filtradas : emp
        setEmpresas(lista)
        if(lista[0]) setForm(f=>({...f, empresa_id: lista[0].id}))
      }
      const {data: prod} = await supabase.from('productos').select('*').order('created_at', {ascending:false})
      if(prod) setProductos(prod)
    }
    init()
  },[])

  async function crear(){
    if(!form.nombre) return alert('Falta nombre')
    if(!form.empresa_id) return alert('No hay empresas - ejecuta el SQL primero')
    const {error} = await supabase.from('productos').insert([{
      nombre: form.nombre,
      sku: form.sku,
      categoria: form.categoria,
      empresa_id: form.empresa_id
    }])
    if(error) alert(error.message)
    else {
      setShowNew(false)
      setForm({nombre:'', sku:'', categoria:'', empresa_id: empresas[0]?.id})
      const {data} = await supabase.from('productos').select('*').order('created_at', {ascending:false})
      if(data) setProductos(data)
    }
  }

  return (
    <div style={{display:'flex', minHeight:'100vh', background:'#09090b', color:'white'}}>
      <div style={{width:250, background:'#0f1012', borderRight:'1px solid #1f1f23', padding:15}}>
        <div style={{fontWeight:900, fontSize:18}}>VINCULA<span style={{color:'#ff6a00'}}>B</span></div>
        <div style={{fontSize:10, color:'#22c55e', marginTop:10}}>EMPRESAS CARGADAS: {empresas.length}</div>
        {empresas.map(e=>(
          <div key={e.id} style={{background:'#1c1917', padding:10, borderRadius:6, marginTop:10, borderLeft:'3px solid #ff6a00'}}>
            <div style={{fontWeight:700, fontSize:13}}>{e.razon_social}</div>
            <div style={{fontSize:9, color:'#666'}}>{e.rut} - {e.estado}</div>
          </div>
        ))}
      </div>
      <div style={{flex:1, padding:25}}>
        <div style={{display:'flex', justifyContent:'space-between'}}>
          <h1 style={{margin:0}}>Productos desde cero ({productos.length})</h1>
          <button onClick={()=>setShowNew(true)} style={{background:'#ff6a00', border:'none', padding:'10px 18px', borderRadius:8, color:'white', fontWeight:800, cursor:'pointer'}}>+ Nuevo Producto</button>
        </div>

        {showNew && (
          <div style={{background:'#15161a', border:'1px solid #ff6a00', borderRadius:8, padding:20, marginTop:20, maxWidth:450}}>
            <label style={{fontSize:10, color:'#888'}}>EMPRESA</label>
            <select value={form.empresa_id} onChange={e=>setForm({...form, empresa_id:e.target.value})} style={{width:'100%', padding:12, background:'#000', color:'white', marginBottom:12, border:'1px solid #333', borderRadius:6}}>
              {empresas.map(emp=><option key={emp.id} value={emp.id}>{emp.razon_social}</option>)}
            </select>
            <label style={{fontSize:10, color:'#888'}}>NOMBRE PRODUCTO</label>
            <input value={form.nombre} onChange={e=>setForm({...form, nombre:e.target.value})} placeholder="Ej: Toalla Premium Hotel" style={{width:'100%', padding:10, background:'#000', color:'white', marginBottom:12, border:'1px solid #333', borderRadius:6}}/>
            <label style={{fontSize:10, color:'#888'}}>SKU</label>
            <input value={form.sku} onChange={e=>setForm({...form, sku:e.target.value})} placeholder="Ej: TRIMAR-001" style={{width:'100%', padding:10, background:'#000', color:'white', marginBottom:12, border:'1px solid #333', borderRadius:6}}/>
            <label style={{fontSize:10, color:'#888'}}>CATEGORIA</label>
            <input value={form.categoria} onChange={e=>setForm({...form, categoria:e.target.value})} placeholder="Ej: Textil" style={{width:'100%', padding:10, background:'#000', color:'white', marginBottom:12, border:'1px solid #333', borderRadius:6}}/>
            <button onClick={crear} style={{width:'100%', background:'#ff6a00', border:'none', padding:12, color:'white', fontWeight:800, borderRadius:6, cursor:'pointer'}}>Guardar Producto</button>
          </div>
        )}

        <div style={{background:'#15161a', border:'1px solid #1f1f23', borderRadius:8, marginTop:20}}>
          {productos.length===0? <div style={{padding:40, textAlign:'center', color:'#555'}}>Sin productos. Crea el primero.</div> :
            productos.map((p,i)=><div key={i} style={{padding:'14px 20px', borderTop: i===0?'none':'1px solid #1f1f23', display:'flex', justifyContent:'space-between', fontSize:13}}><div><b>{p.nombre}</b> <span style={{color:'#666', fontSize:11}}>{p.sku} - {p.categoria}</span></div><span style={{fontSize:11, color:'#ff6a00'}}>{empresas.find(e=>e.id===p.empresa_id)?.razon_social || p.empresa_id.slice(0,8)}</span></div>)
          }
        </div>
      </div>
    </div>
  )
}
