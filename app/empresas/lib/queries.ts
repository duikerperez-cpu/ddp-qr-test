import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
export const getEmpresas = () => supabase.from('empresas').select('*')
export const createEmpresa = async (data: any) => {
  const res = await supabase.from('empresas').insert([{ id: crypto.randomUUID(), razon_social: data.razon_social }]).select()
  if (res.error) alert(res.error.message)
  return res
}
export const updateEmpresa = (id: string, data: any) => supabase.from('empresas').update({ razon_social: data.razon_social }).eq('id', id)
export const deleteEmpresa = (id: string) => supabase.from('empresas').delete().eq('id', id)
