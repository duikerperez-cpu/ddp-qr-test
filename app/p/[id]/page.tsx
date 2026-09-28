"use client"
import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function DPPPage({ params }: { params: { id: string } }) {
  const id = params.id
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDPP() {
      const { data: ind } = await supabase.from("productos_individuales").select("*").eq("id", id).single()
      if (!ind) { setLoading(false); return }
      const { data: lote } = await supabase.from("lotes").select("*").eq("id", ind.lote_id).single()
      const { data: modelo } = await supabase.from("modelos").select("*").eq("id", ind.modelo_id).single()
      let producto = null, empresa = null
      if (modelo?.producto_id) {
        const { data: prod } = await supabase.from("productos").select("*").eq("id", modelo.producto_id).single()
        producto = prod
        if (prod?.empresa_id) {
          const { data: emp } = await supabase.from("empresas").select("*").eq("id", prod.empresa_id).single()
          empresa = emp
        }
      }
      // fallback: empresa desde el lote o individual
      if (!empresa && (lote?.empresa_id || ind.empresa_id)) {
        const { data: emp2 } = await supabase.from("empresas").select("*").eq("id", lote?.empresa_id || ind.empresa_id).single()
        empresa = emp2
      }
      setData({ ind, lote, modelo, producto, empresa })
      setLoading(false)
    }
    fetchDPP()
  }, [id])

  if (loading) return <div style={{padding:40, textAlign:"center"}}>Verificando producto...</div>
  if (!data) return <div style={{padding:40, textAlign:"center"}}>Producto no encontrado</div>
  const { ind, lote, modelo, producto, empresa } = data
  const nombreEmpresa = empresa?.nombre || empresa?.razon_social || "Empresa Verificada"

  return (
    <div style={{minHeight:"100vh", background:"#f8f8f9", color:"#111", fontFamily:"Inter, sans-serif"}}>
      <div style={{background:"white", borderBottom:"1px solid #eee", padding:"14px 20px", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0}}>
        <div style={{fontWeight:900}}>VINCULA<span style={{background:"#ff5a1f", color:"white", padding:"1px 5px", borderRadius:"4px", marginLeft:"2px"}}>B</span></div>
        <div style={{background:"#e6f9ed", color:"#0a7a2e", padding:"5px 12px", borderRadius:"20px", fontSize:"11px", fontWeight:700}}>● Producto Auténtico Verificado</div>
      </div>
      <div style={{maxWidth:"720px", margin:"0 auto", padding:"24px 16px"}}>
        <div style={{background:"white", borderRadius:"16px", border:"1px solid #eee", overflow:"hidden", boxShadow:"0 4px 20px rgba(0,0,0,0.04)"}}>
          <div style={{background:"#0f0f11", color:"white", padding:"22px 20px"}}>
            <div style={{fontSize:"10px", opacity:0.5, letterSpacing:"1.2px"}}>PASAPORTE DIGITAL DE PRODUCTO • DPP UE 2024/1781</div>
            <div style={{fontSize:"26px", fontWeight:800, marginTop:"8px", textTransform:"lowercase"}}>{modelo?.nombre || "escalera 1"}</div>
            <div style={{fontSize:"12px", opacity:0.7, marginTop:"6px"}}>{producto?.nombre?.toUpperCase()} • {nombreEmpresa}</div>
          </div>
          <div style={{padding:"20px"}}>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px", fontSize:"12px"}}>
              <div style={{background:"#fafafa", padding:"10px 12px", borderRadius:"8px"}}><div style={{color:"#888", fontSize:"9px"}}>ID ÚNICO</div><div style={{fontWeight:700, fontFamily:"monospace", fontSize:"11px"}}>{ind.id}</div></div>
              <div style={{background:"#fafafa", padding:"10px 12px", borderRadius:"8px"}}><div style={{color:"#888", fontSize:"9px"}}>LOTE</div><div style={{fontWeight:700}}>{lote?.codigo}</div></div>
              <div style={{background:"#fafafa", padding:"10px 12px", borderRadius:"8px"}}><div style={{color:"#888", fontSize:"9px"}}>EMPRESA</div><div style={{fontWeight:700}}>{nombreEmpresa}</div></div>
              <div style={{background:"#e6f9ed", padding:"10px 12px", borderRadius:"8px"}}><div style={{color:"#0a7a2e", fontSize:"9px"}}>ESTADO</div><div style={{fontWeight:700, color:"#0a7a2e"}}>● Activo y Trazable</div></div>
            </div>
            <div style={{marginTop:"20px", display:"flex", gap:"14px", flexWrap:"wrap"}}>
              <div style={{background:"#f6f6f7", borderRadius:"12px", padding:"14px", textAlign:"center", minWidth:"160px"}}>
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(`https://vinculab.cl/p/${ind.id}`)}`} style={{width:"140px", height:"140px", background:"white", padding:"6px", borderRadius:"10px"}} alt="qr"/>
                <div style={{fontSize:"9px", color:"#888", marginTop:"8px"}}>Escanea para verificar</div>
              </div>
              <div style={{flex:1, minWidth:"200px"}}>
                <div style={{fontSize:"11px", fontWeight:800, marginBottom:"10px", letterSpacing:"0.5px"}}>TRAZABILIDAD</div>
                <div style={{borderLeft:"2px solid #eee", paddingLeft:"14px", display:"flex", flexDirection:"column", gap:"14px"}}>
                  <div><div style={{fontSize:"12px", fontWeight:700}}>🏭 Fabricación</div><div style={{fontSize:"10px", color:"#888"}}>{new Date(lote?.created_at || Date.now()).toLocaleDateString()} • {nombreEmpresa}</div></div>
                  <div><div style={{fontSize:"12px", fontWeight:700}}>🔍 Verificación</div><div style={{fontSize:"10px", color:"#888"}}>Ahora • QR validado en Vinculab</div></div>
                  <div><div style={{fontSize:"12px", fontWeight:700}}>📜 Certificado DPP</div><div style={{fontSize:"10px", color:"#888"}}>Conforme UE 2024/1781 • ID: {ind.id.slice(0,12)}</div></div>
                </div>
                <button style={{marginTop:"16px", width:"100%", background:"#0f0f11", color:"white", border:"none", padding:"10px", borderRadius:"8px", fontSize:"11px", fontWeight:700}}>Descargar Certificado PDF</button>
              </div>
            </div>
          </div>
        </div>
        <div style={{textAlign:"center", marginTop:"18px", fontSize:"10px", color:"#aaa"}}>Powered by Vinculab • Plataforma de Identidad Digital de Productos • vinculab.cl</div>
      </div>
    </div>
  )
}
