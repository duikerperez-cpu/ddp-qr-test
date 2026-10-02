import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/* =========================================================
   VINCULAB - LOTES
   Consultas y operaciones Supabase
========================================================= */

export const getLotes = () =>
  supabase
    .from('lotes')
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

export const getModelos = () =>
  supabase
    .from('modelos')
    .select('id, nombre, empresa_id, producto_id')
    .order('nombre')

/* =========================================================
   CREAR LOTE
========================================================= */

export const createLote = async (data: any) => {
  if (!data.codigo?.trim()) {
    alert('Debes ingresar un código de lote.')
    return { data: null, error: new Error('Código requerido') }
  }

  if (!data.empresa_id) {
    alert('Debes seleccionar una empresa.')
    return { data: null, error: new Error('Empresa requerida') }
  }

  if (!data.producto_id) {
    alert('Debes seleccionar un producto.')
    return { data: null, error: new Error('Producto requerido') }
  }

  if (!data.modelo_id) {
    alert('Debes seleccionar un modelo.')
    return { data: null, error: new Error('Modelo requerido') }
  }

  const cantidad = Number(data.cantidad)

  if (!Number.isInteger(cantidad) || cantidad < 1) {
    alert('La cantidad debe ser un número entero mayor o igual a 1.')
    return { data: null, error: new Error('Cantidad inválida') }
  }

  const res = await supabase
    .from('lotes')
    .insert([
      {
        id: crypto.randomUUID(),
        codigo: data.codigo.trim(),
        cantidad,
        empresa_id: data.empresa_id,
        producto_id: data.producto_id,
        modelo_id: data.modelo_id,
        estado: data.estado || 'activo',
      },
    ])
    .select()

  if (res.error) {
    console.error('Error creando lote:', res.error)
    alert(`Error al crear lote: ${res.error.message}`)
  }

  return res
}

/* =========================================================
   ACTUALIZAR LOTE
========================================================= */

export const updateLote = async (id: string, data: any) => {
  if (!id) {
    alert('No se encontró el ID del lote.')
    return { data: null, error: new Error('ID requerido') }
  }

  if (!data.codigo?.trim()) {
    alert('Debes ingresar un código de lote.')
    return { data: null, error: new Error('Código requerido') }
  }

  if (!data.empresa_id) {
    alert('Debes seleccionar una empresa.')
    return { data: null, error: new Error('Empresa requerida') }
  }

  if (!data.producto_id) {
    alert('Debes seleccionar un producto.')
    return { data: null, error: new Error('Producto requerido') }
  }

  if (!data.modelo_id) {
    alert('Debes seleccionar un modelo.')
    return { data: null, error: new Error('Modelo requerido') }
  }

  const cantidad = Number(data.cantidad)

  if (!Number.isInteger(cantidad) || cantidad < 1) {
    alert('La cantidad debe ser un número entero mayor o igual a 1.')
    return { data: null, error: new Error('Cantidad inválida') }
  }

  const res = await supabase
    .from('lotes')
    .update({
      codigo: data.codigo.trim(),
      cantidad,
      empresa_id: data.empresa_id,
      producto_id: data.producto_id,
      modelo_id: data.modelo_id,
      estado: data.estado || 'activo',
    })
    .eq('id', id)
    .select()

  if (res.error) {
    console.error('Error actualizando lote:', res.error)
    alert(`Error al actualizar lote: ${res.error.message}`)
  }

  return res
}

/* =========================================================
   ELIMINAR LOTE
========================================================= */

export const deleteLote = async (id: string) => {
  const res = await supabase
    .from('lotes')
    .delete()
    .eq('id', id)

  if (res.error) {
    console.error('Error eliminando lote:', res.error)
    alert(`Error al eliminar lote: ${res.error.message}`)
  }

  return res
}
