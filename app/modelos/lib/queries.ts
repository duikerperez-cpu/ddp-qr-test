import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const getModelos = () =>
  supabase
    .from('modelos')
    .select('*')
    .order('created_at', { ascending: false })

export const getEmpresas = () =>
  supabase
    .from('empresas')
    .select('id, razon_social')
    .order('razon_social')

export const getProductos = () =>
  supabase
    .from('productos')
    .select('id, nombre, empresa_id')
    .order('nombre')

export const createModelo = async (data: any) => {
  const res = await supabase
    .from('modelos')
    .insert([
      {
        id: crypto.randomUUID(),
        nombre: data.nombre.trim(),
        empresa_id: data.empresa_id,
        producto_id: data.producto_id || null,
        categoria: data.categoria?.trim() || null,
        descripcion: data.descripcion?.trim() || null
      }
    ])
    .select()

  if (res.error) {
    console.error('Error creando modelo:', res.error)
  }

  return res
}

export const updateModelo = async (id: string, data: any) => {
  const res = await supabase
    .from('modelos')
    .update({
      nombre: data.nombre.trim(),
      empresa_id: data.empresa_id,
      producto_id: data.producto_id || null,
      categoria: data.categoria?.trim() || null,
      descripcion: data.descripcion?.trim() || null
    })
    .eq('id', id)
    .select()

  if (res.error) {
    console.error('Error actualizando modelo:', res.error)
  }

  return res
}

export const deleteModelo = async (id: string) => {
  const res = await supabase
    .from('modelos')
    .delete()
    .eq('id', id)

  if (res.error) {
    console.error('Error eliminando modelo:', res.error)
  }

  return res
}
