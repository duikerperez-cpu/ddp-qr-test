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
    throw new Error('Sesión no válida.')
  }

  const {
    data,
    error
  } = await supabase
    .from('perfiles')
    .select(
      `
      id,
      nombre,
      apellido,
      cargo,
      rol,
      activo,
      empresa_id
      `
    )
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

  const rol = normalizarRol(data.rol)

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
    .select(
      `
      id,
      razon_social,
      nombre,
      name,
      empresa_nombre,
      rut,
      pais,
      sector,
      estado
      `
    )
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
//
// Super Admin:
// puede utilizar todas.
//
// Admin Empresa:
// solamente recibe su empresa.
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
    .select(
      `
      id,
      razon_social,
      nombre,
      name,
      empresa_nombre,
      rut,
      pais,
      sector,
      estado
      `
    )
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
// UNIDADES DISPONIBLES PARA CERTIFICACIÓN
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
    .select(
      `
      id,
      codigo_publico,
      codigo_qr,
      numero_unidad,
      estado,
      empresa_id,
      producto_id,
      modelo_id,
      lote_id
      `
    )
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

  const resultado: UnidadCertificado[] =
    []

  for (
    const unidad of unidades
  ) {
    let productoNombre:
      | string
      | null = null

    let productoCategoria:
      | string
      | null = null

    let modeloNombre:
      | string
      | null = null

    let modeloVersion:
      | string
      | null = null

    let loteCodigo:
      | string
      | null = null

    let dppId:
      | string
      | null = null

    let dppCodigo:
      | string
      | null = null

    let carrierId:
      | string
      | null = null

    let uidNfc:
      | string
      | null = null

    let qrUrl:
      | string
      | null = null

    // --------------------------------------------------------
    // PRODUCTO
    // --------------------------------------------------------

    if (
      unidad.producto_id
    ) {
      const {
        data: producto
      } = await supabase
        .from('productos')
        .select(
          `
          nombre,
          categoria
          `
        )
        .eq(
          'id',
          unidad.producto_id
        )
        .maybeSingle()

      productoNombre =
        producto?.nombre || null

      productoCategoria =
        producto?.categoria || null
    }

    // --------------------------------------------------------
    // MODELO
    // --------------------------------------------------------

    if (
      unidad.modelo_id
    ) {
      const {
        data: modelo
      } = await supabase
        .from('modelos')
        .select(
          `
          nombre,
          version
          `
        )
        .eq(
          'id',
          unidad.modelo_id
        )
        .maybeSingle()

      modeloNombre =
        modelo?.nombre || null

      modeloVersion =
        modelo?.version || null
    }

    // --------------------------------------------------------
    // LOTE
    // --------------------------------------------------------

    if (
      unidad.lote_id
    ) {
      const {
        data: lote
      } = await supabase
        .from('lotes')
        .select('codigo')
        .eq(
          'id',
          unidad.lote_id
        )
        .maybeSingle()

      loteCodigo =
        lote?.codigo || null
    }

    // --------------------------------------------------------
    // DPP
    // --------------------------------------------------------

    const {
      data: dpp
    } = await supabase
      .from('dpps')
      .select(
        `
        id,
        codigo
        `
      )
      .eq(
        'unidad_id',
        unidad.id
      )
      .order(
        'created_at',
        {
          ascending: false
        }
      )
      .limit(1)
      .maybeSingle()

    if (dpp) {
      dppId =
        dpp.id || null

      dppCodigo =
        dpp.codigo || null
    }

    // --------------------------------------------------------
    // NFC / QR
    // --------------------------------------------------------

    const {
      data: carrier
    } = await supabase
      .from('nfc_qr')
      .select(
        `
        id_carrier,
        uid_nfc,
        qr_url
        `
      )
      .eq(
        'unidad_id',
        unidad.id
      )
      .order(
        'fecha_asignacion',
        {
          ascending: false
        }
      )
      .limit(1)
      .maybeSingle()

    if (carrier) {
      carrierId =
        carrier.id_carrier || null

      uidNfc =
        carrier.uid_nfc || null

      qrUrl =
        carrier.qr_url || null
    }

    resultado.push({
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
        productoNombre,

      producto_categoria:
        productoCategoria,

      modelo_nombre:
        modeloNombre,

      modelo_version:
        modeloVersion,

      lote_codigo:
        loteCodigo,

      dpp_id:
        dppId,

      dpp_codigo:
        dppCodigo,

      carrier_id:
        carrierId,

      uid_nfc:
        uidNfc,

      qr_url:
        qrUrl
    })
  }

  return resultado
}

// ============================================================
// CERTIFICADOS
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

  // Esto duplica deliberadamente la seguridad RLS.
  // RLS sigue siendo la protección principal.
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

  const resultado: Certificado[] =
    []

  for (
    const certificado of certificados
  ) {
    let empresaNombre:
      | string
      | null = null

    let productoNombre:
      | string
      | null = null

    let modeloNombre:
      | string
      | null = null

    let loteCodigo:
      | string
      | null = null

    let unidadCodigo:
      | string
      | null = null

    let dppCodigo:
      | string
      | null = null

    // --------------------------------------------------------
    // EMPRESA
    // --------------------------------------------------------

    const {
      data: empresa
    } = await supabase
      .from('empresas')
      .select(
        `
        razon_social,
        nombre,
        name,
        empresa_nombre
        `
      )
      .eq(
        'id',
        certificado.empresa_id
      )
      .maybeSingle()

    empresaNombre =
      empresa?.razon_social ||
      empresa?.empresa_nombre ||
      empresa?.nombre ||
      empresa?.name ||
      null

    // --------------------------------------------------------
    // PRODUCTO
    // --------------------------------------------------------

    if (
      certificado.producto_id
    ) {
      const {
        data: producto
      } = await supabase
        .from('productos')
        .select('nombre')
        .eq(
          'id',
          certificado.producto_id
        )
        .maybeSingle()

      productoNombre =
        producto?.nombre || null
    }

    // --------------------------------------------------------
    // MODELO
    // --------------------------------------------------------

    if (
      certificado.modelo_id
    ) {
      const {
        data: modelo
      } = await supabase
        .from('modelos')
        .select('nombre')
        .eq(
          'id',
          certificado.modelo_id
        )
        .maybeSingle()

      modeloNombre =
        modelo?.nombre || null
    }

    // --------------------------------------------------------
    // LOTE
    // --------------------------------------------------------

    if (
      certificado.lote_id
    ) {
      const {
        data: lote
      } = await supabase
        .from('lotes')
        .select('codigo')
        .eq(
          'id',
          certificado.lote_id
        )
        .maybeSingle()

      loteCodigo =
        lote?.codigo || null
    }

    // --------------------------------------------------------
    // UNIDAD
    // --------------------------------------------------------

    if (
      certificado.unidad_id
    ) {
      const {
        data: unidad
      } = await supabase
        .from(
          'productos_individuales'
        )
        .select(
          `
          codigo_publico,
          codigo_qr
          `
        )
        .eq(
          'id',
          certificado.unidad_id
        )
        .maybeSingle()

      unidadCodigo =
        unidad?.codigo_publico ||
        unidad?.codigo_qr ||
        certificado.unidad_id
    }

    // --------------------------------------------------------
    // DPP
    // --------------------------------------------------------

    if (
      certificado.dpp_id
    ) {
      const {
        data: dpp
      } = await supabase
        .from('dpps')
        .select('codigo')
        .eq(
          'id',
          certificado.dpp_id
        )
        .maybeSingle()

      dppCodigo =
        dpp?.codigo || null
    }

    resultado.push({
      ...certificado,

      empresa_nombre:
        empresaNombre,

      producto_nombre:
        productoNombre,

      modelo_nombre:
        modeloNombre,

      lote_codigo:
        loteCodigo,

      unidad_codigo:
        unidadCodigo,

      dpp_codigo:
        dppCodigo
    })
  }

  return resultado
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

  // Segunda barrera además de RLS.
  if (
    rol === 'adminempresa' &&
    unidad.empresa_id !==
      perfil.empresa_id
  ) {
    throw new Error(
      'No puedes certificar una unidad perteneciente a otra empresa.'
    )
  }

  // ----------------------------------------------------------
  // EVITAR CERTIFICADO DE AUTENTICIDAD DUPLICADO
  // ----------------------------------------------------------

  if (
    tipo === 'autenticidad'
  ) {
    const {
      data: existente,
      error: existenteError
    } = await supabase
      .from('certificados')
      .select(
        `
        id,
        codigo,
        estado
        `
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

  // ----------------------------------------------------------
  // SNAPSHOT DE INFORMACIÓN
  // ----------------------------------------------------------

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

  // ----------------------------------------------------------
  // INSERT
  //
  // codigo = ''
  // El trigger SQL genera VIN-CERT-AAAA-XXXXXX
  // ----------------------------------------------------------

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
      `
      id,
      empresa_id
      `
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
      `
      id,
      empresa_id,
      datos
      `
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
