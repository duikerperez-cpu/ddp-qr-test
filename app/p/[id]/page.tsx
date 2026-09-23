import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function Page({ params }: { params: { id: string } }) {
  const vinculabId = params.id.toUpperCase()

  const { data: item } = await supabase
    .from('items')
    .select('*, nfc_qr(*)')
    .eq('vinculab_id', vinculabId)
    .single()

  if (!item) {
    return <div style={{padding:40, background:'#000', color:'#fff', minHeight:'100vh'}}>NO ENCONTRADO: {vinculabId}<br/>Revisa tabla items en Supabase</div>
  }

  return (
    <div style={{padding:30, background:'#0a0a0a', color:'white', minHeight:'100vh'}}>
      <h1 style={{color:'#ff4d00', fontSize:32}}>VINCULAB {item.vinculab_id}</h1>
      <p><b>Empresa:</b> {item.lotes?.modelos?.productos?.empresas?.razon_social || 'HERCOM CHILE'}</p>
      <p><b>Modelo:</b> {item.lotes?.modelos?.modelo_codigo}</p>
      <p><b>NFC:</b> {item.nfc_qr?.[0]?.uid_nfc} - {item.nfc_qr?.[0]?.tipo}</p>
      <p><b>Sector:</b> {item.lotes?.sector_aplicacion}</p>
      <p><b>QR URL:</b> {item.nfc_qr?.[0]?.qr_url}</p>
      <p style={{marginTop:20, color:'#888'}}>Lote: {item.lote_id} - Fecha: {item.fecha_produccion}</p>
    </div>
  )
}
