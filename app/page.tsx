"use client"
import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Page() {
  const [empresas, setEmpresas] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [modelos, setModelos] = useState<any[]>([])
  const [selectedEmpresa, setSelectedEmpresa] = useState<any>(null)
  const [view, setView] = useState("productos")
  const [showModal, setShowModal] = useState(false)
  const [formEmpresa, setFormEmpresa] = useState("")
  const [formProductos, setFormProductos] = useState<any[]>([])
  const [formProducto, setFormProducto] = useState("")
  const [formNombre, setFormNombre] = useState("")

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: emps } = await supabase.from("empresas").select("*")
    const { data: prods } = await supabase.from("productos").select("*")
    const { data: mods } = await supabase.from("modelos").select("*, productos(nombre), empresas(nombre)")
    if (emps && emps.length > 0) {
      setEmpresas(emps)
      if (!selectedEmpresa) setSelectedEmpresa(emps[0])
    }
    if (prods) setProductos(prods)
    if (mods) setModelos(mods)
  }

  const productosDeEmpresa = selectedEmpresa? productos.filter(p => p.empresa_id === selectedEmpresa.id) : productos
  const modelosDeEmpresa = selectedEmpresa? modelos.filter(m => m.empresa_id === selectedEmpresa.id) : modelos

  async function handleOpenModal() {
    setShowModal(true)
    setFormEmpresa(selectedEmpresa?.id || "")
    if (selectedEmpresa) {
      const { data } = await supabase.from("productos").select("*").eq("empresa_id", selectedEmpresa.id)
      setFormProductos(data || [])
    }
  }

  async function handleChangeEmpresaModal(id: string) {
    setFormEmpresa(id)
    setFormProducto("")
    const { data } = await supabase.from("productos").select("*").eq("empresa_id", id)
    setFormProductos(data || [])
  }

  async function handleSave() {
    if (!formEmpresa ||!formProducto ||!formNombre) return alert("Falta empresa, producto o nombre")
    const { error } = await supabase.from("modelos").insert({ empresa_id: formEmpresa, producto_id: formProducto, nombre: formNombre })
    if (error) alert(error.message)
    else {
      setShowModal(false)
      setFormNombre("")
      loadData()
    }
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0a0a0a", color: "white" }}>
      <div style={{ width: 220, background: "#111", borderRight: "1px solid #222", padding: 16 }}>
        <div style={{ fontWeight: 900, letterSpacing: 2, marginBottom: 4 }}>VINCULA<span style={{ color: "#ff6a00" }}>B</span></div>
        <div style={{ fontSize: 10, color: "#666", marginBottom: 16 }}>{empresas.length} empresas</div>
        {empresas.map(e => (
          <div key={e.id} onClick={() => setSelectedEmpresa(e)} style={{ padding: "10px 12px", marginBottom: 6, borderRadius: 6, cursor: "pointer", fontSize: 12, borderLeft: `3px solid ${selectedEmpresa?.id === e.id? "#ff6a00" : "#333"}`, background: selectedEmpresa?.id === e.id? "#1e1e1e" : "#151515" }}>
            {e.nombre}
          </div>
        ))}
      </div>
      <div style={{ flex: 1, padding: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>{view === "productos"? `Productos (${productosDeEmpresa.length})` : `Modelos (${modelosDeEmpresa.length})`}</h1>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setView("productos")} style={{ background: view === "productos"? "#222" : "transparent", border: "1px solid #333", color: "white", padding: "6px 12px", borderRadius: 6, fontSize: 12 }}>Productos</button>
            <button onClick={() => setView("modelos")} style={{ background: view === "modelos"? "#222" : "transparent", border: "1px solid #333", color: "white", padding: "6px 12px", borderRadius: 6, fontSize: 12 }}>Modelos</button>
            <button onClick={handleOpenModal} style={{ background: "#ff6a00", border: "none", color: "white", padding: "6px 16px", borderRadius: 6, fontWeight: 700, fontSize: 12 }}>+ Nuevo</button>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {view === "productos"? productosDeEmpresa.map((p: any) => (
            <div key={p.id} style={{ background: "#151515", border: "1px solid #222", padding: 12, borderRadius: 6, fontSize: 13 }}><b>{p.nombre}</b> <span style={{ color: "#666" }}>- {p.sku || "ESTRUCTURAS"}</span></div>
          )) : modelosDeEmpresa.map((m: any) => (
            <div key={m.id} style={{ background: "#151515", border: "1px solid #222", padding: 12, borderRadius: 6, fontSize: 13, display: "flex", justifyContent: "space-between" }}><b>{m.nombre}</b><span style={{ color: "#666" }}>{m.productos?.nombre}</span></div>
          ))}
        </div>
      </div>
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 10, padding: 24, width: 400 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Nuevo Modelo</h3>
            <label style={{ fontSize: 11, color: "#888" }}>Empresa</label>
            <select value={formEmpresa} onChange={(e) => handleChangeEmpresaModal(e.target.value)} style={{ width: "100%", background: "#222", border: "1px solid #333", color: "white", padding: 8, borderRadius: 6, marginTop: 4, marginBottom: 12 }}>
              <option value="">Selecciona Empresa</option>
              {empresas.map((e: any) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </select>
            <label style={{ fontSize: 11, color: "#888" }}>Producto</label>
            <select value={formProducto} onChange={(e) => { setFormProducto(e.target.value); const p = formProductos.find(x => x.id === e.target.value); if (p) setFormNombre(`${p.nombre.toUpperCase()}-${new Date().getFullYear()}-001`) }} style={{ width: "100%", background: "#222", border: "1px solid #333", color: "white", padding: 8, borderRadius: 6, marginTop: 4, marginBottom: 12 }}>
              <option value="">Selecciona Producto</option>
              {formProductos.map((p: any) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
            <label style={{ fontSize: 11, color: "#888" }}>Nombre Modelo</label>
            <input value={formNombre} onChange={(e) => setFormNombre(e.target.value)} placeholder="ESCALERA-2024-001" style={{ width: "100%", background: "#222", border: "1px solid #333", color: "white", padding: 8, borderRadius: 6, marginTop: 4, marginBottom: 16 }} />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button onClick={() => setShowModal(false)} style={{ background: "transparent", color: "#888", border: "none", padding: "8px 12px" }}>Cancelar</button>
              <button onClick={handleSave} style={{ background: "#ff6a00", color: "white", border: "none", padding: "8px 16px", borderRadius: 6, fontWeight: 700 }}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
