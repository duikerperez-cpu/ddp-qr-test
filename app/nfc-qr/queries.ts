'use client'

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export type PerfilActual = {
  id: string
  rol: 'superadmin' | 'admin_empresa'
  empresa_id: string | null
  nombre: string | null
  activo: boolean
}

export type UnidadNfcQr = {
  id: string
  codigo: string
  numero_unidad: number
  estado: string | null

  empresa_id: string | null
  producto_id: string | null
  modelo_id: string | null
  lote_id: string

  empresa_nombre: string
  producto_nombre: string
  modelo_nombre: string
  lote_codigo: string

  carrier: CarrierNfcQr | null
}

export type CarrierNfcQr = {
  id_carrier: string
  unidad_id: string | null
  vinculab_id: string | null
  tipo: string | null
  uid_nfc: string | null
  upi: string | null
  qr_url: string | null
  estado: string | null
  fecha_asignacion: string | null
}

export type CrearCarrierInput = {
  unidad_id: string
  codigo_unidad: string
  uid_nfc?: string | null
  tipo?: string
}

/* ============================================================
   PERFIL
============================================================ */

export async function getPerfilActual(): Promise<PerfilActual> {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('No existe una sesión válida.')
  }

  const { data, error } = await supabase
    .from('perfiles')
    .select('id, rol, empresa_id, nombre, activo')
    .eq('id', user.id)
    .single()

  if (error || !data) {
    throw new Error('No fue posible obtener el perfil del usuario.')
  }

  if (!data.activo) {
    throw new Error('El usuario se encuentra inactivo.')
  }

  if (data.rol !== 'superadmin' && data.rol !== 'admin_empresa') {
    throw new Error('El usuario no tiene permisos para administrar NFC/QR.')
  }

  if (data.rol === 'admin_empresa' && !data.empresa_id) {
    throw new Error('El usuario no tiene una empresa asignada.')
  }

  return data as PerfilActual
}

/* ============================================================
   EMPRESAS
============================================================ */

export async function getEmpresasNfcQr() {
  const { data, error } = await supabase
    .from('empresas')
    .select('id, razon_social, estado')
    .order('razon_social', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}

/* ============================================================
   UNIDADES + JERARQUÍA
============================================================ */

export async function getUnidadesNfcQr(): Promise<UnidadNfcQr[]> {
  /*
   * No filtramos manualmente por empresa.
   *
   * RLS de "unidades" decide:
   * - superadmin → todas
   * - admin_empresa → solamente su empresa
   */

  const { data: unidades, error: unidadesError } = await supabase
    .from('unidades')
    .select(`
      id,
      codigo,
      numero_unidad,
      estado,
      empresa_id,
      producto_id,
      modelo_id,
      lote_id
    `)
    .order('created_at', { ascending: false })

  if (unidadesError) {
    throw new Error(unidadesError.message)
  }

  if (!unidades || unidades.length === 0) {
    return []
  }

  /*
   * Estas consultas también están protegidas por sus propias
   * políticas RLS.
   */

  const [
    empresasResult,
    productosResult,
    modelosResult,
    lotesResult,
    carriersResult
  ] = await Promise.all([
    supabase
      .from('empresas')
      .select('id, razon_social'),

    supabase
      .from('productos')
      .select('id, nombre'),

    supabase
      .from('modelos')
      .select('id, nombre'),

    supabase
      .from('lotes')
      .select('id, codigo'),

    supabase
      .from('nfc_qr')
      .select(`
        id_carrier,
        unidad_id,
        vinculab_id,
        tipo,
        uid_nfc,
        upi,
        qr_url,
        estado,
        fecha_asignacion
      `)
  ])

  if (empresasResult.error) {
    throw new Error(empresasResult.error.message)
  }

  if (productosResult.error) {
    throw new Error(productosResult.error.message)
  }

  if (modelosResult.error) {
    throw new Error(modelosResult.error.message)
  }

  if (lotesResult.error) {
    throw new Error(lotesResult.error.message)
  }

  if (carriersResult.error) {
    throw new Error(carriersResult.error.message)
  }

  const empresas = new Map(
    (empresasResult.data || []).map(item => [
      item.id,
      item.razon_social
    ])
  )

  const productos = new Map(
    (productosResult.data || []).map(item => [
      item.id,
      item.nombre
    ])
  )

  const modelos = new Map(
    (modelosResult.data || []).map(item => [
      item.id,
      item.nombre
    ])
  )

  const lotes = new Map(
    (lotesResult.data || []).map(item => [
      item.id,
      item.codigo
    ])
  )

  const carriers = new Map<string, CarrierNfcQr>()

  for (const carrier of carriersResult.data || []) {
    if (carrier.unidad_id) {
      carriers.set(
        carrier.unidad_id,
        carrier as CarrierNfcQr
      )
    }
  }

  return unidades.map(unidad => ({
    id: unidad.id,
    codigo: unidad.codigo,
    numero_unidad: unidad.numero_unidad,
    estado: unidad.estado,

    empresa_id: unidad.empresa_id,
    producto_id: unidad.producto_id,
    modelo_id: unidad.modelo_id,
    lote_id: unidad.lote_id,

    empresa_nombre:
      empresas.get(unidad.empresa_id) || 'Sin empresa',

    producto_nombre:
      productos.get(unidad.producto_id) || 'Sin producto',

    modelo_nombre:
      modelos.get(unidad.modelo_id) || 'Sin modelo',

    lote_codigo:
      lotes.get(unidad.lote_id) || 'Sin lote',

    carrier:
      carriers.get(unidad.id) || null
  }))
}

/* ============================================================
   GENERADOR GLOBAL DE ID CARRIER
============================================================ */

async function generarIdCarrier(): Promise<string> {
  /*
   * El ID se genera en PostgreSQL mediante una secuencia global.
   *
   * Esto evita depender de las filas visibles por RLS.
   * Un admin_empresa no necesita ver carriers de otras empresas
   * para obtener el siguiente identificador.
   */

  const { data, error } = await supabase.rpc(
    'generar_id_carrier'
  )

  if (error) {
    throw new Error(
      `No fue posible generar el ID del carrier: ${error.message}`
    )
  }

  if (
    !data ||
    typeof data !== 'string' ||
    !data.startsWith('CARR-')
  ) {
    throw new Error(
      'La base de datos devolvió un ID de carrier no válido.'
    )
  }

  return data
}

/* ============================================================
   ASIGNAR NFC / QR
============================================================ */

export async function asignarCarrier(
  input: CrearCarrierInput
): Promise<CarrierNfcQr> {
  const perfil = await getPerfilActual()

  const unidadId = input.unidad_id?.trim()
  const codigoUnidad = input.codigo_unidad?.trim()

  if (!unidadId || !codigoUnidad) {
    throw new Error('La unidad es obligatoria.')
  }

  /*
   * Verificamos que la unidad sea visible para el usuario.
   * RLS realiza la comprobación final de empresa.
   */

  const { data: unidad, error: unidadError } = await supabase
    .from('unidades')
    .select(`
      id,
      codigo,
      empresa_id
    `)
    .eq('id', unidadId)
    .single()

  if (unidadError || !unidad) {
    throw new Error(
      'La unidad no existe o no tienes permisos para acceder a ella.'
    )
  }

  /*
   * Protección adicional para admin_empresa.
   */

  if (
    perfil.rol === 'admin_empresa' &&
    unidad.empresa_id !== perfil.empresa_id
  ) {
    throw new Error(
      'No puedes asignar identificadores a unidades de otra empresa.'
    )
  }

  /*
   * Verificamos que todavía no tenga carrier.
   * UNIQUE(unidad_id) en PostgreSQL es la protección definitiva.
   */

  const { data: existente, error: existenteError } =
    await supabase
      .from('nfc_qr')
      .select('id_carrier')
      .eq('unidad_id', unidad.id)
      .maybeSingle()

  if (existenteError) {
    throw new Error(existenteError.message)
  }

  if (existente) {
    throw new Error(
      'Esta unidad ya tiene un identificador NFC/QR asignado.'
    )
  }

  const uidNfc =
    input.uid_nfc?.trim().toUpperCase() || null

  /*
   * UNIQUE(uid_nfc) protege también esta condición en BD.
   */

  if (uidNfc) {
    const { data: nfcExistente, error: nfcError } =
      await supabase
        .from('nfc_qr')
        .select('id_carrier')
        .eq('uid_nfc', uidNfc)
        .maybeSingle()

    if (nfcError) {
      throw new Error(nfcError.message)
    }

    if (nfcExistente) {
      throw new Error(
        'Este UID NFC ya se encuentra asignado.'
      )
    }
  }

  /*
   * ID global generado por PostgreSQL.
   *
   * La secuencia no depende de RLS y evita colisiones
   * entre empresas.
   */

  const idCarrier = await generarIdCarrier()

  /*
   * El QR apunta a la identidad pública de la unidad.
   */

  const qrUrl =
    `https://vinculab.cl/u/${encodeURIComponent(unidad.codigo)}`

  const registro = {
    id_carrier: idCarrier,

    unidad_id: unidad.id,

    /*
     * Código legible de identidad Vinculab.
     */
    vinculab_id: unidad.codigo,

    tipo: input.tipo || 'NFC_QR',

    uid_nfc: uidNfc,

    /*
     * UPI queda reservado para una evolución posterior:
     * identificador público opaco/no predecible.
     */
    upi: null,

    qr_url: qrUrl,

    estado: 'asignado',

    fecha_asignacion:
      new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('nfc_qr')
    .insert(registro)
    .select(`
      id_carrier,
      unidad_id,
      vinculab_id,
      tipo,
      uid_nfc,
      upi,
      qr_url,
      estado,
      fecha_asignacion
    `)
    .single()

  if (error) {
    /*
     * Las restricciones UNIQUE siguen siendo la protección
     * definitiva frente a asignaciones simultáneas.
     */

    if (error.code === '23505') {
      throw new Error(
        'La unidad, el UID NFC o el identificador del carrier ya están registrados.'
      )
    }

    throw new Error(error.message)
  }

  return data as CarrierNfcQr
}

/* ============================================================
   ACTUALIZAR UID NFC
============================================================ */

export async function actualizarUidNfc(
  idCarrier: string,
  uidNfc: string | null
): Promise<void> {
  await getPerfilActual()

  const uid =
    uidNfc?.trim().toUpperCase() || null

  const { error } = await supabase
    .from('nfc_qr')
    .update({
      uid_nfc: uid
    })
    .eq('id_carrier', idCarrier)

  if (error) {
    if (error.code === '23505') {
      throw new Error(
        'Este UID NFC ya está asociado a otro identificador.'
      )
    }

    throw new Error(error.message)
  }
}

/* ============================================================
   CAMBIAR ESTADO
============================================================ */

export async function cambiarEstadoCarrier(
  idCarrier: string,
  estado: string
): Promise<void> {
  await getPerfilActual()

  const estadosPermitidos = [
    'asignado',
    'inactivo'
  ]

  if (!estadosPermitidos.includes(estado)) {
    throw new Error('Estado de carrier no válido.')
  }

  const { error } = await supabase
    .from('nfc_qr')
    .update({
      estado
    })
    .eq('id_carrier', idCarrier)

  if (error) {
    throw new Error(error.message)
  }
}
