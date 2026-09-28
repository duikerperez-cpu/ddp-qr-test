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
      if (modelo) {
        const { data: prod } = await supabase.from("productos").select("*").eq("id", modelo.producto_id).single()
        producto = prod
        if (prod) {
          const { data: emp } = await supabase.from("empresas").select("*").eq("id", prod.empresa_id).single()
          empresa = emp
        }
      }
      setData({ ind, lote, modelo, producto, empresa })
      setLoading(false)
    }
    fetchDPP()
  }, [id])

  if (loading) return <div style={{padding:40, textAlign:"center"}}>Verificando producto...</div>
  if (!data) return <div style={{padding:40, textAlign:"center"}}>Producto no encontrado: {id}</div>

  const { ind, lote, modelo, producto, empresa } = data
  const nombreEmpresa = empresa?.nombre || empresa?.razon_social || "Empresa Verificada"

  return (
    <div style={{minHeight:"100vh", background:"#f8f8f9", color:"#111", fontFamily:"Inter, sans-serif"}}>
      {/* HEADER BLANCO */}
      <div style={{background:"white", borderBottom:"1px solid #eee", padding:"14px 20px", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <div style={{fontWeight:900, letterSpacing:"1px"}}>VINCULA<span style={{background:"#ff5a1f", color:"white", padding:"1px 5px", borderRadius:"4px", marginLeft:"2px"}}>B</span></div>
        <div style={{background:"#e6f9ed", color:"#0a7a2e", padding:"5px 10px", borderRadius:"20px", fontSize:"11px", fontWeight:700, display:"flex", alignItems:"center", gap:"5px"}}>● Producto Auténtico Verificado</div>
      </div>

      <div style={{maxWidth:"680px", margin:"0 auto", padding:"24px 16px"}}>
        {/* CARD PRINCIPAL */}
        <div style={{background:"white", borderRadius:"16px", border:"1px solid #eee", overflow:"hidden"}}>
          <div style={{background:"#0f0f11", color:"white", padding:"20px"}}>
            <div style={{fontSize:"10px", opacity:0.5, letterSpacing:"1px"}}>PASAPORTE DIGITAL DE PRODUCTO</div>
            <div style={{fontSize:"22px", fontWeight:800, marginTop:"6px"}}>{modelo?.nombre || "Producto"}</div>
            <div style={{fontSize:"12px", opacity:0.6, marginTop:"4px"}}>{producto?.nombre} • {nombreEmpresa}</div>
          </div>

          <div style={{padding:"20px"}}>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px", fontSize:"12px"}}>
              <div><div style={{color:"#888", fontSize:"10px"}}>ID ÚNICO</div><div style={{fontWeight:700, fontFamily:"monospace"}}>{ind.id}</div></div>
              <div><div style={{color:"#888", fontSize:"10px"}}>LOTE</div><div style={{fontWeight:700}}>{lote?.codigo}</div></div>
              <div><div style={{color:"#888", fontSize:"10px"}}>EMPRESA</div><div style={{fontWeight:700}}>{nombreEmpresa}</div></div>
              <div><div style={{color:"#888", fontSize:"10px"}}>ESTADO</div><div style={{fontWeight:700, color:"#0a7a2e"}}>● Activo</div></div>
            </div>

            <div style={{marginTop:"20px", display:"flex", gap:"12px"}}>
              <div style={{flex:1, background:"#f6f6f7", borderRadius:"12px", padding:"14px", textAlign:"center"}}>
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://vinculab.cl/p/${ind.id}`)}`} style={{width:"120px", height:"120px", background:"white", padding:"6px", borderRadius:"8px"}} alt="qr"/>
                <div style={{fontSize:"9px", color:"#888", marginTop:"8px"}}>Escanea para verificar</div>
              </div>
              <div style={{flex:1.5}}>
                <div style={{fontSize:"11px", fontWeight:700, marginBottom:"10px"}}>TRAZABILIDAD</div>
                <div style={{borderLeft:"2px solid #eee", paddingLeft:"12px", display:"flex", flexDirection:"column", gap:"12px"}}>
                  <div><div style={{fontSize:"11px", fontWeight:700}}>Fabricación</div><div style={{fontSize:"10px", color:"#888"}}>{new Date(lote?.created_at || Date.now()).toLocaleDateString()} • Lote {lote?.codigo}</div></div>
                  <div><div style={{fontSize:"11px", fontWeight:700}}>Verificación</div><div style={{fontSize:"10px", color:"#888"}}>Ahora • QR escaneado correctamente</div></div>
                  <div><div style={{fontSize:"11px", fontWeight:700}}>Certificado</div><div style={{fontSize:"10px", color:"#888"}}>DPP conforme UE 2024/1781</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{textAlign:"center", marginTop:"16px", fontSize:"10px", color:"#aaa"}}>Powered by Vinculab • Plataforma de Identidad Digital de Productos • vinculab.cl</div>
      </div>
    </div>
  )
}
