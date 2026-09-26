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
