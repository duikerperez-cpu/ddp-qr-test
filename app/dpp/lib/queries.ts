import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export const getDpps = () => supabase.from('dpps').select('*').order('created_at', { ascending: false })
export const getLotes = () => supabase.from('lotes').select('id, codigo').order('created_at', { ascending: false })

export const createDpp = async (data: any) => {
  const res = await supabase.from('dpps').insert([{
    codigo: data.codigo,
    lote_id: data.lote_id,
    descripcion: data.descripcion,
    materiales: data.materiales,
    origen: data.origen,
    huella_carbono: data.huella_carbono,
    estado: data.estado || 'activo'
  }]).select()
  if(res.error) alert(res.error.message)
  return res
}
export const updateDpp = (id: string, data: any) => supabase.from('dpps').update({
  descripcion: data.descripcion,
  materiales: data.materiales,
  origen: data.origen,
  huella_carbono: data.huella_carbono,
  estado: data.estado
}).eq('id', id)

export const deleteDpp = (id: string) => supabase.from('dpps').delete().eq('id', id)
