import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// LEER
export const getEmpresas = () => {
  return supabase.from('empresas').select('*').order('razon_social', { ascending: true })
}

// CREAR
export const createEmpresa = (data: any) => {
  return supabase.from('empresas').insert([data]).select()
}

// EDITAR
export const updateEmpresa = (id: string, data: any) => {
  return supabase.from('empresas').update(data).eq('id', id).select()
}

// BORRAR
export const deleteEmpresa = (id: string) => {
  return supabase.from('empresas').delete().eq('id', id)
}
