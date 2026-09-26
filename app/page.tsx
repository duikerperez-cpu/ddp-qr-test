"use client"
import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
const getNombre = (e:any) => e.nombre || e.razon_social || e.empresa_nombre || e.name || "Sin nombre"
const APP_URL = "https://ddp-qr-test-2-alpha.vercel.app"

export default function Page() {
  const [tab, setTab] = useState("lotes")
  const [empresas, setEmpresas] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [modelos, setModelos] = useState<any[]>([])
  const [lotes, setLotes] = useState<any[]>([])
  const [individuales, setIndividuales] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [selEmpresa, setSelEmpresa] = useState("")
  const [productosFiltrados, setProductosFiltrados] = useState<any[]>([])
  const [selProducto, setSelProducto] = useState("")
  const [nombreModelo, setNombreModelo] = useState("")
  const [showLoteModal, setShowLoteModal] = useState(false)
  const [loteEmpresa, setLoteEmpresa] = useState("")
  const [loteProducto, setLoteProducto] = useState("")
  const [loteModelosFiltrados, setLoteModelosFiltrados] = useState<any[]>([])
  const [loteModelo, setLoteModelo] = useState("")
  const [loteCantidad, setLoteCantidad] = useState("2")
  const [loteCodigo, setLoteCodigo] = useState("")

  useEffect(()=>{ load(); genCodigo() },[])
  function genCodigo(){ setLoteCodigo(`LOTE-${new Date().toISOString().slice(0,10).replace(/-/g,"")}-${Math.floor(1000+Math.random()*9000)}`) }
  async function load(){
    const {data:e}=await supabase.from("empresas").select("*")
    const {data:p}=await supabase.from("productos").select("*")
    const {data:m}=await supabase.from("modelos").select("*")
    const {data:l}=await supabase.from("lotes").select("*")
    const {data:ind}=await supabase.from("productos_individuales").select("*").limit(100)
    if(e) setEmpresas(e); if(p) setProductos(p); if(m) setModelos(m); if(l) setLotes(l); if(ind) setIndividuales(ind)
  }
  async function onEmpresaChange(id:string){
    setSelEmpresa(id); setSelProducto("")
    const {data}=await supabase.from("productos").select("*").eq("empresa_id", id)
    setProductosFiltrados(data||[])
  }
  async function guardarModelo(){
    if(!selEmpresa||!selProducto||!nombreModelo) return alert("Completa todo")
    const {error}=await supabase.from("modelos").insert({empresa_id:selEmpresa, producto_id:selProducto, nombre:nombreModelo})
    if(error) alert(error.message); else {setShowModal(false); setNombreModelo(""); load()}
  }
  async function onLoteEmpresaChange(id:string){
    setLoteEmpresa(id); setLoteProducto(""); setLoteModelo("")
    const {data:prods}=await supabase.from("productos").select("*").eq("empresa_id", id)
    setProductosFiltrados(prods||[])
    const {data:mods}=await supabase.from("modelos").select("*").eq("empresa_id", id)
    setLoteModelosFiltrados(mods||[])
  }
  async function onLoteProductoChange(id:string){
    setLoteProducto(id)
    const {data}=await supabase.from("modelos").select("*").eq("producto_id", id)
    setLoteModelosFiltrados(data||[])
  }
  async function generarIndividuales(lote:any, cantidad:number){
    const loteId = lote.id || lote.codigo
    const lista = Array.from({length: cantidad}, (_, i)=>{
      const id = `${lote.codigo}-${String(i+1).padStart(4,"0")}`
      return { id, lote_id: loteId, empresa_id: lote.empresa_id, modelo_id: lote.modelo_id, codigo_qr: id, url_dpp: `${APP_URL}/dpp/${id}`, estado: "activo" }
    })
    const {error}=await supabase.from("productos_individuales").insert(lista)
    if(error) alert("Error individuales: "+error.message)
  }
  async function guardarLote(){
    if(!loteEmpresa||!loteModelo||!loteCantidad) return alert("Falta empresa, modelo y cantidad")
    const cantidad = parseInt(loteCantidad)
    const payload:any = { codigo: loteCodigo, cantidad, modelo_id: loteModelo, empresa_id: loteEmpresa, producto_id: loteProducto, estado: "activo" }
    const {data:loteCreado, error}=await supabase.from("lotes").insert(payload).select().single()
    if(error){
      const {producto_id, ...sinProd}=payload
      const {data:lote2, error:err2}=await supabase.from("lotes").insert(sinProd).select().single()
      if(err2) return alert("Error lotes: "+err2.message)
      await generarIndividuales(lote2, cantidad)
    } else {
      await generarIndividuales(loteCreado, cantidad)
    }
    setShowLoteModal(false); genCodigo(); load(); setTab("individuales")
  }

  const Item = ({label, active, count, onClick}:any) => (
    <div onClick={onClick} style={{display:"flex", alignItems:"center", gap:10, padding:"10px 12px", margin:"3px 8px", borderRadius:6, cursor:"pointer", fontSize:12.5, color:active?"#fff":"#888", background:active?"#ff6a001a":"transparent", borderLeft:active?"3px solid #ff6a00":"3px solid transparent"}}>
      <span style={{color:"#ff6a00"}}>◼</span>{label}{count!==undefined?` (${count})`:""}
    </div>
  )

  return (
    <div style={{display:"flex", minHeight:"100vh", background:"#0a0a0a", color:"white"}}>
      <div style={{width:220, background:"#121212", borderRight:"1px solid #1e1e1e"}}>
        <div style={{padding:"18px 16px", borderBottom:"1px solid #1e1e1e"}}><div style={{fontWeight:900, fontSize:20}}>VINCULA<span style={{color:"#ff6a00"}}>B</span></div></div>
        <div style={{padding:"12px 0"}}>
          <Item label="Dashboard" active={tab==="dashboard"} onClick={()=>setTab("dashboard")} />
          <Item label="Empresas" active={tab==="empresas"} count={empresas.length} onClick={()=>setTab("empresas")} />
          <Item label="Productos" active={tab==="productos"} count={productos.length} onClick={()=>setTab("productos")} />
          <Item label="Modelos" active={tab==="modelos"} count={modelos.length} onClick={()=>setTab("modelos")} />
          <Item label="Lotes" active={tab==="lotes"} count={lotes.length} onClick={()=>setTab("lotes")} />
          <Item label="Productos Individuales" active={tab==="individuales"} count={individuales.length} onClick={()=>setTab("individuales")} />
        </div>
      </div>
      <div style={{flex:1, display:"flex", flexDirection:"column"}}>
        <div style={{height:52, background:"#111113", borderBottom:"1px solid #1e1e1e", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 24px"}}><div style={{fontSize:10, color:"#555"}}>PLATAFORMA DE IDENTIDAD DIGITAL</div><div style={{fontWeight:700, fontSize:11}}>Administrador</div></div>
        <div style={{padding:28, flex:1, background:"#080808"}}>
          {tab==="lotes" && (
            <><div style={{display:"flex", justifyContent:"space-between"}}><h1>Lotes ({lotes.length})</h1><button onClick={()=>{genCodigo(); setShowLoteModal(true)}} style={{background:"#ff6a00", border:"none", color:"white", padding:"10px 18px", borderRadius:6, fontWeight:700, fontSize:12}}>+ Nuevo Lote</button></div><div style={{marginTop:20, display:"flex", flexDirection:"column", gap:10}}>{lotes.map((l:any)=>(<div key={l.id} style={{background:"#151518", border:"1px solid #222", borderLeft:"2px solid #ff6a00", padding:14, borderRadius:8, display:"flex", justifyContent:"space-between"}}><div><div style={{fontWeight:700, fontSize:13}}>{l.codigo} - {l.cantidad} unidades</div><div style={{color:"#666", fontSize:11}}>{getNombre(empresas.find(e=>e.id===l.empresa_id)||{})}</div></div><button onClick={()=>setTab("individuales")} style={{fontSize:11, background:"#222", color:"#ff6a00", border:"1px solid #333", padding:"6px 10px", borderRadius:6}}>Ver QRs →</button></div>))}</div></>
          )}
          {tab==="individuales" && (
            <><div style={{display:"flex", justifyContent:"space-between"}}><h1>Productos Individuales ({individuales.length})</h1><div style={{display:"flex", gap:8}}><button onClick={async()=>{
              for(const lote of lotes){
                const ya = individuales.some((i:any)=>i.lote_id===lote.id || i.lote_id===lote.codigo || i.lote_id===lote.codigo?.split("-")[0])
                if(ya) continue
                await generarIndividuales(lote, lote.cantidad||2)
              }
              load(); alert("QRs generados!")
            }} style={{background:"#1e1e1e", border:"1px solid #333", color:"#ff6a00", padding:"8px 14px", borderRadius:6, fontSize:11, fontWeight:700}}>♻️ Generar QRs de los {lotes.length} lotes</button><button onClick={()=>setTab("lotes")} style={{background:"#ff6a00", border:"none", color:"white", padding:"8px 14px", borderRadius:6, fontSize:11}}>+ Nuevo Lote</button></div></div><div style={{marginTop:20, display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:12}}>{individuales.map((ind:any)=>(<div key={ind.id} style={{background:"#151518", border:"1px solid #222", borderRadius:10, padding:12, textAlign:"center"}}><div style={{fontSize:11, fontWeight:700, marginBottom:8}}>{ind.id}</div><img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(ind.url_dpp)}`} style={{width:140, height:140, background:"white", padding:6, borderRadius:6}} alt="qr"/><div style={{fontSize:9, color:"#888", marginTop:8, wordBreak:"break-all"}}>{ind.url_dpp}</div></div>))}{individuales.length===0 && <div style={{gridColumn:"1 / -1", background:"#151518", border:"1px dashed #333", padding:24, borderRadius:8, textAlign:"center", color:"#666"}}>Tienes {lotes.length} lotes sin QR. Dale al botón de arriba.</div>}</div></>
          )}
          {tab==="dashboard" && <h1>Dashboard - {lotes.length} Lotes</h1>}
          {tab==="empresas" && <h2>Empresas ({empresas.length})</h2>}
          {tab==="productos" && <h2>Productos ({productos.length})</h2>}
          {tab==="modelos" && <h2>Modelos ({modelos.length})</h2>}
        </div>
      </div>
      {showLoteModal && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:99}}>
          <div style={{background:"#1a1a1e", border:"1px solid #333", borderRadius:12, padding:22, width:460}}>
            <h3 style={{fontWeight:700, marginBottom:6}}>Nuevo Lote</h3>
            <label style={{fontSize:10, color:"#888"}}>EMPRESA</label><select value={loteEmpresa} onChange={e=>onLoteEmpresaChange(e.target.value)} style={{width:"100%", background:"#222227", border:"1px solid #333", color:"white", padding:10, borderRadius:6, margin:"4px 0 12px 0"}}><option value="">Selecciona Empresa</option>{empresas.map((e:any)=><option key={e.id} value={e.id}>{getNombre(e)}</option>)}</select>
            <label style={{fontSize:10, color:"#888"}}>MODELO</label><select value={loteModelo} onChange={e=>setLoteModelo(e.target.value)} style={{width:"100%", background:"#222227", border:"1px solid #333", color:"white", padding:10, borderRadius:6, margin:"4px 0 12px 0"}}><option value="">Selecciona Modelo</option>{loteModelosFiltrados.map((m:any)=><option key={m.id} value={m.id}>{m.nombre}</option>)}</select>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}><div><label style={{fontSize:10, color:"#888"}}>CODIGO</label><input value={loteCodigo} onChange={e=>setLoteCodigo(e.target.value)} style={{width:"100%", background:"#222227", border:"1px solid #333", color:"white", padding:10, borderRadius:6, margin:"4px 0 12px 0"}} /></div><div><label style={{fontSize:10, color:"#888"}}>CANTIDAD</label><input type="number" value={loteCantidad} onChange={e=>setLoteCantidad(e.target.value)} style={{width:"100%", background:"#222227", border:"1px solid #333", color:"white", padding:10, borderRadius:6, margin:"4px 0 12px 0"}} /></div></div>
            <div style={{display:"flex", justifyContent:"flex-end", gap:10, marginTop:8}}><button onClick={()=>setShowLoteModal(false)} style={{background:"transparent", color:"#888", border:"none"}}>Cancelar</button><button onClick={guardarLote} style={{background:"#ff6a00", color:"white", border:"none", padding:"8px 16px", borderRadius:6, fontWeight:700}}>Crear Lote + QRs</button></div>
          </div>
        </div>
      )}
    </div>
  )
}
