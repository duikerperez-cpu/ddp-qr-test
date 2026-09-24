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
  const [filtro, setFiltro] = useState('')
  const [empresaFiltro, setEmpresaFiltro] = useState('todas')
  const [showNew, setShowNew] = useState(false)
  const [editProd, setEditProd] = useState<any>(null)
  const [form, setForm] = useState({nombre:'', sku:'', categoria:'', empresa_id:''})

  async function cargar() {
    const {data: emp} = await supabase.from('empresas').select('*').order('razon_social')
    if(emp) {
      // deja solo hercom y trimar, sin mayusculas duplicadas
      const clean = emp.filter((e:any)=> e.razon_social.toLowerCase().includes('hercom') || e.razon_social.toLowerCase().includes('trimar'))
      setEmpresas(clean.length? clean : emp)
      if(clean[0] &&!form.empresa_id) setForm(f=>({...f, empresa_id: clean[0].id}))
    }
    const {data: prod} = await supabase.from('productos').select('*').order('created_at', {ascending:false})
    if(prod) setProductos(prod)
  }

  useEffect(()=>{ cargar() },[])

  async function guardar() {
    if(!form.nombre ||!form.empresa_id) return alert('Falta nombre o empresa')
    const payload = {
      id: editProd?.id || crypto.randomUUID(),
      nombre: form.nombre,
      sku: form.sku,
      categoria: form.categoria,
      empresa_id: form.empresa_id,
    }
    let error
    if(editProd){
      const res = await supabase.from('productos').update(payload).eq('id', editProd.id)
      error = res.error
    } else {
      const res = await supabase.from('productos').insert([payload])
      error = res.error
    }
    if(error) return alert(error.message)
    setShowNew(false); setEditProd(null)
    setForm({nombre:'', sku:'', categoria:'', empresa_id: empresas[0]?.id || ''})
    cargar()
  }

  async function borrar(id:string){
    if(!confirm('¿Borrar producto?')) return
    await supabase.from('productos').delete().eq('id', id)
    cargar()
  }

  const filtrados = productos.filter(p=>{
    const matchTexto = `${p.nombre} ${p.sku} ${p.categoria}`.toLowerCase().includes(filtro.toLowerCase())
    const matchEmp = empresaFiltro === 'todas' || p.empresa_id === empresaFiltro
    return matchTexto && matchEmp
  })

  return (
    <div style={{display:'flex', minHeight:'100vh', background:'#09090b', color:'white', fontFamily:'Inter, sans-serif'}}>
      {/* SIDEBAR */}
      <div style={{width:270, background:'#0f1012', borderRight:'1px solid #1f1f23', padding:18, position:'sticky', top:0, height:'100vh'}}>
        <div style={{fontWeight:900, fontSize:20, letterSpacing:-0.5}}>VINCULA<span style={{color:'#ff6a00'}}>B</span></div>
        <div style={{fontSize:10, color:'#666', marginTop:4}}>SISTEMA PRODUCTOS</div>

        <div style={{marginTop:25, fontSize:10, color:'#888', fontWeight:700, letterSpacing:1}}>EMPRESAS ({empresas.length})</div>
        <div style={{marginTop:10, display:'flex', flexDirection:'column', gap:8}}>
          <button onClick={()=>setEmpresaFiltro('todas')} style={{textAlign:'left', padding:'10px 12px', borderRadius:8, border: empresaFiltro==='todas'?'1px solid #ff6a00':'1px solid #1f1f23', background: empresaFiltro==='todas'?'#1c1917':'#15161a', color:'white', cursor:'pointer', fontSize:12}}>🌐 Todas</button>
          {empresas.map(e=>(
            <button key={e.id} onClick={()=>setEmpresaFiltro(e.id)} style={{textAlign:'left', padding:'10px 12px', borderRadius:8, border: empresaFiltro===e.id?'1px solid #ff6a00':'1px solid #1f1f23', background: empresaFiltro===e.id?'#1c1917':'#15161a', color:'white', cursor:'pointer'}}>
              <div style={{fontWeight:700, fontSize:12, borderLeft:'3px solid #ff6a00', paddingLeft:8}}>{e.razon_social}</div>
              <div style={{fontSize:9, color:'#666', marginTop:2, paddingLeft:11}}>{e.rut || 'Sin RUT'} • {productos.filter(p=>p.empresa_id===e.id).length} prod.</div>
            </button>
          ))}
        </div>

        <div style={{marginTop:25, background:'#15161a', borderRadius:8, padding:12, border:'1px solid #1f1f23'}}>
          <div style={{fontSize:10, color:'#666'}}>TOTAL</div>
          <div style={{fontSize:22, fontWeight:800}}>{productos.length}</div>
          <div style={{fontSize:10, color:'#ff6a00', marginTop:4}}>{filtrados.length} filtrados</div>
        </div>
      </div>

      {/* MAIN */}
      <div style={{flex:1, padding:'25px 30px'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div>
            <h1 style={{margin:0, fontSize:28, fontWeight:900}}>Productos ({filtrados.length})</h1>
            <div style={{fontSize:12, color:'#666', marginTop:4}}>Tablero desde cero • Hercom + Trimar</div>
          </div>
          <button onClick={()=>{setForm({nombre:'', sku:'', categoria:'', empresa_id: empresas[0]?.id || ''}); setEditProd(null); setShowNew(true)}} style={{background:'#ff6a00', border:'none', padding:'12px 20px', borderRadius:10, color:'white', fontWeight:900, cursor:'pointer'}}>+ Nuevo</button>
        </div>

        <div style={{display:'flex', gap:12, marginTop:20}}>
          <input value={filtro} onChange={e=>setFiltro(e.target.value)} placeholder="Buscar por nombre, SKU, categoría..." style={{flex:1, padding:'12px 14px', background:'#15161a', border:'1px solid #1f1f23', borderRadius:8, color:'white'}}/>
        </div>

        {/* TABLA */}
        <div style={{background:'#15161a', border:'1px solid #1f1f23', borderRadius:12, marginTop:20, overflow:'hidden'}}>
          <div style={{display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 100px', padding:'12px 20px', fontSize:10, color:'#666', fontWeight:700, letterSpacing:1, background:'#0f1012', borderBottom:'1px solid #1f1f23'}}>
            <span>NOMBRE</span><span>SKU</span><span>CATEGORIA</span><span>EMPRESA</span><span>ACCION</span>
          </div>
          {filtrados.length===0? (
            <div style={{padding:40, textAlign:'center', color:'#555'}}>Sin productos. Crea el primero con + Nuevo</div>
          ) : filtrados.map(p=>(
            <div key={p.id} style={{display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 100px', padding:'14px 20px', borderTop:'1px solid #1f1f23', fontSize:13, alignItems:'center'}}>
              <div><b style={{color:'white'}}>{p.nombre}</b></div>
              <div style={{color:'#aaa', fontSize:12}}>{p.sku || '-'}</div>
              <div><span style={{background:'#1f1f23', padding:'4px 8px', borderRadius:4, fontSize:11}}>{p.categoria || 'General'}</span></div>
              <div style={{fontSize:11, color:'#ff6a00'}}>{empresas.find(e=>e.id===p.empresa_id)?.razon_social?.slice(0,15) || p.empresa_id?.slice(0,8)}</div>
              <div style={{display:'flex', gap:6}}>
                <button onClick={()=>{setEditProd(p); setForm({nombre:p.nombre, sku:p.sku||'', categoria:p.categoria||'', empresa_id:p.empresa_id}); setShowNew(true)}} style={{background:'#222', border:'1px solid #333', color:'white', padding:'6px 10px', borderRadius:6, cursor:'pointer', fontSize:11}}>Editar</button>
                <button onClick={()=>borrar(p.id)} style={{background:'#2a1212', border:'1px solid #4a2222', color:'#ff5555', padding:'6px 8px', borderRadius:6, cursor:'pointer', fontSize:11}}>X</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {showNew && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50}}>
          <div style={{background:'#15161a', border:'1px solid #ff6a00', borderRadius:12, padding:22, width:420}}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:15}}><b>{editProd? 'Editar Producto' : 'Nuevo Producto'}</b><button onClick={()=>setShowNew(false)} style={{background:'#222', border:'none', color:'white', borderRadius:6, padding:'4px 8px', cursor:'pointer'}}>X</button></div>
            <label style={{fontSize:10, color:'#888'}}>EMPRESA</label>
            <select value={form.empresa_id} onChange={e=>setForm({...form, empresa_id:e.target.value})} style={{width:'100%', padding:12, background:'#000', color:'white', marginBottom:12, border:'1px solid #333', borderRadius:8}}>
              {empresas.map(emp=><option key={emp.id} value={emp.id}>{emp.razon_social}</option>)}
            </select>
            <label style={{fontSize:10, color:'#888'}}>NOMBRE</label>
            <input value={form.nombre} onChange={e=>setForm({...form, nombre:e.target.value})} placeholder="Ej: Escalera de Seguridad" style={{width:'100%', padding:12, background:'#000', color:'white', marginBottom:12, border:'1px solid #333', borderRadius:8}}/>
            <label style={{fontSize:10, color:'#888'}}>SKU</label>
            <input value={form.sku} onChange={e=>setForm({...form, sku:e.target.value})} placeholder="Ej: GHERC-0001" style={{width:'100%', padding:12, background:'#000', color:'white', marginBottom:12, border:'1px solid #333', borderRadius:8}}/>
            <label style={{fontSize:10, color:'#888'}}>CATEGORIA</label>
            <input value={form.categoria} onChange={e=>setForm({...form, categoria:e.target.value})} placeholder="Ej: Estructuras Metalicas" style={{width:'100%', padding:12, background:'#000', color:'white', marginBottom:16, border:'1px solid #333', borderRadius:8}}/>
            <button onClick={guardar} style={{width:'100%', background:'#ff6a00', border:'none', padding:14, color:'white', fontWeight:900, borderRadius:8, cursor:'pointer'}}>{editProd? 'Actualizar' : 'Guardar Producto'}</button>
          </div>
        </div>
      )}
    </div>
  )
}
