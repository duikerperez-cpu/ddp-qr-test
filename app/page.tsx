import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function Page({ params }: { params: { id: string } }) {
  const vinculabId = params.id.toUpperCase()

  const { data: item } = await supabase
   .from('items')
   .select('*, lotes(*, modelos(*, productos(*, empresas(*)))), nfc_qr(*), dpp(*)')
   .eq('vinculab_id', vinculabId)
   .single()

  if (!item) {
    return <div style={{padding:40, background:'#000', color:'#fff'}}>NO ENCONTRADO: {vinculabId} - Verifica Supabase items</div>
  }

  return (
    <div style={{padding:30, background:'#0a0a0a', color:'white'}}>
      <h1 style={{color:'#ff4d00'}}>VINCULAB {item.vinculab_id}</h1>
      <p>Empresa: HERCOM CHILE - {item.lotes?.modelos?.productos?.empresas?.id}</p>
      <p>Modelo: {item.lotes?.modelos?.modelo_codigo}</p>
      <p>NFC: vin-clpd - {item.nfc_qr?.[0]?.uid_nfc}</p>
      <p>QR: {item.nfc_qr?.[0]?.qr_url}</p>
      <p>Sector: {item.lotes?.sector_aplicacion}</p>
    </div>
  )
}
