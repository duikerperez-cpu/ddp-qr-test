'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function Page(){
  const [view, setView] = useState('dashboard')
  const [empresas, setEmpresas] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [modelos, setModelos] = useState<any[]>([])
  const [lotes, setLotes] = useState<any[]>([])
  const [showNew, setShowNew] = useState(false)
  const [filtro, setFiltro] = useState('')
  const [form, setForm] = useState({nombre:'', sku:'', categoria:'', empresa_id:''})

  async function cargar(){
    const {data: emp} = await supabase.from('empresas').select('*').order('razon_social')
    if(emp) setEmpresas(emp)
    const {data: prod} = await supabase.from('productos').select('*').order('created_at',{ascending:false})
    if(prod) setProductos(prod)
    const {data: mod} = await supabase.from('modelos').select('*').limit(100)
    if(mod) setModelos(mod)
    const {data: lot} = await supabase.from('lotes').select('*').limit(100)
    if(lot) setLotes(lot)
    if(emp && emp[0]) setForm(f=>({...f, empresa_id: f.empresa_id || emp[0].id}))
  }
  useEffect(()=>{cargar()},[])

  async function guardar(){
    if(!form.nombre) return alert('Falta nombre')
    const payload = { id: crypto.randomUUID(), nombre: form.nombre, sku: form.sku, categoria: form.categoria, empresa_id: form.empresa_id }
    const {error} = await supabase.from('productos').insert([payload])
    if(error) return alert(error.message)
    setShowNew(false); setForm({nombre:'', sku:'', categoria:'', empresa_id: empresas[0]?.id}); cargar()
  }

  const menu = [
    {id:'dashboard', label:'Dashboard', icon:'⌂'},
    {id:'empresas', label:'Empresas', icon:'◧'},
    {id:'productos', label:'Productos', icon:'⬔'},
    {id:'modelos', label:'Modelos', icon:'⬙'},
    {id:'lotes', label:'Lotes', icon:'☰'},
    {id:'individuales', label:'Productos Individuales', icon:'◎'},
  ]
  const menu2 = [
    {id:'dpp', label:'DPP', icon:'◫'},
    {id:'qr', label:'NFC / QR', icon:'↗'},
    {id:'cert', label:'Certificados', icon:'✓'},
    {id:'traza', label:'Trazabilidad', icon:'●'},
  ]

  const filtrados = productos.filter(p=> `${p.nombre} ${p.sku}`.toLowerCase().includes(filtro.toLowerCase()))

  return(
    <div style={{display:'flex', minHeight:'100vh', background:'#0a0a0b', color:'white', fontFamily:'Inter, sans-serif'}}>
      {/* SIDEBAR EXACTO AL ORIGINAL */}
      <div style={{width:250, background:'#0f1012', borderRight:'1px solid #1e1e21', padding:'0', display:'flex', flexDirection:'column'}}>
        <div style={{padding:'22px 20px', borderBottom:'1px solid #1e1e21'}}>
          <div style={{fontWeight:900, fontSize:22, letterSpacing:-0.5}}>VINCULA<span style={{color:'#ff6a00'}}>B</span></div>
          <div style={{fontSize:9, letterSpacing:1.5, color:'#666', marginTop:2}}>DIGITAL PRODUCT IDENTITY</div>
        </div>

        <div style={{padding:'18px 12px', flex:1}}>
          <div style={{fontSize:9, letterSpacing:1.5, color:'#555', marginBottom:10, paddingLeft:8}}>PRINCIPAL</div>
          {menu.map(m=>(
            <button key={m.id} onClick={()=>setView(m.id)} style={{width:'100%', textAlign:'left', display:'flex', gap:10, alignItems:'center', padding:'10px 12px', borderRadius:8, border:'none', background: view===m.id?'#1e1410':'transparent', color: view===m.id?'white':'#888', cursor:'pointer', fontSize:13, marginBottom:4, borderLeft: view===m.id?'3px solid #ff6a00':'3px solid transparent'}}>
              <span style={{color:'#ff6a00'}}>{m.icon}</span> {m.label}
            </button>
          ))}
          <div style={{fontSize:9, letterSpacing:1.5, color:'#555', margin:'18px 0 10px 8'}}>GESTIÓN</div>
          {/* ya incluidos arriba */}
          <div style={{fontSize:9, letterSpacing:1.5, color:'#555', margin:'18px 0 10px 8'}}>IDENTIDAD DIGITAL</div>
          {menu2.map(m=>(
            <button key={m.id} onClick={()=>setView(m.id)} style={{width:'100%', textAlign:'left', display:'flex', gap:10, alignItems:'center', padding:'10px 12px', borderRadius:8, border:'none', background: view===m.id?'#1e1410':'transparent', color: view===m.id?'white':'#888', cursor:'pointer', fontSize:13, marginBottom:4, borderLeft: view===m.id?'3px solid #ff6a00':'3px solid transparent'}}>
              <span style={{color:'#ff6a00'}}>{m.icon}</span> {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN */}
      <div style={{flex:1, background:'#09090b'}}>
        <div style={{height:60, borderBottom:'1px solid #1e1e21', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0 28px'}}>
          <div>
            <div style={{fontSize:11, letterSpacing:2, color:'#666'}}>PLATAFORMA DE IDENTIDAD DIGITAL DE PRODUCTOS</div>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:12}}>
            <div style={{textAlign:'right'}}><div style={{fontSize:9, color:'#666'}}>USUARIO</div><div style={{fontSize:12, fontWeight:700}}>Administrador</div></div>
            <div style={{width:32, height:32, background:'#ff6a00', borderRadius:50, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:12}}>A</div>
          </div>
        </div>

        <div style={{padding:'28px'}}>
          {view==='dashboard' && (
            <>
              <h1 style={{margin:0, fontSize:24, fontWeight:800}}>Dashboard</h1>
              <div style={{fontSize:12, color:'#666', marginTop:4}}>Vista general de la plataforma Vinculab.</div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:16, marginTop:22}}>
                {[
                  {label:'EMPRESAS', val: empresas.length},
                  {label:'PRODUCTOS', val: productos.length},
                  {label:'MODELOS', val: modelos.length},
                  {label:'LOTES', val: lotes.length},
                ].map(c=>(
                  <div key={c.label} style={{background:'#15161a', border:'1px solid #1f1f23', borderLeft:'3px solid #ff6a00', borderRadius:10, padding:'18px 20px'}}>
                    <div style={{fontSize:10, letterSpacing:1.5, color:'#666'}}>{c.label}</div>
                    <div style={{fontSize:28, fontWeight:900, marginTop:10}}>{c.val}</div>
                  </div>
                ))}
              </div>
              <div style={{marginTop:30, background:'#15161a', border:'1px solid #1f1f23', borderRadius:12, padding:20}}>
                <div style={{fontWeight:700, marginBottom:15}}>Productos recientes</div>
                {productos.slice(0,5).map(p=><div key={p.id} style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderTop:'1px solid #1f1f23', fontSize:13}}><span>{p.nombre}</span><span style={{color:'#666'}}>{empresas.find(e=>e.id===p.empresa_id)?.razon_social}</span></div>)}
              </div>
            </>
          )}

          {view==='productos' && (
            <>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <h1 style={{margin:0}}>Productos ({filtrados.length})</h1>
                <button onClick={()=>setShowNew(true)} style={{background:'#ff6a00', border:'none', padding:'10px 18px', borderRadius:8, color:'white', fontWeight:800, cursor:'pointer'}}>+ Nuevo</button>
              </div>
              <input value={filtro} onChange={e=>setFiltro(e.target.value)} placeholder="Buscar por nombre, SKU, categoría..." style={{width:'100%', marginTop:18, padding:'12px 14px', background:'#15161a', border:'1px solid #1f1f23', borderRadius:8, color:'white'}}/>
              <div style={{background:'#15161a', border:'1px solid #1f1f23', borderRadius:12, marginTop:16, overflow:'hidden'}}>
                <div style={{display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 100px', padding:'12px 20px', fontSize:10, color:'#666', background:'#0f1012'}}><span>NOMBRE</span><span>SKU</span><span>CATEGORIA</span><span>EMPRESA</span><span>ACCION</span></div>
                {filtrados.map(p=><div key={p.id} style={{display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 100px', padding:'14px 20px', borderTop:'1px solid #1f1f23', fontSize:13}}><b>{p.nombre}</b><span style={{color:'#aaa'}}>{p.sku}</span><span>{p.categoria}</span><span style={{color:'#ff6a00', fontSize:11}}>{empresas.find(e=>e.id===p.empresa_id)?.razon_social}</span><span><button onClick={async()=>{if(confirm('Borrar?')){await supabase.from('productos').delete().eq('id',p.id); cargar()}}} style={{background:'#2a1212', border:'1px solid #333', color:'#ff5555', padding:'5px 8px', borderRadius:6, cursor:'pointer', fontSize:11}}>Borrar</button></span></div>)}
              </div>
            </>
          )}

          {view==='empresas' && (
            <>
              <h1>Empresas ({empresas.length})</h1>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:20}}>
                {empresas.map(e=><div key={e.id} style={{background:'#15161a', border:'1px solid #1f1f23', borderLeft:'3px solid #ff6a00', borderRadius:10, padding:18}}><div style={{fontWeight:800}}>{e.razon_social}</div><div style={{fontSize:11, color:'#666', marginTop:4}}>{e.rut} - {e.pais} • {productos.filter(p=>p.empresa_id===e.id).length} productos</div></div>)}
              </div>
            </>
          )}

          {(view==='modelos' || view==='lotes' || view==='individuales' || view==='dpp' || view==='qr' || view==='cert' || view==='traza') && (
            <div style={{textAlign:'center', padding:80, color:'#555'}}>
              <div style={{fontSize:40}}>🚧</div>
              <div style={{marginTop:10, fontWeight:700}}>{view.toUpperCase()} - Próximamente</div>
              <div style={{fontSize:12, marginTop:6}}>Este módulo ya está preparado en tu BD, lo conectamos cuando quieras.</div>
            </div>
          )}
        </div>
      </div>

      {showNew && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50}}>
          <div style={{background:'#15161a', border:'1px solid #ff6a00', borderRadius:12, padding:22, width:420}}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:15}}><b>Nuevo Producto</b><button onClick={()=>setShowNew(false)} style={{background:'#222', border:'none', color:'white', borderRadius:6, padding:'4px 8px', cursor:'pointer'}}>X</button></div>
            <select value={form.empresa_id} onChange={e=>setForm({...form, empresa_id:e.target.value})} style={{width:'100%', padding:12, background:'#000', color:'white', marginBottom:12, border:'1px solid #333', borderRadius:8}}>{empresas.map(o=><option key={o.id} value={o.id}>{o.razon_social}</option>)}</select>
            <input value={form.nombre} onChange={e=>setForm({...form, nombre:e.target.value})} placeholder="Nombre" style={{width:'100%', padding:12, background:'#000', color:'white', marginBottom:12, border:'1px solid #333', borderRadius:8}}/>
            <input value={form.sku} onChange={e=>setForm({...form, sku:e.target.value})} placeholder="SKU" style={{width:'100%', padding:12, background:'#000', color:'white', marginBottom:12, border:'1px solid #333', borderRadius:8}}/>
            <input value={form.categoria} onChange={e=>setForm({...form, categoria:e.target.value})} placeholder="Categoria" style={{width:'100%', padding:12, background:'#000', color:'white', marginBottom:16, border:'1px solid #333', borderRadius:8}}/>
            <button onClick={guardar} style={{width:'100%', background:'#ff6a00', border:'none', padding:14, color:'white', fontWeight:900, borderRadius:8, cursor:'pointer'}}>Guardar</button>
          </div>
        </div>
      )}
    </div>
  )
}
