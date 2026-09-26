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
  const [lotes, setLotes] = useState<any[]>([])
  const [tab, setTab] = useState("dashboard")

  // Form Nuevo Modelo
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
    const { data: l } = await supabase.from("lotes").select("*")
    if(e) setEmpresas(e)
    if(p) setProductos(p)
    if(m) setModelos(m)
    if(l) setLotes(l)
  }

  async function onEmpresaChange(id: string) {
    setSelEmpresa(id)
    setSelProducto("")
    if(!id) { setProductosFiltrados([]); return }
    const { data } = await supabase.from("productos").select("*").eq("empresa_id", id)
    setProductosFiltrados(data || [])
  }

  async function guardarModelo() {
    if(!selEmpresa ||!selProducto ||!nombreModelo) return alert("Selecciona empresa, producto y nombre")
    const { error } = await supabase.from("modelos").insert({ empresa_id: selEmpresa, producto_id: selProducto, nombre: nombreModelo })
    if(error) alert(error.message)
    else { setShowModal(false); setNombreModelo(""); load() }
  }

  const MenuItem = ({ icon, label, active, onClick }: any) => (
    <div onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", margin: "2px 0", borderRadius: 6, cursor: "pointer", fontSize: 13, color: active ? "#fff" : "#888", background: active ? "#ff6a001a" : "transparent", borderLeft: active ? "2px solid #ff6a00" : "2px solid transparent" }}>
      <span style={{ color: "#ff6a00" }}>{icon}</span> {label}
    </div>
  )

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#080808", color: "white", fontFamily: "Inter" }}>
      <div style={{ width: 240, background: "#111113", borderRight: "1px solid #1e1e1e", padding: 16, display: "flex", flexDirection: "column" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 900, fontSize: 22, letterSpacing: 1 }}>VINCULA<span style={{ color: "#ff6a00" }}>B</span></div>
          <div style={{ fontSize: 9, color: "#666", letterSpacing: 2, marginTop: 2 }}>DIGITAL PRODUCT IDENTITY</div>
        </div>

        <div style={{ fontSize: 10, color: "#555", letterSpacing: 1.5, margin: "16px 0 8px 0" }}>PRINCIPAL</div>
        <MenuItem icon="◫" label="Dashboard" active={tab === "dashboard"} onClick={() => setTab("dashboard")} />

        <div style={{ fontSize: 10, color: "#555", letterSpacing: 1.5, margin: "20px 0 8px 0" }}>GESTIÓN</div>
        <MenuItem icon="◫" label="Empresas" active={tab === "empresas"} onClick={() => setTab("empresas")} />
        <MenuItem icon="◇" label="Productos" active={tab === "productos"} onClick={() => setTab("productos")} />
        <MenuItem icon="◇" label="Modelos" active={tab === "modelos"} onClick={() => setTab("modelos")} />
        <MenuItem icon="☰" label="Lotes" active={tab === "lotes"} onClick={() => setTab("lotes")} />
        <MenuItem icon="◍" label="Productos Individuales" active={tab === "individuales"} onClick={() => setTab("individuales")} />

        <div style={{ fontSize: 10, color: "#555", letterSpacing: 1.5, margin: "20px 0 8px 0" }}>IDENTIDAD DIGITAL</div>
        <MenuItem icon="◫" label="DPP" active={false} />
        <MenuItem icon="⌁" label="NFC / QR" active={false} />
        <MenuItem icon="✓" label="Certificados" active={false} />
        <MenuItem icon="◍" label="Trazabilidad" active={false} />
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ height: 56, borderBottom: "1px solid #1e1e1e", background: "#111113", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" }}>
          <div style={{ fontSize: 10, color: "#555", letterSpacing: 1 }}>PLATAFORMA DE IDENTIDAD DIGITAL DE PRODUCTOS</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 9, color: "#666" }}>USUARIO</div>
              <div style={{ fontSize: 12, fontWeight: 700 }}>Administrador</div>
            </div>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#ff6a00", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12 }}>A</div>
          </div>
        </div>

        <div style={{ padding: 32 }}>
          {tab === "dashboard" && (
            <>
              <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Dashboard</h1>
              <p style={{ fontSize: 13, color: "#666", marginBottom: 24 }}>Vista general de la plataforma Vinculab.</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                {[
                  { label: "EMPRESAS", value: empresas.length },
                  { label: "PRODUCTOS", value: productos.length },
                  { label: "MODELOS", value: modelos.length },
                  { label: "LOTES", value: lotes.length },
                ].map((c) => (
                  <div key={c.label} style={{ background: "#151518", border: "1px solid #222", borderLeft: "2px solid #ff6a00", borderRadius: 8, padding: 20 }}>
                    <div style={{ fontSize: 10, color: "#666", letterSpacing: 1.5, marginBottom: 12 }}>{c.label}</div>
                    <div style={{ fontSize: 32, fontWeight: 800 }}>{c.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
                <button onClick={() => setShowModal(true)} style={{ background: "#ff6a00", color: "white", border: "none", padding: "10px 18px", borderRadius: 6, fontWeight: 700, fontSize: 13 }}>+ Nuevo Modelo</button>
                <button onClick={() => setTab("modelos")} style={{ background: "#1e1e1e", color: "white", border: "1px solid #333", padding: "10px 18px", borderRadius: 6, fontSize: 13 }}>Ver Modelos ({modelos.length})</button>
              </div>
            </>
          )}

          {tab === "modelos" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700 }}>Modelos ({modelos.length})</h2>
                <button onClick={() => setShowModal(true)} style={{ background: "#ff6a00", color: "white", border: "none", padding: "8px 14px", borderRadius: 6, fontWeight: 700, fontSize: 12 }}>+ Nuevo Modelo</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {modelos.map((m: any) => (
                  <div key={m.id} style={{ background: "#151518", border: "1px solid #222", padding: 14, borderRadius: 6, fontSize: 13, display: "flex", justifyContent: "space-between" }}>
                    <b>{m.nombre}</b><span style={{ color: "#666" }}>{m.empresa_id?.slice(0,8)}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === "productos" && (
            <>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Productos ({productos.length})</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {productos.map((p: any) => (
                  <div key={p.id} style={{ background: "#151518", border: "1px solid #222", padding: 14, borderRadius: 6, fontSize: 13 }}>
                    <b>{p.nombre}</b> <span style={{ color: "#666" }}>- {p.categoria || "GENERAL"}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#1a1a1e", border: "1px solid #2a2a2e", borderRadius: 12, padding: 24, width: 460 }}>
            <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Nuevo Modelo</h3>

            <label style={{ fontSize: 10, color: "#888", letterSpacing: 1 }}>EMPRESA</label>
            <select value={selEmpresa} onChange={(e) => onEmpresaChange(e.target.value)} style={{ width: "100%", background: "#222227", border: "1px solid #333", color: "white", padding: 10, borderRadius: 6, marginTop: 4, marginBottom: 16 }}>
              <option value="">Selecciona Empresa</option>
              {empresas.map((e: any) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </select>

            <label style={{ fontSize: 10, color: "#888", letterSpacing: 1 }}>PRODUCTO - YA FUNCIONA</label>
            <select value={selProducto} onChange={(e) => {
              setSelProducto(e.target.value)
              const p = productosFiltrados.find(x => x.id === e.target.value)
              if(p) setNombreModelo(`${p.nombre.toUpperCase()}-${new Date().getFullYear()}-001`)
            }} style={{ width: "100%", background: "#222227", border: "1px solid #333", color: "white", padding: 10, borderRadius: 6, marginTop: 4, marginBottom: 16 }}>
              <option value="">Selecciona Producto</option>
              {productosFiltrados.map((p: any) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>

            <label style={{ fontSize: 10, color: "#888", letterSpacing: 1 }}>NOMBRE MODELO</label>
            <input value={nombreModelo} onChange={(e) => setNombreModelo(e.target.value)} placeholder="ESCALERA-2024-001" style={{ width: "100%", background: "#222227", border: "1px solid #333", color: "white", padding: 10, borderRadius: 6, marginTop: 4, marginBottom: 20 }} />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => setShowModal(false)} style={{ background: "transparent", color: "#888", border: "none", padding: "8px 14px" }}>Cancelar</button>
              <button onClick={guardarModelo} style={{ background: "#ff6a00", color: "white", border: "none", padding: "8px 18px", borderRadius: 6, fontWeight: 700 }}>Guardar Modelo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
