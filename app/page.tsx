"use client"
import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
const APP_URL = process.env.NEXT_PUBLIC_SUPABASE_APP_URL || "https://vinculab.cl"
const getNombre = (e:any) => e?.nombre || e?.razon_social || "Sin nombre"

export default function Page(){
  const [tab,setTab]=useState("dashboard")
  const [empresas,setEmpresas]=useState<any[]>([]); const [productos,setProductos]=useState<any[]>([]); const [modelos,setModelos]=useState<any[]>([]); const [lotes,setLotes]=useState<any[]>([]); const [inds,setInds]=useState<any[]>([])

  // Crear
  const [showEmpresa,setShowEmpresa]=useState(false); const [nomEmpresa,setNomEmpresa]=useState("")
  const [showProducto,setShowProducto]=useState(false); const [prodEmpresa,setProdEmpresa]=useState(""); const [nomProducto,setNomProducto]=useState("")
  const [showModelo,setShowModelo]=useState(false); const [modEmpresa,setModEmpresa]=useState(""); const [modProducto,setModProducto]=useState(""); const [modProdFiltrados,setModProdFiltrados]=useState<any[]>([]); const [nomModelo,setNomModelo]=useState("")
  // NUEVOS CAMPOS DPP QUE PIDE LA EMPRESA CLIENTE
  const [modCat,setModCat]=useState("Battery"); const [modVer,setModVer]=useState("V1.0"); const [modLi,setModLi]=useState("12"); const [modCo,setModCo]=useState("15"); const [modNi,setModNi]=useState("30"); const [modCo2,setModCo2]=useState("45.5"); const [modCo2kwh,setModCo2kwh]=useState("8.2")

  const [showLote,setShowLote]=useState(false); const [loteEmpresa,setLoteEmpresa]=useState(""); const [loteModelosFiltrados,setLoteModelosFiltrados]=useState<any[]>([]); const [loteModelo,setLoteModelo]=useState(""); const [loteProducto,setLoteProducto]=useState(""); const [loteCodigo,setLoteCodigo]=useState(""); const [loteCant,setLoteCant]=useState("10")

  useEffect(()=>{ load(); genCodigo() },[])

  function genCodigo(){ setLoteCodigo('LOTE-'+new Date().toISOString().slice(0,10).replace(/-/g,"")+'-'+Math.floor(1000+Math.random()*9000)) }

  async function load(){
    const {data:e}=await supabase.from("empresas").select("*")
    const {data:p}=await supabase.from("productos").select("*")
    const {data:m}=await supabase.from("modelos").select("*")
    const {data:l}=await supabase.from("lotes").select("*")
    const {data:ind}=await supabase.from("productos_individuales").select("*").limit(200)
    if(e) setEmpresas(e); if(p) setProductos(p); if(m) setModelos(m); if(l) setLotes(l); if(ind) setInds(ind)
  }

  function onModEmpresaChange(id:string){ setModEmpresa(id); setModProdFiltrados(productos.filter((x:any)=>x.empresa_id===id)) }
  function onLoteEmpresaChange(id:string){ setLoteEmpresa(id); setLoteModelosFiltrados(modelos.filter((x:any)=>x.empresa_id===id)) }

  async function guardarEmpresa(){ if(!nomEmpresa) return; await supabase.from("empresas").insert({nombre:nomEmpresa, razon_social:nomEmpresa}); setShowEmpresa(false); setNomEmpresa(""); load() }
  async function guardarProducto(){ if(!prodEmpresa||!nomProducto) return; await supabase.from("productos").insert({empresa_id:prodEmpresa, nombre:nomProducto}); setShowProducto(false); setNomProducto(""); load() }
  
  // MODELO CON DATOS DPP INGRESADOS POR LA EMPRESA CLIENTE
  async function guardarModelo(){ 
    if(!modEmpresa||!modProducto||!nomModelo) return; 
    await supabase.from("modelos").insert({ 
      empresa_id:modEmpresa, producto_id:modProducto, nombre:nomModelo,
      categoria: modCat, version: modVer,
      lithium_pct: parseInt(modLi)||0, cobalt_pct: parseInt(modCo)||0, nickel_pct: parseInt(modNi)||0,
      co2_total: parseFloat(modCo2)||0, co2_kwh: parseFloat(modCo2kwh)||0
    }); 
    setShowModelo(false); setNomModelo(""); load() 
  }

  async function crearLote(){
    if(!loteEmpresa||!loteModelo||!loteCodigo) return;
    const modeloSel = modelos.find(m=>m.id===loteModelo)
    const {data:loteData, error}=await supabase.from("lotes").insert({ empresa_id:loteEmpresa, producto_id:modeloSel?.producto_id || loteProducto, modelo_id:loteModelo, codigo:loteCodigo, cantidad:parseInt(loteCant) }).select().single()
    if(error){ alert(error.message); return }
    const cant = parseInt(loteCant)
    const rows = Array.from({length:cant}).map((_,i)=>({ id:`${loteCodigo}-${String(i+1).padStart(4,'0')}`, lote_id:loteData.id, empresa_id:loteEmpresa, producto_id:modeloSel?.producto_id, modelo_id:loteModelo }))
    await supabase.from("productos_individuales").insert(rows)
    setShowLote(false); genCodigo(); load(); setTab("lotes")
  }

  return (
    <div style={{minHeight:"100vh", background:"#0f0f11", color:"white", fontFamily:"Inter,sans-serif", padding:"20px"}}>
      <div style={{maxWidth:"1100px", margin:"0 auto"}}>


        {tab==="dashboard" && (
  <div>
    <div style={{ marginBottom: "20px" }}>
      <h1
        style={{
          margin: 0,
          fontSize: "28px",
          fontWeight: 700,
          color: "#fff",
        }}
      >
        Dashboard
      </h1>

      <p
        style={{
          marginTop: "6px",
          fontSize: "12px",
          color: "#6f7c91",
        }}
      >
        Vista general de la plataforma Vinculab.
      </p>
    </div>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4,1fr)",
        gap: "12px",
      }}
    >
      {/* Empresas */}

      <div
        style={{
          background: "#08111d",
          border: "1px solid #1a2330",
          borderLeft: "3px solid #ff6b1a",
          borderRadius: "8px",
          padding: "14px",
          minHeight: "70px",
        }}
      >
        <div
          style={{
            fontSize: "9px",
            color: "#7b8798",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          Empresas
        </div>

        <div
          style={{
            fontSize: "18px",
            fontWeight: 700,
            marginTop: "10px",
          }}
        >
          {empresas.length}
        </div>
      </div>

      {/* Productos */}

      <div
        style={{
          background: "#08111d",
          border: "1px solid #1a2330",
          borderLeft: "3px solid #ff6b1a",
          borderRadius: "8px",
          padding: "14px",
          minHeight: "70px",
        }}
      >
        <div
          style={{
            fontSize: "9px",
            color: "#7b8798",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          Productos
        </div>

        <div
          style={{
            fontSize: "18px",
            fontWeight: 700,
            marginTop: "10px",
          }}
        >
          {productos.length}
        </div>
      </div>

      {/* Modelos */}

      <div
        style={{
          background: "#08111d",
          border: "1px solid #1a2330",
          borderLeft: "3px solid #ff6b1a",
          borderRadius: "8px",
          padding: "14px",
          minHeight: "70px",
        }}
      >
        <div
          style={{
            fontSize: "9px",
            color: "#7b8798",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          Modelos
        </div>

        <div
          style={{
            fontSize: "18px",
            fontWeight: 700,
            marginTop: "10px",
          }}
        >
          {modelos.length}
        </div>
      </div>

      {/* Lotes */}

      <div
        style={{
          background: "#08111d",
          border: "1px solid #1a2330",
          borderLeft: "3px solid #ff6b1a",
          borderRadius: "8px",
          padding: "14px",
          minHeight: "70px",
        }}
      >
        <div
          style={{
            fontSize: "9px",
            color: "#7b8798",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          Lotes
        </div>

        <div
          style={{
            fontSize: "18px",
            fontWeight: 700,
            marginTop: "10px",
          }}
        >
          {lotes.length}
        </div>
      </div>
    </div>
  </div>
)}
        {tab==="modelos" && <div><div style={{display:"flex", justifyContent:"space-between"}}><h3>Modelos</h3><button onClick={()=>setShowModelo(true)} style={{background:"#ff5a1f", border:"none", color:"white", padding:"6px 12px", borderRadius:"6px"}}>+ Nuevo Modelo DPP</button></div><div style={{marginTop:"12px"}}>{modelos.map((m:any)=><div key={m.id} style={{background:"#1a1a1e", padding:"10px", marginTop:"8px", borderRadius:"8px", fontSize:"12px"}}>{m.nombre} • {m.categoria || 'Battery'} • Li:{m.lithium_pct}% Co:{m.cobalt_pct}% Ni:{m.nickel_pct}% • CO2:{m.co2_total}kg</div>)}</div></div>}

        {tab==="lotes" && <div><div style={{display:"flex", justifyContent:"space-between"}}><h3>Lotes</h3><button onClick={()=>{genCodigo(); setShowLote(true)}} style={{background:"#ff5a1f", border:"none", color:"white", padding:"6px 12px", borderRadius:"6px"}}>+ Nuevo Lote + QRs</button></div><div style={{marginTop:"12px"}}>{lotes.map((l:any)=><div key={l.id} style={{background:"#1a1a1e", padding:"10px", marginTop:"8px", borderRadius:"8px", fontSize:"12px"}}>{l.codigo} • <a href={`/p/${l.codigo}-0001`} style={{color:"#ff5a1f"}} target="_blank">Ver DPP ejemplo</a></div>)}</div></div>}

        {tab==="DPP" && <div style={{background:"#1a1a1e", padding:"20px", borderRadius:"12px"}}><h3>Tus páginas DPP blancas están en vinculab.cl/p/[codigo]</h3><p style={{fontSize:"12px", color:"#888", marginTop:"8px"}}>Ejemplo: vinculab.cl/p/LOTE-20260927-1136-0001 - Esta es la que escanea el cliente final con la composición que ingresó la empresa.</p></div>}
      </div>

      {showEmpresa && <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:50}}><div style={{background:"#1a1a1e", border:"1px solid #2a2a2e", borderRadius:"12px", padding:"20px", width:"400"}}><h3>Nueva Empresa</h3><input value={nomEmpresa} onChange={e=>setNomEmpresa(e.target.value)} placeholder="Hercom Chile" style={{width:"100%", background:"#222227", border:"1px solid #333", color:"white", padding:"10px", borderRadius:"6px", marginTop:"12px"}}/><div style={{display:"flex", justifyContent:"flex-end", gap:"10px", marginTop:"12px"}}><button onClick={()=>setShowEmpresa(false)}>Cancelar</button><button onClick={guardarEmpresa} style={{background:"#ff5a1f", color:"white", border:"none", padding:"8px 12px", borderRadius:"6px"}}>Guardar</button></div></div></div>}

      {showProducto && <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:50}}><div style={{background:"#1a1a1e", border:"1px solid #2a2a2e", borderRadius:"12px", padding:"20px", width:"400"}}><h3>Nuevo Producto</h3><select value={prodEmpresa} onChange={e=>setProdEmpresa(e.target.value)} style={{width:"100%", background:"#222227", border:"1px solid #333", color:"white", padding:"10px", borderRadius:"6px", marginTop:"12px"}}><option>Empresa</option>{empresas.map((e:any)=><option key={e.id} value={e.id}>{getNombre(e)}</option>)}</select><input value={nomProducto} onChange={e=>setNomProducto(e.target.value)} placeholder="Batería 5kWh" style={{width:"100%", background:"#222227", border:"1px solid #333", color:"white", padding:"10px", borderRadius:"6px", marginTop:"8px"}}/><div style={{display:"flex", justifyContent:"flex-end", gap:"10px", marginTop:"12px"}}><button onClick={()=>setShowProducto(false)}>Cancelar</button><button onClick={guardarProducto} style={{background:"#ff5a1f", color:"white", border:"none", padding:"8px 12px", borderRadius:"6px"}}>Guardar</button></div></div></div>}

      {/* MODAL NUEVO MODELO - AHORA LA EMPRESA INGRESA SU INFO DPP */}
      {showModelo && <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:50, overflowY:"auto", padding:"20px"}}><div style={{background:"#1a1a1e", border:"1px solid #2a2a2e", borderRadius:"12px", padding:"22px", width:"460"}}>
        <h3 style={{fontSize:"13px", fontWeight:800}}>Nuevo Modelo - Datos DPP UE (lo llena la empresa cliente)</h3>
        <select value={modEmpresa} onChange={e=>onModEmpresaChange(e.target.value)} style={{width:"100%", background:"#222227", border:"1px solid #333", color:"white", padding:"10px", borderRadius:"6px", marginTop:"12px"}}><option value="">Empresa cliente</option>{empresas.map((e:any)=><option key={e.id} value={e.id}>{getNombre(e)}</option>)}</select>
        <select value={modProducto} onChange={e=>setModProducto(e.target.value)} style={{width:"100%", background:"#222227", border:"1px solid #333", color:"white", padding:"10px", borderRadius:"6px", marginTop:"8px"}}><option value="">Producto</option>{modProdFiltrados.map((p:any)=><option key={p.id} value={p.id}>{p.nombre}</option>)}</select>
        <input value={nomModelo} onChange={e=>setNomModelo(e.target.value)} placeholder="Nombre modelo Ej: escalera 1" style={{width:"100%", background:"#222227", border:"1px solid #333", color:"white", padding:"10px", borderRadius:"6px", marginTop:"8px"}}/>
        <div style={{fontSize:"10px", color:"#888", marginTop:"12px", letterSpacing:"0.5px", fontWeight:700}}>COMPOSICIÓN QUÍMICA Y HUELLA (OBLIGATORIO UE)</div>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px", marginTop:"8px"}}>
          <input value={modCat} onChange={e=>setModCat(e.target.value)} placeholder="Categoría Ej: Battery" style={{background:"#222227", border:"1px solid #333", color:"white", padding:"10px", borderRadius:"6px"}}/>
          <input value={modVer} onChange={e=>setModVer(e.target.value)} placeholder="Versión Ej: V1.0" style={{background:"#222227", border:"1px solid #333", color:"white", padding:"10px", borderRadius:"6px"}}/>
          <input value={modLi} onChange={e=>setModLi(e.target.value)} placeholder="Lithium % Ej: 12" type="number" style={{background:"#222227", border:"1px solid #333", color:"white", padding:"10px", borderRadius:"6px"}}/>
          <input value={modCo} onChange={e=>setModCo(e.target.value)} placeholder="Cobalt % Ej: 15" type="number" style={{background:"#222227", border:"1px solid #333", color:"white", padding:"10px", borderRadius:"6px"}}/>
          <input value={modNi} onChange={e=>setModNi(e.target.value)} placeholder="Nickel % Ej: 30" type="number" style={{background:"#222227", border:"1px solid #333", color:"white", padding:"10px", borderRadius:"6px"}}/>
          <input value={modCo2} onChange={e=>setModCo2(e.target.value)} placeholder="CO2 total kg Ej: 45.5" type="number" step="0.1" style={{background:"#222227", border:"1px solid #333", color:"white", padding:"10px", borderRadius:"6px"}}/>
        </div>
        <input value={modCo2kwh} onChange={e=>setModCo2kwh(e.target.value)} placeholder="CO2 por kWh Ej: 8.2" type="number" step="0.1" style={{width:"100%", background:"#222227", border:"1px solid #333", color:"white", padding:"10px", borderRadius:"6px", marginTop:"8px"}}/>
        <div style={{display:"flex", justifyContent:"flex-end", gap:"10px", marginTop:"16px"}}><button onClick={()=>setShowModelo(false)} style={{background:"transparent", color:"#666", border:"none", fontSize:"12px"}}>Cancelar</button><button onClick={guardarModelo} style={{background:"#ff5a1f", color:"white", border:"none", padding:"8px 16px", borderRadius:"6px", fontWeight:700, fontSize:"12px"}}>Guardar Modelo DPP</button></div>
      </div></div>}

      {showLote && <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:50}}><div style={{background:"#1a1a1e", border:"1px solid #2a2a2e", borderRadius:"12px", padding:"20px", width:"400"}}><h3>Nuevo Lote</h3><select value={loteEmpresa} onChange={e=>onLoteEmpresaChange(e.target.value)} style={{width:"100%", background:"#222227", border:"1px solid #333", color:"white", padding:"10px", borderRadius:"6px", marginTop:"12px"}}><option>Empresa</option>{empresas.map((e:any)=><option key={e.id} value={e.id}>{getNombre(e)}</option>)}</select><select value={loteModelo} onChange={e=>setLoteModelo(e.target.value)} style={{width:"100%", background:"#222227", border:"1px solid #333", color:"white", padding:"10px", borderRadius:"6px", marginTop:"8px"}}><option>Modelo</option>{loteModelosFiltrados.map((m:any)=><option key={m.id} value={m.id}>{m.nombre}</option>)}</select><input value={loteCodigo} onChange={e=>setLoteCodigo(e.target.value)} style={{width:"100%", background:"#222227", border:"1px solid #333", color:"white", padding:"10px", borderRadius:"6px", marginTop:"8px"}}/><input value={loteCant} onChange={e=>setLoteCant(e.target.value)} type="number" placeholder="Cantidad" style={{width:"100%", background:"#222227", border:"1px solid #333", color:"white", padding:"10px", borderRadius:"6px", marginTop:"8px"}}/><div style={{display:"flex", justifyContent:"flex-end", gap:"10px", marginTop:"12px"}}><button onClick={()=>setShowLote(false)}>Cancelar</button><button onClick={crearLote} style={{background:"#ff5a1f", color:"white", border:"none", padding:"8px 12px", borderRadius:"6px"}}>Crear Lote + QRs</button></div></div></div>}
    </div>
  )
}
