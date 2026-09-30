import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const getEmpresas = () => supabase.from('empresas').select('*').order('razon_social')

export const createEmpresa = async (data: any) => {
  const res = await supabase.from('empresas').insert([data]).select()
  console.log('CREATE RES:', res)
  if (res.error) alert('Error Supabase: ' + res.error.message)
  return res
}

export const updateEmpresa = async (id: string, data: any) => {
  const res = await supabase.from('empresas').update(data).eq('id', id).select()
  if (res.error) alert('Error Update: ' + res.error.message)
  return res
}

export const deleteEmpresa = (id: string) => supabase.from('empresas').delete().eq('id', id)
