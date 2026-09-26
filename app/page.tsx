"use client"
import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Page("use client"
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

    if (emps) {
      setEmpresas(emps)
      if (!selectedEmpresa && emps.length > 0) setSelectedEmpresa(emps[0])
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
    <div style={{ display: "flex", minHeight: "100vh", background: "#0a0a0a", color: "white", fontFamily: "Inter, sans-serif" }}>
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
          <h1 style={{ fontSize: 28, fontFamily: "serif", fontWeight: 700 }}>{view === "productos"? `Productos (${productosDeEmpresa.length})` : `Modelos (${modelosDeEmpresa.length})`}</h1>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setView("productos")} style={{ background: view === "productos"? "#222" : "transparent", border: "1px solid #333", color: "white", padding: "6px 12px", borderRadius: 6, fontSize: 12 }}>Productos</button>
            <button onClick={() => setView("modelos")} style={{ background: view === "modelos"? "#222" : "transparent", border: "1px solid #333", color: "white", padding: "6px 12px", borderRadius: 6, fontSize: 12 }}>Modelos</button>
            <button onClick={handleOpenModal} style={{ background: "#ff6a00", border: "none", color: "white", padding: "6px 16px", borderRadius: 6, fontWeight: 700, fontSize: 12 }}>+ Nuevo</button>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {view === "productos"? productosDeEmpresa.map((p: any) => (
            <div key={p.id} style={{ background: "#151515", border: "1px solid #222", padding: 12, borderRadius: 6, fontSize: 13 }}>
              <b>{p.nombre}</b> <span style={{ color: "#666" }}>- {p.sku || p.categoria || "ESTRUCTURAS METALICAS"}</span>
            </div>
          )) : modelosDeEmpresa.map((m: any) => (
            <div key={m.id} style={{ background: "#151515", border: "1px solid #222", padding: 12, borderRadius: 6, fontSize: 13, display: "flex", justifyContent: "space-between" }}>
              <b>{m.nombre}</b> <span style={{ color: "#666" }}>{m.productos?.nombre}</span>
            </div>
          ))}
          {view === "productos" && productosDeEmpresa.length === 0 && <div style={{ color: "#666", fontSize: 12, marginTop: 20 }}>No hay productos vinculados a {selectedEmpresa?.nombre}. Ve a Supabase y vincula productos a esta empresa.</div>}
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

            <label style={{ fontSize: 11, color: "#888" }}>Producto - AHORA SI FUNCIONA</label>
            <select value={formProducto} onChange={(e) => {
              setFormProducto(e.target.value)
              const p = formProductos.find(x => x.id === e.target.value)
              if (p) setFormNombre(`${p.nombre.toUpperCase()}-${new Date().getFullYear()}-001`)
            }} style={{ width: "100%", background: "#222", border: "1px solid #333", color: "white", padding: 8, borderRadius: 6, marginTop: 4, marginBottom: 12 }}>
              <option value="">Selecciona Producto</option>
              {formProductos.map((p: any) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>

            <label style={{ fontSize: 11, color: "#888" }}>Nombre Modelo</label>
            <input value={formNombre} onChange={(e) => setFormNombre(e.target.value)} placeholder="ESCALERA-2024-001" style={{ width: "100%", background: "#222", border: "1px solid #333", color: "white", padding: 8, borderRadius: 6, marginTop: 4, marginBottom: 16 }} />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button onClick={() => setShowModal(false)} style={{ background: "transparent", color: "#888", border: "none", padding: "8px 12px" }}>Cancelar</button>
              <button onClick={handleSave} style={{ background: "#ff6a00", color: "white", border: "none", padding: "8px 16px", borderRadius: 6, fontWeight: 700 }}>Guardar Modelo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}) {
  const [empresas, setEmpresas] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [modelos, setModelos] = useState<any[]>([])
  const [selectedEmpresa, setSelectedEmpresa] = useState<string>("")
  const [activeTab, setActiveTab] = useState<"productos" | "modelos">("productos")

  // Modal Nuevo Modelo
  const [showModal, setShowModal] = useState(false)
  const [empresaModal, setEmpresaModal] = useState("")
  const [productosModal, setProductosModal] = useState<any[]>([])
  const [productoModal, setProductoModal] = useState("")
  const [nombreModelo, setNombreModelo] = useState("")

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    const { data: emp } = await supabase.from("empresas").select("*")
    if (emp) {
      setEmpresas(emp)
      if (emp.length > 0 &&!selectedEmpresa) setSelectedEmpresa(emp[0].id)
    }
    const { data: prod } = await supabase.from("productos").select("*")
    if (prod) setProductos(prod)
    const { data: mod } = await supabase.from("modelos").select("*, productos(nombre), empresas(nombre)").order("created_at", { ascending: false })
    if (mod) setModelos(mod)
  }

  const productosFiltrados = productos.filter(p =>!selectedEmpresa || p.empresa_id === selectedEmpresa)
  const modelosFiltrados = modelos.filter(m =>!selectedEmpresa || m.empresa_id === selectedEmpresa)

  async function openNuevoModelo() {
    setShowModal(true)
    setEmpresaModal(selectedEmpresa)
    if (selectedEmpresa) {
      const { data } = await supabase.from("productos").select("*").eq("empresa_id", selectedEmpresa)
      setProductosModal(data || [])
    }
  }

  async function handleEmpresaModalChange(e: any) {
    const id = e.target.value
    setEmpresaModal(id)
    setProductoModal("")
    const { data } = await supabase.from("productos").select("*").eq("empresa_id", id)
    setProductosModal(data || [])
  }

  async function handleGuardarModelo() {
    if (!empresaModal ||!productoModal ||!nombreModelo) {
      alert("Completa empresa, producto y nombre")
      return
    }
    const { error } = await supabase.from("modelos").insert({
      empresa_id: empresaModal,
      producto_id: productoModal,
      nombre: nombreModelo
    })
    if (error) alert(error.message)
    else {
      setShowModal(false)
      setNombreModelo("")
      setProductoModal("")
      fetchAll()
    }
  }

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-white font-sans">
      {/* SIDEBAR */}
      <div className="w-[200px] bg-[#111] border-r border-[#222] p-4">
        <h1 className="font-black text-lg tracking-widest mb-1">VINCULA<span className="text-orange-500">B</span></h1>
        <p className="text-[10px] text-zinc-500 mb-4">{empresas.length} empresas</p>
        <div className="space-y-2">
          {empresas.map((e: any) => (
            <button
              key={e.id}
              onClick={() => setSelectedEmpresa(e.id)}
              className={`w-full text-left text-xs p-2.5 rounded border-l-2 transition ${selectedEmpresa === e.id? "bg-[#1e1e1e] border-orange-500 text-white" : "bg-[#1a1a1a] border-[#333] text-zinc-400 hover:text-white"}`}
            >
              {e.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-6">
            <button onClick={() => setActiveTab("productos")} className={`text-2xl font-serif font-bold ${activeTab === "productos"? "text-white" : "text-zinc-600"}`}>Productos ({productosFiltrados.length})</button>
            <button onClick={() => setActiveTab("modelos")} className={`text-2xl font-serif font-bold ${activeTab === "modelos"? "text-white" : "text-zinc-600"}`}>Modelos ({modelosFiltrados.length})</button>
          </div>
          <button onClick={openNuevoModelo} className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded">+ Nuevo</button>
        </div>

        {activeTab === "productos"? (
          <div className="space-y-1">
            {productosFiltrados.map((p: any) => (
              <div key={p.id} className="bg-[#151515] border border-[#222] p-3 rounded text-xs">
                <span className="font-bold">{p.nombre}</span><span className="text-zinc-500"> - {p.sku || p.categoria || "Sin categoría"}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {modelosFiltrados.map((m: any) => (
              <div key={m.id} className="bg-[#151515] border border-[#222] p-3 rounded text-xs flex justify-between">
                <span className="font-bold">{m.nombre}</span>
                <span className="text-zinc-500">{m.productos?.nombre} - {m.empresas?.nombre}</span>
              </div>
            ))}
            {modelosFiltrados.length === 0 && <p className="text-zinc-600 text-xs mt-10">No hay modelos para esta empresa. Crea uno con + Nuevo</p>}
          </div>
        )}
      </div>

      {/* MODAL NUEVO MODELO - AHORA SI SE PUEDE SELECCIONAR PRODUCTO */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6 w-full max-w-md space-y-4">
            <h2 className="font-bold">Nuevo Modelo</h2>
            <div>
              <label className="text-[11px] text-zinc-500">Empresa</label>
              <select value={empresaModal} onChange={handleEmpresaModalChange} className="w-full mt-1 bg-[#222] border border-[#333] rounded p-2 text-sm">
                <option value="">Selecciona Empresa</option>
                {empresas.map((e: any) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-zinc-500">Producto</label>
              <select value={productoModal} onChange={(e) => {
                setProductoModal(e.target.value)
                const prod = productosModal.find(x => x.id === e.target.value)
                if(prod) setNombreModelo(`${prod.nombre.toUpperCase()}-${new Date().getFullYear()}-001`)
              }} className="w-full mt-1 bg-[#222] border border-[#333] rounded p-2 text-sm">
                <option value="">Selecciona Producto</option>
                {productosModal.map((p: any) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-zinc-500">Nombre Modelo</label>
              <input value={nombreModelo} onChange={(e) => setNombreModelo(e.target.value)} className="w-full mt-1 bg-[#222] border border-[#333] rounded p-2 text-sm" placeholder="ESCALERA-2024-001" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowModal(false)} className="text-zinc-500 text-xs px-3 py-2">Cancelar</button>
              <button onClick={handleGuardarModelo} className="bg-orange-500 text-xs font-bold px-4 py-2 rounded">Guardar Modelo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
