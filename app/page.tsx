"use client"
import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
const getNombre = (e:any) => e?.nombre || e?.razon_social || "Sin nombre"
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://vinculab.cl"

export default function Page() {
  const [tab, setTab] = useState("dashboard")
  const [empresas, setEmpresas] = useState<any[]>([]); const [productos, setProductos] = useState<any[]>([]); const [modelos, setModelos] = useState<any[]>([]); const [lotes, setLotes] = useState<any[]>([]); const [individuales, setIndividuales] = useState<any[]>([])
  const [showLoteModal, setShowLoteModal] = useState(false)
  const [loteEmpresa, setLoteEmpresa] = useState(""); const [loteModelosFiltrados, setLoteModelosFiltrados] = useState<any[]>([]); const [loteModelo, setLoteModelo] = useState(""); const [loteCantidad, setLoteCantidad] = useState("2"); const [loteCodigo, setLoteCodigo] = useState("")

  useEffect(()=>{ load(); genCodigo() },[])
  function genCodigo(){ setLoteCodigo(`LOTE-${new Date().toISOString().slice(0,10).replace(/-/g,"")}-${Math.floor(1000+Math.random()*9000)}`) }
  async function load(){
    const {data:e}=await supabase.from("empresas").select("*"); const {data:p}=await supabase.from("productos").select("*"); const {data:m}=await supabase.from("modelos").select("*"); const {data:l}=await supabase.from("lotes").select("*").order('created_at',{ascending:false}); const {data:ind}=await supabase.from("productos_individuales").select("*").limit(100)
    if(e) setEmpresas(e); if(p) setProductos(p); if(m) setModelos(m); if(l) setLotes(l); if(ind) setIndividuales(ind)
  }
  async function onLoteEmpresaChange(id:string){
    setLoteEmpresa(id); const {data}=await supabase.from("modelos").select("*").eq("empresa_id", id); setLoteModelosFiltrados(data||[])
  }
  async function generarIndividuales(lote:any, cantidad:number){
    const lista = Array.from({length: cantidad}, (_, i)=>{ const id = `${lote.codigo}-${String(i+1).padStart(4,"0")}`; return { id, lote_id: lote.id, empresa_id: lote.empresa_id, modelo_id: lote.modelo_id, codigo_qr: id, url_dpp: `${APP_URL}/p/${id}`, estado: "activo" } })
    await supabase.from("productos_individuales").insert(lista)
  }
  async function guardarLote(){
    if(!loteEmpresa||!loteModelo) return alert("Falta empresa y modelo"); const cantidad = parseInt(loteCantidad); const payload:any = { codigo: loteCodigo, cantidad, modelo_id: loteModelo, empresa_id: loteEmpresa, estado: "activo" }
    const {data:loteCreado, error}=await supabase.from("lotes").insert(payload).select().single(); if(error) return alert(error.message)
    await generarIndividuales(loteCreado, cantidad); setShowLoteModal(false); genCodigo(); load(); setTab("individuales")
  }

  const Menu = ({label, id}:{label:string, id:string}) => {
    const active = tab===id
    return <div onClick={()=>setTab(id)} style={{padding:"9px 16px", margin:"2px 8px", borderRadius:"6px", fontSize:"12px", color:active?"#ff6a00":"#8a8a8e", background:active?"#ff6a0015":"transparent", cursor:"pointer", display:"flex", alignItems:"center", gap:"8px", borderLeft:active?"2px solid #ff6a00":"2px solid transparent"}}><span style={{fontSize:"7px"}}>●</span> {label}</div>
  }
  const Card = (title:string, value:number) => (
    <div style={{background:"#1e1e20", border:"1px solid #2a2a2e", borderLeft:"2px solid #ff6a00", borderRadius:"6px", padding:"16px 18px"}}><div style={{fontSize:"9px", color:"#666", letterSpacing:"1px", fontWeight:700}}>{title}</div><div style={{fontSize:"22px", fontWeight:900, marginTop:"6px"}}>{value}</div></div>
  )

  return (
    <div style={{display:"flex", minHeight:"100vh", background:"#0e0e10", color:"white"}}>
      <div style={{width:"210px", background:"#131315", borderRight:"1px solid #1e1e22"}}>
        <div style={{padding:"18px 16px", borderBottom:"1px solid #1e1e22"}}><div style={{fontWeight:900, fontSize:"18px"}}>VINCULA<span style={{background:"#ff6a00", padding:"0 4px", borderRadius:"3px", marginLeft:"1px"}}>B</span></div></div>
        <div style={{padding:"16px 0"}}>
          <div style={{fontSize:"8px", color:"#444", padding:"0 16px 6px", letterSpacing:"1px"}}>PRINCIPAL</div><Menu label="Dashboard" id="dashboard"/>
          <div style={{fontSize:"8px", color:"#444", padding:"12px 16px 6px", letterSpacing:"1px"}}>GESTIÓN</div><Menu label="Empresas" id="empresas"/><Menu label="Productos" id="productos"/><Menu label="Modelos" id="modelos"/><Menu label="Lotes" id="lotes"/><Menu label="Productos Individuales" id="individuales"/>
          <div style={{fontSize:"8px", color:"#444", padding:"12px 16px 6px", letterSpacing:"1px"}}>IDENTIDAD DIGITAL</div><Menu label="DPP" id="dpp"/><Menu label="NFC / QR" id="nfc"/><Menu label="Certificados" id="cert"/><Menu label="Trazabilidad" id="traza"/>
        </div>
      </div>

      <div style={{flex:1, display:"flex", flexDirection:"column"}}>
        <div style={{height:"48px", background:"#161618", borderBottom:"1px solid #1e1e22", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 20px"}}><div style={{fontSize:"9px", color:"#555", letterSpacing:"1px"}}>PLATAFORMA DE IDENTIDAD DIGITAL DE PRODUCTOS</div><div style={{fontSize:"11px", fontWeight:700}}>Administrador</div></div>
        <div style={{padding:"20px", background:"#0a0a0c", flex:1}}>

          {tab==="dashboard" && (
            <><div style={{marginBottom:"16px"}}><div style={{fontWeight:700, fontSize:"14px"}}>Dashboard</div><div style={{fontSize:"11px", color:"#666"}}>Vista general de la plataforma Vinculab.</div></div><div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:"12px"}}>{Card("EMPRESAS", empresas.length)}{Card("PRODUCTOS", productos.length)}{Card("MODELOS", modelos.length)}{Card("LOTES", lotes.length)}</div></>
          )}

          {tab==="lotes" && (
            <><div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}><h2 style={{fontSize:"16px"}}>Lotes ({lotes.length})</h2><button onClick={()=>{genCodigo(); setShowLoteModal(true)}} style={{background:"#ff6a00", border:"none", color:"white", padding:"8px 14px", borderRadius:"6px", fontWeight:700, fontSize:"12px"}}>+ Nuevo Lote</button></div><div style={{marginTop:"16px", display:"flex", flexDirection:"column", gap:"8px"}}>{lotes.map((l:any)=>(<div key={l.id} style={{background:"#1a1a1e", border:"1px solid #222", borderLeft:"2px solid #ff6a00", padding:"12px 14px", borderRadius:"6px", display:"flex", justifyContent:"space-between", fontSize:"12px"}}><div><div style={{fontWeight:700}}>{l.codigo} - {l.cantidad} unidades</div><div style={{color:"#666", fontSize:"11px"}}>{getNombre(empresas.find(e=>e.id===l.empresa_id))}</div></div><button onClick={()=>setTab("individuales")} style={{background:"#222", color:"#ff6a00", border:"1px solid #333", padding:"6px 10px", borderRadius:"6px", fontSize:"11px"}}>Ver QRs →</button></div>))}</div></>
          )}

          {tab==="individuales" && (
            <><div style={{display:"flex", justifyContent:"space-between"}}><h2 style={{fontSize:"16px"}}>Productos Individuales ({individuales.length})</h2><button onClick={()=>setTab("lotes")} style={{background:"#ff6a00", border:"none", color:"white", padding:"8px 14px", borderRadius:"6px", fontSize:"12px"}}>+ Nuevo Lote</button></div><div style={{marginTop:"16px", display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:"12px"}}>{individuales.map((ind:any)=>(<div key={ind.id} style={{background:"#1a1a1e", border:"1px solid #222", borderRadius:"8px", padding:"10px", textAlign:"center"}}><div style={{fontSize:"10px", fontWeight:700, marginBottom:"6px"}}>{ind.id}</div><img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(ind.url_dpp)}`} style={{width:"100%", background:"white", padding:"4px", borderRadius:"4px"}} alt="qr"/><div style={{fontSize:"8px", color:"#666", marginTop:"6px", wordBreak:"break-all"}}>{ind.url_dpp}</div></div>))}</div></>
          )}

          {tab==="empresas" && <h2>Empresas ({empresas.length})</h2>}
          {tab==="productos" && <h2>Productos ({productos.length})</h2>}
          {tab==="modelos" && <h2>Modelos ({modelos.length}) - {modelos.map((m:any)=>m.nombre).join(", ")}</h2>}
          {tab==="dpp" && <div style={{color:"#666"}}>DPP - Tus páginas de QR están en /p/[codigo] y ya se ven blancas perfectas</div>}
        </div>
      </div>

      {showLoteModal && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:99}}>
          <div style={{background:"#1a1a1e", border:"1px solid #333", borderRadius:"12px", padding:"22px", width:"460"}}>
            <h3 style={{fontWeight:700, marginBottom:"12px"}}>Nuevo Lote</h3>
            <label style={{fontSize:"10px", color:"#888"}}>EMPRESA</label><select value={loteEmpresa} onChange={e=>onLoteEmpresaChange(e.target.value)} style={{width:"100%", background:"#222227", border:"1px solid #333", color:"white", padding:"10px", borderRadius:"6px", margin:"4px 0 12px 0"}}><option value="">Selecciona Empresa</option>{empresas.map((e:any)=><option key={e.id} value={e.id}>{getNombre(e)}</option>)}</select>
            <label style={{fontSize:"10px", color:"#888"}}>MODELO</label><select value={loteModelo} onChange={e=>setLoteModelo(e.target.value)} style={{width:"100%", background:"#222227", border:"1px solid #333", color:"white", padding:"10px", borderRadius:"6px", margin:"4px 0 12px 0"}}><option value="">Selecciona Modelo</option>{loteModelosFiltrados.map((m:any)=><option key={m.id} value={m.id}>{m.nombre}</option>)}</select>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px"}}><div><label style={{fontSize:"10px", color:"#888"}}>CODIGO</label><input value={loteCodigo} onChange={e=>setLoteCodigo(e.target.value)} style={{width:"100%", background:"#222227", border:"1px solid #333", color:"white", padding:"10px", borderRadius:"6px", marginTop:"4px"}}/></div><div><label style={{fontSize:"10px", color:"#888"}}>CANTIDAD</label><input type="number" value={loteCantidad} onChange={e=>setLoteCantidad(e.target.value)} style={{width:"100%", background:"#222227", border:"1px solid #333", color:"white", padding:"10px", borderRadius:"6px", marginTop:"4px"}}/></div></div>
            <div style={{display:"flex", justifyContent:"flex-end", gap:"10px", marginTop:"16px"}}><button onClick={()=>setShowLoteModal(false)} style={{background:"transparent", color:"#888", border:"none"}}>Cancelar</button><button onClick={guardarLote} style={{background:"#ff6a00", color:"white", border:"none", padding:"8px 16px", borderRadius:"6px", fontWeight:700}}>Crear Lote + QRs</button></div>
          </div>
        </div>
      )}
    </div>
  )
}
