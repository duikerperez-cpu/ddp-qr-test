export default function Dashboard(){
  const cards=[
    {label:'EMPRESAS',value:0},
    {label:'PRODUCTOS',value:0},
    {label:'MODELOS',value:0},
    {label:'LOTES',value:0},
  ]
  return (
    <div>
      <h1 style={{margin:0,fontSize:18,fontWeight:800}}>Dashboard</h1>
      <p style={{margin:'4px 0 20px',fontSize:11,color:'#768088'}}>Vista general de la plataforma Vinculab.</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
        {cards.map(c=>(
          <div key={c.label} style={{background:'#11161d',border:'1px solid #1e2731',borderLeft:'3px solid #ff4500',borderRadius:8,padding:16}}>
            <div style={{fontSize:8,color:'#5a6570',letterSpacing:1}}>{c.label}</div>
            <div style={{fontSize:24,fontWeight:900,marginTop:8}}>{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
