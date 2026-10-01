import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
export const getProductos = () => supabase.from('productos').select('*').order('nombre')
export const getEmpresasForSelect = () => supabase.from('empresas').select('id, razon_social').order('razon_social')

export const createProducto = async (data: any) => {
  const res = await supabase.from('productos').insert([{ 
    id: `PROD-${Date.now()}`, 
    empresa_id: data.empresa_id, 
    nombre: data.nombre,
    categoria: data.categoria || null,
    sku: data.sku || null,
    descripcion: data.descripcion || null
  }]).select()
  if(res.error) alert('Error: ' + res.error.message)
  return res
}
export const updateProducto = (id: string, data: any) => supabase.from('productos').update({ nombre: data.nombre, empresa_id: data.empresa_id, categoria: data.categoria, sku: data.sku, descripcion: data.descripcion }).eq('id', id)
export const deleteProducto = (id: string) => supabase.from('productos').delete().eq('id', id)
