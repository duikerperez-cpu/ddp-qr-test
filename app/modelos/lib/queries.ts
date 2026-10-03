import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/* =========================================================
   TIPOS INTERNOS
========================================================= */

export type PerfilActual = {
  id: string
  empresa_id: string | null
  nombre: string | null
  apellido: string | null
  cargo: string | null
  rol: string | null
  activo: boolean | null
}

/* =========================================================
   PERFIL ACTUAL
========================================================= */

export const getPerfilActual = async () => {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return {
      data: null,
      error:
        userError ||
        new Error('Usuario no autenticado')
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
    .maybeSingle()

  return {
    data: perfil as PerfilActual | null,
    error
  }
}

/* =========================================================
   MODELOS

   RLS determina qué registros puede ver cada usuario.
========================================================= */

export const getModelos = () =>
  supabase
    .from('modelos')
    .select('*')
    .order('created_at', {
      ascending: false
    })

/* =========================================================
   EMPRESAS

   RLS:
   - superadmin -> todas
   - admin_empresa -> solo la suya
========================================================= */

export const getEmpresas = () =>
  supabase
    .from('empresas')
    .select('id, razon_social')
    .order('razon_social')

/* =========================================================
   PRODUCTOS

   RLS:
   - superadmin -> todos
   - admin_empresa -> solo los de su empresa
========================================================= */

export const getProductos = () =>
  supabase
    .from('productos')
    .select('id, nombre, empresa_id')
    .order('nombre')

/* =========================================================
   CREAR MODELO

   SUPERADMIN:
   - empresa_id viene del formulario.

   ADMIN_EMPRESA:
   - empresa_id SIEMPRE viene del perfil.
   - cualquier empresa_id recibido del formulario se ignora.

   Además verificamos que el producto seleccionado pertenezca
   a la misma empresa.
========================================================= */

export const createModelo = async (
  data: any
) => {
  const {
    data: perfil,
    error: perfilError
  } = await getPerfilActual()

  if (perfilError || !perfil) {
    return {
      data: null,
      error:
        perfilError ||
        new Error('Perfil no encontrado')
    }
  }

  if (perfil.activo === false) {
    return {
      data: null,
      error: new Error(
        'Usuario desactivado.'
      )
    }
  }

  const esSuperadmin =
    perfil.rol === 'superadmin'

  const esAdminEmpresa =
    perfil.rol === 'admin_empresa'

  if (!esSuperadmin && !esAdminEmpresa) {
    return {
      data: null,
      error: new Error(
        'No tienes permisos para crear modelos.'
      )
    }
  }

  /* ---------------------------------------------------------
     EMPRESA
  --------------------------------------------------------- */

  let empresaId: string | null = null

  if (esSuperadmin) {
    empresaId =
      typeof data.empresa_id === 'string'
        ? data.empresa_id.trim()
        : ''

    if (!empresaId) {
      return {
        data: null,
        error: new Error(
          'Debes seleccionar una empresa.'
        )
      }
    }
  }

  if (esAdminEmpresa) {
    empresaId = perfil.empresa_id

    if (!empresaId) {
      return {
        data: null,
        error: new Error(
          'Tu usuario no tiene una empresa asociada.'
        )
      }
    }
  }

  /* ---------------------------------------------------------
     VALIDACIONES
  --------------------------------------------------------- */

  const nombre =
    typeof data.nombre === 'string'
      ? data.nombre.trim()
      : ''

  const productoId =
    typeof data.producto_id === 'string'
      ? data.producto_id.trim()
      : ''

  if (!nombre) {
    return {
      data: null,
      error: new Error(
        'Debes ingresar el nombre del modelo.'
      )
    }
  }

  if (!productoId) {
    return {
      data: null,
      error: new Error(
        'Debes seleccionar un producto.'
      )
    }
  }

  /* ---------------------------------------------------------
     VERIFICAR PRODUCTO

     Evita relacionar un modelo de Empresa A con
     un producto de Empresa B.
  --------------------------------------------------------- */

  const {
    data: producto,
    error: productoError
  } = await supabase
    .from('productos')
    .select('id, empresa_id')
    .eq('id', productoId)
    .maybeSingle()

  if (productoError) {
    return {
      data: null,
      error: productoError
    }
  }

  if (!producto) {
    return {
      data: null,
      error: new Error(
        'El producto seleccionado no existe o no tienes acceso a él.'
      )
    }
  }

  if (producto.empresa_id !== empresaId) {
    return {
      data: null,
      error: new Error(
        'El producto seleccionado no pertenece a la empresa indicada.'
      )
    }
  }

  /* ---------------------------------------------------------
     INSERT
  --------------------------------------------------------- */

  const res = await supabase
    .from('modelos')
    .insert([
      {
        id: crypto.randomUUID(),
        nombre,
        empresa_id: empresaId,
        producto_id: productoId,
        categoria:
          data.categoria?.trim() || null,
        descripcion:
          data.descripcion?.trim() || null
      }
    ])
    .select()

  if (res.error) {
    console.error(
      'Error creando modelo:',
      res.error
    )
  }

  return res
}

/* =========================================================
   ACTUALIZAR MODELO

   IMPORTANTE:
   empresa_id NO se modifica.

   El modelo permanece en su empresa original.

   Sí permitimos cambiar el producto, pero solamente por
   otro producto perteneciente a esa misma empresa.
========================================================= */

export const updateModelo = async (
  id: string,
  data: any
) => {
  const {
    data: perfil,
    error: perfilError
  } = await getPerfilActual()

  if (perfilError || !perfil) {
    return {
      data: null,
      error:
        perfilError ||
        new Error('Perfil no encontrado')
    }
  }

  if (perfil.activo === false) {
    return {
      data: null,
      error: new Error(
        'Usuario desactivado.'
      )
    }
  }

  const esSuperadmin =
    perfil.rol === 'superadmin'

  const esAdminEmpresa =
    perfil.rol === 'admin_empresa'

  if (!esSuperadmin && !esAdminEmpresa) {
    return {
      data: null,
      error: new Error(
        'No tienes permisos para editar modelos.'
      )
    }
  }

  /* ---------------------------------------------------------
     MODELO ACTUAL
  --------------------------------------------------------- */

  const {
    data: modeloActual,
    error: modeloError
  } = await supabase
    .from('modelos')
    .select(`
      id,
      empresa_id,
      producto_id
    `)
    .eq('id', id)
    .maybeSingle()

  if (modeloError) {
    return {
      data: null,
      error: modeloError
    }
  }

  if (!modeloActual) {
    return {
      data: null,
      error: new Error(
        'El modelo no existe o no tienes acceso a él.'
      )
    }
  }

  /*
    Para admin_empresa hacemos una comprobación
    adicional además de RLS.
  */

  if (
    esAdminEmpresa &&
    modeloActual.empresa_id !==
      perfil.empresa_id
  ) {
    return {
      data: null,
      error: new Error(
        'No tienes permisos para modificar este modelo.'
      )
    }
  }

  /* ---------------------------------------------------------
     VALIDACIONES
  --------------------------------------------------------- */

  const nombre =
    typeof data.nombre === 'string'
      ? data.nombre.trim()
      : ''

  const productoId =
    typeof data.producto_id === 'string'
      ? data.producto_id.trim()
      : ''

  if (!nombre) {
    return {
      data: null,
      error: new Error(
        'Debes ingresar el nombre del modelo.'
      )
    }
  }

  if (!productoId) {
    return {
      data: null,
      error: new Error(
        'Debes seleccionar un producto.'
      )
    }
  }

  /* ---------------------------------------------------------
     VERIFICAR NUEVO PRODUCTO
  --------------------------------------------------------- */

  const {
    data: producto,
    error: productoError
  } = await supabase
    .from('productos')
    .select('id, empresa_id')
    .eq('id', productoId)
    .maybeSingle()

  if (productoError) {
    return {
      data: null,
      error: productoError
    }
  }

  if (!producto) {
    return {
      data: null,
      error: new Error(
        'El producto seleccionado no existe o no tienes acceso a él.'
      )
    }
  }

  if (
    producto.empresa_id !==
    modeloActual.empresa_id
  ) {
    return {
      data: null,
      error: new Error(
        'El producto seleccionado pertenece a otra empresa.'
      )
    }
  }

  /* ---------------------------------------------------------
     UPDATE

     empresa_id deliberadamente NO aparece aquí.
  --------------------------------------------------------- */

  const res = await supabase
    .from('modelos')
    .update({
      nombre,
      producto_id: productoId,
      categoria:
        data.categoria?.trim() || null,
      descripcion:
        data.descripcion?.trim() || null
    })
    .eq('id', id)
    .select()

  if (res.error) {
    console.error(
      'Error actualizando modelo:',
      res.error
    )
  }

  return res
}

/* =========================================================
   ELIMINAR MODELO

   RLS sigue siendo la protección definitiva.
========================================================= */

export const deleteModelo = async (
  id: string
) => {
  const {
    data: perfil,
    error: perfilError
  } = await getPerfilActual()

  if (perfilError || !perfil) {
    return {
      data: null,
      error:
        perfilError ||
        new Error('Perfil no encontrado')
    }
  }

  if (perfil.activo === false) {
    return {
      data: null,
      error: new Error(
        'Usuario desactivado.'
      )
    }
  }

  const esSuperadmin =
    perfil.rol === 'superadmin'

  const esAdminEmpresa =
    perfil.rol === 'admin_empresa'

  if (!esSuperadmin && !esAdminEmpresa) {
    return {
      data: null,
      error: new Error(
        'No tienes permisos para eliminar modelos.'
      )
    }
  }

  const res = await supabase
    .from('modelos')
    .delete()
    .eq('id', id)
    .select()

  if (res.error) {
    console.error(
      'Error eliminando modelo:',
      res.error
    )
  }

  return res
}

/* =========================================================
   ATRIBUTOS DEL MODELO
========================================================= */

export const getAtributosModelo = (
  modeloId: string
) =>
  supabase
    .from('modelo_atributos')
    .select('*')
    .eq('modelo_id', modeloId)
    .order('grupo', {
      ascending: true
    })
    .order('orden', {
      ascending: true
    })

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
        valor:
          data.valor?.trim() || null,
        unidad:
          data.unidad?.trim() || null,
        grupo:
          data.grupo?.trim() ||
          'Especificaciones',
        orden:
          Number(data.orden) || 0
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
      valor:
        data.valor?.trim() || null,
      unidad:
        data.unidad?.trim() || null,
      grupo:
        data.grupo?.trim() ||
        'Especificaciones',
      orden:
        Number(data.orden) || 0
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
    .select()

  if (res.error) {
    console.error(
      'Error eliminando atributo:',
      res.error
    )
  }

  return res
}
