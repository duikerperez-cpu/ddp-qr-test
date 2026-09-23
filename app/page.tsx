'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Page() {
  const [tab, setTab] = useState('empresas')
  const [empresas] = useState([
    {id:'hercom', nombre:'Hercom Chile'},
    {id:'trimar', nombre:'Trimar Hotel'}
  ])
  const [productos, setProductos] = useState<any[]>([])
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({nombre:'', sku:'', empresa_id:'hercom'})

  useEffect(()=>{ loadProductos() },[])

  async function loadProductos(){
    const {data} = await supabase.from('productos').select('*').order('created_at', {ascending:false})
    if(data) setProductos(data)
  }

  async function crearProducto(){
    if(!form.nombre ||!form.sku) return alert('Nombre y SKU obligatorios')
    const empresa = empresas.find(e=>e.id===form.empresa_id)
    const {error} = await supabase.from('productos').insert([{
      nombre: form.nombre,
      sku: form.sku,
      empresa_id: form.empresa_id,
      empresa_nombre: empresa?.nombre
    }])
    if(error){ alert(error.message) } else {
      setShowNew(false)
      setForm({nombre:'', sku:'', empresa_id:'hercom'})
      loadProductos()
    }
  }

  return (
    <div style={{display:'flex', minHeight:'100vh', background:'#09090b', color:'white', fontFamily:'Inter, Arial'}}>
      {/* SIDEBAR - solo 2 empresas */}
      <div style={{width:240, background:'#0f1012', borderRight:'1px solid #1f1f23'}}>
        <div style={{padding:18, borderBottom:'1px solid #1f1f23'}}>
          <div style={{fontWeight:900}}>VINCULA<span style={{color:'#ff6a00'}}>B</span></div>
          <div style={{fontSize:9, color:'#666'}}>SOLO 2 EMPRESAS</div>
        </div>
        <button onClick={()=>setTab('empresas')} style={{width:'100%', textAlign:'left', padding:12, background: tab==='empresas'? '#1c1917' : 'transparent', border:'none', borderLeft: tab==='empresas'? '3px solid #ff6a00' : '3px solid transparent', color:'white', cursor:'pointer'}}>◫ Empresas (2)</button>
        <button onClick={()=>setTab('productos')} style={{width:'100%', textAlign:'left', padding:12, background: tab==='productos'? '#1c1917' : 'transparent', border:'none', borderLeft: tab==='productos'? '3px solid #ff6a00' : '3px solid transparent', color:'white', cursor:'pointer'}}>⬙ Productos ({productos.length})</button>
        <button onClick={()=>setTab('modelos')} style={{width:'100%', textAlign:'left', padding:12, background: tab==='modelos'? '#1c1917' : 'transparent', border:'none', borderLeft: tab==='modelos'? '3px solid #ff6a00' : '3px solid transparent', color:'white', cursor:'pointer'}}>◇ Modelos</button>
        <button onClick={()=>setTab('lotes')} style={{width:'100%', textAlign:'left', padding:12, background: tab==='lotes'? '#1c1917' : 'transparent', border:'none', borderLeft: tab==='lotes'? '3px solid #ff6a00' : '3px solid transparent', color:'white', cursor:'pointer'}}>☰ Lotes</button>
      </div>

      <div style={{flex:1, padding:25}}>
        {tab==='empresas' && (
          <>
            <h1>Empresas - 2 activas</h1>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:15, marginTop:20}}>
              {empresas.map(e=>(
                <div key={e.id} style={{background:'#15161a', border:'1px solid #1f1f23', borderRadius:8, padding:20, borderLeft:'4px solid #ff6a00'}}>
                  <div style={{fontWeight:800, fontSize:18}}>{e.nombre}</div>
                  <div style={{fontSize:11, color:'#22c55e', marginTop:10}}>● Activa - lista para crear productos</div>
                </div>
              ))}
            </div>
            <div style={{marginTop:25, background:'#111', padding:15, borderRadius:8, fontSize:12, color:'#666'}}>Ahora vas a Productos y creas desde cero para estas 2 empresas.</div>
          </>
        )}

        {tab==='productos' && (
          <>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <h1 style={{margin:0}}>Productos ({productos.length}) - Desde cero</h1>
              <button onClick={()=>setShowNew(true)} style={{background:'#ff6a00', color:'white', border:'none', padding:'10px 18px', borderRadius:8, fontWeight:800, cursor:'pointer'}}>+ Nuevo Producto</button>
            </div>

            {showNew && (
              <div style={{background:'#15161a', border:'1px solid #ff6a00', borderRadius:8, padding:20, marginTop:20}}>
                <h3 style={{marginTop:0}}>Crear Producto Nuevo</h3>
                <div style={{display:'grid', gap:12, maxWidth:400}}>
                  <label style={{fontSize:11, color:'#888'}}>EMPRESA (solo 2 opciones)</label>
                  <select value={form.empresa_id} onChange={e=>setForm({...form, empresa_id:e.target.value})} style={{padding:10, background:'#09090b', color:'white', border:'1px solid #333', borderRadius:6}}>
                    <option value="hercom">Hercom Chile</option>
                    <option value="trimar">Trimar Hotel</option>
                  </select>
                  <label style={{fontSize:11, color:'#888'}}>NOMBRE PRODUCTO</label>
                  <input value={form.nombre} onChange={e=>setForm({...form, nombre:e.target.value})} placeholder="Ej: Toalla Premium" style={{padding:10, background:'#09090b', color:'white', border:'1px solid #333', borderRadius:6}}/>
                  <label style={{fontSize:11, color:'#888'}}>SKU / CÓDIGO</label>
                  <input value={form.sku} onChange={e=>setForm({...form, sku:e.target.value})} placeholder="Ej: HER-001" style={{padding:10, background:'#09090b', color:'white', border:'1px solid #333', borderRadius:6}}/>
                  <div style={{display:'flex', gap:10, marginTop:10}}>
                    <button onClick={crearProducto} style={{background:'#ff6a00', border:'none', padding:'10px 20px', borderRadius:6, color:'white', fontWeight:700, cursor:'pointer'}}>Guardar</button>
                    <button onClick={()=>setShowNew(false)} style={{background:'#222', border:'none', padding:'10px 20px', borderRadius:6, color:'white', cursor:'pointer'}}>Cancelar</button>
                  </div>
                </div>
              </div>
            )}

            <div style={{background:'#15161a', border:'1px solid #1f1f23', borderRadius:8, marginTop:20}}>
              {productos.length===0? (
                <div style={{padding:40, textAlign:'center', color:'#666'}}>
                  <div style={{fontSize:30}}>⬙</div>
                  <div style={{marginTop:10}}>Cero productos. Estás partiendo de cero.</div>
                  <div style={{fontSize:11, marginTop:5}}>Haz click en + Nuevo Producto para crear el primero para Hercom Chile o Trimar Hotel</div>
                </div>
              ) : (
                productos.map((p,i)=><div key={i} style={{padding:'14px 20px', borderTop: i===0? 'none' : '1px solid #1f1f23', display:'flex', justifyContent:'space-between'}}><div><b>{p.nombre}</b><div style={{fontSize:11, color:'#666'}}>{p.empresa_nombre} - {p.sku}</div></div><div style={{fontSize:11, color:'#22c55e'}}>● Creado</div></div>)
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
