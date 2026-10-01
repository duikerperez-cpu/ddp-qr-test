import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
export const getProductos = () => supabase.from('productos').select('*')
export const getEmpresasForSelect = () => supabase.from('empresas').select('id, razon_social')

export const createProducto = async (data: any) => {
  const res = await supabase.from('productos').insert([{ 
    id: `PROD-${Date.now()}`, 
    nombre: data.nombre, 
    empresa_id: data.empresa_id 
  }]).select()
  if(res.error) { alert('Error: ' + res.error.message); console.error(res.error) }
  return res
}
export const updateProducto = (id: string, data: any) => supabase.from('productos').update({ nombre: data.nombre, empresa_id: data.empresa_id }).eq('id', id)
export const deleteProducto = (id: string) => supabase.from('productos').delete().eq('id', id)
