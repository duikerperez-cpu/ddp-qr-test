"use client"
import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
1
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Page() {
  const [empresas, setEmpresas] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [modelos, setModelos] = useState<any[]>([])
  
  const [empresaId, setEmpresaId] = useState("")
  const [productoId, setProductoId] = useState("")
  const [nombre, setNombre] = useState("")
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    loadEmpresas()
    loadModelos()
  }, [])

  async function loadEmpresas() {
    const { data } = await supabase.from("empresas").select("*")
    if (data) setEmpresas(data)
  }

  async function loadModelos() {
    const { data } = await supabase.from("modelos").select("*, productos(nombre), empresas(nombre)").order("created_at", { ascending: false })
    if (data) setModelos(data)
  }

  async function handleEmpresaChange(e: any) {
    const id = e.target.value
    setEmpresaId(id)
    setProductoId("")
    setProductos([])
    
    if (id) {
      const { data } = await supabase.from("productos").select("*").eq("empresa_id", id)
      console.log("Productos:", data)
      setProductos(data || [])
    }
  }

  function handleProductoChange(e: any) {
    const id = e.target.value
    console.log("Producto seleccionado:", id)
    setProductoId(id)
    const prod = productos.find(p => p.id === id)
    if (prod) {
      setNombre(`${prod.nombre.toUpperCase()}-HERCOM-${new Date().getFullYear()}-${Date.now().toString().slice(-3)}`)
    }
  }

  async function handleGuardar() {
    if (!empresaId || !productoId) {
      alert("Debes seleccionar empresa y producto")
      return
    }
    setLoading(true)
    const { error } = await supabase.from("modelos").insert({
      empresa_id: empresaId,
      producto_id: productoId,
      nombre: nombre,
    })
    setLoading(false)
    if (error) {
      alert(error.message)
    } else {
      setShowModal(false)
      setNombre("")
      setEmpresaId("")
      setProductoId("")
      loadModelos()
    }
  }

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Modelos ({modelos.length})</h1>
        <button onClick={() => setShowModal(true)} className="bg-orange-500 px-4 py-2 rounded font-bold">+ Nuevo Modelo</button>
      </div>

      <div className="grid gap-2">
        {modelos.map((m: any) => (
          <div key={m.id} className="bg-zinc-900 p-3 rounded border border-zinc-800">
            {m.nombre} - {m.productos?.nombre || 'Sin producto'} - {m.empresas?.nombre || 'Sin empresa'}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-bold">Nuevo Modelo</h2>
            
            <div>
              <label className="text-sm text-zinc-400">Empresa</label>
              <select value={empresaId} onChange={handleEmpresaChange} className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded p-2 text-white">
                <option value="">Selecciona Empresa</option>
                {empresas.map((e: any) => (
                  <option key={e.id} value={e.id}>{e.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-zinc-400">Producto</label>
              <select 
                value={productoId} 
                onChange={handleProductoChange} 
                disabled={!empresaId}
                className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded p-2 text-white disabled:opacity-50"
              >
                <option value="">Selecciona Producto</option>
                {productos.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
              {empresaId && productos.length === 0 && (
                <p className="text-xs text-red-400 mt-1">No hay productos para esta empresa</p>
              )}
            </div>

            <div>
              <label className="text-sm text-zinc-400">Nombre Modelo</label>
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded p-2 text-white" placeholder="ESCALERA-2024-001" />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowModal(false)} className="text-zinc-400 px-3 py-2">Cancelar</button>
              <button onClick={handleGuardar} disabled={loading} className="bg-orange-500 px-4 py-2 rounded disabled:opacity-50 font-bold">
                {loading ? "Guardando..." : "Guardar Modelo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
