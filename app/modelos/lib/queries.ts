import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// =====================================================
// MODELOS
// =====================================================

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

export const updateModelo = async (
  id: string,
  data: any
) => {
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

// =====================================================
// ATRIBUTOS DEL MODELO
// =====================================================

export const getAtributosModelo = (
  modeloId: string
) =>
  supabase
    .from('modelo_atributos')
    .select('*')
    .eq('modelo_id', modeloId)
    .order('grupo', { ascending: true })
    .order('orden', { ascending: true })

export const createAtributoModelo = async (
  modeloId: string,
  data: any
) => {
  const res = await supabase
    .from('modelo_atributos')
    .insert([
      {
        modelo_id: modeloId,
        nombre: data.nombre.trim(),
        valor: data.valor?.trim() || null,
        unidad: data.unidad?.trim() || null,
        grupo:
          data.grupo?.trim() ||
          'Especificaciones',
        orden: Number(data.orden) || 0
      }
    ])
    .select()

  if (res.error) {
    console.error(
      'Error creando atributo:',
      res.error
    )
  }

  return res
}

export const updateAtributoModelo = async (
  id: string,
  data: any
) => {
  const res = await supabase
    .from('modelo_atributos')
    .update({
      nombre: data.nombre.trim(),
      valor: data.valor?.trim() || null,
      unidad: data.unidad?.trim() || null,
      grupo:
        data.grupo?.trim() ||
        'Especificaciones',
      orden: Number(data.orden) || 0
    })
    .eq('id', id)
    .select()

  if (res.error) {
    console.error(
      'Error actualizando atributo:',
      res.error
    )
  }

  return res
}

export const deleteAtributoModelo = async (
  id: string
) => {
  const res = await supabase
    .from('modelo_atributos')
    .delete()
    .eq('id', id)

  if (res.error) {
    console.error(
      'Error eliminando atributo:',
      res.error
    )
  }

  return res
}
