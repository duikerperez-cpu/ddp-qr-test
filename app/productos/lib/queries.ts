import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/* =========================================================
   OBTENER PERFIL DEL USUARIO ACTUAL
========================================================= */

export const getPerfilActual = async () => {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return {
      data: null,
      error: userError || new Error('Usuario no autenticado')
    }
  }

  const { data: perfil, error } = await supabase
    .from('perfiles')
    .select(`
      id,
      empresa_id,
      nombre,
      apellido,
      cargo,
      rol,
      activo
    `)
    .eq('id', user.id)
    .single()

  return {
    data: perfil,
    error
  }
}

/* =========================================================
   PRODUCTOS
========================================================= */

export const getProductos = () => {
  return supabase
    .from('productos')
    .select('*')
    .order('nombre')
}

/* =========================================================
   CREAR PRODUCTO
   La empresa se obtiene de la sesión.
   NO se acepta empresa_id desde el formulario.
========================================================= */

export const createProducto = async (data: any) => {

  const { data: perfil, error: perfilError } =
    await getPerfilActual()

  if (perfilError || !perfil) {
    alert('No fue posible identificar tu perfil.')
    console.error(perfilError)

    return {
      data: null,
      error: perfilError || new Error('Perfil no encontrado')
    }
  }

  if (!perfil.activo) {
    const error = new Error('Usuario desactivado.')
    alert(error.message)

    return {
      data: null,
      error
    }
  }

  if (!perfil.empresa_id) {
    const error = new Error(
      'Tu usuario no tiene una empresa asociada.'
    )

    alert(error.message)

    return {
      data: null,
      error
    }
  }

  const res = await supabase
    .from('productos')
    .insert([
      {
        id: `PROD-${Date.now()}`,

        // IMPORTANTE:
        // viene del perfil autenticado
        empresa_id: perfil.empresa_id,

        nombre: data.nombre.trim(),
        categoria: data.categoria?.trim() || null,
        sku: data.sku?.trim() || null
      }
    ])
    .select()

  if (res.error) {
    alert('Error al crear producto: ' + res.error.message)
    console.error(res.error)
  }

  return res
}

/* =========================================================
   ACTUALIZAR PRODUCTO
   empresa_id NO puede modificarse desde el formulario.
========================================================= */

export const updateProducto = async (
  id: string,
  data: any
) => {

  const res = await supabase
    .from('productos')
    .update({
      nombre: data.nombre.trim(),
      categoria: data.categoria?.trim() || null,
      sku: data.sku?.trim() || null
    })
    .eq('id', id)
    .select()

  if (res.error) {
    alert('Error al actualizar producto: ' + res.error.message)
    console.error(res.error)
  }

  return res
}

/* =========================================================
   ELIMINAR PRODUCTO
========================================================= */

export const deleteProducto = async (id: string) => {

  const res = await supabase
    .from('productos')
    .delete()
    .eq('id', id)

  if (res.error) {
    alert('Error al eliminar producto: ' + res.error.message)
    console.error(res.error)
  }

  return res
}
