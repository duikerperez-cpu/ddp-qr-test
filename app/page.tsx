'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Page(){
  const [view, setView] = useState('dashboard')
  const [empresas, setEmpresas] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [modelos, setModelos] = useState<any[]>([])
  const [lotes, setLotes] = useState<any[]>([])
  const [individuales, setIndividuales] = useState<any[]>([])

  const [showProd, setShowProd] = useState(false)
  const [showMod, setShowMod] = useState(false)
  const [showLote, setShowLote] = useState(false)
  const [filtro, setFiltro] = useState('')

  const [formProd, setFormProd] = useState({nombre:'', sku:'', categoria:'', empresa_id:''})
  const [formMod, setFormMod] = useState({nombre:'', descripcion:'', empresa_id:'', producto_id:''})
  const [formLote, setFormLote] = useState({codigo:'', cantidad:'', modelo_id:'', empresa_id:''})

  async function cargar(){
    const {data: emp} = await supabase.from('empresas').select('*')
    const {data: prod} = await supabase.from('productos').select('*').order('created_at',{ascending:false})
    const {data: mod} = await supabase.from('modelos').select('*').order('created_at',{ascending:false})
    const {data: lot} = await supabase.from('lotes').select('*').order('created_at',{ascending:false})
    const {data: ind} = await supabase.from('productos_individuales').select('*').order('created_at',{ascending:false}).limit(100)

    if(emp) setEmpresas(emp)
    if(prod) setProductos(prod)
    if(mod) setModelos(mod)
    if(lot) setLotes(lot)
    if(ind) setIndividuales(ind)

    if(emp && emp.length > 0){
      setFormProd(f=>({...f, empresa_id: f.empresa_id || emp[0].id}))
      setFormMod(f=>({...f, empresa_id: f.empresa_id || emp[0].id, producto_id: f.producto_id || prod?.[0]?.id || ''}))
      setFormLote(f=>({...f, empresa_id: f.empresa_id || emp[0].id, modelo_id: f.modelo_id || mod?.[0]?.id || ''}))
    }
  }

  useEffect(()=>{cargar()},[])

  async function guardarProducto(){
    if(!formProd.nombre) return alert('Falta nombre')
    const {error} = await supabase.from('productos').insert([{
      nombre: formProd.nombre,
      sku: formProd.sku,
      categoria: formProd.categoria,
      empresa_id: formProd.empresa_id
    }])
    if(error) return alert('Error producto: '+error.message)
    setShowProd(false)
    setFormProd({...formProd, nombre:'', sku:'', categoria:''})
    cargar()
  }

  async function guardarModelo(){
    if(!formMod.nombre) return alert('Falta nombre del modelo')
    if(!formMod.empresa_id) return alert('Falta empresa')
    console.log('Guardando modelo', formMod)
    const {data, error} = await supabase.from('modelos').insert([{
      nombre: formMod.nombre,
      descripcion: formMod.descripcion,
      empresa_id: formMod.empresa_id,
      producto_id: formMod.producto_id
    }]).select()
    if(error){
      alert('Error modelo: '+error.message)
      console.error(error)
      return
    }
    console.log('Modelo guardado', data)
    setShowMod(false)
    setFormMod({...formMod, nombre:'', descripcion:''})
    cargar()
  }

  async function guardarLote(){
    if(!formLote.codigo) return alert('Falta código de lote')
    const {error} = await supabase.from('lotes').insert([{
      codigo: formLote.codigo,
      cantidad: parseInt(formLote.cantidad) || 0,
      modelo_id: formLote.modelo_id,
      empresa_id: formLote.empresa_id
    }])
    if(error) return alert('Error lote: '+error.message)
    setShowLote(false)
    setFormLote({...formLote, codigo:'', cantidad:''})
    cargar()
  }

  const Card = ({label, val, sub}:{label:string, val:number, sub?:string}) => (
    <div style={{background:'#15161a', border:'1px solid #1f1f23', borderLeft:'3px solid #ff6a00', borderRadius:10, padding:'18px 20px'}}>
      <div style={{fontSize:10, letterSpacing:1.5, color:'#666'}}>{label}</div>
      <div style={{fontSize:28, fontWeight:900, marginTop:10}}>{val}</div>
      {sub && <div style={{fontSize:10, color:'#ff6a00', marginTop:4}}>{sub}</div>}
    </div>
  )

  return(
    <div style={{display:'flex', minHeight:'100vh', background:'#09090b', color:'white', fontFamily:'Inter, system-ui'}}>
      {/* SIDEBAR */}
      <div style={{width:250, background:'#0f1012', borderRight:'1px solid #1f1f23', display:'flex', flexDirection:'column'}}>
        <div style={{padding:22, borderBottom:'1px solid #1f1f23'}}>
          <div style={{fontWeight:900, fontSize:22}}>VINCULA<span style={{color:'#ff6a00'}}>B</span></div>
          <div style={{fontSize:9, letterSpacing:1.5, color:'#666'}}>DIGITAL PRODUCT IDENTITY</div>
        </div>
        <div style={{padding:12, overflowY:'auto'}}>
          <div style={{fontSize:9, color:'#555', margin:'10px 8px', letterSpacing:1}}>PRINCIPAL</div>
          <button onClick={()=>setView('dashboard')} style={{width:'100%', textAlign:'left', padding:'10px 12px', borderRadius:8, border:'none', background: view==='dashboard'?'#1e1410':'transparent', color: view==='dashboard'?'white':'#888', borderLeft: view==='dashboard'?'3px solid #ff6a00':'3px solid transparent', cursor:'pointer'}}>⌂ Dashboard</button>

          <div style={{fontSize:9, color:'#555', margin:'18px 8px 10px', letterSpacing:1}}>GESTIÓN</div>
          {[
            {id:'empresas', l:'Empresas', c:empresas.length},
            {id:'productos', l:'Productos', c:productos.length},
            {id:'modelos', l:'Modelos', c:modelos.length},
            {id:'lotes', l:'Lotes', c:lotes.length},
            {id:'individuales', l:'Prod. Individuales', c:individuales.length},
          ].map(m=>(
            <button key={m.id} onClick={()=>setView(m.id)} style={{width:'100%', display:'flex', justifyContent:'space-between', textAlign:'left', padding:'10px 12px', borderRadius:8, border:'none', background: view===m.id?'#1e1410':'transparent', color: view===m.id?'white':'#888', borderLeft: view===m.id?'3px solid #ff6a00':'3px solid transparent', cursor:'pointer', marginBottom:4}}>
              <span>{m.l}</span><span style={{background:'#1f1f23', padding:'2px 6px', borderRadius:4, fontSize:10}}>{m.c}</span>
            </button>
          ))}

          <div style={{fontSize:9, color:'#555', margin:'18px 8px 10px', letterSpacing:1}}>IDENTIDAD DIGITAL</div>
          {[
            {id:'dpp', l:'DPP'},
            {id:'qr', l:'QR / NFC'},
            {id:'cert', l:'Certificados'},
            {id:'traza', l:'Trazabilidad'},
          ].map(m=>(
            <button key={m.id} onClick={()=>setView(m.id)} style={{width:'100%', textAlign:'left', padding:'10px 12px', borderRadius:8, border:'none', background: view===m.id?'#1e1410':'transparent', color: view===m.id?'white':'#888', borderLeft: view===m.id?'3px solid #ff6a00':'3px solid transparent', cursor:'pointer', marginBottom:4, fontSize:12}}>{m.l}</button>
          ))}
        </div>
      </div>

      {/* MAIN */}
      <div style={{flex:1}}>
        <div style={{height:58, borderBottom:'1px solid #1f1f23', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0 26px'}}>
          <div style={{fontSize:11, color:'#666', letterSpacing:1}}>PLATAFORMA DE IDENTIDAD DIGITAL DE PRODUCTOS</div>
          <div style={{display:'flex', gap:10, alignItems:'center'}}>
            <div style={{textAlign:'right'}}><div style={{fontSize:9, color:'#666'}}>USUARIO</div><div style={{fontSize:12, fontWeight:700}}>Administrador</div></div>
            <div style={{width:30, height:30, background:'#ff6a00', borderRadius:50, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900}}>A</div>
          </div>
        </div>

        <div style={{padding:28}}>
          {view==='dashboard' && (
            <>
              <h1 style={{margin:0}}>Dashboard</h1><div style={{fontSize:12, color:'#666'}}>Vista general Vinculab • {empresas.length} empresas</div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:14, marginTop:20}}>
                <Card label='EMPRESAS' val={empresas.length} />
                <Card label='PRODUCTOS' val={productos.length} />
                <Card label='MODELOS' val={modelos.length} />
                <Card label='LOTES' val={lotes.length} />
              </div>
            </>
          )}

          {view==='productos' && (
            <>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}><h1 style={{margin:0}}>Productos ({productos.length})</h1><button onClick={()=>setShowProd(true)} style={{background:'#ff6a00', border:'none', padding:'10px 16px', borderRadius:8, color:'white', fontWeight:800, cursor:'pointer'}}>+ Nuevo</button></div>
              <input value={filtro} onChange={e=>setFiltro(e.target.value)} placeholder="Buscar producto..." style={{width:'100%', marginTop:14, padding:12, background:'#15161a', border:'1px solid #1f1f23', borderRadius:8, color:'white'}}/>
              <div style={{background:'#15161a', border:'1px solid #1f1f23', borderRadius:12, marginTop:14, overflow:'hidden'}}>
                {productos.filter(p=>p.nombre.toLowerCase().includes(filtro.toLowerCase())).map(p=><div key={p.id} style={{padding:'14px 18px', borderTop:'1px solid #1f1f23', display:'flex', justifyContent:'space-between', fontSize:13}}><span><b>{p.nombre}</b> <span style={{color:'#666'}}>{p.sku} • {p.categoria}</span></span><span style={{color:'#ff6a00', fontSize:11}}>{empresas.find(e=>e.id===p.empresa_id)?.razon_social || p.empresa_id}</span></div>)}
              </div>
            </>
          )}

          {view==='modelos' && (
            <>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}><h1 style={{margin:0}}>Modelos ({modelos.length})</h1><button onClick={()=>setShowMod(true)} style={{background:'#ff6a00', border:'none', padding:'10px 16px', borderRadius:8, color:'white', fontWeight:800, cursor:'pointer'}}>+ Nuevo Modelo</button></div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginTop:16}}>
                {modelos.map(m=>{
                  const emp = empresas.find(e=>e.id===m.empresa_id)
                  const prod = productos.find(p=>p.id===m.producto_id)
                  return (
                    <div key={m.id} style={{background:'#15161a', border:'1px solid #1f1f23', borderRadius:10, padding:16}}>
                      <div style={{fontWeight:800}}>{m.nombre}</div>
                      <div style={{fontSize:11, color:'#666', marginTop:4}}>{m.descripcion || 'Sin descripción'}</div>
                      <div style={{fontSize:10, color:'#ff6a00', marginTop:8}}>{emp?.razon_social || 'Empresa'} • {prod?.nombre || 'Producto'}</div>
                      <div style={{fontSize:10, color:'#666', marginTop:4}}>{lotes.filter(l=>l.modelo_id===m.id).length} lotes</div>
                    </div>
                  )
                })}
              </div>
              {modelos.length===0 && <div style={{color:'#555', fontSize:13, marginTop:20}}>Aún no hay modelos. Crea el primero con Hercom + ESCALERA.</div>}
            </>
          )}

          {view==='lotes' && (
            <>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}><h1 style={{margin:0}}>Lotes ({lotes.length})</h1><button onClick={()=>setShowLote(true)} style={{background:'#ff6a00', border:'none', padding:'10px 16px', borderRadius:8, color:'white', fontWeight:800, cursor:'pointer'}}>+ Nuevo Lote</button></div>
              <div style={{background:'#15161a', border:'1px solid #1f1f23', borderRadius:12, marginTop:16, overflow:'hidden'}}>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', padding:'10px 16px', fontSize:10, color:'#666', background:'#0f1012'}}><span>CODIGO</span><span>MODELO</span><span>CANTIDAD</span><span>EMPRESA</span></div>
                {lotes.map(l=>{
                  const mod = modelos.find(m=>m.id===l.modelo_id)
                  const emp = empresas.find(e=>e.id===l.empresa_id)
                  return <div key={l.id} style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', padding:'12px 16px', borderTop:'1px solid #1f1f23', fontSize:13}}><b>{l.codigo}</b><span>{mod?.nombre || l.modelo_id}</span><span>{l.cantidad}</span><span style={{color:'#ff6a00', fontSize:11}}>{emp?.razon_social || ''}</span></div>
                })}
              </div>
            </>
          )}

          {view==='empresas' && (
            <><h1>Empresas</h1><div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:16}}>{empresas.map(e=><div key={e.id} style={{background:'#15161a', border:'1px solid #1f1f23', borderLeft:'3px solid #ff6a00', borderRadius:10, padding:18}}><div style={{fontWeight:800}}>{e.razon_social}</div><div style={{fontSize:11, color:'#666', marginTop:4}}>{e.rut} • {productos.filter(p=>p.empresa_id===e.id).length} prod. • {modelos.filter(m=>m.empresa_id===e.id).length} mod.</div></div>)}</div></>
          )}

          {view==='individuales' && (
            <><h1>Productos Individuales ({individuales.length})</h1>
              <div style={{marginTop:16, background:'#15161a', border:'1px solid #1f1f23', borderRadius:12, padding:20}}>
                <button onClick={async()=>{
                  if(lotes.length===0) return alert('Primero crea un Lote')
                  const lote = lotes[0]
                  const nuevos = Array.from({length:5}).map(()=>({
                    serial: `VIN-${Date.now()}-${Math.random().toString(36).slice(2,5).toUpperCase()}`,
                    lote_id: lote.id,
                    qr_code: `https://vinculab.cl/p/${Math.random().toString(36).slice(2,8)}`,
                    estado:'creado'
                  }))
                  const {error} = await supabase.from('productos_individuales').insert(nuevos)
                  if(error) alert(error.message); else cargar()
                }} style={{background:'#ff6a00', border:'none', padding:'10px 16px', borderRadius:8, color:'white', fontWeight:800, cursor:'pointer'}}>Generar 5 unidades de prueba del primer lote</button>
                <div style={{marginTop:16}}>{individuales.map(i=><div key={i.id} style={{padding:'8px 0', borderTop:'1px solid #1f1f23', fontSize:12, display:'flex', justifyContent:'space-between'}}><span>{i.serial}</span><span style={{color:'#666'}}>{i.qr_code}</span></div>)}</div>
              </div>
            </>
          )}

          {['dpp','qr','cert','traza'].includes(view) && (
            <div style={{textAlign:'center', padding:80, color:'#555'}}><div style={{fontSize:30}}>🔗</div><div style={{fontWeight:800, marginTop:10}}>{view.toUpperCase()}</div><div style={{fontSize:12, marginTop:6}}>Conectado a productos_individuales. Próximo paso.</div></div>
          )}
        </div>
      </div>

      {/* MODAL PRODUCTO */}
      {showProd && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:99}}>
          <div style={{background:'#15161a', border:'1px solid #ff6a00', borderRadius:12, padding:20, width:400}}>
            <b>Nuevo Producto</b>
            <select value={formProd.empresa_id} onChange={e=>setFormProd({...formProd, empresa_id:e.target.value})} style={{width:'100%', padding:10, background:'#000', color:'white', marginTop:12, border:'1px solid #333', borderRadius:8}}>{empresas.map(o=><option key={o.id} value={o.id}>{o.razon_social}</option>)}</select>
            <input value={formProd.nombre} onChange={e=>setFormProd({...formProd, nombre:e.target.value})} placeholder="Nombre" style={{width:'100%', padding:10, background:'#000', color:'white', marginTop:10, border:'1px solid #333', borderRadius:8}}/>
            <input value={formProd.sku} onChange={e=>setFormProd({...formProd, sku:e.target.value})} placeholder="SKU" style={{width:'100%', padding:10, background:'#000', color:'white', marginTop:10, border:'1px solid #333', borderRadius:8}}/>
            <input value={formProd.categoria} onChange={e=>setFormProd({...formProd, categoria:e.target.value})} placeholder="Categoria" style={{width:'100%', padding:10, background:'#000', color:'white', marginTop:10, border:'1px solid #333', borderRadius:8}}/>
            <div style={{display:'flex', gap:8, marginTop:12}}>
              <button onClick={()=>setShowProd(false)} style={{flex:1, padding:12, background:'#222', border:'none', borderRadius:8, color:'white', cursor:'pointer'}}>Cancelar</button>
              <button onClick={guardarProducto} style={{flex:1, background:'#ff6a00', border:'none', padding:12, borderRadius:8, color:'white', fontWeight:800, cursor:'pointer'}}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL MODELO */}
      {showMod && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:99}}>
          <div style={{background:'#15161a', border:'1px solid #ff6a00', borderRadius:12, padding:20, width:420}}>
            <b>Nuevo Modelo</b>
            <select value={formMod.empresa_id} onChange={e=>setFormMod({...formMod, empresa_id:e.target.value})} style={{width:'100%', padding:10, background:'#000', color:'white', marginTop:12, border:'1px solid #333', borderRadius:8}}>{empresas.map(o=><option key={o.id} value={o.id}>{o.razon_social}</option>)}</select>
            <select value={formMod.producto_id} onChange={e=>setFormMod({...formMod, producto_id:e.target.value})} style={{width:'100%', padding:10, background:'#000', color:'white', marginTop:10, border:'1px solid #333', borderRadius:8}}>
              <option value="">Selecciona Producto</option>
              {productos.filter(p=>p.empresa_id===formMod.empresa_id).map(o=><option key={o.id} value={o.id}>{o.nombre}</option>)}
            </select>
            <input value={formMod.nombre} onChange={e=>setFormMod({...formMod, nombre:e.target.value})} placeholder="Nombre Modelo ej: ESCALERA-2024-V2" style={{width:'100%', padding:10, background:'#000', color:'white', marginTop:10, border:'1px solid #333', borderRadius:8}}/>
            <input value={formMod.descripcion} onChange={e=>setFormMod({...formMod, descripcion:e.target.value})} placeholder="Descripcion" style={{width:'100%', padding:10, background:'#000', color:'white', marginTop:10, border:'1px solid #333', borderRadius:8}}/>
            <div style={{display:'flex', gap:8, marginTop:12}}>
              <button onClick={()=>setShowMod(false)} style={{flex:1, padding:12, background:'#222', border:'none', borderRadius:8, color:'white', cursor:'pointer'}}>Cancelar</button>
              <button onClick={guardarModelo} style={{flex:1, background:'#ff6a00', border:'none', padding:12, borderRadius:8, color:'white', fontWeight:800, cursor:'pointer'}}>Guardar Modelo</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL LOTE */}
      {showLote && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:99}}>
          <div style={{background:'#15161a', border:'1px solid #ff6a00', borderRadius:12, padding:20, width:420}}>
            <b>Nuevo Lote</b>
            <select value={formLote.empresa_id} onChange={e=>setFormLote({...formLote, empresa_id:e.target.value})} style={{width:'100%', padding:10, background:'#000', color:'white', marginTop:12, border:'1px solid #333', borderRadius:8}}>{empresas.map(o=><option key={o.id} value={o.id}>{o.razon_social}</option>)}</select>
            <select value={formLote.modelo_id} onChange={e=>setFormLote({...formLote, modelo_id:e.target.value})} style={{width:'100%', padding:10, background:'#000', color:'white', marginTop:10, border:'1px solid #333', borderRadius:8}}>
              <option value="">Selecciona Modelo</option>
              {modelos.filter(m=>m.empresa_id===formLote.empresa_id).map(o=><option key={o.id} value={o.id}>{o.nombre}</option>)}
            </select>
            <input value={formLote.codigo} onChange={e=>setFormLote({...formLote, codigo:e.target.value})} placeholder="Código Lote ej: LOTE-001-2024" style={{width:'100%', padding:10, background:'#000', color:'white', marginTop:10, border:'1px solid #333', borderRadius:8}}/>
            <input type="number" value={formLote.cantidad} onChange={e=>setFormLote({...formLote, cantidad:e.target.value})} placeholder="Cantidad" style={{width:'100%', padding:10, background:'#000', color:'white', marginTop:10, border:'1px solid #333', borderRadius:8}}/>
            <div style={{display:'flex', gap:8, marginTop:12}}>
              <button onClick={()=>setShowLote(false)} style={{flex:1, padding:12, background:'#222', border:'none', borderRadius:8, color:'white', cursor:'pointer'}}>Cancelar</button>
              <button onClick={guardarLote} style={{flex:1, background:'#ff6a00', border:'none', padding:12, borderRadius:8, color:'white', fontWeight:800, cursor:'pointer'}}>Guardar Lote</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
