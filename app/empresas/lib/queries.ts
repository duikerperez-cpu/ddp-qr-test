import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const getEmpresas = () => supabase.from('empresas').select('*').order('razon_social')

export const createEmpresa = async (data: any) => {
  const newRow = {
    id: crypto.randomUUID(),
    razon_social: data.razon_social,
    Pais: 'Chile',
    Sector: data.Sector || 'General',
    nombre: data.razon_social,
    Nombre: data.razon_social
  }
  const res = await supabase.from('empresas').insert([newRow]).select()
  if (res.error) {
    console.error(res.error)
    alert('Error al crear: ' + res.error.message)
  }
  return res
}

export const updateEmpresa = (id: string, data: any) => {
  return supabase.from('empresas').update({
    razon_social: data.razon_social,
    Sector: data.Sector,
    nombre: data.razon_social
  }).eq('id', id)
}

export const deleteEmpresa = (id: string) => supabase.from('empresas').delete().eq('id', id)
