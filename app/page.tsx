"use client"
import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function Page() {
  const [stats, setStats] = useState({empresas:0, productos:0, modelos:0, lotes:0})
  const [tab, setTab] = useState("dashboard")

  useEffect(()=>{ load() },[])
  async function load(){
    const {count:e} = await supabase.from("empresas").select("*", {count:'exact', head:true})
    const {count:p} = await supabase.from("productos").select("*", {count:'exact', head:true})
    const {count:m} = await supabase.from("modelos").select("*", {count:'exact', head:true})
    const {count:l} = await supabase.from("lotes").select("*", {count:'exact', head:true})
    setStats({empresas:e||0, productos:p||0, modelos:m||0, lotes:l||0})
  }

  const menuItem = (label:string, active=false) => (
    <div onClick={()=>setTab(label.toLowerCase())} style={{padding:"9px 14px", margin:"2px 8px", borderRadius:"6px", fontSize:"11.5px", color:active?"#ff6a00":"#8a8a8e", background:active?"#ff6a0015":"transparent", cursor:"pointer", display:"flex", alignItems:"center", gap:"8px", borderLeft:active?"2px solid #ff6a00":"2px solid transparent"}}>
      <span style={{fontSize:"8px"}}>●</span> {label}
    </div>
  )

  const card = (title:string, value:number) => (
    <div style={{background:"#1e1e20", border:"1px solid #2a2a2e", borderLeft:"2px solid #ff6a00", borderRadius:"6px", padding:"16px 18px"}}>
      <div style={{fontSize:"9px", color:"#666", letterSpacing:"1px", fontWeight:700}}>{title}</div>
      <div style={{fontSize:"22px", fontWeight:900, marginTop:"6px", color:"white"}}>{value}</div>
    </div>
  )

  return (
    <div style={{display:"flex", minHeight:"100vh", background:"#0e0e10", color:"white", fontFamily:"Inter, system-ui"}}>
      {/* SIDEBAR IGUAL A TU FOTO ANTIGUA */}
      <div style={{width:"210px", background:"#131315", borderRight:"1px solid #1e1e22", display:"flex", flexDirection:"column"}}>
        <div style={{padding:"18px 16px", borderBottom:"1px solid #1e1e22", display:"flex", alignItems:"center", gap:"8px"}}>
          <div style={{fontWeight:900, fontSize:"18px", letterSpacing:"1px"}}>VINCULA<span style={{background:"#ff6a00", color:"white", padding:"0 4px", borderRadius:"3px", marginLeft:"1px"}}>B</span></div>
          <div style={{fontSize:"7px", color:"#666", lineHeight:"8px", marginLeft:"6px"}}>DIGITAL PRODUCT IDENTITY</div>
        </div>
        
        <div style={{padding:"16px 0", flex:1}}>
          <div style={{fontSize:"8px", color:"#444", padding:"0 16px", marginBottom:"6px", letterSpacing:"1px"}}>PRINCIPAL</div>
          {menuItem("Dashboard", tab==="dashboard")}
          
          <div style={{fontSize:"8px", color:"#444", padding:"12px 16px 6px", letterSpacing:"1px"}}>GESTIÓN</div>
          {menuItem("Empresas")}
          {menuItem("Productos")}
          {menuItem("Modelos")}
          {menuItem("Lotes", tab==="lotes")}
          {menuItem("Productos Individuales")}

          <div style={{fontSize:"8px", color:"#444", padding:"12px 16px 6px", letterSpacing:"1px"}}>IDENTIDAD DIGITAL</div>
          {menuItem("DPP")}
          {menuItem("NFC / QR")}
          {menuItem("Certificados")}
          {menuItem("Trazabilidad")}
        </div>
      </div>

      {/* MAIN IGUAL A TU FOTO */}
      <div style={{flex:1, display:"flex", flexDirection:"column"}}>
        <div style={{height:"48px", background:"#161618", borderBottom:"1px solid #1e1e22", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 20px"}}>
          <div style={{fontSize:"9px", color:"#555", letterSpacing:"1px"}}>PLATAFORMA DE IDENTIDAD DIGITAL DE PRODUCTOS</div>
          <div style={{fontSize:"11px", display:"flex", alignItems:"center", gap:"8px"}}><span style={{fontSize:"8px", color:"#888"}}>VINCULAB</span><span style={{fontWeight:700}}>Administrador</span><div style={{width:"22px", height:"22px", background:"#ff6a00", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"10px"}}>A</div></div>
        </div>

        <div style={{padding:"18px 20px", background:"#0a0a0c", flex:1}}>
          <div style={{marginBottom:"16px"}}>
            <div style={{fontWeight:700, fontSize:"14px"}}>Dashboard</div>
            <div style={{fontSize:"11px", color:"#666", marginTop:"2px"}}>Vista general de la plataforma Vinculab.</div>
          </div>

          <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:"12px"}}>
            {card("EMPRESAS", stats.empresas)}
            {card("PRODUCTOS", stats.productos)}
            {card("MODELOS", stats.modelos)}
            {card("LOTES", stats.lotes)}
          </div>

          <div style={{marginTop:"20px", background:"#161618", border:"1px solid #1e1e22", borderRadius:"6px", padding:"20px", color:"#666", fontSize:"12px", textAlign:"center"}}>
            Plataforma conectada a Supabase • {stats.lotes} lotes activos • Tus DPPs siguen funcionando en /p/[ID] igual que antes
          </div>
        </div>
      </div>
    </div>
  )
}
