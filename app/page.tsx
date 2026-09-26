"use client"
import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const getNombreEmpresa = (e:any) => e.nombre || e.razon_social || e.empresa_nombre || e.name || "Sin nombre"

export default function Page() {
  const [empresas, setEmpresas] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [modelos, setModelos] = useState<any[]>([])
  const [tab, setTab] = useState("empresas")

  const [showModal, setShowModal] = useState(false)
  const [selEmpresa, setSelEmpresa] = useState("")
  const [productosFiltrados, setProductosFiltrados] = useState<any[]>([])
  const [selProducto, setSelProducto] = useState("")
  const [nombreModelo, setNombreModelo] = useState("")

  useEffect(() => { load() }, [])

  async function load() {
    const { data: e } = await supabase.from("empresas").select("*")
    const { data: p } = await supabase.from("productos").select("*")
    const { data: m } = await supabase.from("modelos").select("*")
    if(e) setEmpresas(e)
    if(p) setProductos(p)
    if(m) setModelos(m)
  }

  async function onEmpresaChange(id: string) {
    setSelEmpresa(id)
    setSelProducto("")
    if(!id) return
    const { data } = await supabase.from("productos").select("*").eq("empresa_id", id)
    if(data && data.length > 0) setProductosFiltrados(data)
    else {
      const { data: all } = await supabase.from("productos").select("*")
      setProductosFiltrados(all || [])
    }
  }

  async function guardarModelo() {
    if(!selEmpresa ||!selProducto ||!nombreModelo) return alert("Falta empresa, producto o nombre")
    const { error } = await supabase.from("modelos").insert({ empresa_id: selEmpresa, producto_id: selProducto, nombre: nombreModelo })
    if(error) alert(error.message)
    else { setShowModal(false); setNombreModelo(""); load() }
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#080808", color: "white" }}>
      <div style={{ width: 240, background: "#111113", borderRight: "1px solid #1e1e1e", padding: 16 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 900, fontSize: 22 }}>VINCULA<span style={{ color: "#ff6a00" }}>B</span></div>
          <div style={{ fontSize: 9, color: "#666", letterSpacing: 2 }}>DIGITAL PRODUCT IDENTITY</div>
        </div>
        <div onClick={() => setTab("dashboard")} style={{ padding: "10px 12px", cursor: "pointer", fontSize: 13, color: tab === "dashboard" ? "#fff" : "#888", background: tab === "dashboard" ? "#ff6a001a" : "transparent", borderLeft: tab === "dashboard" ? "2px solid #ff6a00" : "2px solid transparent", borderRadius: 6 }}>◫ Dashboard</div>
        <div style={{ fontSize: 10, color: "#555", margin: "16px 0 8px 0" }}>GESTIÓN</div>
        <div onClick={() => setTab("empresas")} style={{ padding: "10px 12px", cursor: "pointer", fontSize: 13, color: tab === "empresas" ? "#fff" : "#888", background: tab === "empresas" ? "#ff6a001a" : "transparent", borderLeft: tab === "empresas" ? "2px solid #ff6a00" : "2px solid transparent", borderRadius: 6, marginBottom: 4 }}>Empresas ({empresas.length})</div>
        <div onClick={() => setTab("productos")} style={{ padding: "10px 12px", cursor: "pointer", fontSize: 13, color: tab === "productos" ? "#fff" : "#888", background: tab === "productos" ? "#ff6a001a" : "transparent", borderLeft: tab === "productos" ? "2px solid #ff6a00" : "2px solid transparent", borderRadius: 6, marginBottom: 4 }}>◇ Productos ({productos.length})</div>
        <div onClick={() => setTab("modelos")} style={{ padding: "10px 12px", cursor: "pointer", fontSize: 13, color: tab === "modelos" ? "#fff" : "#888", background: tab === "modelos" ? "#ff6a001a" : "transparent", borderLeft: tab === "modelos" ? "2px solid #ff6a00" : "2px solid transparent", borderRadius: 6 }}>◇ Modelos ({modelos.length})</div>
      </div>

      <div style={{ flex: 1, padding: 32 }}>
        {tab === "empresas" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h1 style={{ fontSize: 24, fontWeight: 700 }}>Empresas ({empresas.length})</h1>
              <button onClick={() => setShowModal(true)} style={{ background: "#ff6a00", color: "white", border: "none", padding: "8px 16px", borderRadius: 6, fontWeight: 700, fontSize: 12 }}>+ Nuevo Modelo</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {empresas.map((e:any) => (
                <div key={e.id} style={{ background: "#151518", border: "1px solid #222", padding: 14, borderRadius: 8, fontSize: 13 }}>
                  <div style={{ fontWeight: 700 }}>{getNombreEmpresa(e)}</div>
                  <div style={{ color: "#666", fontSize: 11, marginTop: 4 }}>{e.rut} - {e.pais} - {e.sector} - {e.estado}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "dashboard" && (
          <>
            <h1 style={{ fontSize: 28, fontWeight: 700 }}>Dashboard</h1>
            <p style={{ color: "#666", fontSize: 13, marginTop: 4 }}>Vista general - {empresas.length} empresas conectadas</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 24 }}>
              <div style={{ background: "#151518", borderLeft: "2px solid #ff6a00", padding: 20, borderRadius: 8 }}><div style={{ fontSize: 10, color: "#666" }}>EMPRESAS</div><div style={{ fontSize: 30, fontWeight: 800, marginTop: 8 }}>{empresas.length}</div></div>
              <div style={{ background: "#151518", borderLeft: "2px solid #ff6a00", padding: 20, borderRadius: 8 }}><div style={{ fontSize: 10, color: "#666" }}>PRODUCTOS</div><div style={{ fontSize: 30, fontWeight: 800, marginTop: 8 }}>{productos.length}</div></div>
              <div style={{ background: "#151518", borderLeft: "2px solid #ff6a00", padding: 20, borderRadius: 8 }}><div style={{ fontSize: 10, color: "#666" }}>MODELOS</div><div style={{ fontSize: 30, fontWeight: 800, marginTop: 8 }}>{modelos.length}</div></div>
            </div>
          </>
        )}

        {tab === "productos" && <div><h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Productos ({productos.length})</h2>{productos.map((p:any)=><div key={p.id} style={{ background: "#151518", border: "1px solid #222", padding: 12, borderRadius: 6, marginBottom: 8, fontSize: 13 }}><b>{p.nombre || p.name || p.titulo}</b></div>)}</div>}
        {tab === "modelos" && <div><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}><h2 style={{ fontSize: 20, fontWeight: 700 }}>Modelos ({modelos.length})</h2><button onClick={() => setShowModal(true)} style={{ background: "#ff6a00", color: "white", border: "none", padding: "8px 14px", borderRadius: 6, fontWeight: 700, fontSize: 12 }}>+ Nuevo</button></div>{modelos.map((m:any)=><div key={m.id} style={{ background: "#151518", border: "1px solid #222", padding: 12, borderRadius: 6, marginBottom: 8, fontSize: 13 }}><b>{m.nombre}</b></div>)}</div>}
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#1a1a1e", border: "1px solid #2a2a2e", borderRadius: 12, padding: 24, width: 460 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Nuevo Modelo - Ahora sí funciona</h3>
            <label style={{ fontSize: 10, color: "#888" }}>EMPRESA</label>
            <select value={selEmpresa} onChange={(e) => onEmpresaChange(e.target.value)} style={{ width: "100%", background: "#222227", border: "1px solid #333", color: "white", padding: 10, borderRadius: 6, margin: "4px 0 16px 0" }}>
              <option value="">Selecciona Empresa</option>
              {empresas.map((e:any) => <option key={e.id} value={e.id}>{getNombreEmpresa(e)}</option>)}
            </select>
            <label style={{ fontSize: 10, color: "#888" }}>PRODUCTO</label>
            <select value={selProducto} onChange={(e) => { setSelProducto(e.target.value); const p = productosFiltrados.find(x => x.id === e.target.value); if(p) setNombreModelo(`${(p.nombre||p.name||"MODELO").toUpperCase()}-${new Date().getFullYear()}-001`) }} style={{ width: "100%", background: "#222227", border: "1px solid #333", color: "white", padding: 10, borderRadius: 6, margin: "4px 0 16px 0" }}>
              <option value="">Selecciona Producto</option>
              {productosFiltrados.map((p:any) => <option key={p.id} value={p.id}>{p.nombre || p.name || p.titulo}</option>)}
            </select>
            <label style={{ fontSize: 10, color: "#888" }}>NOMBRE MODELO</label>
            <input value={nombreModelo} onChange={(e) => setNombreModelo(e.target.value)} placeholder="ESCALERA-2024-001" style={{ width: "100%", background: "#222227", border: "1px solid #333", color: "white", padding: 10, borderRadius: 6, margin: "4px 0 20px 0" }} />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => setShowModal(false)} style={{ background: "transparent", color: "#888", border: "none", padding: "8px 14px" }}>Cancelar</button>
              <button onClick={guardarModelo} style={{ background: "#ff6a00", color: "white", border: "none", padding: "8px 18px", borderRadius: 6, fontWeight: 700 }}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
