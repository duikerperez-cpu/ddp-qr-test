import { createClient } from '@supabase/supabase-js'

export default async function PublicPage({ params }: { params: { codigo: string } }){
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const { data: lote } = await supabase.from('lotes').select('*').eq('codigo', params.codigo).single()
  if(!lote) return <div style={{padding:40, background:'#09090b', color:'white', minHeight:'100vh'}}>Código no encontrado: {params.codigo}</div>

  const { data: empresa } = await supabase.from('empresas').select('razon_social').eq('id', lote.empresa_id).single()
  const { data: producto } = await supabase.from('productos').select('nombre').eq('id', lote.producto_id).single()
  const { data: modelo } = await supabase.from('modelos').select('nombre').eq('id', lote.modelo_id).single()

  return (
    <div style={{ background:'#09090b', minHeight:'100vh', color:'white', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'#18181b', border:'1px solid #27272a', borderRadius:16, padding:24, maxWidth:400, width:'100%', textAlign:'center' }}>
        <h2 style={{color:'#ff6a00'}}>Vinculab - Trazabilidad</h2>
        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://vinculab.cl/p/${lote.codigo}`} style={{margin:'16px auto', borderRadius:12}} />
        <h1>{lote.codigo}</h1>
        <p>Empresa: {empresa?.razon_social || lote.empresa_id}</p>
        <p>Producto: {producto?.nombre || lote.producto_id}</p>
        <p>Modelo: {modelo?.nombre || lote.modelo_id}</p>
        <p>Estado: <b style={{color:'#22c55e'}}>{lote.estado}</b></p>
        <p style={{opacity:0.5, fontSize:12, marginTop:20}}>Creado: {new Date(lote.created_at).toLocaleString()}</p>
      </div>
    </div>
  )
}
