"use client"
import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
const getNombre = (e:any) => e.nombre || e.razon_social || e.empresa_nombre || e.name || "Sin nombre"

export default function Page() {
  const [tab, setTab] = useState("lotes")
  const [empresas, setEmpresas] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [modelos, setModelos] = useState<any[]>([])
  const [lotes, setLotes] = useState<any[]>([])

  // Modal Modelo
  const [showModal, setShowModal] = useState(false)
  const [selEmpresa, setSelEmpresa] = useState("")
  const [productosFiltrados, setProductosFiltrados] = useState<any[]>([])
  const [selProducto, setSelProducto] = useState("")
  const [nombreModelo, setNombreModelo] = useState("")

  // Modal Lote
  const [showLoteModal, setShowLoteModal] = useState(false)
  const [loteEmpresa, setLoteEmpresa] = useState("")
  const [loteProducto, setLoteProducto] = useState("")
  const [loteModelosFiltrados, setLoteModelosFiltrados] = useState<any[]>([])
  const [loteModelo, setLoteModelo] = useState("")
  const [loteCantidad, setLoteCantidad] = useState("100")
  const [loteCodigo, setLoteCodigo] = useState("")

  useEffect(()=>{ load(); genCodigo() },[])
  function genCodigo(){ setLoteCodigo(`LOTE-${new Date().toISOString().slice(0,10).replace(/-/g,"")}-${Math.floor(1000+Math.random()*9000)}`) }

  async function load(){
    const {data:e}=await supabase.from("empresas").select("*")
    const {data:p}=await supabase.from("productos").select("*")
    const {data:m}=await supabase.from("modelos").select("*")
    const {data:l}=await supabase.from("lotes").select("*").order("created_at",{ascending:false})
    if(e) setEmpresas(e); if(p) setProductos(p); if(m) setModelos(m); if(l) setLotes(l)
  }

  async function onEmpresaChange(id:string){
    setSelEmpresa(id); setSelProducto("")
    const {data}=await supabase.from("productos").select("*").eq("empresa_id", id)
    setProductosFiltrados(data && data.length ? data : productos)
  }
  async function guardarModelo(){
    if(!selEmpresa||!selProducto||!nombreModelo) return alert("Completa todo")
    const {error}=await supabase.from("modelos").insert({empresa_id:selEmpresa, producto_id:selProducto, nombre:nombreModelo})
    if(error) alert(error.message); else {setShowModal(false); setNombreModelo(""); load()}
  }

  // --- LOGICA LOTES ---
  async function onLoteEmpresaChange(id:string){
    setLoteEmpresa(id); setLoteProducto(""); setLoteModelo("")
    const {data:prods}=await supabase.from("productos").select("*").eq("empresa_id", id)
    setProductosFiltrados(prods && prods.length ? prods : productos)
    const {data:mods}=await supabase.from("modelos").select("*").eq("empresa_id", id)
    setLoteModelosFiltrados(mods||[])
  }
  async function onLoteProductoChange(id:string){
    setLoteProducto(id)
    const {data}=await supabase.from("modelos").select("*").eq("producto_id", id)
    setLoteModelosFiltrados(data||[])
  }
  async function guardarLote(){
    if(!loteEmpresa||!loteModelo||!loteCantidad) return alert("Falta empresa, modelo y cantidad")
    const payload:any = {
      empresa_id: loteEmpresa,
      producto_id: loteProducto || null,
      modelo_id: loteModelo,
      cantidad: parseInt(loteCantidad),
      codigo: loteCodigo,
      estado: "activo"
    }
    const {error}=await supabase.from("lotes").insert(payload)
    if(error) alert("Error lotes: "+error.message + "\n\nSi tu tabla lotes no tiene columna codigo/cantidad, ejecuta en Supabase:\nALTER TABLE lotes ADD COLUMN IF NOT EXISTS codigo text; ALTER TABLE lotes ADD COLUMN IF NOT EXISTS cantidad int; ALTER TABLE lotes ADD COLUMN IF NOT EXISTS modelo_id uuid;")
    else { setShowLoteModal(false); genCodigo(); setLoteCantidad("100"); load(); alert("Lote creado: "+loteCodigo) }
  }

  const Item = ({label, active, count, onClick}:{label:string, active:boolean, count?:number, onClick?:any}) => (
    <div onClick={onClick} style={{display:"flex", alignItems:"center", gap:10, padding:"10px 12px", margin:"3px 8px", borderRadius:6, cursor:"pointer", fontSize:12.5, color:active?"#fff":"#888", background:active?"#ff6a001a":"transparent", borderLeft:active?"3px solid #ff6a00":"3px solid transparent"}}>
      <span style={{color:"#ff6a00"}}>◼</span>{label}{count!==undefined?` (${count})`:""}
    </div>
  )

  return (
    <div style={{display:"flex", minHeight:"100vh", background:"#0a0a0a", color:"white"}}>
      <div style={{width:220, background:"#121212", borderRight:"1px solid #1e1e1e"}}>
        <div style={{padding:"18px 16px", borderBottom:"1px solid #1e1e1e"}}><div style={{fontWeight:900, fontSize:20}}>VINCULA<span style={{color:"#ff6a00"}}>B</span></div><div style={{fontSize:8, color:"#555", letterSpacing:1.5}}>DIGITAL PRODUCT IDENTITY</div></div>
        <div style={{padding:"12px 0"}}>
          <div style={{fontSize:9, color:"#444", padding:"10px 16px"}}>PRINCIPAL</div>
          <Item label="Dashboard" active={tab==="dashboard"} onClick={()=>setTab("dashboard")} />
          <div style={{fontSize:9, color:"#444", padding:"16px 16px 6px 16px"}}>GESTIÓN</div>
          <Item label="Empresas" active={tab==="empresas"} count={empresas.length} onClick={()=>setTab("empresas")} />
          <Item label="Productos" active={tab==="productos"} count={productos.length} onClick={()=>setTab("productos")} />
          <Item label="Modelos" active={tab==="modelos"} count={modelos.length} onClick={()=>setTab("modelos")} />
          <Item label="Lotes" active={tab==="lotes"} count={lotes.length} onClick={()=>setTab("lotes")} />
          <Item label="Productos Individuales" active={tab==="individuales"} onClick={()=>setTab("individuales")} />
          <div style={{fontSize:9, color:"#444", padding:"16px 16px 6px 16px"}}>IDENTIDAD DIGITAL</div>
          <Item label="DPP" active={false} onClick={()=>{}} /><Item label="NFC / QR" active={false} onClick={()=>{}} />
        </div>
      </div>

      <div style={{flex:1, display:"flex", flexDirection:"column"}}>
        <div style={{height:52, background:"#111113", borderBottom:"1px solid #1e1e1e", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 24px"}}>
          <div style={{fontSize:10, color:"#555", letterSpacing:1.5}}>PLATAFORMA DE IDENTIDAD DIGITAL</div>
          <div style={{display:"flex", alignItems:"center", gap:10}}><div style={{textAlign:"right"}}><div style={{fontSize:8, color:"#666"}}>USUARIO</div><div style={{fontSize:11, fontWeight:700}}>Administrador</div></div><div style={{width:28, height:28, borderRadius:"50%", background:"#ff6a00", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800}}>A</div></div>
        </div>

        <div style={{padding:28, flex:1, background:"#080808"}}>
          {tab==="lotes" && (
            <>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                <div><h1 style={{fontSize:22, fontWeight:700}}>Lotes ({lotes.length})</h1><p style={{fontSize:12, color:"#666", marginTop:4}}>Cada lote genera {loteCantidad||100} identidades digitales con QR/NFC</p></div>
                <button onClick={()=>{genCodigo(); setShowLoteModal(true)}} style={{background:"#ff6a00", border:"none", color:"white", padding:"10px 18px", borderRadius:6, fontWeight:700, fontSize:12}}>+ Nuevo Lote</button>
              </div>

              <div style={{marginTop:20, display:"flex", flexDirection:"column", gap:10}}>
                {lotes.length===0 && <div style={{background:"#151518", border:"1px dashed #333", padding:24, borderRadius:8, textAlign:"center", color:"#666", fontSize:13}}>Aún no hay lotes. Crea el primer lote para Hercom Chile</div>}
                {lotes.map((l:any)=>(
                  <div key={l.id} style={{background:"#151518", border:"1px solid #222", borderLeft:"2px solid #ff6a00", padding:14, borderRadius:8, display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                    <div><div style={{fontWeight:700, fontSize:13}}>{l.codigo||l.id.slice(0,12)} - {l.cantidad||"-"} unidades</div><div style={{color:"#666", fontSize:11, marginTop:4}}>{getNombre(empresas.find(e=>e.id===l.empresa_id))} • Modelo: {modelos.find(m=>m.id===l.modelo_id)?.nombre||l.modelo_id?.slice(0,8)} • {new Date(l.created_at).toLocaleDateString()}</div></div>
                    <div style={{fontSize:10, background:"#1e1e1e", padding:"4px 8px", borderRadius:12, color:"#ff6a00"}}>{l.estado||"activo"}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab==="dashboard" && (
            <>
              <h1 style={{fontSize:24, fontWeight:700}}>Dashboard</h1>
              <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:14, marginTop:20}}>
                {[{l:"EMPRESAS",v:empresas.length},{l:"PRODUCTOS",v:productos.length},{l:"MODELOS",v:modelos.length},{l:"LOTES",v:lotes.length}].map(c=>(
                  <div key={c.l} style={{background:"#161618", border:"1px solid #222", borderLeft:"2px solid #ff5a00", borderRadius:8, padding:"18px 16px"}}><div style={{fontSize:9, color:"#666"}}>{c.l}</div><div style={{fontSize:28, fontWeight:800, marginTop:10}}>{c.v}</div></div>
                ))}
              </div>
              <div style={{display:"flex", gap:10, marginTop:20}}><button onClick={()=>setTab("lotes")} style={{background:"#ff6a00", border:"none", color:"white", padding:"9px 16px", borderRadius:6, fontWeight:700, fontSize:12}}>+ Nuevo Lote</button><button onClick={()=>setShowModal(true)} style={{background:"#1e1e1e", border:"1px solid #333", color:"white", padding:"9px 16px", borderRadius:6, fontSize:12}}>Nuevo Modelo</button></div>
            </>
          )}

          {tab==="empresas" && <><h2>Empresas ({empresas.length})</h2><div style={{marginTop:12, display:"flex", flexDirection:"column", gap:8}}>{empresas.map((e:any)=><div key={e.id} style={{background:"#151518", border:"1px solid #222", padding:14, borderRadius:8}}><b>{getNombre(e)}</b><div style={{color:"#666", fontSize:11}}>{e.rut} - {e.sector}</div></div>)}</div></>}
          {tab==="modelos" && <><div style={{display:"flex", justifyContent:"space-between"}}><h2>Modelos ({modelos.length})</h2><button onClick={()=>setShowModal(true)} style={{background:"#ff6a00", border:"none", color:"white", padding:"8px 14px", borderRadius:6, fontSize:11, fontWeight:700}}>+ Nuevo</button></div><div style={{marginTop:12, display:"flex", flexDirection:"column", gap:8}}>{modelos.map((m:any)=><div key={m.id} style={{background:"#151518", border:"1px solid #222", padding:12, borderRadius:6}}>{m.nombre}</div>)}</div></>}
        </div>
      </div>

      {/* MODAL LOTE - NUEVO */}
      {showLoteModal && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:99}}>
          <div style={{background:"#1a1a1e", border:"1px solid #333", borderRadius:12, padding:22, width:460}}>
            <h3 style={{fontWeight:700, marginBottom:6}}>Nuevo Lote</h3><p style={{fontSize:11, color:"#666", marginBottom:16}}>Generará identidades digitales para cada unidad</p>
            
            <label style={{fontSize:10, color:"#888"}}>EMPRESA</label>
            <select value={loteEmpresa} onChange={e=>onLoteEmpresaChange(e.target.value)} style={{width:"100%", background:"#222227", border:"1px solid #333", color:"white", padding:10, borderRadius:6, margin:"4px 0 12px 0"}}><option value="">Selecciona Empresa</option>{empresas.map((e:any)=><option key={e.id} value={e.id}>{getNombre(e)}</option>)}</select>

            <label style={{fontSize:10, color:"#888"}}>PRODUCTO</label>
            <select value={loteProducto} onChange={e=>onLoteProductoChange(e.target.value)} style={{width:"100%", background:"#222227", border:"1px solid #333", color:"white", padding:10, borderRadius:6, margin:"4px 0 12px 0"}}><option value="">(Opcional) Filtra por producto</option>{productosFiltrados.map((p:any)=><option key={p.id} value={p.id}>{p.nombre||p.name}</option>)}</select>

            <label style={{fontSize:10, color:"#888"}}>MODELO</label>
            <select value={loteModelo} onChange={e=>setLoteModelo(e.target.value)} style={{width:"100%", background:"#222227", border:"1px solid #333", color:"white", padding:10, borderRadius:6, margin:"4px 0 12px 0"}}><option value="">Selecciona Modelo</option>{loteModelosFiltrados.map((m:any)=><option key={m.id} value={m.id}>{m.nombre}</option>)}</select>

            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>
              <div><label style={{fontSize:10, color:"#888"}}>CODIGO LOTE</label><input value={loteCodigo} onChange={e=>setLoteCodigo(e.target.value)} style={{width:"100%", background:"#222227", border:"1px solid #333", color:"white", padding:10, borderRadius:6, margin:"4px 0 12px 0"}} /></div>
              <div><label style={{fontSize:10, color:"#888"}}>CANTIDAD</label><input type="number" value={loteCantidad} onChange={e=>setLoteCantidad(e.target.value)} style={{width:"100%", background:"#222227", border:"1px solid #333", color:"white", padding:10, borderRadius:6, margin:"4px 0 12px 0"}} /></div>
            </div>

            <div style={{display:"flex", justifyContent:"flex-end", gap:10, marginTop:8}}><button onClick={()=>setShowLoteModal(false)} style={{background:"transparent", color:"#888", border:"none"}}>Cancelar</button><button onClick={guardarLote} style={{background:"#ff6a00", color:"white", border:"none", padding:"8px 16px", borderRadius:6, fontWeight:700}}>Crear Lote</button></div>
          </div>
        </div>
      )}

      {showModal && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:99}}>
          <div style={{background:"#1a1a1e", border:"1px solid #333", borderRadius:12, padding:22, width:440}}>
            <h3 style={{fontWeight:700, marginBottom:16}}>Nuevo Modelo</h3>
            <select value={selEmpresa} onChange={e=>onEmpresaChange(e.target.value)} style={{width:"100%", background:"#222227", border:"1px solid #333", color:"white", padding:10, borderRadius:6, margin:"4px 0 12px 0"}}><option value="">Empresa</option>{empresas.map((e:any)=><option key={e.id} value={e.id}>{getNombre(e)}</option>)}</select>
            <select value={selProducto} onChange={e=>{setSelProducto(e.target.value); const p=productosFiltrados.find(x=>x.id===e.target.value); if(p) setNombreModelo(`${(p.nombre||p.name||"MODELO").toUpperCase()}-${new Date().getFullYear()}-001`)}} style={{width:"100%", background:"#222227", border:"1px solid #333", color:"white", padding:10, borderRadius:6, margin:"4px 0 12px 0"}}><option value="">Producto</option>{productosFiltrados.map((p:any)=><option key={p.id} value={p.id}>{p.nombre||p.name}</option>)}</select>
            <input value={nombreModelo} onChange={e=>setNombreModelo(e.target.value)} placeholder="Nombre" style={{width:"100%", background:"#222227", border:"1px solid #333", color:"white", padding:10, borderRadius:6, margin:"4px 0 12px 0"}} />
            <div style={{display:"flex", justifyContent:"flex-end", gap:10}}><button onClick={()=>setShowModal(false)} style={{background:"transparent", color:"#888", border:"none"}}>Cancelar</button><button onClick={guardarModelo} style={{background:"#ff6a00", color:"white", border:"none", padding:"8px 16px", borderRadius:6, fontWeight:700}}>Guardar</button></div>
          </div>
        </div>
      )}
    </div>
  )
}
