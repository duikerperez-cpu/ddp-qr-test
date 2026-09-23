import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function Page({ params }: { params: { id: string } }) {
  const vinculabId = params.id.toUpperCase()

  const { data: item, error } = await supabase
    .from('items')
    .select('*')
    .eq('vinculab_id', vinculabId)
    .single()

  if (error) {
    return <div style={{padding:40, background:'#000', color:'#f55', minHeight:'100vh'}}>ERROR SUPABASE: {error.message}<br/>ID buscado: {vinculabId}</div>
  }

  if (!item) {
    return <div style={{padding:40, background:'#000', color:'#fff', minHeight:'100vh'}}>NO ENCONTRADO: {vinculabId}<br/>Revisa tabla items en Supabase</div>
  }

  return (
    <div style={{padding:30, background:'#0a0a0a', color:'white', minHeight:'100vh'}}>
      <h1 style={{color:'#ff4d00', fontSize:32}}>VINCULAB {item.vinculab_id}</h1>
      <pre style={{background:'#222', padding:20, marginTop:20}}>{JSON.stringify(item, null, 2)}</pre>
      <p style={{marginTop:20}}>Si ves esto, ¡YA FUNCIONA! El problema era el select con lotes.</p>
    </div>
  )
}
