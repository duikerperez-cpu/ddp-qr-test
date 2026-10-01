import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export const getProductos = () => supabase.from('productos').select('*').order('nombre')
export const getEmpresasForSelect = () => supabase.from('empresas').select('id, razon_social').order('razon_social')

export const createProducto = async (data: any) => {
  const row = { id: data.id || `PROD-${Date.now()}`, empresa_id: data.empresa_id, nombre: data.nombre, Categoria: data.Categoria, SKU: data.SKU }
  const res = await supabase.from('productos').insert([row]).select()
  if(res.error) alert('Error: ' + res.error.message)
  return res
}
export const updateProducto = (id: string, data: any) => supabase.from('productos').update({ nombre: data.nombre, Categoria: data.Categoria, SKU: data.SKU, empresa_id: data.empresa_id }).eq('id', id)
export const deleteProducto = (id: string) => supabase.from('productos').delete().eq('id', id)
