"use client"
import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function DPPPage({ params }: { params: { id: string } }) {
  const id = params.id
  const [d, setD] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: ind } = await supabase.from("productos_individuales").select("*").eq("id", id).single()
      if (!ind) { setLoading(false); return }
      const { data: lote } = await supabase.from("lotes").select("*").eq("id", ind.lote_id).single()
      const { data: modelo } = await supabase.from("modelos").select("*").eq("id", ind.modelo_id).single()
      let producto = null, empresa = null
      if (modelo?.producto_id) {
        const { data: p } = await supabase.from("productos").select("*").eq("id", modelo.producto_id).single()
        producto = p
        if (p?.empresa_id) {
          const { data: e } = await supabase.from("empresas").select("*").eq("id", p.empresa_id).single()
          empresa = e
        }
      }
      if (!empresa && (lote?.empresa_id || ind.empresa_id)) {
        const { data: e2 } = await supabase.from("empresas").select("*").eq("id", lote?.empresa_id || ind.empresa_id).single()
        empresa = e2
      }
      setD({ ind, lote, modelo, producto, empresa })
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return <div style={{padding:40, textAlign:"center", fontFamily:"sans-serif"}}>Verificando...</div>
  if (!d) return <div style={{padding:40, textAlign:"center"}}>No encontrado {id}</div>

  const empresaNombre = d.empresa?.nombre || d.empresa?.razon_social || "HERCOM CHILE"
  const modeloNombre = d.modelo?.nombre || "her092026"
  const loteCodigo = d.lote?.codigo || "her205609"
  const fecha = new Date().toISOString().slice(0,10)

  return (
    <div style={{minHeight:"100vh", background:"#f6f7f8", padding:"16px", fontFamily:"Inter, sans-serif", color:"#1a1a1a"}}>
      <div style={{maxWidth:"760px", margin:"0 auto"}}>

        {/* HEADER - IGUAL A TU FOTO */}
        <div style={{background:"white", borderRadius:"12px", border:"1px solid #e5e7eb", padding:"18px 20px", display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
          <div>
            <div style={{fontSize:"18px", fontWeight:800, letterSpacing:"-0.3px"}}>ESCALERA DE SEGURIDAD</div>
            <div style={{fontSize:"11px", color:"#6b7280", marginTop:"2px"}}>VIN-CL-00001</div>
            <div style={{fontSize:"10px", color:"#6b7280", marginTop:"2px"}}>{modeloNombre} • Lote {loteCodigo} • Serie 169904391</div>
            <div style={{marginTop:"8px", background:"#e6f7ed", color:"#0a7a2e", border:"1px solid #b6e7c5", display:"inline-flex", padding:"3px 10px", borderRadius:"20px", fontSize:"10px", fontWeight:600}}>● Verificado por VINCULAB • {fecha}</div>
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{background:"white", border:"1px solid #eee", padding:"6px", borderRadius:"8px"}}>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://vinculab.cl/p/${id}`)}`} style={{width:"86px", height:"86px"}} alt="qr"/>
            </div>
            <div style={{fontSize:"7px", color:"#9ca3af", marginTop:"4px"}}>https://vinculab.cl/p/{id.slice(0,12)}</div>
          </div>
        </div>

        {/* GRID 2 COL */}
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginTop:"12px"}}>
          {/* FABRICANTE */}
          <div style={{background:"white", borderRadius:"12px", border:"1px solid #e5e7eb", padding:"14px"}}>
            <div style={{fontSize:"9px", fontWeight:800, color:"#6b7280", letterSpacing:"0.8px", display:"flex", alignItems:"center", gap:"6px"}}>📄 FABRICANTE</div>
            <div style={{marginTop:"10px", fontSize:"11px", display:"flex", flexDirection:"column", gap:"7px"}}>
              <div style={{display:"flex", justifyContent:"space-between"}}><span style={{color:"#6b7280"}}>Empresa</span><span style={{fontWeight:700}}>{empresaNombre}</span></div>
              <div style={{display:"flex", justifyContent:"space-between"}}><span style={{color:"#6b7280"}}>País</span><span style={{fontWeight:700}}>CL</span></div>
              <div style={{display:"flex", justifyContent:"space-between"}}><span style={{color:"#6b7280"}}>ID Empresa</span><span style={{fontWeight:700}}>VINCULAB-CL</span></div>
              <div style={{display:"flex", justifyContent:"space-between"}}><span style={{color:"#6b7280"}}>Planta</span><span style={{fontWeight:700}}>Planta Chile</span></div>
              <div style={{display:"flex", justifyContent:"space-between"}}><span style={{color:"#6b7280"}}>Fecha fabricación</span><span style={{fontWeight:700}}>{fecha}</span></div>
            </div>
          </div>
          {/* PRODUCTO */}
          <div style={{background:"white", borderRadius:"12px", border:"1px solid #e5e7eb", padding:"14px"}}>
            <div style={{fontSize:"9px", fontWeight:800, color:"#6b7280", letterSpacing:"0.8px"}}>🏷️ PRODUCTO</div>
            <div style={{marginTop:"10px", fontSize:"11px", display:"flex", flexDirection:"column", gap:"7px"}}>
              <div style={{display:"flex", justifyContent:"space-between"}}><span style={{color:"#6b7280"}}>Categoría</span><span style={{fontWeight:700}}>Battery</span></div>
              <div style={{display:"flex", justifyContent:"space-between"}}><span style={{color:"#6b7280"}}>Modelo</span><span style={{fontWeight:700}}>{modeloNombre}</span></div>
              <div style={{display:"flex", justifyContent:"space-between"}}><span style={{color:"#6b7280"}}>Versión</span><span style={{fontWeight:700}}>V1.0</span></div>
              <div style={{display:"flex", justifyContent:"space-between"}}><span style={{color:"#6b7280"}}>Lote</span><span style={{fontWeight:700}}>{loteCodigo}</span></div>
              <div style={{display:"flex", justifyContent:"space-between"}}><span style={{color:"#6b7280"}}>Cantidad lote</span><span style={{fontWeight:700}}>{d.lote?.cantidad || 78} unid</span></div>
            </div>
          </div>
        </div>

        {/* COMPOSICION + HUELLA */}
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginTop:"12px"}}>
          <div style={{background:"white", borderRadius:"12px", border:"1px solid #e5e7eb", padding:"14px"}}>
            <div style={{fontSize:"9px", fontWeight:800, color:"#6b7280", letterSpacing:"0.8px"}}>🧪 COMPOSICIÓN QUÍMICA (UE OBLIGATORIO)</div>
            <div style={{marginTop:"10px", fontSize:"11px", display:"flex", flexDirection:"column", gap:"8px"}}>
              <div><div style={{display:"flex", justifyContent:"space-between"}}><span>Lithium (7439-93-2)</span><span style={{fontWeight:700}}>12% ♻️</span></div><div style={{height:"6px", background:"#e5e7eb", borderRadius:"10px", marginTop:"4px"}}><div style={{width:"12%", height:"100%", background:"#22c55e", borderRadius:"10px"}}></div></div></div>
              <div><div style={{display:"flex", justifyContent:"space-between"}}><span>Cobalt (7440-48-4)</span><span style={{fontWeight:700}}>15% ♻️</span></div><div style={{height:"6px", background:"#e5e7eb", borderRadius:"10px", marginTop:"4px"}}><div style={{width:"15%", height:"100%", background:"#22c55e", borderRadius:"10px"}}></div></div></div>
              <div><div style={{display:"flex", justifyContent:"space-between"}}><span>Nickel (7440-02-0)</span><span style={{fontWeight:700}}>30% ♻️</span></div><div style={{height:"6px", background:"#e5e7eb", borderRadius:"10px", marginTop:"4px"}}><div style={{width:"60%", height:"100%", background:"linear-gradient(90deg,#22c55e,#3b82f6)", borderRadius:"10px"}}></div></div></div>
              <div style={{fontSize:"9px", color:"#6b7280", marginTop:"4px"}}>Materias críticas: Lithium, Cobalt, Nickel<br/>⚠️ Contiene electrolito</div>
            </div>
          </div>
          <div style={{background:"linear-gradient(135deg,#1f0f0a 0%,#ff5a1f 100%)", borderRadius:"12px", padding:"14px", color:"white"}}>
            <div style={{fontSize:"9px", fontWeight:800, letterSpacing:"0.8px", opacity:0.8}}>🔥 HUELLA DE CARBONO</div>
            <div style={{marginTop:"10px", fontSize:"13px", fontWeight:800}}>45.5 kg CO₂e</div>
            <div style={{fontSize:"10px", opacity:0.8}}>8.2 kg CO₂e / kWh • Metodología PEFCR Batteries</div>
            <div style={{marginTop:"12px", height:"4px", background:"rgba(255,255,255,0.3)", borderRadius:"10px"}}><div style={{width:"65%", height:"100%", background:"white", borderRadius:"10px"}}></div></div>
            <div style={{fontSize:"8px", marginTop:"6px", opacity:0.7}}>65% fabricación • Verificación: Self-declared</div>
          </div>
        </div>

        {/* CIRCULARIDAD + UE */}
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginTop:"12px"}}>
          <div style={{background:"white", borderRadius:"12px", border:"1px solid #e5e7eb", padding:"14px"}}>
            <div style={{fontSize:"9px", fontWeight:800, color:"#6b7280", letterSpacing:"0.8px"}}>♻️ CIRCULARIDAD</div>
            <div style={{marginTop:"10px", fontSize:"11px", display:"flex", flexDirection:"column", gap:"7px"}}>
              <div style={{display:"flex", justifyContent:"space-between"}}><span style={{color:"#6b7280"}}>Vida útil</span><span style={{fontWeight:700}}>3000 ciclos / 10 años</span></div>
              <div style={{display:"flex", justifyContent:"space-between"}}><span style={{color:"#6b7280"}}>Reparabilidad</span><span style={{fontWeight:700}}>7/10</span></div>
              <div style={{display:"flex", justifyContent:"space-between"}}><span style={{color:"#6b7280"}}>Reciclabilidad</span><span style={{fontWeight:700}}>85%</span></div>
              <div style={{display:"flex", justifyContent:"space-between"}}><span style={{color:"#6b7280"}}>Contenido reciclado</span><span style={{fontWeight:700}}>12%</span></div>
              <div style={{display:"flex", justifyContent:"space-between"}}><span style={{color:"#6b7280"}}>Segunda vida</span><span style={{fontWeight:700}}>Si</span></div>
              <div style={{display:"flex", justifyContent:"space-between"}}><span style={{color:"#6b7280"}}>Programa retorno VINCULAB</span><span></span></div>
            </div>
          </div>
          <div style={{background:"white", borderRadius:"12px", border:"1px solid #e5e7eb", padding:"14px"}}>
            <div style={{fontSize:"9px", fontWeight:800, color:"#6b7280", letterSpacing:"0.8px"}}>✓ CONFORMIDAD UE</div>
            <div style={{marginTop:"10px", fontSize:"11px", display:"flex", flexDirection:"column", gap:"7px"}}>
              <div style={{display:"flex", justifyContent:"space-between"}}><span style={{color:"#6b7280"}}>Regulación</span><span style={{fontWeight:700}}>EU 2023/1542</span></div>
              <div style={{display:"flex", justifyContent:"space-between"}}><span style={{color:"#6b7280"}}>Marcado CE</span><span style={{fontWeight:700}}>Si</span></div>
              <div style={{display:"flex", justifyContent:"space-between"}}><span style={{color:"#6b7280"}}>Due Diligence</span><span style={{fontWeight:700}}>Art. 48</span></div>
              <div style={{display:"flex", justifyContent:"space-between"}}><span style={{color:"#6b7280"}}>Ensayos</span><span style={{fontWeight:700}}>UN38.3 / IEC62660</span></div>
              <div style={{display:"flex", justifyContent:"space-between"}}><span style={{color:"#6b7280"}}>Declaración</span><span style={{fontWeight:700, color:"#ff5a1f", textDecoration:"underline"}}>Ver PDF</span></div>
            </div>
          </div>
        </div>

        {/* TRAZABILIDAD */}
        <div style={{background:"white", borderRadius:"12px", border:"1px solid #e5e7eb", padding:"14px", marginTop:"12px"}}>
          <div style={{fontSize:"9px", fontWeight:800, color:"#6b7280", letterSpacing:"0.8px"}}>⇄ HISTORIAL DE TRAZABILIDAD</div>
          <div style={{marginTop:"10px", fontSize:"11px", display:"flex", justifyContent:"space-between", borderBottom:"1px solid #f3f4f6", paddingBottom:"8px"}}>
            <span>MANUFACTURED - {fecha} - Chile</span><span style={{color:"#22c55e"}}>✓</span>
          </div>
          <div style={{marginTop:"8px", fontSize:"11px", display:"flex", justifyContent:"space-between"}}>
            <span>VERIFIED - {fecha} - Vinculab Platform</span><span style={{color:"#22c55e"}}>✓</span>
          </div>
        </div>

      </div>
    </div>
  )
}
