import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/* =========================================================
   TIPOS
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

export type EmpresaProducto = {
  id: string
  razon_social: string | null
  empresa_nombre?: string | null
}

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
   OBTENER EMPRESAS

   RLS:
   - superadmin → todas
   - admin_empresa → solo la suya
========================================================= */

export const getEmpresasProductos = () => {
  return supabase
    .from('empresas')
    .select(`
      id,
      razon_social,
      empresa_nombre
    `)
    .order('razon_social')
}

/* =========================================================
   OBTENER PRODUCTOS

   NO agregamos filtro manual de empresa.

   RLS decide:
   - superadmin → todos
   - admin_empresa → solo los de su empresa
========================================================= */

export const getProductos = () => {
  return supabase
    .from('productos')
    .select('*')
    .order('nombre')
}

/* =========================================================
   CREAR PRODUCTO

   SUPERADMIN:
   - puede indicar empresa_id.

   ADMIN_EMPRESA:
   - empresa_id SIEMPRE se obtiene del perfil.
   - se ignora cualquier empresa_id recibido del formulario.

   RLS sigue siendo la protección final.
========================================================= */

export const createProducto = async (data: any) => {
  const {
    data: perfil,
    error: perfilError
  } = await getPerfilActual()

  if (perfilError || !perfil) {
    const error =
      perfilError ||
      new Error('Perfil no encontrado')

    return {
      data: null,
      error
    }
  }

  if (perfil.activo === false) {
    return {
      data: null,
      error: new Error('Usuario desactivado.')
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
        'Tu usuario no tiene permisos para crear productos.'
      )
    }
  }

  let empresaId: string | null = null

  /* ---------------------------------------------------------
     SUPERADMIN
  --------------------------------------------------------- */

  if (esSuperadmin) {
    empresaId =
      typeof data.empresa_id === 'string'
        ? data.empresa_id.trim()
        : ''

    if (!empresaId) {
      return {
        data: null,
        error: new Error(
          'Debes seleccionar la empresa del producto.'
        )
      }
    }
  }

  /* ---------------------------------------------------------
     ADMINISTRADOR DE EMPRESA
  --------------------------------------------------------- */

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

  if (!nombre) {
    return {
      data: null,
      error: new Error(
        'Debes ingresar el nombre del producto.'
      )
    }
  }

  /* ---------------------------------------------------------
     INSERT
  --------------------------------------------------------- */

  const res = await supabase
    .from('productos')
    .insert([
      {
        id: `PROD-${Date.now()}`,
        empresa_id: empresaId,
        nombre,
        categoria:
          data.categoria?.trim() || null,
        sku:
          data.sku?.trim() || null
      }
    ])
    .select()

  return res
}

/* =========================================================
   ACTUALIZAR PRODUCTO

   IMPORTANTE:
   empresa_id NO se modifica.

   Un administrador de empresa no puede mover un producto
   hacia otra empresa.

   El superadmin tampoco lo cambia desde este formulario.
   Si posteriormente queremos implementar "transferir producto"
   lo haremos como operación administrativa separada.
========================================================= */

export const updateProducto = async (
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
      error: new Error('Usuario desactivado.')
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
        'No tienes permisos para editar productos.'
      )
    }
  }

  const nombre =
    typeof data.nombre === 'string'
      ? data.nombre.trim()
      : ''

  if (!nombre) {
    return {
      data: null,
      error: new Error(
        'Debes ingresar el nombre del producto.'
      )
    }
  }

  const res = await supabase
    .from('productos')
    .update({
      nombre,
      categoria:
        data.categoria?.trim() || null,
      sku:
        data.sku?.trim() || null
    })
    .eq('id', id)
    .select()

  return res
}

/* =========================================================
   ELIMINAR PRODUCTO

   RLS determina si el usuario puede borrar el registro.
========================================================= */

export const deleteProducto = async (
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
      error: new Error('Usuario desactivado.')
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
        'No tienes permisos para eliminar productos.'
      )
    }
  }

  const res = await supabase
    .from('productos')
    .delete()
    .eq('id', id)
    .select()

  return res
}
