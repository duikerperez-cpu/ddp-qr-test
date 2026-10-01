export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{display:'flex', minHeight:'100vh'}}>
      <aside style={{width:260, background:'#09090b', color:'white', padding:20, borderRight:'1px solid #27272a', position:'sticky', top:0, height:'100vh'}}>
        <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:30}}>
          <span style={{fontWeight:900, fontSize:18}}>VINCULAB</span>
          <span style={{background:'#ff6a00', color:'white', fontSize:11, fontWeight:900, padding:'2px 6px', borderRadius:4}}>B</span>
        </div>
        <div style={{fontSize:10, color:'#71717a', fontWeight:800, letterSpacing:1, marginBottom:12}}>PLATAFORMA ADMIN</div>
        <nav style={{display:'flex', flexDirection:'column', gap:4}}>
          <a href="/admin" style={{padding:'10px 12px', borderRadius:8, color:'#e4e4e7', textDecoration:'none', fontSize:13}}>📊 Dashboard</a>
          <a href="/dpp" style={{padding:'10px 12px', borderRadius:8, background:'#18181b', color:'white', textDecoration:'none', fontSize:13, fontWeight:700}}>🏷️ Crear DPP / QR</a>
          <a href="/admin" style={{padding:'10px 12px', borderRadius:8, color:'#a1a1aa', textDecoration:'none', fontSize:13}}>📦 Productos Individuales</a>
          <div style={{height:1, background:'#27272a', margin:'16px 0'}} />
          <span style={{padding:'0 12px', fontSize:10, color:'#52525b'}}>IDENTIDAD DIGITAL</span>
          <span style={{padding:'8px 12px', fontSize:13, color:'#52525b'}}>DPP</span>
          <span style={{padding:'8px 12px', fontSize:13, color:'#52525b'}}>NFC / QR</span>
          <span style={{padding:'8px 12px', fontSize:13, color:'#52525b'}}>Certificados</span>
        </nav>
        <div style={{position:'absolute', bottom:20, left:20, right:20, fontSize:10, color:'#52525b'}}>Usuario: Administrador</div>
      </aside>
      <main style={{flex:1, background:'#f4f4f5', minHeight:'100vh'}}>{children}</main>
    </div>
  )
}
