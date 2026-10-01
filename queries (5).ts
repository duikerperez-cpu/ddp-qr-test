import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export const getLotes = () => supabase.from('lotes').select('*').order('created_at', { ascending: false })
export const getEmpresas = () => supabase.from('empresas').select('id, razon_social').order('razon_social')
export const getProductos = () => supabase.from('productos').select('id, nombre, empresa_id').order('nombre')
export const getModelos = () => supabase.from('modelos').select('id, nombre, empresa_id, producto_id').order('nombre')

export const createLote = async (data: any) => {
  const res = await supabase.from('lotes').insert([{
    id: crypto.randomUUID(),
    codigo: data.codigo,
    cantidad: Number(data.cantidad) || 1,
    modelo_id: data.modelo_id,
    producto_id: data.producto_id,
    empresa_id: data.empresa_id,
    estado: data.estado || 'activo'
  }]).select()
  if(res.error) { alert(res.error.message); console.error(res.error) }
  return res
}
export const updateLote = (id: string, data: any) => supabase.from('lotes').update({ codigo: data.codigo, cantidad: data.cantidad, estado: data.estado }).eq('id', id)
export const deleteLote = (id: string) => supabase.from('lotes').delete().eq('id', id)
