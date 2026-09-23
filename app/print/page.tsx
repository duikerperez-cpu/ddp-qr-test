export default function PrintPage() {
  const items = Array.from({length: 30}, (_, i) => `VIN-CL-${String(i+1).padStart(6,'0')}`)
  return (
    <div style={{padding:20}}>
      <h1>Hoja QR - VINCULAB - 30 unidades</h1>
      <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:20}}>
        {items.map(id => (
          <div key={id} style={{border:'1px solid #ccc', padding:10, textAlign:'center'}}>
            <img src={`/api/qr?data=https://ddp-qr-test-2-alpha.vercel.app/p/${id}`} style={{width:'100%'}} />
            <div style={{fontSize:10, fontFamily:'monospace'}}>{id}<br/>CARR-{id.split('-')[2]}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
