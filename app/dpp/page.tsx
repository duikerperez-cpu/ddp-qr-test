'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter, useSearchParams } from 'next/navigation'
import QRWithLogo from '../components/QRWithLogo'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/* =========================================================
   TIPOS
========================================================= */

type Perfil = {
  id: string
  empresa_id: string | null
  nombre: string | null
  apellido: string | null
  cargo: string | null
  rol: string
  activo: boolean
}

type Empresa = {
  id: string
  razon_social?: string | null
  nombre?: string | null
  name?: string | null
  empresa_nombre?: string | null
  pais?: string | null
  sector?: string | null
  estado?: string | null
}

type Producto = {
  id: string
  empresa_id?: string | null
  nombre?: string | null
  categoria?: string | null
}

type Modelo = {
  id: string
  empresa_id?: string | null
  id_producto?: string | null
  producto_id?: string | null
  modelo?: string | null
  version?: string | null
}

type Lote = {
  id: string
  empresa_id?: string | null
  producto_id?: string | null
  modelo_id?: string | null
  id_modelo?: string | null
  codigo?: string | null
  fecha_fabricacion?: string | null
  cantidad?: number | null
  planta?: string | null
  estado?: string | null
}

type Unidad = {
  id: string
  codigo: string
  lote_id: string
  empresa_id: string | null
  producto_id: string | null
  modelo_id: string | null
  numero_unidad: number
  estado: string | null
  created_at?: string | null
}

type DPP = {
  id: string
  codigo: string
  lote_id: string | null
  empresa_id: string | null
  producto_id: string | null
  modelo_id: string | null
  unidad_id: string | null
  descripcion: string | null
  datos: Record<string, any> | null
  plantilla: string | null
  estado: string | null
}

/* =========================================================
   PLANTILLAS
========================================================= */

const PLANTILLAS: Record<string, any> = {
  mineria: {
    label: 'Industria / Minería',
    code: 'IND',
    logo: '/hercom-logo.png',
    fallbackLogo: '/vinculab-logo.png',
    fields: [
      {
        key: 'tipo_acero',
        label: 'Tipo Acero *',
        placeholder: 'A36'
      },
      {
        key: 'norma',
        label: 'Norma *',
        placeholder: 'NCH 427'
      },
      {
        key: 'carga_max',
        label: 'Carga Máxima (kg)',
        placeholder: '5000'
      },
      {
        key: 'soldador',
        label: 'Soldador',
        placeholder: 'Nombre del soldador'
      },
      {
        key: 'lote_acero',
        label: 'Lote Acero',
        placeholder: 'COL-2026-123'
      },
      {
        key: 'fecha_fabricacion',
        label: 'Fecha Fabricación',
        type: 'date'
      },
      {
        key: 'ubicacion_obra',
        label: 'Ubicación / Obra',
        placeholder: 'Faena / Proyecto'
      },
      {
        key: 'foto_url',
        label: 'Foto URL',
        placeholder: 'https://...'
      },
      {
        key: 'certificado_url',
        label: 'Certificado PDF URL',
        placeholder: 'https://...'
      }
    ]
  },

  kombucha: {
    label: 'Alimentos / Bebidas',
    code: 'ALI',
    logo: '/auka-logo.png',
    fallbackLogo: '/vinculab-logo.png',
    fields: [
      {
        key: 'sabor',
        label: 'Sabor *',
        placeholder: 'Hibisco, Original, Jengibre'
      },
      {
        key: 'volumen',
        label: 'Volumen *',
        placeholder: '350ml'
      },
      {
        key: 'lote',
        label: 'Lote',
        placeholder: 'LOTE-2026-001'
      },
      {
        key: 'fecha_elaboracion',
        label: 'Elaboración',
        type: 'date'
      },
      {
        key: 'fecha_vencimiento',
        label: 'Vencimiento',
        type: 'date'
      },
      {
        key: 'ingredientes',
        label: 'Ingredientes',
        placeholder: 'Ingredientes del producto...'
      },
      {
        key: 'azucar_g',
        label: 'Azúcar g/100ml',
        placeholder: '4g'
      },
      {
        key: 'resolucion_sanitaria',
        label: 'Resolución Sanitaria',
        placeholder: 'Res. 12345'
      },
      {
        key: 'certificacion',
        label: 'Certificación',
        placeholder: 'Orgánico'
      },
      {
        key: 'temperatura_conservacion',
        label: 'Conservación',
        placeholder: 'Refrigerar 2-4°C'
      },
      {
        key: 'foto_url',
        label: 'Foto Producto URL',
        placeholder: 'https://...'
      },
      {
        key: 'certificado_url',
        label: 'Certificado / Análisis PDF',
        placeholder: 'https://...'
      }
    ]
  }
}

/* =========================================================
   UTILIDADES
========================================================= */

function nombreEmpresa(empresa?: Empresa | null) {
  if (!empresa) return 'Empresa'

  return (
    empresa.razon_social ||
    empresa.nombre ||
    empresa.empresa_nombre ||
    empresa.name ||
    'Empresa'
  )
}

function nombreProducto(producto?: Producto | null) {
  return producto?.nombre || 'Producto'
}

function nombreModelo(modelo?: Modelo | null) {
  if (!modelo) return 'Modelo'

  if (modelo.version) {
    return `${modelo.modelo || 'Modelo'} · ${modelo.version}`
  }

  return modelo.modelo || 'Modelo'
}

function generarCodigoDPP(codigoUnidad: string) {
  const limpio = codigoUnidad
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, '')
    .slice(0, 30)

  const fecha = new Date()

  const yy = fecha
    .getFullYear()
    .toString()
    .slice(-2)

  const mm = String(fecha.getMonth() + 1).padStart(2, '0')

  const dd = String(fecha.getDate()).padStart(2, '0')

  const aleatorio = Math.floor(1000 + Math.random() * 9000)

  return `DPP-${limpio}-${yy}${mm}${dd}-${aleatorio}`
}

/* =========================================================
   COMPONENTE PRINCIPAL
========================================================= */

function DPPContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const editCodigo = searchParams.get('edit')
  const unidadParam = searchParams.get('unidad')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [empresa, setEmpresa] = useState<Empresa | null>(null)

  const [unidades, setUnidades] = useState<Unidad[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [modelos, setModelos] = useState<Modelo[]>([])
  const [lotes, setLotes] = useState<Lote[]>([])

  const [unidadId, setUnidadId] = useState('')
  const [plantilla, setPlantilla] = useState('mineria')

  const [descripcion, setDescripcion] = useState('')
  const [form, setForm] = useState<Record<string, any>>({})

  const [result, setResult] = useState('')
  const [codigoDPP, setCodigoDPP] = useState('')

  const [logoSrc, setLogoSrc] = useState(
    PLANTILLAS.mineria.logo
  )

  /* =======================================================
     DERIVADOS
  ======================================================= */

  const esSuperadmin = perfil?.rol === 'superadmin'

  const unidadSeleccionada = useMemo(
    () => unidades.find(item => item.id === unidadId) || null,
    [unidades, unidadId]
  )

  const productoSeleccionado = useMemo(() => {
    if (!unidadSeleccionada?.producto_id) return null

    return (
      productos.find(
        item => item.id === unidadSeleccionada.producto_id
      ) || null
    )
  }, [productos, unidadSeleccionada])

  const modeloSeleccionado = useMemo(() => {
    if (!unidadSeleccionada?.modelo_id) return null

    return (
      modelos.find(
        item => item.id === unidadSeleccionada.modelo_id
      ) || null
    )
  }, [modelos, unidadSeleccionada])

  const loteSeleccionado = useMemo(() => {
    if (!unidadSeleccionada?.lote_id) return null

    return (
      lotes.find(
        item => item.id === unidadSeleccionada.lote_id
      ) || null
    )
  }, [lotes, unidadSeleccionada])

  /* =======================================================
     LOGO
  ======================================================= */

  useEffect(() => {
    setLogoSrc(
      PLANTILLAS[plantilla]?.logo ||
      '/vinculab-logo.png'
    )
  }, [plantilla])

  /* =======================================================
     CARGA INICIAL
  ======================================================= */

  useEffect(() => {
    cargarSistema()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function cargarSistema() {
    setLoading(true)
    setError('')

    try {
      /* ---------------------------------------------------
         AUTH
      --------------------------------------------------- */

      const {
        data: { user },
        error: authError
      } = await supabase.auth.getUser()

      if (authError || !user) {
        router.replace('/login')
        return
      }

      /* ---------------------------------------------------
         PERFIL
      --------------------------------------------------- */

      const {
        data: perfilData,
        error: perfilError
      } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (perfilError || !perfilData) {
        throw new Error(
          'No fue posible cargar el perfil del usuario.'
        )
      }

      if (!perfilData.activo) {
        throw new Error(
          'Tu cuenta se encuentra desactivada.'
        )
      }

      if (
        perfilData.rol !== 'superadmin' &&
        perfilData.rol !== 'admin_empresa'
      ) {
        throw new Error(
          'Tu perfil no tiene autorización para administrar DPP.'
        )
      }

      if (
        perfilData.rol === 'admin_empresa' &&
        !perfilData.empresa_id
      ) {
        throw new Error(
          'Tu perfil no tiene una empresa asociada.'
        )
      }

      setPerfil(perfilData)

      /* ---------------------------------------------------
         EMPRESA
      --------------------------------------------------- */

      if (perfilData.empresa_id) {
        const {
          data: empresaData,
          error: empresaError
        } = await supabase
          .from('empresas')
          .select('*')
          .eq('id', perfilData.empresa_id)
          .single()

        if (empresaError) {
          throw empresaError
        }

        setEmpresa(empresaData)
      }

      /* ---------------------------------------------------
         DATOS MAESTROS
         RLS limita automáticamente al cliente.
      --------------------------------------------------- */

      const [
        unidadesResult,
        productosResult,
        modelosResult,
        lotesResult
      ] = await Promise.all([
        supabase
          .from('unidades')
          .select('*')
          .order('created_at', {
            ascending: false
          }),

        supabase
          .from('productos')
          .select('*'),

        supabase
          .from('modelos')
          .select('*'),

        supabase
          .from('lotes')
          .select('*')
      ])

      if (unidadesResult.error) {
        throw unidadesResult.error
      }

      if (productosResult.error) {
        throw productosResult.error
      }

      if (modelosResult.error) {
        throw modelosResult.error
      }

      if (lotesResult.error) {
        throw lotesResult.error
      }

      const unidadesData =
        (unidadesResult.data || []) as Unidad[]

      setUnidades(unidadesData)
      setProductos(
        (productosResult.data || []) as Producto[]
      )
      setModelos(
        (modelosResult.data || []) as Modelo[]
      )
      setLotes(
        (lotesResult.data || []) as Lote[]
      )

      /* ---------------------------------------------------
         EDICIÓN
      --------------------------------------------------- */

      if (editCodigo) {
        await cargarDPPParaEditar(
          editCodigo,
          unidadesData
        )
      } else if (unidadParam) {
        const existe = unidadesData.some(
          unidad => unidad.id === unidadParam
        )

        if (existe) {
          setUnidadId(unidadParam)
        }
      }
    } catch (e: any) {
      console.error(e)

      setError(
        e?.message ||
        'Ocurrió un error cargando el módulo DPP.'
      )
    } finally {
      setLoading(false)
    }
  }

  /* =======================================================
     CARGAR DPP EDICIÓN
  ======================================================= */

  async function cargarDPPParaEditar(
    codigo: string,
    unidadesDisponibles: Unidad[]
  ) {
    const {
      data,
      error: dppError
    } = await supabase
      .from('dpps')
      .select('*')
      .eq('codigo', codigo)
      .single()

    if (dppError || !data) {
      throw new Error(
        'No fue posible cargar el DPP solicitado.'
      )
    }

    const dpp = data as DPP

    if (dpp.unidad_id) {
      const existe = unidadesDisponibles.some(
        unidad => unidad.id === dpp.unidad_id
      )

      if (existe) {
        setUnidadId(dpp.unidad_id)
      }
    }

    const plantillaGuardada =
      dpp.plantilla &&
      PLANTILLAS[dpp.plantilla]
        ? dpp.plantilla
        : 'mineria'

    setPlantilla(plantillaGuardada)

    setDescripcion(
      dpp.descripcion || ''
    )

    setForm(
      dpp.datos || {}
    )

    setCodigoDPP(dpp.codigo)

    setLogoSrc(
      PLANTILLAS[plantillaGuardada]?.logo ||
      '/vinculab-logo.png'
    )
  }

  /* =======================================================
     CAMBIO UNIDAD
  ======================================================= */

  function seleccionarUnidad(id: string) {
    setUnidadId(id)
    setResult('')
    setMensaje('')

    const unidad = unidades.find(
      item => item.id === id
    )

    if (!unidad) return

    const producto = productos.find(
      item => item.id === unidad.producto_id
    )

    const modelo = modelos.find(
      item => item.id === unidad.modelo_id
    )

    const lote = lotes.find(
      item => item.id === unidad.lote_id
    )

    if (!descripcion) {
      const partes = [
        producto?.nombre,
        modelo?.modelo,
        lote?.codigo,
        unidad.codigo
      ].filter(Boolean)

      setDescripcion(
        partes.join(' · ')
      )
    }

    setForm(prev => ({
      ...prev,

      fecha_fabricacion:
        prev.fecha_fabricacion ||
        lote?.fecha_fabricacion ||
        '',

      lote:
        prev.lote ||
        lote?.codigo ||
        '',

      lote_produccion:
        prev.lote_produccion ||
        lote?.codigo ||
        ''
    }))
  }

  /* =======================================================
     GUARDAR
  ======================================================= */

  async function save() {
    setError('')
    setMensaje('')
    setResult('')

    if (!unidadSeleccionada) {
      setError(
        'Selecciona una unidad física antes de crear el DPP.'
      )
      return
    }

    if (!unidadSeleccionada.empresa_id) {
      setError(
        'La unidad seleccionada no tiene empresa asociada.'
      )
      return
    }

    if (!unidadSeleccionada.producto_id) {
      setError(
        'La unidad seleccionada no tiene producto asociado.'
      )
      return
    }

    if (!unidadSeleccionada.modelo_id) {
      setError(
        'La unidad seleccionada no tiene modelo asociado.'
      )
      return
    }

    if (!unidadSeleccionada.lote_id) {
      setError(
        'La unidad seleccionada no tiene lote asociado.'
      )
      return
    }

    if (!descripcion.trim()) {
      setError(
        'Ingresa la descripción del producto.'
      )
      return
    }

    setSaving(true)

    try {
      /* ---------------------------------------------------
         COMPROBAR SI LA UNIDAD YA TIENE DPP
      --------------------------------------------------- */

      if (!editCodigo) {
        const {
          data: existente,
          error: existenteError
        } = await supabase
          .from('dpps')
          .select('id,codigo')
          .eq('unidad_id', unidadSeleccionada.id)
          .maybeSingle()

        if (existenteError) {
          throw existenteError
        }

        if (existente) {
          setError(
            `Esta unidad ya tiene el DPP ${existente.codigo}.`
          )

          setSaving(false)
          return
        }
      }

      /* ---------------------------------------------------
         EDICIÓN
      --------------------------------------------------- */

      if (editCodigo) {
        const {
          error: updateError
        } = await supabase
          .from('dpps')
          .update({
            empresa_id:
              unidadSeleccionada.empresa_id,

            producto_id:
              unidadSeleccionada.producto_id,

            modelo_id:
              unidadSeleccionada.modelo_id,

            lote_id:
              unidadSeleccionada.lote_id,

            unidad_id:
              unidadSeleccionada.id,

            descripcion:
              descripcion.trim(),

            datos: form,

            plantilla,

            estado: 'activo'
          })
          .eq('codigo', editCodigo)

        if (updateError) {
          throw updateError
        }

        const publicUrl =
          `${window.location.origin}/p/${editCodigo}`

        setCodigoDPP(editCodigo)
        setResult(publicUrl)

        setMensaje(
          'DPP actualizado correctamente.'
        )

        return
      }

      /* ---------------------------------------------------
         NUEVO DPP
      --------------------------------------------------- */

      const nuevoCodigo =
        generarCodigoDPP(
          unidadSeleccionada.codigo
        )

      const payload = {
        codigo: nuevoCodigo,

        empresa_id:
          unidadSeleccionada.empresa_id,

        producto_id:
          unidadSeleccionada.producto_id,

        modelo_id:
          unidadSeleccionada.modelo_id,

        lote_id:
          unidadSeleccionada.lote_id,

        unidad_id:
          unidadSeleccionada.id,

        descripcion:
          descripcion.trim(),

        datos: form,

        plantilla,

        estado: 'activo'
      }

      const {
        data: nuevoDPP,
        error: insertError
      } = await supabase
        .from('dpps')
        .insert([payload])
        .select('id,codigo')
        .single()

      if (insertError) {
        throw insertError
      }

      const publicUrl =
        `${window.location.origin}/p/${nuevoDPP.codigo}`

      setCodigoDPP(
        nuevoDPP.codigo
      )

      setResult(publicUrl)

      setMensaje(
        'DPP creado y vinculado a la unidad física.'
      )
    } catch (e: any) {
      console.error(e)

      setError(
        e?.message ||
        'No fue posible guardar el DPP.'
      )
    } finally {
      setSaving(false)
    }
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#09090b',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui'
        }}
      >
        <div
          style={{
            textAlign: 'center'
          }}
        >
          <div
            style={{
              color: '#ff6a00',
              fontSize: 22,
              fontWeight: 950,
              letterSpacing: 2
            }}
          >
            VINCULAB
          </div>

          <div
            style={{
              marginTop: 10,
              color: '#a1a1aa',
              fontSize: 12
            }}
          >
            Cargando módulo DPP...
          </div>
        </div>
      </div>
    )
  }

  /* =======================================================
     ERROR CRÍTICO SIN PERFIL
  ======================================================= */

  if (!perfil) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#09090b',
          color: 'white',
          padding: 30,
          fontFamily: 'system-ui'
        }}
      >
        <div
          style={{
            maxWidth: 700,
            margin: '60px auto',
            background: '#18181b',
            border: '1px solid #7f1d1d',
            borderRadius: 16,
            padding: 24
          }}
        >
          <h2
            style={{
              marginTop: 0
            }}
          >
            No fue posible acceder
          </h2>

          <p
            style={{
              color: '#fca5a5'
            }}
          >
            {error ||
              'No se encontró un perfil válido.'}
          </p>

          <button
            onClick={() =>
              router.replace('/login')
            }
            style={{
              marginTop: 10,
              border: 0,
              borderRadius: 10,
              padding: '12px 18px',
              background: '#ff6a00',
              color: 'white',
              fontWeight: 900,
              cursor: 'pointer'
            }}
          >
            VOLVER AL LOGIN
          </button>
        </div>
      </div>
    )
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div
      style={{
        background: '#09090b',
        minHeight: '100vh',
        color: 'white',
        padding: 20,
        fontFamily: 'system-ui'
      }}
    >
      <div
        style={{
          maxWidth: 1000,
          margin: '0 auto'
        }}
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 15,
            flexWrap: 'wrap',
            marginBottom: 24
          }}
        >
          <div>
            <div
              style={{
                color: '#ff6a00',
                fontWeight: 950,
                fontSize: 13,
                letterSpacing: 2,
                marginBottom: 5
              }}
            >
              VINCULAB
            </div>

            <h1
              style={{
                margin: 0,
                fontWeight: 950,
                fontSize: 26
              }}
            >
              {editCodigo
                ? 'Editar Pasaporte Digital'
                : 'Crear Pasaporte Digital'}
            </h1>

            <p
              style={{
                color: '#a1a1aa',
                margin: '7px 0 0',
                fontSize: 13
              }}
            >
              DPP · Digital Product Passport
            </p>
          </div>

          <button
            onClick={() =>
              router.push(
                esSuperadmin
                  ? '/admin'
                  : '/portal'
              )
            }
            style={{
              background: '#18181b',
              color: 'white',
              border: '1px solid #3f3f46',
              borderRadius: 10,
              padding: '10px 16px',
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            ← Dashboard
          </button>
        </div>

        {/* =================================================
            EMPRESA
        ================================================= */}

        <div
          style={{
            background:
              'linear-gradient(135deg,#18181b,#111113)',
            border: '1px solid #27272a',
            borderRadius: 16,
            padding: 18,
            marginBottom: 18
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: '#71717a',
              fontWeight: 900,
              letterSpacing: 1.5
            }}
          >
            EMPRESA ACTIVA
          </div>

          <div
            style={{
              marginTop: 7,
              fontSize: 18,
              fontWeight: 950
            }}
          >
            {empresa
              ? nombreEmpresa(empresa)
              : esSuperadmin
                ? 'Super Administrador'
                : 'Empresa'}
          </div>

          <div
            style={{
              marginTop: 6,
              color: '#a1a1aa',
              fontSize: 12
            }}
          >
            {esSuperadmin
              ? 'Acceso global autorizado.'
              : 'Solo puedes administrar pasaportes digitales de tu empresa.'}
          </div>
        </div>

        {/* =================================================
            MENSAJES
        ================================================= */}

        {error && (
          <div
            style={{
              marginBottom: 18,
              background: '#450a0a',
              border: '1px solid #991b1b',
              color: '#fecaca',
              padding: 14,
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 700
            }}
          >
            {error}
          </div>
        )}

        {mensaje && (
          <div
            style={{
              marginBottom: 18,
              background: '#052e16',
              border: '1px solid #166534',
              color: '#86efac',
              padding: 14,
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 800
            }}
          >
            {mensaje}
          </div>
        )}

        {/* =================================================
            SIN UNIDADES
        ================================================= */}

        {unidades.length === 0 ? (
          <div
            style={{
              background: '#18181b',
              border: '1px solid #27272a',
              borderRadius: 16,
              padding: 30,
              textAlign: 'center'
            }}
          >
            <div
              style={{
                fontSize: 35,
                marginBottom: 12
              }}
            >
              ◈
            </div>

            <h2
              style={{
                margin: 0
              }}
            >
              No existen unidades disponibles
            </h2>

            <p
              style={{
                color: '#a1a1aa',
                fontSize: 13
              }}
            >
              Primero debes disponer de una unidad física
              para crear su Pasaporte Digital.
            </p>

            <button
              onClick={() =>
                router.push('/unidades')
              }
              style={{
                marginTop: 10,
                background: '#ff6a00',
                color: 'white',
                border: 0,
                borderRadius: 10,
                padding: '12px 18px',
                fontWeight: 900,
                cursor: 'pointer'
              }}
            >
              VER UNIDADES
            </button>
          </div>
        ) : (
          <>
            {/* ===============================================
                PASO 1
            =============================================== */}

            <div
              style={{
                background: '#18181b',
                border: '1px solid #27272a',
                borderRadius: 16,
                padding: 20,
                marginBottom: 18
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'center',
                  marginBottom: 16
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: '#ff6a00',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 950
                  }}
                >
                  1
                </div>

                <div>
                  <div
                    style={{
                      fontWeight: 950
                    }}
                  >
                    Seleccionar unidad física
                  </div>

                  <div
                    style={{
                      color: '#71717a',
                      fontSize: 11,
                      marginTop: 2
                    }}
                  >
                    El DPP quedará vinculado permanentemente
                    a esta identidad.
                  </div>
                </div>
              </div>

              <label
                style={{
                  display: 'block',
                  fontSize: 10,
                  color: '#a1a1aa',
                  fontWeight: 900,
                  marginBottom: 7
                }}
              >
                UNIDAD
              </label>

              <select
                value={unidadId}
                disabled={Boolean(editCodigo)}
                onChange={e =>
                  seleccionarUnidad(
                    e.target.value
                  )
                }
                style={{
                  width: '100%',
                  background: '#09090b',
                  color: 'white',
                  border: '1px solid #3f3f46',
                  borderRadius: 10,
                  padding: 13,
                  outline: 'none'
                }}
              >
                <option value="">
                  Selecciona una unidad...
                </option>

                {unidades.map(unidad => (
                  <option
                    key={unidad.id}
                    value={unidad.id}
                  >
                    {unidad.codigo}
                    {' · '}
                    Unidad #{unidad.numero_unidad}
                  </option>
                ))}
              </select>

              {editCodigo && (
                <div
                  style={{
                    color: '#71717a',
                    fontSize: 10,
                    marginTop: 7
                  }}
                >
                  La unidad queda bloqueada durante la edición
                  para proteger la trazabilidad.
                </div>
              )}

              {/* =============================================
                  CADENA DE IDENTIDAD
              ============================================= */}

              {unidadSeleccionada && (
                <div
                  style={{
                    marginTop: 18,
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fit,minmax(160px,1fr))',
                    gap: 10
                  }}
                >
                  <InfoCard
                    label="PRODUCTO"
                    value={
                      nombreProducto(
                        productoSeleccionado
                      )
                    }
                  />

                  <InfoCard
                    label="MODELO"
                    value={
                      nombreModelo(
                        modeloSeleccionado
                      )
                    }
                  />

                  <InfoCard
                    label="LOTE"
                    value={
                      loteSeleccionado?.codigo ||
                      unidadSeleccionada.lote_id
                    }
                  />

                  <InfoCard
                    label="UNIDAD"
                    value={
                      unidadSeleccionada.codigo
                    }
                    highlight
                  />
                </div>
              )}
            </div>

            {/* ===============================================
                PASO 2
            =============================================== */}

            <div
              style={{
                background: '#18181b',
                border: '1px solid #27272a',
                borderRadius: 16,
                padding: 20,
                marginBottom: 18
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'center',
                  marginBottom: 16
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: '#ff6a00',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 950
                  }}
                >
                  2
                </div>

                <div>
                  <div
                    style={{
                      fontWeight: 950
                    }}
                  >
                    Tipo de Pasaporte
                  </div>

                  <div
                    style={{
                      color: '#71717a',
                      fontSize: 11,
                      marginTop: 2
                    }}
                  >
                    Define la información técnica del producto.
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  flexWrap: 'wrap'
                }}
              >
                {Object.keys(
                  PLANTILLAS
                ).map(key => (
                  <button
                    key={key}
                    disabled={Boolean(editCodigo)}
                    onClick={() => {
                      setPlantilla(key)
                      setForm({})
                      setResult('')
                    }}
                    style={{
                      padding: '11px 16px',
                      borderRadius: 10,
                      fontWeight: 900,
                      fontSize: 12,
                      border:
                        plantilla === key
                          ? '1px solid #ff6a00'
                          : '1px solid #3f3f46',
                      background:
                        plantilla === key
                          ? '#ff6a00'
                          : '#09090b',
                      color: 'white',
                      cursor: editCodigo
                        ? 'not-allowed'
                        : 'pointer',
                      opacity:
                        editCodigo &&
                        plantilla !== key
                          ? 0.5
                          : 1
                    }}
                  >
                    {PLANTILLAS[key].label}
                  </button>
                ))}
              </div>
            </div>

            {/* ===============================================
                PASO 3
            =============================================== */}

            <div
              style={{
                background: '#18181b',
                border: '1px solid #27272a',
                borderRadius: 16,
                padding: 20
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'center',
                  marginBottom: 20
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: '#ff6a00',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 950
                  }}
                >
                  3
                </div>

                <div>
                  <div
                    style={{
                      fontWeight: 950
                    }}
                  >
                    Información del DPP
                  </div>

                  <div
                    style={{
                      color: '#71717a',
                      fontSize: 11,
                      marginTop: 2
                    }}
                  >
                    Información técnica asociada a la unidad.
                  </div>
                </div>
              </div>

              <label
                style={{
                  fontSize: 10,
                  color: '#a1a1aa',
                  fontWeight: 900
                }}
              >
                DESCRIPCIÓN PRODUCTO *
              </label>

              <input
                value={descripcion}
                onChange={e =>
                  setDescripcion(
                    e.target.value
                  )
                }
                placeholder="Descripción del producto"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: '#09090b',
                  border: '1px solid #3f3f46',
                  borderRadius: 10,
                  padding: 13,
                  color: 'white',
                  marginTop: 7,
                  marginBottom: 18,
                  outline: 'none'
                }}
              />

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit,minmax(250px,1fr))',
                  gap: 14
                }}
              >
                {PLANTILLAS[
                  plantilla
                ].fields.map(
                  (field: any) => (
                    <div
                      key={field.key}
                    >
                      <label
                        style={{
                          fontSize: 10,
                          color: '#a1a1aa',
                          fontWeight: 900
                        }}
                      >
                        {field.label.toUpperCase()}
                      </label>

                      <input
                        type={
                          field.type ||
                          'text'
                        }
                        value={
                          form[
                            field.key
                          ] || ''
                        }
                        onChange={e =>
                          setForm({
                            ...form,
                            [field.key]:
                              e.target.value
                          })
                        }
                        placeholder={
                          field.placeholder
                        }
                        style={{
                          width: '100%',
                          boxSizing:
                            'border-box',
                          background:
                            '#09090b',
                          border:
                            '1px solid #3f3f46',
                          borderRadius: 10,
                          padding: 12,
                          color: 'white',
                          marginTop: 7,
                          outline: 'none'
                        }}
                      />
                    </div>
                  )
                )}
              </div>

              {/* =============================================
                  GUARDAR
              ============================================= */}

              <button
                onClick={save}
                disabled={
                  saving ||
                  !unidadSeleccionada
                }
                style={{
                  width: '100%',
                  background:
                    saving ||
                    !unidadSeleccionada
                      ? '#3f3f46'
                      : '#ff6a00',
                  color: 'white',
                  padding: 15,
                  borderRadius: 11,
                  fontWeight: 950,
                  border: 'none',
                  cursor:
                    saving ||
                    !unidadSeleccionada
                      ? 'not-allowed'
                      : 'pointer',
                  marginTop: 24,
                  fontSize: 13
                }}
              >
                {saving
                  ? 'GUARDANDO...'
                  : editCodigo
                    ? '💾 GUARDAR CAMBIOS'
                    : '🚀 CREAR PASAPORTE DIGITAL'}
              </button>

              {!unidadSeleccionada && (
                <p
                  style={{
                    textAlign: 'center',
                    color: '#71717a',
                    fontSize: 10,
                    marginBottom: 0
                  }}
                >
                  Selecciona una unidad física para habilitar
                  la creación del DPP.
                </p>
              )}

              {/* =============================================
                  RESULTADO
              ============================================= */}

              {result && (
                <div
                  style={{
                    marginTop: 24,
                    background: '#052e16',
                    border: '1px solid #16a34a',
                    padding: 22,
                    borderRadius: 14,
                    textAlign: 'center'
                  }}
                >
                  <div
                    style={{
                      color: '#86efac',
                      fontSize: 10,
                      fontWeight: 950,
                      letterSpacing: 1.5
                    }}
                  >
                    PASAPORTE DIGITAL ACTIVO
                  </div>

                  <h3
                    style={{
                      margin:
                        '8px 0 4px',
                      fontSize: 17
                    }}
                  >
                    {codigoDPP}
                  </h3>

                  {unidadSeleccionada && (
                    <div
                      style={{
                        color: '#86efac',
                        fontSize: 11
                      }}
                    >
                      Vinculado a{' '}
                      <strong>
                        {
                          unidadSeleccionada.codigo
                        }
                      </strong>
                    </div>
                  )}

                  <a
                    href={result}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'block',
                      marginTop: 12,
                      color: 'white',
                      fontWeight: 700,
                      fontSize: 11,
                      wordBreak:
                        'break-all'
                    }}
                  >
                    {result}
                  </a>

                  <div
                    style={{
                      marginTop: 20,
                      display: 'flex',
                      justifyContent:
                        'center'
                    }}
                  >
                    <QRWithLogo
                      data={result}
                      logo={logoSrc}
                      fallback={
                        PLANTILLAS[
                          plantilla
                        ]
                          .fallbackLogo
                      }
                      size={280}
                    />
                  </div>

                  <p
                    style={{
                      fontSize: 10,
                      color: '#86efac',
                      marginTop: 12
                    }}
                  >
                    QR vinculado al Pasaporte Digital
                    Vinculab
                  </p>

                  <div
                    style={{
                      marginTop: 16,
                      display: 'flex',
                      gap: 8,
                      justifyContent:
                        'center',
                      flexWrap: 'wrap'
                    }}
                  >
                    <a
                      href={result}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        background:
                          'white',
                        color: '#052e16',
                        padding:
                          '10px 16px',
                        borderRadius: 8,
                        fontWeight: 950,
                        fontSize: 11,
                        textDecoration:
                          'none'
                      }}
                    >
                      VER FICHA →
                    </a>

                    <button
                      onClick={() =>
                        window.print()
                      }
                      style={{
                        background:
                          '#16a34a',
                        color: 'white',
                        padding:
                          '10px 16px',
                        borderRadius: 8,
                        fontWeight: 950,
                        fontSize: 11,
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      🖨️ IMPRIMIR QR
                    </button>

                    {unidadSeleccionada && (
                      <button
                        onClick={() =>
                          router.push(
                            `/u/${unidadSeleccionada.codigo}`
                          )
                        }
                        style={{
                          background:
                            '#18181b',
                          color: 'white',
                          padding:
                            '10px 16px',
                          borderRadius: 8,
                          fontWeight: 950,
                          fontSize: 11,
                          border:
                            '1px solid #3f3f46',
                          cursor: 'pointer'
                        }}
                      >
                        VER IDENTIDAD
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* =========================================================
   INFO CARD
========================================================= */

function InfoCard({
  label,
  value,
  highlight = false
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div
      style={{
        background: '#09090b',
        border: highlight
          ? '1px solid #ff6a00'
          : '1px solid #27272a',
        borderRadius: 10,
        padding: 12
      }}
    >
      <div
        style={{
          color: '#71717a',
          fontSize: 9,
          fontWeight: 900,
          letterSpacing: 1
        }}
      >
        {label}
      </div>

      <div
        style={{
          color: highlight
            ? '#ff8a3d'
            : 'white',
          marginTop: 5,
          fontSize: 12,
          fontWeight: 900,
          wordBreak: 'break-word'
        }}
      >
        {value}
      </div>
    </div>
  )
}

/* =========================================================
   PAGE
========================================================= */

export default function Page() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            padding: 40,
            background: '#09090b',
            color: 'white',
            minHeight: '100vh',
            fontFamily: 'system-ui'
          }}
        >
          Cargando Vinculab...
        </div>
      }
    >
      <DPPContent />
    </Suspense>
  )
}
