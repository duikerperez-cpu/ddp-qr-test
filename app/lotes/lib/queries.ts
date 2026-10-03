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

  const {
    data: perfil,
    error
  } = await supabase
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
   CONSULTAS GENERALES
   RLS DETERMINA QUÉ PUEDE VER CADA USUARIO
========================================================= */

export const getLotes = () =>
  supabase
    .from('lotes')
    .select('*')
    .order('created_at', {
      ascending: false
    })

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
    .select(
      'id, nombre, empresa_id, producto_id'
    )
    .order('nombre')

/* =========================================================
   NORMALIZAR CÓDIGO DE LOTE
========================================================= */

const normalizarCodigoLote = (
  codigo: string
) => {
  return codigo
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '-')
    .replace(/[^A-Z0-9-_]/g, '')
    .replace(/-+/g, '-')
}

/* =========================================================
   GENERAR CÓDIGO DE IDENTIDAD VINCULAB
========================================================= */

const generarCodigoUnidad = (
  codigoLote: string,
  numero: number
) => {
  const lote =
    normalizarCodigoLote(
      codigoLote
    )

  const numeroFormateado =
    String(numero).padStart(
      4,
      '0'
    )

  return `VIN-${lote}-${numeroFormateado}`
}

/* =========================================================
   VALIDAR PERFIL OPERATIVO
========================================================= */

const obtenerPerfilOperativo =
  async () => {
    const {
      data: perfil,
      error
    } = await getPerfilActual()

    if (error || !perfil) {
      return {
        perfil: null,
        error:
          error ||
          new Error(
            'Perfil no encontrado.'
          )
      }
    }

    if (perfil.activo === false) {
      return {
        perfil: null,
        error: new Error(
          'Usuario desactivado.'
        )
      }
    }

    const esSuperadmin =
      perfil.rol ===
      'superadmin'

    const esAdminEmpresa =
      perfil.rol ===
      'admin_empresa'

    if (
      !esSuperadmin &&
      !esAdminEmpresa
    ) {
      return {
        perfil: null,
        error: new Error(
          'No tienes permisos para administrar lotes.'
        )
      }
    }

    if (
      esAdminEmpresa &&
      !perfil.empresa_id
    ) {
      return {
        perfil: null,
        error: new Error(
          'Tu usuario no tiene una empresa asociada.'
        )
      }
    }

    return {
      perfil,
      error: null
    }
  }

/* =========================================================
   VALIDAR PRODUCTO Y MODELO

   Verifica:

   EMPRESA
      ↓
   PRODUCTO
      ↓
   MODELO
========================================================= */

const validarJerarquia = async (
  empresaId: string,
  productoId: string,
  modeloId: string
) => {
  /* ---------------------------------------------------------
     PRODUCTO
  --------------------------------------------------------- */

  const {
    data: producto,
    error: productoError
  } = await supabase
    .from('productos')
    .select(
      'id, empresa_id'
    )
    .eq(
      'id',
      productoId
    )
    .maybeSingle()

  if (productoError) {
    return {
      error:
        productoError
    }
  }

  if (!producto) {
    return {
      error:
        new Error(
          'El producto seleccionado no existe o no tienes acceso a él.'
        )
    }
  }

  if (
    producto.empresa_id !==
    empresaId
  ) {
    return {
      error:
        new Error(
          'El producto seleccionado no pertenece a la empresa indicada.'
        )
    }
  }

  /* ---------------------------------------------------------
     MODELO
  --------------------------------------------------------- */

  const {
    data: modelo,
    error: modeloError
  } = await supabase
    .from('modelos')
    .select(
      'id, empresa_id, producto_id'
    )
    .eq(
      'id',
      modeloId
    )
    .maybeSingle()

  if (modeloError) {
    return {
      error:
        modeloError
    }
  }

  if (!modelo) {
    return {
      error:
        new Error(
          'El modelo seleccionado no existe o no tienes acceso a él.'
        )
    }
  }

  if (
    modelo.empresa_id !==
    empresaId
  ) {
    return {
      error:
        new Error(
          'El modelo seleccionado no pertenece a la empresa indicada.'
        )
    }
  }

  if (
    modelo.producto_id !==
    productoId
  ) {
    return {
      error:
        new Error(
          'El modelo seleccionado no pertenece al producto indicado.'
        )
    }
  }

  return {
    error: null
  }
}

/* =========================================================
   GENERAR UNIDADES FALTANTES

   IMPORTANTE:

   - No duplica unidades.
   - No modifica códigos antiguos.
   - No elimina unidades si baja cantidad.
   - Solo crea números faltantes.
========================================================= */

const generarUnidadesFaltantes =
  async (
    lote: {
      id: string
      codigo: string
      cantidad: number
      empresa_id: string
      producto_id: string
      modelo_id: string
    }
  ) => {
    const {
      data: existentes,
      error: errorConsulta
    } =
      await supabase
        .from('unidades')
        .select(
          'numero_unidad, codigo'
        )
        .eq(
          'lote_id',
          lote.id
        )

    if (errorConsulta) {
      console.error(
        'Error consultando unidades existentes:',
        errorConsulta
      )

      return {
        data: null,
        error:
          errorConsulta
      }
    }

    const numerosExistentes =
      new Set(
        (existentes || []).map(
          unidad =>
            Number(
              unidad.numero_unidad
            )
        )
      )

    const unidadesNuevas:
      any[] = []

    for (
      let numero = 1;
      numero <=
      lote.cantidad;
      numero++
    ) {
      if (
        numerosExistentes.has(
          numero
        )
      ) {
        continue
      }

      const codigoUnidad =
        generarCodigoUnidad(
          lote.codigo,
          numero
        )

      unidadesNuevas.push({
        id:
          crypto.randomUUID(),

        codigo:
          codigoUnidad,

        lote_id:
          lote.id,

        empresa_id:
          lote.empresa_id,

        producto_id:
          lote.producto_id,

        modelo_id:
          lote.modelo_id,

        numero_unidad:
          numero,

        estado:
          'activo'
      })
    }

    if (
      unidadesNuevas.length ===
      0
    ) {
      return {
        data: [],
        error: null
      }
    }

    const resultado =
      await supabase
        .from('unidades')
        .insert(
          unidadesNuevas
        )
        .select()

    if (resultado.error) {
      console.error(
        'Error generando unidades:',
        resultado.error
      )
    }

    return resultado
  }

/* =========================================================
   CREAR LOTE
========================================================= */

export const createLote =
  async (
    data: any
  ) => {
    /* ---------------------------------------------------------
       PERFIL
    --------------------------------------------------------- */

    const {
      perfil,
      error: perfilError
    } =
      await obtenerPerfilOperativo()

    if (
      perfilError ||
      !perfil
    ) {
      return {
        data: null,
        error:
          perfilError ||
          new Error(
            'Perfil no válido.'
          )
      }
    }

    const esSuperadmin =
      perfil.rol ===
      'superadmin'

    /* ---------------------------------------------------------
       CÓDIGO
    --------------------------------------------------------- */

    if (
      !data.codigo?.trim()
    ) {
      return {
        data: null,
        error:
          new Error(
            'Debes ingresar un código de lote.'
          )
      }
    }

    const codigo =
      normalizarCodigoLote(
        data.codigo
      )

    if (!codigo) {
      return {
        data: null,
        error:
          new Error(
            'El código del lote no es válido.'
          )
      }
    }

    /* ---------------------------------------------------------
       EMPRESA

       SUPERADMIN:
       viene del formulario.

       ADMIN_EMPRESA:
       SIEMPRE viene del perfil.
    --------------------------------------------------------- */

    let empresaId:
      string | null = null

    if (esSuperadmin) {
      empresaId =
        typeof data.empresa_id ===
        'string'
          ? data.empresa_id.trim()
          : ''

      if (!empresaId) {
        return {
          data: null,
          error:
            new Error(
              'Debes seleccionar una empresa.'
            )
        }
      }
    } else {
      empresaId =
        perfil.empresa_id

      if (!empresaId) {
        return {
          data: null,
          error:
            new Error(
              'Tu usuario no tiene una empresa asociada.'
            )
        }
      }
    }

    /* ---------------------------------------------------------
       PRODUCTO
    --------------------------------------------------------- */

    const productoId =
      typeof data.producto_id ===
      'string'
        ? data.producto_id.trim()
        : ''

    if (!productoId) {
      return {
        data: null,
        error:
          new Error(
            'Debes seleccionar un producto.'
          )
      }
    }

    /* ---------------------------------------------------------
       MODELO
    --------------------------------------------------------- */

    const modeloId =
      typeof data.modelo_id ===
      'string'
        ? data.modelo_id.trim()
        : ''

    if (!modeloId) {
      return {
        data: null,
        error:
          new Error(
            'Debes seleccionar un modelo.'
          )
      }
    }

    /* ---------------------------------------------------------
       CANTIDAD
    --------------------------------------------------------- */

    const cantidad =
      Number(
        data.cantidad
      )

    if (
      !Number.isInteger(
        cantidad
      ) ||
      cantidad < 1
    ) {
      return {
        data: null,
        error:
          new Error(
            'La cantidad debe ser un número entero mayor o igual a 1.'
          )
      }
    }

    /* ---------------------------------------------------------
       VALIDAR JERARQUÍA
    --------------------------------------------------------- */

    const validacion =
      await validarJerarquia(
        empresaId,
        productoId,
        modeloId
      )

    if (
      validacion.error
    ) {
      return {
        data: null,
        error:
          validacion.error
      }
    }

    /* ---------------------------------------------------------
       CREAR LOTE
    --------------------------------------------------------- */

    const loteId =
      crypto.randomUUID()

    const res =
      await supabase
        .from('lotes')
        .insert([
          {
            id:
              loteId,

            codigo,

            cantidad,

            empresa_id:
              empresaId,

            producto_id:
              productoId,

            modelo_id:
              modeloId,

            estado:
              data.estado ||
              'activo'
          }
        ])
        .select()
        .single()

    if (res.error) {
      console.error(
        'Error creando lote:',
        res.error
      )

      return {
        data: null,
        error:
          res.error
      }
    }

    /* ---------------------------------------------------------
       GENERAR UNIDADES
    --------------------------------------------------------- */

    const resultadoUnidades =
      await generarUnidadesFaltantes({
        id:
          res.data.id,

        codigo:
          res.data.codigo,

        cantidad:
          Number(
            res.data.cantidad
          ),

        empresa_id:
          res.data.empresa_id,

        producto_id:
          res.data.producto_id,

        modelo_id:
          res.data.modelo_id
      })

    /*
      Si las unidades fallan, el lote
      permanece creado.

      Esto mantiene el comportamiento
      actual de la aplicación.
    */

    if (
      resultadoUnidades.error
    ) {
      console.error(
        'El lote fue creado, pero ocurrió un error generando las unidades.',
        resultadoUnidades.error
      )

      return {
        data:
          res.data,

        error:
          resultadoUnidades.error
      }
    }

    return {
      data:
        res.data,

      error:
        null
    }
  }

/* =========================================================
   ACTUALIZAR LOTE

   PROTECCIÓN DE IDENTIDAD:

   NO modificamos:
   - código
   - empresa_id
   - producto_id
   - modelo_id

   Solo:
   - cantidad
   - estado

   Así no rompemos QR ni unidades existentes.
========================================================= */

export const updateLote =
  async (
    id: string,
    data: any
  ) => {
    if (!id) {
      return {
        data: null,
        error:
          new Error(
            'No se encontró el ID del lote.'
          )
      }
    }

    /* ---------------------------------------------------------
       PERFIL
    --------------------------------------------------------- */

    const {
      perfil,
      error: perfilError
    } =
      await obtenerPerfilOperativo()

    if (
      perfilError ||
      !perfil
    ) {
      return {
        data: null,
        error:
          perfilError ||
          new Error(
            'Perfil no válido.'
          )
      }
    }

    /* ---------------------------------------------------------
       OBTENER LOTE ACTUAL

       RLS impide acceder a lotes ajenos.
    --------------------------------------------------------- */

    const {
      data: loteActual,
      error: loteError
    } =
      await supabase
        .from('lotes')
        .select(`
          id,
          codigo,
          cantidad,
          empresa_id,
          producto_id,
          modelo_id,
          estado
        `)
        .eq(
          'id',
          id
        )
        .maybeSingle()

    if (loteError) {
      return {
        data: null,
        error:
          loteError
      }
    }

    if (!loteActual) {
      return {
        data: null,
        error:
          new Error(
            'El lote no existe o no tienes acceso a él.'
          )
      }
    }

    /* ---------------------------------------------------------
       COMPROBACIÓN EXTRA ADMIN_EMPRESA
    --------------------------------------------------------- */

    if (
      perfil.rol ===
        'admin_empresa' &&
      loteActual.empresa_id !==
        perfil.empresa_id
    ) {
      return {
        data: null,
        error:
          new Error(
            'No tienes permisos para modificar este lote.'
          )
      }
    }

    /* ---------------------------------------------------------
       CANTIDAD
    --------------------------------------------------------- */

    const cantidad =
      Number(
        data.cantidad
      )

    if (
      !Number.isInteger(
        cantidad
      ) ||
      cantidad < 1
    ) {
      return {
        data: null,
        error:
          new Error(
            'La cantidad debe ser un número entero mayor o igual a 1.'
          )
      }
    }

    /* ---------------------------------------------------------
       UPDATE

       IMPORTANTE:
       NO usamos aquí empresa/producto/modelo/código
       provenientes del formulario.
    --------------------------------------------------------- */

    const res =
      await supabase
        .from('lotes')
        .update({
          cantidad,

          estado:
            data.estado ||
            loteActual.estado ||
            'activo'
        })
        .eq(
          'id',
          id
        )
        .select()
        .single()

    if (res.error) {
      console.error(
        'Error actualizando lote:',
        res.error
      )

      return {
        data: null,
        error:
          res.error
      }
    }

    /* ---------------------------------------------------------
       GENERAR ÚNICAMENTE UNIDADES FALTANTES
    --------------------------------------------------------- */

    const resultadoUnidades =
      await generarUnidadesFaltantes({
        id:
          res.data.id,

        codigo:
          res.data.codigo,

        cantidad:
          Number(
            res.data.cantidad
          ),

        empresa_id:
          res.data.empresa_id,

        producto_id:
          res.data.producto_id,

        modelo_id:
          res.data.modelo_id
      })

    if (
      resultadoUnidades.error
    ) {
      console.error(
        'Error generando unidades faltantes:',
        resultadoUnidades.error
      )

      return {
        data:
          res.data,

        error:
          resultadoUnidades.error
      }
    }

    return {
      data:
        res.data,

      error:
        null
    }
  }

/* =========================================================
   ELIMINAR LOTE
========================================================= */

export const deleteLote =
  async (
    id: string
  ) => {
    const {
      perfil,
      error: perfilError
    } =
      await obtenerPerfilOperativo()

    if (
      perfilError ||
      !perfil
    ) {
      return {
        data: null,
        error:
          perfilError ||
          new Error(
            'Perfil no válido.'
          )
      }
    }

    /*
      RLS es la protección definitiva.

      La consulta solamente podrá eliminar
      un lote al que el usuario tenga acceso.
    */

    const res =
      await supabase
        .from('lotes')
        .delete()
        .eq(
          'id',
          id
        )
        .select()

    if (res.error) {
      console.error(
        'Error eliminando lote:',
        res.error
      )
    }

    return res
  }
