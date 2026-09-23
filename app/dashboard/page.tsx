'use client'
export default function Dashboard() {
  return (
    <div style={{display:'flex', minHeight:'100vh', background:'#0a0a0a', color:'white', fontFamily:'Arial, sans-serif'}}>
      
      {/* SIDEBAR NEGRO */}
      <div style={{width:230, background:'#000', borderRight:'1px solid #1a1a1a', padding:'20px 15px'}}>
        <div style={{color:'#ff6a00', fontWeight:900, fontSize:19, letterSpacing:1, marginBottom:30}}>VINCULAB</div>
        <div style={{display:'flex', flexDirection:'column', gap:16, fontSize:13, color:'#666'}}>
          <div style={{color:'white', background:'#1a1a1a', padding:'10px 12px', borderRadius:6, borderLeft:'3px solid #ff6a00'}}>Dashboard</div>
          <div>Empresas</div><div>Productos</div><div>Modelos</div><div>Lotes</div>
          <div>Productos Individuales</div><div>DPP</div><div>NFC/QR</div>
          <div>Confirmaciones</div><div>Trazabilidad</div>
        </div>
      </div>

      {/* MAIN NEGRO */}
      <div style={{flex:1, background:'#0f0f0f', padding:30}}>
        <h1 style={{fontSize:32, margin:0, fontWeight:900}}>Dashboard</h1>
        <p style={{color:'#888', fontSize:13, marginTop:5}}>Vista general de la plataforma de Identidad Digital de Productos</p>
        
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginTop:30}}>
          {[
            {k:'EMPRESAS', v:'12', s:'Activas · +2 este mes'},
            {k:'PRODUCTOS', v:'238', s:'Registrados · +18 este mes'},
            {k:'MODELOS', v:'18', s:'Plantillas activas'},
            {k:'LOTES', v:'1,042', s:'Creados · +83 este mes'},
          ].map(c=>(
            <div key={c.k} style={{background:'#1e1e1e', borderLeft:'6px solid #ff6a00', borderRadius:8, padding:20}}>
              <div style={{fontSize:10, color:'#888', letterSpacing:1}}>{c.k}</div>
              <div style={{fontSize:64, fontWeight:900, lineHeight:1, margin:'10px 0'}}>{c.v}</div>
              <div style={{fontSize:12, color:'#aaa'}}>{c.s} <span style={{color:'#ff6a00'}}>↗</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
