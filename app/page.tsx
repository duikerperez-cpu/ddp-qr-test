"use client"
import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
const getNombre = (e:any) => e.nombre || e.razon_social || e.empresa_nombre || e.name || "Sin nombre"

export default function Page() {
  const [tab, setTab] = useState("dashboard")
  const [empresas, setEmpresas] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [modelos, setModelos] = useState<any[]>([])
  const [lotes, setLotes] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [selEmpresa, setSelEmpresa] = useState("")
  const [productosFiltrados, setProductosFiltrados] = useState<any[]>([])
  const [selProducto, setSelProducto] = useState("")
  const [nombreModelo, setNombreModelo] = useState("")

  useEffect(()=>{ load() },[])
  async function load(){
    const {data:e}=await supabase.from("empresas").select("*")
    const {data:p}=await supabase.from("productos").select("*")
    const {data:m}=await supabase.from("modelos").select("*")
    const {data:l}=await supabase.from("lotes").select("*")
    if(e) setEmpresas(e); if(p) setProductos(p); if(m) setModelos(m); if(l) setLotes(l)
  }
  async function onEmpresaChange(id:string){
    setSelEmpresa(id); setSelProducto("")
    const {data}=await supabase.from("productos").select("*").eq("empresa_id", id)
    setProductosFiltrados(data && data.length ? data : productos)
  }
  async function guardar(){
    if(!selEmpresa||!selProducto||!nombreModelo) return alert("Completa todo")
    const {error}=await supabase.from("modelos").insert({empresa_id:selEmpresa, producto_id:selProducto, nombre:nombreModelo})
    if(error) alert(error.message); else {setShowModal(false); setNombreModelo(""); load(); setTab("modelos")}
  }

  const Item = ({label, active, count, onClick}:{label:string, active:boolean, count?:number, onClick?:any}) => (
    <div onClick={onClick} style={{display:"flex", alignItems:"center", gap:10, padding:"10px 12px", margin:"3px 8px", borderRadius:6, cursor:"pointer", fontSize:12.5, color:active?"#fff":"#888", background:active?"#ff6a001a":"transparent", borderLeft:active?"3px solid #ff6a00":"3px solid transparent"}}>
      <span style={{color:"#ff6a00", fontSize:11}}>◼</span>{label}{count!==undefined?` (${count})`:""}
    </div>
  )

  return (
    <div style={{display:"flex", minHeight:"100vh", background:"#0a0a0a", color:"white", fontFamily:"Inter, sans-serif"}}>
      {/* SIDEBAR EXACTO A TU FOTO GOOGLE */}
      <div style={{width:220, background:"#121212", borderRight:"1px solid #1e1e1e", display:"flex", flexDirection:"column"}}>
        <div style={{padding:"18px 16px", borderBottom:"1px solid #1e1e1e"}}>
          <div style={{fontWeight:900, fontSize:20, letterSpacing:1}}>VINCULA<span style={{color:"#ff6a00"}}>B</span></div>
          <div style={{fontSize:8, color:"#555", letterSpacing:1.5, marginTop:2}}>DIGITAL PRODUCT IDENTITY</div>
        </div>
        <div style={{padding:"12px 0", flex:1}}>
          <div style={{fontSize:9, color:"#444", letterSpacing:1.5, padding:"10px 16px"}}>PRINCIPAL</div>
          <Item label="Dashboard" active={tab==="dashboard"} onClick={()=>setTab("dashboard")} />
          <div style={{fontSize:9, color:"#444", letterSpacing:1.5, padding:"16px 16px 6px 16px"}}>GESTIÓN</div>
          <Item label="Empresas" active={tab==="empresas"} count={empresas.length} onClick={()=>setTab("empresas")} />
          <Item label="Productos" active={tab==="productos"} count={productos.length} onClick={()=>setTab("productos")} />
          <Item label="Modelos" active={tab==="modelos"} count={modelos.length} onClick={()=>setTab("modelos")} />
          <Item label="Lotes" active={tab==="lotes"} count={lotes.length} onClick={()=>setTab("lotes")} />
          <Item label="Productos Individuales" active={tab==="individuales"} onClick={()=>setTab("individuales")} />
          <div style={{fontSize:9, color:"#444", letterSpacing:1.5, padding:"16px 16px 6px 16px"}}>IDENTIDAD DIGITAL</div>
          <Item label="DPP" active={tab==="dpp"} onClick={()=>setTab("dpp")} />
          <Item label="NFC / QR" active={tab==="nfc"} onClick={()=>setTab("nfc")} />
          <Item label="Certificados" active={tab==="cert"} onClick={()=>setTab("cert")} />
          <Item label="Trazabilidad" active={tab==="traza"} onClick={()=>setTab("traza")} />
        </div>
      </div>

      {/* MAIN */}
      <div style={{flex:1, display:"flex", flexDirection:"column"}}>
        <div style={{height:52, background:"#111113", borderBottom:"1px solid #1e1e1e", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 24px"}}>
          <div style={{fontSize:10, color:"#555", letterSpacing:1.5}}>PLATAFORMA DE IDENTIDAD DIGITAL DE PRODUCTOS</div>
          <div style={{display:"flex", alignItems:"center", gap:10}}><div style={{textAlign:"right"}}><div style={{fontSize:8, color:"#666"}}>USUARIO</div><div style={{fontSize:11, fontWeight:700}}>Administrador</div></div><div style={{width:28, height:28, borderRadius:"50%", background:"#ff6a00", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:11}}>A</div></div>
        </div>

        <div style={{padding:28, flex:1, background:"#080808"}}>
          {tab==="dashboard" && (
            <>
              <h1 style={{fontSize:24, fontWeight:700}}>Dashboard</h1>
              <p style={{fontSize:12, color:"#666", marginTop:4}}>Vista general de la plataforma Vinculab.</p>
              <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:14, marginTop:20}}>
                {[{l:"EMPRESAS",v:empresas.length},{l:"PRODUCTOS",v:productos.length},{l:"MODELOS",v:modelos.length},{l:"LOTES",v:lotes.length}].map(c=>(
                  <div key={c.l} style={{background:"#161618", border:"1px solid #222", borderLeft:"2px solid #ff5a00", borderRadius:8, padding:"18px 16px"}}>
                    <div style={{fontSize:9, color:"#666", letterSpacing:1.2}}>{c.l}</div><div style={{fontSize:28, fontWeight:800, marginTop:10}}>{c.v}</div>
                  </div>
                ))}
              </div>
              <button onClick={()=>setShowModal(true)} style={{marginTop:20, background:"#ff6a00", border:"none", color:"white", padding:"9px 16px", borderRadius:6, fontWeight:700, fontSize:12}}>+ Nuevo Modelo</button>
            </>
          )}

          {tab==="empresas" && <><div style={{display:"flex", justifyContent:"space-between"}}><h2>Empresas ({empresas.length})</h2><button onClick={()=>setShowModal(true)} style={{background:"#ff6a00", border:"none", color:"white", padding:"8px 14px", borderRadius:6, fontSize:11, fontWeight:700}}>+ Nuevo Modelo</button></div><div style={{marginTop:16, display:"flex", flexDirection:"column", gap:8}}>{empresas.map((e:any)=><div key={e.id} style={{background:"#151518", border:"1px solid #222", padding:14, borderRadius:8, fontSize:13}}><b>{getNombre(e)}</b><div style={{color:"#666", fontSize:11}}>{e.rut} - {e.pais} - {e.sector} - {e.estado}</div></div>)}</div></>}

          {tab==="productos" && <><h2>Productos ({productos.length})</h2><div style={{marginTop:12, display:"flex", flexDirection:"column", gap:8}}>{productos.map((p:any)=><div key={p.id} style={{background:"#151518", border:"1px solid #222", padding:12, borderRadius:6, fontSize:12}}>{p.nombre||p.name}</div>)}</div></>}
          {tab==="modelos" && <><div style={{display:"flex", justifyContent:"space-between"}}><h2>Modelos ({modelos.length})</h2><button onClick={()=>setShowModal(true)} style={{background:"#ff6a00", border:"none", color:"white", padding:"8px 14px", borderRadius:6, fontSize:11, fontWeight:700}}>+ Nuevo Modelo</button></div><div style={{marginTop:12, display:"flex", flexDirection:"column", gap:8}}>{modelos.map((m:any)=><div key={m.id} style={{background:"#151518", border:"1px solid #222", padding:12, borderRadius:6, fontSize:12}}>{m.nombre}</div>)}</div></>}
          {tab==="lotes" && <><h2>Lotes ({lotes.length})</h2><p style={{color:"#666", fontSize:12, marginTop:8}}>Módulo de lotes migrado a Supabase. {lotes.length===0?"Aún no hay lotes creados.":""}</p></>}
          {["individuales","dpp","nfc","cert","traza"].includes(tab) && <><h2 style={{textTransform:"capitalize"}}>{tab.toUpperCase()}</h2><p style={{color:"#666", fontSize:12, marginTop:8}}>Módulo {tab} - en migración desde Google Apps Script a Vercel. La estructura ya está lista.</p></>}
        </div>
      </div>

      {showModal && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:99}}>
          <div style={{background:"#1a1a1e", border:"1px solid #333", borderRadius:12, padding:22, width:440}}>
            <h3 style={{fontWeight:700, marginBottom:16}}>Nuevo Modelo</h3>
            <label style={{fontSize:10, color:"#888"}}>EMPRESA</label>
            <select value={selEmpresa} onChange={e=>onEmpresaChange(e.target.value)} style={{width:"100%", background:"#222227", border:"1px solid #333", color:"white", padding:10, borderRadius:6, margin:"4px 0 14px 0"}}><option value="">Selecciona Empresa</option>{empresas.map((e:any)=><option key={e.id} value={e.id}>{getNombre(e)}</option>)}</select>
            <label style={{fontSize:10, color:"#888"}}>PRODUCTO</label>
            <select value={selProducto} onChange={e=>{setSelProducto(e.target.value); const p=productosFiltrados.find(x=>x.id===e.target.value); if(p) setNombreModelo(`${(p.nombre||p.name||"MODELO").toUpperCase()}-${new Date().getFullYear()}-001`)}} style={{width:"100%", background:"#222227", border:"1px solid #333", color:"white", padding:10, borderRadius:6, margin:"4px 0 14px 0"}}><option value="">Selecciona Producto</option>{productosFiltrados.map((p:any)=><option key={p.id} value={p.id}>{p.nombre||p.name}</option>)}</select>
            <label style={{fontSize:10, color:"#888"}}>NOMBRE MODELO</label>
            <input value={nombreModelo} onChange={e=>setNombreModelo(e.target.value)} style={{width:"100%", background:"#222227", border:"1px solid #333", color:"white", padding:10, borderRadius:6, margin:"4px 0 18px 0"}} />
            <div style={{display:"flex", justifyContent:"flex-end", gap:10}}><button onClick={()=>setShowModal(false)} style={{background:"transparent", color:"#888", border:"none"}}>Cancelar</button><button onClick={guardar} style={{background:"#ff6a00", color:"white", border:"none", padding:"8px 16px", borderRadius:6, fontWeight:700}}>Guardar Modelo</button></div>
          </div>
        </div>
      )}
    </div>
  )
}
