import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
export const getModelos = () => supabase.from('modelos').select('*').order('created_at', { ascending: false })
export const getEmpresas = () => supabase.from('empresas').select('id, razon_social')
export const getProductos = () => supabase.from('productos').select('id, nombre')

export const createModelo = async (data: any) => {
  const res = await supabase.from('modelos').insert([{ 
    id: crypto.randomUUID(),
    nombre: data.nombre, 
    empresa_id: data.empresa_id, 
    producto_id: data.producto_id,
    categoria: data.categoria || null,
    descripcion: data.descripcion || null
  }]).select()
  if(res.error) alert('Error modelos: ' + res.error.message)
  return res
}
export const updateModelo = (id: string, data: any) => supabase.from('modelos').update({ nombre: data.nombre, empresa_id: data.empresa_id, producto_id: data.producto_id, categoria: data.categoria, descripcion: data.descripcion }).eq('id', id)
export const deleteModelo = (id: string) => supabase.from('modelos').delete().eq('id', id)
