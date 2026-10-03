'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ============================================================
// REGISTROS DE AUKABOOCH QUE INTENTAREMOS LEER DESDE HERCOM
// ============================================================

const AUKABOOCH = {
  empresa: 'd7631aa7-cc3b-4e23-b332-241576196764',
  producto: 'PROD-1790856440380',
  modelo: '2400aac1-ffba-480f-88c2-72f907fed1a3',
  lote: '6d7f8041-133e-49bd-886f-d6ccdf3c5776',
  unidad: '24dee64e-8331-43bc-8b2e-76854b93d432',
}

type ResultadoPrueba = {
  nombre: string
  bloqueado: boolean
  detalle: string
}

type Perfil = {
  id?: string
  nombre?: string | null
  rol?: string | null
  empresa_id?: string | null
  activo?: boolean | null
}

export default function PruebaSeguridadPage() {
  const [cargando, setCargando] = useState(true)
  const [errorGeneral, setErrorGeneral] = useState('')
  const [email, setEmail] = useState('')
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [empresaActual, setEmpresaActual] = useState('')
  const [resultados, setResultados] = useState<ResultadoPrueba[]>([])

  useEffect(() => {
    ejecutarPrueba()
  }, [])

  async function ejecutarPrueba() {
    setCargando(true)
    setErrorGeneral('')
    setResultados([])

    try {
      // ======================================================
      // 1. COMPROBAR SESIÓN
      // ======================================================

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        throw new Error(
          'No existe una sesión válida. Inicia sesión como administrador de Hercom.'
        )
      }

      setEmail(user.email ?? '')

      // ======================================================
      // 2. OBTENER PERFIL DEL USUARIO ACTUAL
      // ======================================================

      const { data: perfilData, error: perfilError } = await supabase
        .from('perfiles')
        .select('id, nombre, rol, empresa_id, activo')
        .eq('id', user.id)
        .maybeSingle()

      if (perfilError) {
        throw new Error(
          `No se pudo obtener el perfil: ${perfilError.message}`
        )
      }

      if (!perfilData) {
        throw new Error('El usuario actual no tiene perfil.')
      }

      setPerfil(perfilData)

      // ======================================================
      // SEGURIDAD DE LA PRUEBA
      // NO EJECUTAR COMO SUPERADMIN
      // ======================================================

      if (perfilData.rol === 'superadmin') {
        throw new Error(
          'Estás conectado como Super Admin. Esta prueba debe realizarse con el administrador de Hercom.'
        )
      }

      if (!perfilData.empresa_id) {
        throw new Error(
          'El perfil actual no tiene una empresa asignada.'
        )
      }

      if (perfilData.empresa_id === AUKABOOCH.empresa) {
        throw new Error(
          'El usuario actual pertenece a AukaBooch. Debes realizar esta prueba con Hercom.'
        )
      }

      // ======================================================
      // 3. IDENTIFICAR EMPRESA DEL USUARIO
      // ======================================================

      const { data: empresaData, error: empresaError } = await supabase
        .from('empresas')
        .select('id, razon_social')
        .eq('id', perfilData.empresa_id)
        .maybeSingle()

      if (empresaError) {
        throw new Error(
          `No se pudo consultar la empresa del usuario: ${empresaError.message}`
        )
      }

      setEmpresaActual(
        empresaData?.razon_social ?? perfilData.empresa_id
      )

      // ======================================================
      // 4. INTENTOS DIRECTOS CONTRA DATOS DE AUKABOOCH
      //
      // IMPORTANTE:
      // Supabase + RLS normalmente no devuelve "permission denied".
      // Una fila que RLS oculta suele aparecer simplemente como
      // inexistente.
      // ======================================================

      const pruebas: ResultadoPrueba[] = []

      // ------------------------------------------------------
      // EMPRESA
      // ------------------------------------------------------

      const empresaAuka = await supabase
        .from('empresas')
        .select('id, razon_social')
        .eq('id', AUKABOOCH.empresa)
        .maybeSingle()

      pruebas.push({
        nombre: 'Empresa AukaBooch',
        bloqueado: !empresaAuka.data,
        detalle: empresaAuka.error
          ? `RLS/Error: ${empresaAuka.error.message}`
          : empresaAuka.data
            ? 'ALERTA: el usuario pudo leer la empresa AukaBooch.'
            : 'Registro no visible para esta sesión.',
      })

      // ------------------------------------------------------
      // PRODUCTO
      // ------------------------------------------------------

      const productoAuka = await supabase
        .from('productos')
        .select('id, nombre, empresa_id')
        .eq('id', AUKABOOCH.producto)
        .maybeSingle()

      pruebas.push({
        nombre: 'Producto AukaBooch',
        bloqueado: !productoAuka.data,
        detalle: productoAuka.error
          ? `RLS/Error: ${productoAuka.error.message}`
          : productoAuka.data
            ? 'ALERTA: el usuario pudo leer el producto de AukaBooch.'
            : 'Registro no visible para esta sesión.',
      })

      // ------------------------------------------------------
      // MODELO
      // ------------------------------------------------------

      const modeloAuka = await supabase
        .from('modelos')
        .select('id, nombre, empresa_id')
        .eq('id', AUKABOOCH.modelo)
        .maybeSingle()

      pruebas.push({
        nombre: 'Modelo AukaBooch',
        bloqueado: !modeloAuka.data,
        detalle: modeloAuka.error
          ? `RLS/Error: ${modeloAuka.error.message}`
          : modeloAuka.data
            ? 'ALERTA: el usuario pudo leer el modelo de AukaBooch.'
            : 'Registro no visible para esta sesión.',
      })

      // ------------------------------------------------------
      // LOTE
      // ------------------------------------------------------

      const loteAuka = await supabase
        .from('lotes')
        .select('id, codigo, empresa_id')
        .eq('id', AUKABOOCH.lote)
        .maybeSingle()

      pruebas.push({
        nombre: 'Lote AukaBooch',
        bloqueado: !loteAuka.data,
        detalle: loteAuka.error
          ? `RLS/Error: ${loteAuka.error.message}`
          : loteAuka.data
            ? 'ALERTA: el usuario pudo leer el lote de AukaBooch.'
            : 'Registro no visible para esta sesión.',
      })

      // ------------------------------------------------------
      // UNIDAD
      // ------------------------------------------------------

      const unidadAuka = await supabase
        .from('unidades')
        .select('id, codigo, empresa_id')
        .eq('id', AUKABOOCH.unidad)
        .maybeSingle()

      pruebas.push({
        nombre: 'Unidad AukaBooch',
        bloqueado: !unidadAuka.data,
        detalle: unidadAuka.error
          ? `RLS/Error: ${unidadAuka.error.message}`
          : unidadAuka.data
            ? 'ALERTA: el usuario pudo leer la unidad de AukaBooch.'
            : 'Registro no visible para esta sesión.',
      })

      setResultados(pruebas)
    } catch (error: any) {
      console.error('Error prueba seguridad:', error)
      setErrorGeneral(
        error?.message ?? 'Error desconocido durante la prueba.'
      )
    } finally {
      setCargando(false)
    }
  }

  const todoBloqueado =
    resultados.length === 5 &&
    resultados.every((resultado) => resultado.bloqueado)

  const existeFalla =
    resultados.length > 0 &&
    resultados.some((resultado) => !resultado.bloqueado)

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#08090b',
        color: '#f5f5f5',
        padding: '40px 20px',
        fontFamily:
          'Inter, Arial, Helvetica, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
        }}
      >
        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <div
          style={{
            marginBottom: '30px',
          }}
        >
          <div
            style={{
              color: '#ff6a00',
              fontWeight: 900,
              fontSize: '13px',
              letterSpacing: '2px',
              marginBottom: '10px',
            }}
          >
            VINCULAB · DIAGNÓSTICO DE SEGURIDAD
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: '34px',
              fontWeight: 900,
            }}
          >
            Prueba de aislamiento RLS
          </h1>

          <p
            style={{
              marginTop: '10px',
              color: '#9ca3af',
              lineHeight: 1.6,
            }}
          >
            Esta página intenta acceder directamente a registros
            pertenecientes a otra empresa utilizando la sesión
            actualmente autenticada.
          </p>
        </div>

        {/* ================================================== */}
        {/* CARGANDO */}
        {/* ================================================== */}

        {cargando && (
          <div
            style={{
              background: '#15171a',
              border: '1px solid #292c31',
              borderRadius: '14px',
              padding: '25px',
            }}
          >
            Ejecutando pruebas de seguridad...
          </div>
        )}

        {/* ================================================== */}
        {/* ERROR */}
        {/* ================================================== */}

        {!cargando && errorGeneral && (
          <div
            style={{
              background: '#2a1010',
              border: '1px solid #7f1d1d',
              borderRadius: '14px',
              padding: '22px',
              color: '#fecaca',
            }}
          >
            <strong>No se pudo ejecutar la prueba.</strong>

            <div
              style={{
                marginTop: '10px',
              }}
            >
              {errorGeneral}
            </div>
          </div>
        )}

        {/* ================================================== */}
        {/* INFORMACIÓN DE SESIÓN */}
        {/* ================================================== */}

        {!cargando && !errorGeneral && perfil && (
          <>
            <section
              style={{
                background: '#15171a',
                border: '1px solid #292c31',
                borderRadius: '16px',
                padding: '22px',
                marginBottom: '20px',
              }}
            >
              <h2
                style={{
                  marginTop: 0,
                  fontSize: '18px',
                }}
              >
                Sesión utilizada
              </h2>

              <div
                style={{
                  display: 'grid',
                  gap: '10px',
                  color: '#d1d5db',
                }}
              >
                <div>
                  <strong>Usuario:</strong>{' '}
                  {perfil.nombre || 'Sin nombre'}
                </div>

                <div>
                  <strong>Email:</strong> {email}
                </div>

                <div>
                  <strong>Rol:</strong> {perfil.rol}
                </div>

                <div>
                  <strong>Empresa:</strong>{' '}
                  {empresaActual || perfil.empresa_id}
                </div>
              </div>
            </section>

            {/* ============================================== */}
            {/* RESULTADO GENERAL */}
            {/* ============================================== */}

            {todoBloqueado && (
              <div
                style={{
                  background: '#0d2517',
                  border: '1px solid #166534',
                  borderRadius: '16px',
                  padding: '24px',
                  marginBottom: '20px',
                }}
              >
                <div
                  style={{
                    color: '#4ade80',
                    fontWeight: 900,
                    fontSize: '22px',
                  }}
                >
                  ✓ AISLAMIENTO CORRECTO
                </div>

                <p
                  style={{
                    marginBottom: 0,
                    color: '#bbf7d0',
                    lineHeight: 1.6,
                  }}
                >
                  La sesión de esta empresa no pudo leer ninguno
                  de los registros de AukaBooch utilizados en la
                  prueba.
                </p>
              </div>
            )}

            {existeFalla && (
              <div
                style={{
                  background: '#2a1010',
                  border: '1px solid #991b1b',
                  borderRadius: '16px',
                  padding: '24px',
                  marginBottom: '20px',
                }}
              >
                <div
                  style={{
                    color: '#f87171',
                    fontWeight: 900,
                    fontSize: '22px',
                  }}
                >
                  ⚠ AISLAMIENTO INCOMPLETO
                </div>

                <p
                  style={{
                    marginBottom: 0,
                    color: '#fecaca',
                    lineHeight: 1.6,
                  }}
                >
                  Al menos un registro de AukaBooch fue visible
                  para esta sesión. No debemos continuar hasta
                  revisar la política RLS correspondiente.
                </p>
              </div>
            )}

            {/* ============================================== */}
            {/* RESULTADOS INDIVIDUALES */}
            {/* ============================================== */}

            <section
              style={{
                background: '#15171a',
                border: '1px solid #292c31',
                borderRadius: '16px',
                overflow: 'hidden',
              }}
            >
              {resultados.map((resultado, index) => (
                <div
                  key={resultado.nombre}
                  style={{
                    padding: '20px',
                    borderBottom:
                      index < resultados.length - 1
                        ? '1px solid #292c31'
                        : 'none',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '20px',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: 800,
                          marginBottom: '6px',
                        }}
                      >
                        {resultado.nombre}
                      </div>

                      <div
                        style={{
                          color: '#9ca3af',
                          fontSize: '14px',
                        }}
                      >
                        {resultado.detalle}
                      </div>
                    </div>

                    <div
                      style={{
                        padding: '8px 13px',
                        borderRadius: '999px',
                        fontWeight: 900,
                        fontSize: '13px',
                        background: resultado.bloqueado
                          ? '#0d2517'
                          : '#2a1010',
                        color: resultado.bloqueado
                          ? '#4ade80'
                          : '#f87171',
                        border: resultado.bloqueado
                          ? '1px solid #166534'
                          : '1px solid #991b1b',
                      }}
                    >
                      {resultado.bloqueado
                        ? 'BLOQUEADO ✓'
                        : 'VISIBLE ⚠'}
                    </div>
                  </div>
                </div>
              ))}
            </section>

            {/* ============================================== */}
            {/* BOTÓN REPETIR */}
            {/* ============================================== */}

            <button
              onClick={ejecutarPrueba}
              style={{
                marginTop: '22px',
                width: '100%',
                border: 'none',
                borderRadius: '12px',
                padding: '15px 18px',
                background: '#ff6a00',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '15px',
                cursor: 'pointer',
              }}
            >
              Repetir prueba
            </button>
          </>
        )}
      </div>
    </main>
  )
}
