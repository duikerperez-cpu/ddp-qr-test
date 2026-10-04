import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ============================================================
// TIPOS
// ============================================================

export type PerfilCertificados = {
  id: string
  nombre: string | null
  apellido: string | null
  cargo: string | null
  rol: string | null
  activo: boolean | null
  empresa_id: string | null
}

export type EmpresaCertificado = {
  id: string
  razon_social: string | null
  nombre: string | null
  name: string | null
  empresa_nombre: string | null
  rut: string | null
  pais: string | null
  sector: string | null
  estado: string | null
}

export type UnidadCertificado = {
  id: string
  codigo_publico: string | null
  codigo_qr: string | null
  numero_unidad: number | null
  estado: string | null

  empresa_id: string | null
  producto_id: string | null
  modelo_id: string | null
  lote_id: string | null

  producto_nombre: string | null
  producto_categoria: string | null

  modelo_nombre: string | null
  modelo_version: string | null

  lote_codigo: string | null

  dpp_id: string | null
  dpp_codigo: string | null

  carrier_id: string | null
  uid_nfc: string | null
  qr_url: string | null
}

export type Certificado = {
  id: string
  codigo: string
  tipo: string
  titulo: string
  descripcion: string | null

  empresa_id: string

  producto_id: string | null
  modelo_id: string | null
  lote_id: string | null
  unidad_id: string | null
  dpp_id: string | null
  carrier_id: string | null

  estado: string

  fecha_emision: string
  fecha_vencimiento: string | null

  emitido_por: string

  referencia_verificacion: string | null
  hash_verificacion: string | null

  observaciones: string | null

  datos: Record<string, any>

  created_at: string
  updated_at: string

  empresa_nombre?: string | null
  producto_nombre?: string | null
  modelo_nombre?: string | null
  lote_codigo?: string | null
  unidad_codigo?: string | null
  dpp_codigo?: string | null
}

// ============================================================
// NORMALIZAR ROL
// ============================================================

export function normalizarRol(
  rol: string | null | undefined
) {
  return String(rol || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/_/g, '')
    .replace(/-/g, '')
}

// ============================================================
// PERFIL ACTUAL
// ============================================================

export async function getPerfilCertificados(): Promise<PerfilCertificados> {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error(
      'Sesión no válida.'
    )
  }

  const {
    data,
    error
  } = await supabase
    .from('perfiles')
    .select(`
      id,
      nombre,
      apellido,
      cargo,
      rol,
      activo,
      empresa_id
    `)
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    console.error(
      'Error obteniendo perfil:',
      error
    )

    throw new Error(
      'No fue posible obtener el perfil del usuario.'
    )
  }

  if (!data) {
    throw new Error(
      'No existe un perfil asociado a esta cuenta.'
    )
  }

  if (data.activo === false) {
    throw new Error(
      'La cuenta se encuentra desactivada.'
    )
  }

  const rol =
    normalizarRol(data.rol)

  if (
    rol !== 'superadmin' &&
    rol !== 'adminempresa'
  ) {
    throw new Error(
      'No tienes permisos para administrar certificados.'
    )
  }

  if (
    rol === 'adminempresa' &&
    !data.empresa_id
  ) {
    throw new Error(
      'Tu cuenta no tiene una empresa asociada.'
    )
  }

  return data as PerfilCertificados
}

// ============================================================
// EMPRESA
// ============================================================

export async function getEmpresaCertificados(
  empresaId: string
): Promise<EmpresaCertificado | null> {
  const perfil =
    await getPerfilCertificados()

  const rol =
    normalizarRol(perfil.rol)

  if (
    rol !== 'superadmin' &&
    perfil.empresa_id !== empresaId
  ) {
    throw new Error(
      'No tienes acceso a esta empresa.'
    )
  }

  const {
    data,
    error
  } = await supabase
    .from('empresas')
    .select(`
      id,
      razon_social,
      nombre,
      name,
      empresa_nombre,
      rut,
      pais,
      sector,
      estado
    `)
    .eq('id', empresaId)
    .maybeSingle()

  if (error) {
    console.error(
      'Error obteniendo empresa:',
      error
    )

    throw new Error(
      'No fue posible obtener la empresa.'
    )
  }

  return data as EmpresaCertificado | null
}

// ============================================================
// EMPRESAS
// ============================================================

export async function getEmpresasCertificados(): Promise<
  EmpresaCertificado[]
> {
  const perfil =
    await getPerfilCertificados()

  const rol =
    normalizarRol(perfil.rol)

  let query = supabase
    .from('empresas')
    .select(`
      id,
      razon_social,
      nombre,
      name,
      empresa_nombre,
      rut,
      pais,
      sector,
      estado
    `)
    .order(
      'razon_social',
      {
        ascending: true
      }
    )

  if (
    rol === 'adminempresa'
  ) {
    query = query.eq(
      'id',
      perfil.empresa_id!
    )
  }

  const {
    data,
    error
  } = await query

  if (error) {
    console.error(
      'Error obteniendo empresas:',
      error
    )

    throw new Error(
      'No fue posible cargar las empresas.'
    )
  }

  return (
    data || []
  ) as EmpresaCertificado[]
}

// ============================================================
// UNIDADES PARA CERTIFICACIÓN
//
// VERSIÓN OPTIMIZADA:
//
// Antes:
// varias consultas por cada unidad.
//
// Ahora:
// 1 consulta unidades
// 1 productos
// 1 modelos
// 1 lotes
// 1 DPP
// 1 NFC/QR
//
// Total aproximado:
// 6 consultas independientemente del número de unidades.
// ============================================================

export async function getUnidadesCertificados(): Promise<
  UnidadCertificado[]
> {
  const perfil =
    await getPerfilCertificados()

  const rol =
    normalizarRol(perfil.rol)

  let query = supabase
    .from('productos_individuales')
    .select(`
      id,
      codigo_publico,
      codigo_qr,
      numero_unidad,
      estado,
      empresa_id,
      producto_id,
      modelo_id,
      lote_id,
      created_at
    `)
    .order(
      'created_at',
      {
        ascending: false
      }
    )

  if (
    rol === 'adminempresa'
  ) {
    query = query.eq(
      'empresa_id',
      perfil.empresa_id!
    )
  }

  const {
    data: unidades,
    error: unidadesError
  } = await query

  if (unidadesError) {
    console.error(
      'Error obteniendo unidades:',
      unidadesError
    )

    throw new Error(
      'No fue posible cargar las unidades.'
    )
  }

  if (
    !unidades ||
    unidades.length === 0
  ) {
    return []
  }

  // ==========================================================
  // IDS ÚNICOS
  // ==========================================================

  const productoIds = Array.from(
    new Set(
      unidades
        .map(
          (unidad) =>
            unidad.producto_id
        )
        .filter(
          (
            id
          ): id is string =>
            Boolean(id)
        )
    )
  )

  const modeloIds = Array.from(
    new Set(
      unidades
        .map(
          (unidad) =>
            unidad.modelo_id
        )
        .filter(
          (
            id
          ): id is string =>
            Boolean(id)
        )
    )
  )

  const loteIds = Array.from(
    new Set(
      unidades
        .map(
          (unidad) =>
            unidad.lote_id
        )
        .filter(
          (
            id
          ): id is string =>
            Boolean(id)
        )
    )
  )

  const unidadIds =
    unidades.map(
      (unidad) =>
        unidad.id
    )

  // ==========================================================
  // CONSULTAS EN PARALELO
  // ==========================================================

  const [
    productosResponse,
    modelosResponse,
    lotesResponse,
    dppsResponse,
    carriersResponse
  ] = await Promise.all([
    productoIds.length > 0
      ? supabase
          .from('productos')
          .select(
            'id,nombre,categoria'
          )
          .in(
            'id',
            productoIds
          )
      : Promise.resolve({
          data: [],
          error: null
        }),

    modeloIds.length > 0
      ? supabase
          .from('modelos')
          .select(
            'id,nombre,version'
          )
          .in(
            'id',
            modeloIds
          )
      : Promise.resolve({
          data: [],
          error: null
        }),

    loteIds.length > 0
      ? supabase
          .from('lotes')
          .select(
            'id,codigo'
          )
          .in(
            'id',
            loteIds
          )
      : Promise.resolve({
          data: [],
          error: null
        }),

    supabase
      .from('dpps')
      .select(
        'id,codigo,unidad_id,created_at'
      )
      .in(
        'unidad_id',
        unidadIds
      )
      .order(
        'created_at',
        {
          ascending: false
        }
      ),

    supabase
      .from('nfc_qr')
      .select(
        `
        id_carrier,
        unidad_id,
        uid_nfc,
        qr_url,
        fecha_asignacion
        `
      )
      .in(
        'unidad_id',
        unidadIds
      )
      .order(
        'fecha_asignacion',
        {
          ascending: false
        }
      )
  ])

  if (
    productosResponse.error
  ) {
    console.error(
      'Error cargando productos:',
      productosResponse.error
    )
  }

  if (
    modelosResponse.error
  ) {
    console.error(
      'Error cargando modelos:',
      modelosResponse.error
    )
  }

  if (
    lotesResponse.error
  ) {
    console.error(
      'Error cargando lotes:',
      lotesResponse.error
    )
  }

  if (
    dppsResponse.error
  ) {
    console.error(
      'Error cargando DPP:',
      dppsResponse.error
    )
  }

  if (
    carriersResponse.error
  ) {
    console.error(
      'Error cargando carriers:',
      carriersResponse.error
    )
  }

  // ==========================================================
  // MAPAS
  // ==========================================================

  const productosMap =
    new Map<
      string,
      {
        nombre: string | null
        categoria: string | null
      }
    >()

  for (
    const producto of
      productosResponse.data || []
  ) {
    productosMap.set(
      producto.id,
      {
        nombre:
          producto.nombre ||
          null,

        categoria:
          producto.categoria ||
          null
      }
    )
  }

  const modelosMap =
    new Map<
      string,
      {
        nombre: string | null
        version: string | null
      }
    >()

  for (
    const modelo of
      modelosResponse.data || []
  ) {
    modelosMap.set(
      modelo.id,
      {
        nombre:
          modelo.nombre ||
          null,

        version:
          modelo.version ||
          null
      }
    )
  }

  const lotesMap =
    new Map<
      string,
      {
        codigo: string | null
      }
    >()

  for (
    const lote of
      lotesResponse.data || []
  ) {
    lotesMap.set(
      lote.id,
      {
        codigo:
          lote.codigo ||
          null
      }
    )
  }

  // ==========================================================
  // DPP MÁS RECIENTE POR UNIDAD
  // ==========================================================

  const dppsMap =
    new Map<
      string,
      {
        id: string
        codigo: string | null
      }
    >()

  for (
    const dpp of
      dppsResponse.data || []
  ) {
    if (
      !dpp.unidad_id
    ) {
      continue
    }

    if (
      !dppsMap.has(
        dpp.unidad_id
      )
    ) {
      dppsMap.set(
        dpp.unidad_id,
        {
          id:
            dpp.id,

          codigo:
            dpp.codigo ||
            null
        }
      )
    }
  }

  // ==========================================================
  // CARRIER MÁS RECIENTE POR UNIDAD
  // ==========================================================

  const carriersMap =
    new Map<
      string,
      {
        id_carrier: string
        uid_nfc: string | null
        qr_url: string | null
      }
    >()

  for (
    const carrier of
      carriersResponse.data || []
  ) {
    if (
      !carrier.unidad_id
    ) {
      continue
    }

    if (
      !carriersMap.has(
        carrier.unidad_id
      )
    ) {
      carriersMap.set(
        carrier.unidad_id,
        {
          id_carrier:
            carrier.id_carrier,

          uid_nfc:
            carrier.uid_nfc ||
            null,

          qr_url:
            carrier.qr_url ||
            null
        }
      )
    }
  }

  // ==========================================================
  // CONSTRUIR RESULTADO
  // ==========================================================

  return unidades.map(
    (unidad) => {
      const producto =
        unidad.producto_id
          ? productosMap.get(
              unidad.producto_id
            )
          : undefined

      const modelo =
        unidad.modelo_id
          ? modelosMap.get(
              unidad.modelo_id
            )
          : undefined

      const lote =
        unidad.lote_id
          ? lotesMap.get(
              unidad.lote_id
            )
          : undefined

      const dpp =
        dppsMap.get(
          unidad.id
        )

      const carrier =
        carriersMap.get(
          unidad.id
        )

      return {
        id:
          unidad.id,

        codigo_publico:
          unidad.codigo_publico ||
          null,

        codigo_qr:
          unidad.codigo_qr ||
          null,

        numero_unidad:
          unidad.numero_unidad ??
          null,

        estado:
          unidad.estado ||
          null,

        empresa_id:
          unidad.empresa_id ||
          null,

        producto_id:
          unidad.producto_id ||
          null,

        modelo_id:
          unidad.modelo_id ||
          null,

        lote_id:
          unidad.lote_id ||
          null,

        producto_nombre:
          producto?.nombre ||
          null,

        producto_categoria:
          producto?.categoria ||
          null,

        modelo_nombre:
          modelo?.nombre ||
          null,

        modelo_version:
          modelo?.version ||
          null,

        lote_codigo:
          lote?.codigo ||
          null,

        dpp_id:
          dpp?.id ||
          null,

        dpp_codigo:
          dpp?.codigo ||
          null,

        carrier_id:
          carrier?.id_carrier ||
          null,

        uid_nfc:
          carrier?.uid_nfc ||
          null,

        qr_url:
          carrier?.qr_url ||
          null
      }
    }
  )
}

// ============================================================
// CERTIFICADOS
//
// TAMBIÉN OPTIMIZADO POR LOTES.
// ============================================================

export async function getCertificados(): Promise<
  Certificado[]
> {
  const perfil =
    await getPerfilCertificados()

  const rol =
    normalizarRol(perfil.rol)

  let query = supabase
    .from('certificados')
    .select('*')
    .order(
      'fecha_emision',
      {
        ascending: false
      }
    )

  if (
    rol === 'adminempresa'
  ) {
    query = query.eq(
      'empresa_id',
      perfil.empresa_id!
    )
  }

  const {
    data,
    error
  } = await query

  if (error) {
    console.error(
      'Error obteniendo certificados:',
      error
    )

    throw new Error(
      'No fue posible cargar los certificados.'
    )
  }

  const certificados =
    (data || []) as Certificado[]

  if (
    certificados.length === 0
  ) {
    return []
  }

  // ==========================================================
  // IDS
  // ==========================================================

  const empresaIds = Array.from(
    new Set(
      certificados
        .map(
          (item) =>
            item.empresa_id
        )
        .filter(Boolean)
    )
  )

  const productoIds = Array.from(
    new Set(
      certificados
        .map(
          (item) =>
            item.producto_id
        )
        .filter(
          (
            id
          ): id is string =>
            Boolean(id)
        )
    )
  )

  const modeloIds = Array.from(
    new Set(
      certificados
        .map(
          (item) =>
            item.modelo_id
        )
        .filter(
          (
            id
          ): id is string =>
            Boolean(id)
        )
    )
  )

  const loteIds = Array.from(
    new Set(
      certificados
        .map(
          (item) =>
            item.lote_id
        )
        .filter(
          (
            id
          ): id is string =>
            Boolean(id)
        )
    )
  )

  const unidadIds = Array.from(
    new Set(
      certificados
        .map(
          (item) =>
            item.unidad_id
        )
        .filter(
          (
            id
          ): id is string =>
            Boolean(id)
        )
    )
  )

  const dppIds = Array.from(
    new Set(
      certificados
        .map(
          (item) =>
            item.dpp_id
        )
        .filter(
          (
            id
          ): id is string =>
            Boolean(id)
        )
    )
  )

  // ==========================================================
  // CONSULTAS PARALELAS
  // ==========================================================

  const [
    empresasResponse,
    productosResponse,
    modelosResponse,
    lotesResponse,
    unidadesResponse,
    dppsResponse
  ] = await Promise.all([
    empresaIds.length > 0
      ? supabase
          .from('empresas')
          .select(`
            id,
            razon_social,
            empresa_nombre,
            nombre,
            name
          `)
          .in(
            'id',
            empresaIds
          )
      : Promise.resolve({
          data: [],
          error: null
        }),

    productoIds.length > 0
      ? supabase
          .from('productos')
          .select(
            'id,nombre'
          )
          .in(
            'id',
            productoIds
          )
      : Promise.resolve({
          data: [],
          error: null
        }),

    modeloIds.length > 0
      ? supabase
          .from('modelos')
          .select(
            'id,nombre'
          )
          .in(
            'id',
            modeloIds
          )
      : Promise.resolve({
          data: [],
          error: null
        }),

    loteIds.length > 0
      ? supabase
          .from('lotes')
          .select(
            'id,codigo'
          )
          .in(
            'id',
            loteIds
          )
      : Promise.resolve({
          data: [],
          error: null
        }),

    unidadIds.length > 0
      ? supabase
          .from(
            'productos_individuales'
          )
          .select(`
            id,
            codigo_publico,
            codigo_qr
          `)
          .in(
            'id',
            unidadIds
          )
      : Promise.resolve({
          data: [],
          error: null
        }),

    dppIds.length > 0
      ? supabase
          .from('dpps')
          .select(
            'id,codigo'
          )
          .in(
            'id',
            dppIds
          )
      : Promise.resolve({
          data: [],
          error: null
        })
  ])

  // ==========================================================
  // MAPAS
  // ==========================================================

  const empresasMap =
    new Map<string, string>()

  for (
    const empresa of
      empresasResponse.data || []
  ) {
    empresasMap.set(
      empresa.id,
      empresa.razon_social ||
        empresa.empresa_nombre ||
        empresa.nombre ||
        empresa.name ||
        empresa.id
    )
  }

  const productosMap =
    new Map<string, string>()

  for (
    const producto of
      productosResponse.data || []
  ) {
    productosMap.set(
      producto.id,
      producto.nombre ||
        producto.id
    )
  }

  const modelosMap =
    new Map<string, string>()

  for (
    const modelo of
      modelosResponse.data || []
  ) {
    modelosMap.set(
      modelo.id,
      modelo.nombre ||
        modelo.id
    )
  }

  const lotesMap =
    new Map<string, string>()

  for (
    const lote of
      lotesResponse.data || []
  ) {
    lotesMap.set(
      lote.id,
      lote.codigo ||
        lote.id
    )
  }

  const unidadesMap =
    new Map<string, string>()

  for (
    const unidad of
      unidadesResponse.data || []
  ) {
    unidadesMap.set(
      unidad.id,
      unidad.codigo_publico ||
        unidad.codigo_qr ||
        unidad.id
    )
  }

  const dppsMap =
    new Map<string, string>()

  for (
    const dpp of
      dppsResponse.data || []
  ) {
    dppsMap.set(
      dpp.id,
      dpp.codigo ||
        dpp.id
    )
  }

  // ==========================================================
  // RESULTADO
  // ==========================================================

  return certificados.map(
    (certificado) => ({
      ...certificado,

      empresa_nombre:
        empresasMap.get(
          certificado.empresa_id
        ) || null,

      producto_nombre:
        certificado.producto_id
          ? productosMap.get(
              certificado.producto_id
            ) || null
          : null,

      modelo_nombre:
        certificado.modelo_id
          ? modelosMap.get(
              certificado.modelo_id
            ) || null
          : null,

      lote_codigo:
        certificado.lote_id
          ? lotesMap.get(
              certificado.lote_id
            ) || null
          : null,

      unidad_codigo:
        certificado.unidad_id
          ? unidadesMap.get(
              certificado.unidad_id
            ) || null
          : null,

      dpp_codigo:
        certificado.dpp_id
          ? dppsMap.get(
              certificado.dpp_id
            ) || null
          : null
    })
  )
}

// ============================================================
// CERTIFICADO POR ID
// ============================================================

export async function getCertificadoPorId(
  id: string
): Promise<Certificado | null> {
  await getPerfilCertificados()

  const {
    data,
    error
  } = await supabase
    .from('certificados')
    .select('*')
    .eq(
      'id',
      id
    )
    .maybeSingle()

  if (error) {
    console.error(
      'Error obteniendo certificado:',
      error
    )

    throw new Error(
      'No fue posible obtener el certificado.'
    )
  }

  return data as Certificado | null
}

// ============================================================
// CREAR CERTIFICADO
// ============================================================

export async function crearCertificado({
  unidad,
  tipo = 'autenticidad',
  titulo = 'Certificado de Autenticidad',
  descripcion = null,
  fechaVencimiento = null,
  observaciones = null
}: {
  unidad: UnidadCertificado
  tipo?: string
  titulo?: string
  descripcion?: string | null
  fechaVencimiento?: string | null
  observaciones?: string | null
}): Promise<Certificado> {
  const perfil =
    await getPerfilCertificados()

  const rol =
    normalizarRol(perfil.rol)

  if (
    !unidad.empresa_id
  ) {
    throw new Error(
      'La unidad no tiene una empresa asociada.'
    )
  }

  if (
    rol === 'adminempresa' &&
    unidad.empresa_id !==
      perfil.empresa_id
  ) {
    throw new Error(
      'No puedes certificar una unidad perteneciente a otra empresa.'
    )
  }

  // ==========================================================
  // EVITAR AUTENTICIDAD DUPLICADA
  // ==========================================================

  if (
    tipo === 'autenticidad'
  ) {
    const {
      data: existente,
      error: existenteError
    } = await supabase
      .from('certificados')
      .select(
        'id,codigo,estado'
      )
      .eq(
        'unidad_id',
        unidad.id
      )
      .eq(
        'tipo',
        'autenticidad'
      )
      .neq(
        'estado',
        'revocado'
      )
      .limit(1)

    if (existenteError) {
      console.error(
        'Error verificando certificado:',
        existenteError
      )

      throw new Error(
        'No fue posible verificar los certificados existentes.'
      )
    }

    if (
      existente &&
      existente.length > 0
    ) {
      throw new Error(
        `La unidad ya posee un certificado de autenticidad activo: ${existente[0].codigo}`
      )
    }
  }

  // ==========================================================
  // SNAPSHOT
  // ==========================================================

  const datos = {
    unidad: {
      id:
        unidad.id,

      codigo:
        unidad.codigo_publico ||
        unidad.codigo_qr ||
        unidad.id,

      numero:
        unidad.numero_unidad,

      estado:
        unidad.estado
    },

    producto: {
      id:
        unidad.producto_id,

      nombre:
        unidad.producto_nombre,

      categoria:
        unidad.producto_categoria
    },

    modelo: {
      id:
        unidad.modelo_id,

      nombre:
        unidad.modelo_nombre,

      version:
        unidad.modelo_version
    },

    lote: {
      id:
        unidad.lote_id,

      codigo:
        unidad.lote_codigo
    },

    dpp: {
      id:
        unidad.dpp_id,

      codigo:
        unidad.dpp_codigo
    },

    identidad_fisica: {
      carrier_id:
        unidad.carrier_id,

      uid_nfc:
        unidad.uid_nfc,

      qr_url:
        unidad.qr_url
    }
  }

  const {
    data,
    error
  } = await supabase
    .from('certificados')
    .insert({
      codigo: '',

      tipo,

      titulo,

      descripcion,

      empresa_id:
        unidad.empresa_id,

      producto_id:
        unidad.producto_id,

      modelo_id:
        unidad.modelo_id,

      lote_id:
        unidad.lote_id,

      unidad_id:
        unidad.id,

      dpp_id:
        unidad.dpp_id,

      carrier_id:
        unidad.carrier_id,

      estado:
        'valido',

      fecha_vencimiento:
        fechaVencimiento ||
        null,

      emitido_por:
        'VINCULAB',

      observaciones,

      datos
    })
    .select('*')
    .single()

  if (error) {
    console.error(
      'Error creando certificado:',
      error
    )

    throw new Error(
      error.message ||
        'No fue posible emitir el certificado.'
    )
  }

  return data as Certificado
}

// ============================================================
// CAMBIAR ESTADO
// ============================================================

export async function cambiarEstadoCertificado(
  certificadoId: string,
  nuevoEstado:
    | 'valido'
    | 'revocado'
    | 'vencido'
    | 'suspendido'
): Promise<void> {
  const perfil =
    await getPerfilCertificados()

  const rol =
    normalizarRol(perfil.rol)

  const {
    data: certificado,
    error: certificadoError
  } = await supabase
    .from('certificados')
    .select(
      'id,empresa_id'
    )
    .eq(
      'id',
      certificadoId
    )
    .maybeSingle()

  if (
    certificadoError ||
    !certificado
  ) {
    throw new Error(
      'No fue posible encontrar el certificado.'
    )
  }

  if (
    rol === 'adminempresa' &&
    certificado.empresa_id !==
      perfil.empresa_id
  ) {
    throw new Error(
      'No puedes modificar certificados de otra empresa.'
    )
  }

  const {
    error
  } = await supabase
    .from('certificados')
    .update({
      estado:
        nuevoEstado
    })
    .eq(
      'id',
      certificadoId
    )

  if (error) {
    console.error(
      'Error actualizando certificado:',
      error
    )

    throw new Error(
      'No fue posible actualizar el certificado.'
    )
  }
}

// ============================================================
// REVOCAR CERTIFICADO
// ============================================================

export async function revocarCertificado(
  certificadoId: string,
  motivo?: string
): Promise<void> {
  const perfil =
    await getPerfilCertificados()

  const rol =
    normalizarRol(perfil.rol)

  const {
    data: certificado,
    error: certificadoError
  } = await supabase
    .from('certificados')
    .select(
      'id,empresa_id,datos'
    )
    .eq(
      'id',
      certificadoId
    )
    .maybeSingle()

  if (
    certificadoError ||
    !certificado
  ) {
    throw new Error(
      'No fue posible encontrar el certificado.'
    )
  }

  if (
    rol === 'adminempresa' &&
    certificado.empresa_id !==
      perfil.empresa_id
  ) {
    throw new Error(
      'No puedes revocar certificados de otra empresa.'
    )
  }

  const datosActuales =
    certificado.datos &&
    typeof certificado.datos ===
      'object'
      ? certificado.datos
      : {}

  const nuevosDatos = {
    ...datosActuales,

    revocacion: {
      motivo:
        motivo ||
        'Certificado revocado',

      fecha:
        new Date().toISOString(),

      usuario:
        perfil.id
    }
  }

  const {
    error
  } = await supabase
    .from('certificados')
    .update({
      estado:
        'revocado',

      observaciones:
        motivo ||
        'Certificado revocado',

      datos:
        nuevosDatos
    })
    .eq(
      'id',
      certificadoId
    )

  if (error) {
    console.error(
      'Error revocando certificado:',
      error
    )

    throw new Error(
      'No fue posible revocar el certificado.'
    )
  }
}
