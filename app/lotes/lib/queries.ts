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
   * Primero consultamos las unidades que ya existen.
   *
   * Esto evita duplicarlas si:
   * - se vuelve a guardar el lote
   * - aumenta la cantidad
   * - hubo una generación anterior
   */

  const { data: existentes, error: errorConsulta } =
    await supabase
      .from('unidades')
      .select('numero_unidad')
      .eq('lote_id', lote.id)

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

  const numerosExistentes = new Set(
    (existentes || []).map(
      unidad => Number(unidad.numero_unidad)
    )
  )

  /*
   * Construimos únicamente las unidades
   * que todavía no existen.
   */

  const unidadesNuevas = []

  for (
    let numero = 1;
    numero <= lote.cantidad;
    numero++
  ) {
    if (numerosExistentes.has(numero)) {
      continue
    }

    const numeroFormateado =
      String(numero).padStart(4, '0')

    unidadesNuevas.push({
      id: crypto.randomUUID(),

      codigo:
        `${lote.codigo}-${numeroFormateado}`,

      lote_id: lote.id,

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
   * Si ya existen todas las unidades,
   * no hacemos ningún INSERT.
   */

  if (unidadesNuevas.length === 0) {
    return {
      data: [],
      error: null
    }
  }

  /*
   * Insertamos las unidades faltantes.
   */

  const resultado = await supabase
    .from('unidades')
    .insert(unidadesNuevas)
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
     VALIDACIONES
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
     CREAR LOTE
  =============================== */

  const loteId =
    crypto.randomUUID()

  const codigo =
    data.codigo.trim()

  const res = await supabase
    .from('lotes')
    .insert([
      {
        id: loteId,

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
      id: res.data.id,
      codigo: res.data.codigo,
      cantidad:
        Number(res.data.cantidad),

      empresa_id:
        res.data.empresa_id,

      producto_id:
        res.data.producto_id,

      modelo_id:
        res.data.modelo_id
    })

  /*
   * Si el lote se creó pero ocurrió
   * un problema creando las unidades,
   * NO eliminamos automáticamente
   * el lote.
   *
   * Así evitamos pérdida accidental
   * de información.
   */

  if (resultadoUnidades.error) {
    console.error(
      'El lote fue creado, pero ocurrió un error generando las unidades.'
    )

    alert(
      'El lote fue creado, pero ocurrió un error generando sus unidades.'
    )

    return {
      data: res.data,
      error:
        resultadoUnidades.error
    }
  }

  return {
    data: res.data,
    error: null
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
     VALIDACIONES
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
     ACTUALIZAR LOTE
  =============================== */

  const res = await supabase
    .from('lotes')
    .update({
      codigo:
        data.codigo.trim(),

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
    .eq('id', id)
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
      error: res.error
    }
  }

  /* ===============================
     GENERAR UNIDADES FALTANTES
  =============================== */

  const resultadoUnidades =
    await generarUnidadesFaltantes({
      id: res.data.id,
      codigo: res.data.codigo,
      cantidad:
        Number(res.data.cantidad),

      empresa_id:
        res.data.empresa_id,

      producto_id:
        res.data.producto_id,

      modelo_id:
        res.data.modelo_id
    })

  if (resultadoUnidades.error) {
    alert(
      'El lote fue actualizado, pero ocurrió un error generando las unidades faltantes.'
    )

    return {
      data: res.data,
      error:
        resultadoUnidades.error
    }
  }

  return {
    data: res.data,
    error: null
  }
}

/* =========================================================
   ELIMINAR LOTE
========================================================= */

export const deleteLote = async (
  id: string
) => {
  const res = await supabase
    .from('lotes')
    .delete()
    .eq('id', id)

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
