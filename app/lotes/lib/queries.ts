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
    normalizarCodigoLote(codigoLote)

  const numeroFormateado =
    String(numero).padStart(4, '0')

  return `VIN-${lote}-${numeroFormateado}`
}

/* =========================================================
   FUNCIÓN INTERNA
   GENERAR UNIDADES FALTANTES DEL LOTE
========================================================= */

const generarUnidadesFaltantes = async (
  lote: {
    id: string
    codigo: string
    cantidad: number
    empresa_id: string
    producto_id: string
    modelo_id: string
  }
) => {

  /*
   * Consultar las unidades que ya existen.
   *
   * Esto permite:
   *
   * - volver a guardar un lote sin duplicar
   * - aumentar la cantidad
   * - generar solamente unidades faltantes
   */

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
      error: errorConsulta
    }
  }

  /*
   * Crear conjunto con números
   * que ya existen.
   */

  const numerosExistentes =
    new Set(
      (existentes || []).map(
        unidad =>
          Number(
            unidad.numero_unidad
          )
      )
    )

  /*
   * Construir únicamente
   * las unidades faltantes.
   */

  const unidadesNuevas: any[] = []

  for (
    let numero = 1;
    numero <= lote.cantidad;
    numero++
  ) {

    /*
     * Si el número ya existe
     * no hacemos nada.
     *
     * IMPORTANTE:
     * tampoco modificamos códigos
     * antiguos.
     */

    if (
      numerosExistentes.has(numero)
    ) {
      continue
    }

    /*
     * Código definitivo de identidad:
     *
     * VIN-CODIGOLOTE-0001
     */

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

  /*
   * Si todas las unidades
   * ya existen, terminamos.
   */

  if (
    unidadesNuevas.length === 0
  ) {

    return {
      data: [],
      error: null
    }
  }

  /*
   * Insertar únicamente
   * las unidades nuevas.
   */

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

export const createLote = async (
  data: any
) => {

  /* ===============================
     VALIDAR CÓDIGO
  =============================== */

  if (!data.codigo?.trim()) {

    alert(
      'Debes ingresar un código de lote.'
    )

    return {
      data: null,
      error:
        new Error(
          'Código requerido'
        )
    }
  }

  /* ===============================
     VALIDAR EMPRESA
  =============================== */

  if (!data.empresa_id) {

    alert(
      'Debes seleccionar una empresa.'
    )

    return {
      data: null,
      error:
        new Error(
          'Empresa requerida'
        )
    }
  }

  /* ===============================
     VALIDAR PRODUCTO
  =============================== */

  if (!data.producto_id) {

    alert(
      'Debes seleccionar un producto.'
    )

    return {
      data: null,
      error:
        new Error(
          'Producto requerido'
        )
    }
  }

  /* ===============================
     VALIDAR MODELO
  =============================== */

  if (!data.modelo_id) {

    alert(
      'Debes seleccionar un modelo.'
    )

    return {
      data: null,
      error:
        new Error(
          'Modelo requerido'
        )
    }
  }

  /* ===============================
     VALIDAR CANTIDAD
  =============================== */

  const cantidad =
    Number(data.cantidad)

  if (
    !Number.isInteger(cantidad) ||
    cantidad < 1
  ) {

    alert(
      'La cantidad debe ser un número entero mayor o igual a 1.'
    )

    return {
      data: null,
      error:
        new Error(
          'Cantidad inválida'
        )
    }
  }

  /* ===============================
     GENERAR ID DEL LOTE
  =============================== */

  const loteId =
    crypto.randomUUID()

  /*
   * Guardamos el código del lote
   * normalizado.
   */

  const codigo =
    normalizarCodigoLote(
      data.codigo
    )

  if (!codigo) {

    alert(
      'El código del lote no es válido.'
    )

    return {
      data: null,
      error:
        new Error(
          'Código inválido'
        )
    }
  }

  /* ===============================
     CREAR LOTE
  =============================== */

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
            data.empresa_id,

          producto_id:
            data.producto_id,

          modelo_id:
            data.modelo_id,

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

    alert(
      `Error al crear lote: ${res.error.message}`
    )

    return {
      data: null,
      error: res.error
    }
  }

  /* ===============================
     GENERAR UNIDADES
  =============================== */

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
   * Si falla la creación de unidades,
   * conservamos el lote.
   */

  if (
    resultadoUnidades.error
  ) {

    console.error(
      'El lote fue creado, pero ocurrió un error generando las unidades.',
      resultadoUnidades.error
    )

    alert(
      'El lote fue creado, pero ocurrió un error generando sus unidades.'
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
========================================================= */

export const updateLote = async (
  id: string,
  data: any
) => {

  /* ===============================
     VALIDAR ID
  =============================== */

  if (!id) {

    alert(
      'No se encontró el ID del lote.'
    )

    return {
      data: null,
      error:
        new Error(
          'ID requerido'
        )
    }
  }

  /* ===============================
     VALIDAR CÓDIGO
  =============================== */

  if (!data.codigo?.trim()) {

    alert(
      'Debes ingresar un código de lote.'
    )

    return {
      data: null,
      error:
        new Error(
          'Código requerido'
        )
    }
  }

  /* ===============================
     VALIDAR EMPRESA
  =============================== */

  if (!data.empresa_id) {

    alert(
      'Debes seleccionar una empresa.'
    )

    return {
      data: null,
      error:
        new Error(
          'Empresa requerida'
        )
    }
  }

  /* ===============================
     VALIDAR PRODUCTO
  =============================== */

  if (!data.producto_id) {

    alert(
      'Debes seleccionar un producto.'
    )

    return {
      data: null,
      error:
        new Error(
          'Producto requerido'
        )
    }
  }

  /* ===============================
     VALIDAR MODELO
  =============================== */

  if (!data.modelo_id) {

    alert(
      'Debes seleccionar un modelo.'
    )

    return {
      data: null,
      error:
        new Error(
          'Modelo requerido'
        )
    }
  }

  /* ===============================
     VALIDAR CANTIDAD
  =============================== */

  const cantidad =
    Number(
      data.cantidad
    )

  if (
    !Number.isInteger(cantidad) ||
    cantidad < 1
  ) {

    alert(
      'La cantidad debe ser un número entero mayor o igual a 1.'
    )

    return {
      data: null,
      error:
        new Error(
          'Cantidad inválida'
        )
    }
  }

  /*
   * Normalizar código.
   */

  const codigo =
    normalizarCodigoLote(
      data.codigo
    )

  if (!codigo) {

    alert(
      'El código del lote no es válido.'
    )

    return {
      data: null,
      error:
        new Error(
          'Código inválido'
        )
    }
  }

  /* ===============================
     ACTUALIZAR LOTE
  =============================== */

  const res =
    await supabase
      .from('lotes')
      .update({

        codigo,

        cantidad,

        empresa_id:
          data.empresa_id,

        producto_id:
          data.producto_id,

        modelo_id:
          data.modelo_id,

        estado:
          data.estado ||
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

    alert(
      `Error al actualizar lote: ${res.error.message}`
    )

    return {
      data: null,
      error:
        res.error
    }
  }

  /* ===============================
     GENERAR UNIDADES FALTANTES
  =============================== */

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

    alert(
      'El lote fue actualizado, pero ocurrió un error generando las unidades faltantes.'
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

export const deleteLote = async (
  id: string
) => {

  const res =
    await supabase
      .from('lotes')
      .delete()
      .eq(
        'id',
        id
      )

  if (res.error) {

    console.error(
      'Error eliminando lote:',
      res.error
    )

    alert(
      `Error al eliminar lote: ${res.error.message}`
    )
  }

  return res
}
