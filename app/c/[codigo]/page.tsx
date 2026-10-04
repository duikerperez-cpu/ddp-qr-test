'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ============================================================
// TIPOS
// ============================================================

type CertificadoPublico = {
  encontrado: boolean

  codigo?: string
  tipo?: string
  titulo?: string
  descripcion?: string | null
  estado?: string

  fecha_emision?: string
  fecha_vencimiento?: string | null

  emitido_por?: string | null

  referencia_verificacion?: string | null
  hash_verificacion?: string | null

  empresa?: {
    id?: string | null
    nombre?: string | null
    pais?: string | null
    sector?: string | null
  } | null

  producto?: {
    id?: string | null
    nombre?: string | null
    categoria?: string | null
    sku?: string | null
  } | null

  modelo?: {
    id?: string | null
    nombre?: string | null
    version?: string | null
    categoria?: string | null
  } | null

  lote?: {
    id?: string | null
    codigo?: string | null
    estado?: string | null
    fecha_produccion?: string | null
    fecha_vencimiento?: string | null
    ubicacion?: string | null
  } | null

  unidad?: {
    id?: string | null
    codigo?: string | null
    numero_unidad?: number | null
    estado?: string | null
  } | null

  dpp?: {
    id?: string | null
    codigo?: string | null
    estado?: string | null
  } | null

  identidad?: {
    carrier_id?: string | null
    vinculab_id?: string | null
    tipo?: string | null
    uid_nfc?: string | null
    qr_url?: string | null
    estado?: string | null
  } | null

  datos_emision?: Record<string, any> | null
}

// ============================================================
// HELPERS
// ============================================================

function texto(
  valor: string | number | null | undefined,
  fallback = 'No informado'
) {
  if (
    valor === null ||
    valor === undefined ||
    valor === ''
  ) {
    return fallback
  }

  return String(valor)
}

function fecha(
  valor: string | null | undefined
) {
  if (!valor) {
    return 'Sin vencimiento'
  }

  const date = new Date(valor)

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return valor
  }

  return new Intl.DateTimeFormat(
    'es-CL',
    {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }
  ).format(date)
}

function fechaHora(
  valor: string | null | undefined
) {
  if (!valor) {
    return 'No informado'
  }

  const date = new Date(valor)

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return valor
  }

  return new Intl.DateTimeFormat(
    'es-CL',
    {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
  ).format(date)
}

function estadoNormalizado(
  estado: string | null | undefined
) {
  return String(
    estado || ''
  )
    .trim()
    .toLowerCase()
}

function estadoVisual(
  estado: string | null | undefined
) {
  const valor =
    estadoNormalizado(
      estado
    )

  if (
    valor === 'valido' ||
    valor === 'válido'
  ) {
    return {
      label: 'CERTIFICADO VÁLIDO',
      className: 'status valid',
      icon: '✓'
    }
  }

  if (
    valor === 'revocado'
  ) {
    return {
      label: 'CERTIFICADO REVOCADO',
      className: 'status revoked',
      icon: '×'
    }
  }

  if (
    valor === 'suspendido'
  ) {
    return {
      label: 'CERTIFICADO SUSPENDIDO',
      className: 'status suspended',
      icon: '!'
    }
  }

  if (
    valor === 'vencido'
  ) {
    return {
      label: 'CERTIFICADO VENCIDO',
      className: 'status expired',
      icon: '!'
    }
  }

  return {
    label:
      estado
        ? String(estado).toUpperCase()
        : 'ESTADO NO DISPONIBLE',

    className:
      'status neutral',

    icon: '?'
  }
}

// ============================================================
// COMPONENTE
// ============================================================

export default function CertificadoPublicoPage() {
  const params =
    useParams()

  const codigoParam =
    params?.codigo

  const codigo =
    Array.isArray(
      codigoParam
    )
      ? codigoParam[0]
      : String(
          codigoParam || ''
        )

  const [
    loading,
    setLoading
  ] = useState(true)

  const [
    error,
    setError
  ] = useState('')

  const [
    certificado,
    setCertificado
  ] = useState<CertificadoPublico | null>(
    null
  )

  // ==========================================================
  // CARGA
  // ==========================================================

  useEffect(() => {
    if (!codigo) {
      return
    }

    let activo = true

    async function cargar() {
      try {
        setLoading(true)
        setError('')

        const {
          data,
          error
        } = await supabase.rpc(
          'get_certificado_publico',
          {
            p_codigo:
              decodeURIComponent(
                codigo
              )
          }
        )

        if (error) {
          console.error(
            'Error RPC certificado:',
            error
          )

          throw new Error(
            'No fue posible verificar el certificado.'
          )
        }

        if (!activo) {
          return
        }

        const resultado =
          data as CertificadoPublico

        if (
          !resultado ||
          resultado.encontrado !== true
        ) {
          setCertificado(
            resultado || {
              encontrado: false
            }
          )

          return
        }

        setCertificado(
          resultado
        )
      } catch (err: any) {
        console.error(err)

        if (activo) {
          setError(
            err?.message ||
              'No fue posible cargar el certificado.'
          )
        }
      } finally {
        if (activo) {
          setLoading(false)
        }
      }
    }

    cargar()

    return () => {
      activo = false
    }
  }, [codigo])

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <>
        <main className="loadingPage">
          <div className="loadingLogo">
            VINCULAB
          </div>

          <div className="loader" />

          <div className="loadingText">
            Verificando certificado digital...
          </div>
        </main>

        <style jsx>{`
          * {
            box-sizing: border-box;
          }

          .loadingPage {
            min-height: 100vh;
            background: #08090b;
            color: #ffffff;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-family:
              Arial,
              Helvetica,
              sans-serif;
            padding: 24px;
          }

          .loadingLogo {
            color: #ff6a00;
            font-size: 26px;
            font-weight: 900;
            letter-spacing: 5px;
            margin-bottom: 30px;
          }

          .loader {
            width: 42px;
            height: 42px;
            border-radius: 50%;
            border: 3px solid #282b31;
            border-top-color: #ff6a00;
            animation: spin 0.8s linear infinite;
          }

          .loadingText {
            margin-top: 20px;
            color: #9198a7;
            font-size: 14px;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </>
    )
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (
    error ||
    !certificado ||
    certificado.encontrado !== true
  ) {
    return (
      <>
        <main className="errorPage">
          <div className="brand">
            VINCULAB
          </div>

          <div className="errorCard">
            <div className="errorIcon">
              ×
            </div>

            <div className="eyebrow">
              VERIFICACIÓN DIGITAL
            </div>

            <h1>
              Certificado no encontrado
            </h1>

            <p>
              {error ||
                'No existe un certificado verificable asociado al código solicitado.'}
            </p>

            <div className="requested">
              {decodeURIComponent(
                codigo
              )}
            </div>

            <a
              href="/"
              className="homeButton"
            >
              Ir a Vinculab
            </a>
          </div>
        </main>

        <style jsx>{`
          * {
            box-sizing: border-box;
          }

          .errorPage {
            min-height: 100vh;
            background: #08090b;
            color: #ffffff;
            font-family:
              Arial,
              Helvetica,
              sans-serif;
            padding: 50px 20px;
          }

          .brand {
            max-width: 760px;
            margin: 0 auto 30px;
            color: #ff6a00;
            font-size: 24px;
            font-weight: 900;
            letter-spacing: 5px;
          }

          .errorCard {
            max-width: 760px;
            margin: 0 auto;
            padding: 50px;
            border-radius: 24px;
            background: #121418;
            border: 1px solid #2b2f36;
            text-align: center;
          }

          .errorIcon {
            width: 72px;
            height: 72px;
            margin: 0 auto 25px;
            border-radius: 50%;
            border: 2px solid #ef4444;
            color: #ef4444;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
          }

          .eyebrow {
            color: #ff6a00;
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 2px;
          }

          h1 {
            margin: 12px 0;
            font-size: 34px;
          }

          p {
            color: #9ba2b0;
            line-height: 1.7;
          }

          .requested {
            margin: 24px 0;
            padding: 14px;
            border-radius: 10px;
            background: #08090b;
            border: 1px solid #30343b;
            color: #d6dae2;
            font-family: monospace;
          }

          .homeButton {
            display: inline-flex;
            padding: 14px 22px;
            border-radius: 10px;
            background: #ff6a00;
            color: #ffffff;
            text-decoration: none;
            font-weight: 800;
          }

          @media (max-width: 600px) {
            .errorCard {
              padding: 32px 20px;
            }

            h1 {
              font-size: 28px;
            }
          }
        `}</style>
      </>
    )
  }

  const estado =
    estadoVisual(
      certificado.estado
    )

  const unidadUrl =
    certificado.identidad?.qr_url ||
    (
      certificado.unidad?.codigo
        ? `/u/${encodeURIComponent(
            certificado.unidad.codigo
          )}`
        : null
    )

  const dppUrl =
    certificado.unidad?.codigo
      ? `/u/${encodeURIComponent(
          certificado.unidad.codigo
        )}`
      : null

  // ==========================================================
  // CERTIFICADO
  // ==========================================================

  return (
    <>
      <main className="page">
        {/* ===================================================
            HEADER
        =================================================== */}

        <header className="header">
          <a
            href="/"
            className="brand"
          >
            VINCULAB
          </a>

          <div className="headerRight">
            <span className="dot" />

            Verificación pública
          </div>
        </header>

        {/* ===================================================
            HERO
        =================================================== */}

        <section className="hero">
          <div>
            <div className="eyebrow">
              IDENTIDAD DIGITAL VERIFICABLE
            </div>

            <h1>
              Certificado de
              <br />
              autenticidad.
            </h1>

            <p className="heroText">
              Registro digital verificable asociado
              a una identidad física y a su historial
              de producto dentro de Vinculab.
            </p>
          </div>

          <div className={estado.className}>
            <div className="statusIcon">
              {estado.icon}
            </div>

            <div>
              <strong>
                {estado.label}
              </strong>

              <span>
                Verificado por Vinculab
              </span>
            </div>
          </div>
        </section>

        {/* ===================================================
            CERTIFICADO PRINCIPAL
        =================================================== */}

        <section className="certificate">
          <div className="certificateTop">
            <div>
              <div className="certificateLabel">
                CERTIFICADO DIGITAL
              </div>

              <h2>
                {texto(
                  certificado.titulo,
                  'Certificado de Autenticidad'
                )}
              </h2>
            </div>

            <div className="seal">
              <div className="sealCircle">
                ✓
              </div>

              <div>
                <strong>
                  VINCULAB
                </strong>

                <span>
                  Identidad verificable
                </span>
              </div>
            </div>
          </div>

          <div className="certificateNumber">
            <span>
              N° CERTIFICADO
            </span>

            <strong>
              {certificado.codigo}
            </strong>
          </div>

          {certificado.descripcion && (
            <p className="description">
              {certificado.descripcion}
            </p>
          )}

          {/* ===============================================
              PRODUCTO
          =============================================== */}

          <div className="sectionTitle">
            PRODUCTO CERTIFICADO
          </div>

          <div className="mainProduct">
            <div className="productIcon">
              ◇
            </div>

            <div>
              <span>
                PRODUCTO
              </span>

              <strong>
                {texto(
                  certificado.producto?.nombre
                )}
              </strong>

              <small>
                {texto(
                  certificado.producto?.categoria
                )}
              </small>
            </div>
          </div>

          {/* ===============================================
              DATOS
          =============================================== */}

          <div className="dataGrid">
            <Info
              label="Modelo"
              value={texto(
                certificado.modelo?.nombre
              )}
            />

            <Info
              label="Versión"
              value={texto(
                certificado.modelo?.version
              )}
            />

            <Info
              label="Lote"
              value={texto(
                certificado.lote?.codigo
              )}
            />

            <Info
              label="Unidad"
              value={texto(
                certificado.unidad?.codigo
              )}
            />

            <Info
              label="N° de unidad"
              value={texto(
                certificado.unidad?.numero_unidad
              )}
            />

            <Info
              label="SKU"
              value={texto(
                certificado.producto?.sku
              )}
            />

            <Info
              label="Fabricante / Empresa"
              value={texto(
                certificado.empresa?.nombre
              )}
            />

            <Info
              label="País"
              value={texto(
                certificado.empresa?.pais
              )}
            />
          </div>

          {/* ===============================================
              IDENTIDAD DIGITAL
          =============================================== */}

          <div className="sectionTitle spaced">
            IDENTIDAD DIGITAL
          </div>

          <div className="identityGrid">
            <Identity
              label="Vinculab ID"
              value={texto(
                certificado.identidad?.vinculab_id ||
                  certificado.unidad?.codigo
              )}
            />

            <Identity
              label="Carrier"
              value={texto(
                certificado.identidad?.carrier_id,
                'Sin carrier'
              )}
            />

            <Identity
              label="Tecnología"
              value={texto(
                certificado.identidad?.tipo,
                'QR'
              )}
            />

            <Identity
              label="UID NFC"
              value={texto(
                certificado.identidad?.uid_nfc,
                'No registrado'
              )}
            />
          </div>

          {/* ===============================================
              DPP
          =============================================== */}

          <div className="dppBox">
            <div>
              <span>
                PASAPORTE DIGITAL DE PRODUCTO
              </span>

              <strong>
                {texto(
                  certificado.dpp?.codigo,
                  'Sin DPP asociado'
                )}
              </strong>
            </div>

            <div className="miniStatus">
              {certificado.dpp?.estado
                ? certificado.dpp.estado.toUpperCase()
                : 'NO DISPONIBLE'}
            </div>
          </div>

          {/* ===============================================
              VERIFICACIÓN
          =============================================== */}

          <div className="verification">
            <div className="verifyIcon">
              ✓
            </div>

            <div className="verifyContent">
              <span>
                VERIFICACIÓN DIGITAL
              </span>

              <h3>
                Identidad confirmada
              </h3>

              <p>
                Este certificado está vinculado
                digitalmente a la unidad{' '}
                <strong>
                  {texto(
                    certificado.unidad?.codigo
                  )}
                </strong>
                {certificado.identidad?.carrier_id
                  ? ` y al carrier ${certificado.identidad.carrier_id}.`
                  : '.'}
              </p>

              <div className="reference">
                {texto(
                  certificado.referencia_verificacion,
                  certificado.codigo
                )}
              </div>
            </div>
          </div>

          {/* ===============================================
              FECHAS
          =============================================== */}

          <div className="dateGrid">
            <div>
              <span>
                FECHA DE EMISIÓN
              </span>

              <strong>
                {fechaHora(
                  certificado.fecha_emision
                )}
              </strong>
            </div>

            <div>
              <span>
                VENCIMIENTO
              </span>

              <strong>
                {fecha(
                  certificado.fecha_vencimiento
                )}
              </strong>
            </div>

            <div>
              <span>
                EMITIDO POR
              </span>

              <strong>
                {texto(
                  certificado.emitido_por,
                  'Vinculab'
                )}
              </strong>
            </div>
          </div>

          {/* ===============================================
              ACCIONES
          =============================================== */}

          <div className="actions">
            {unidadUrl && (
              <a
                href={unidadUrl}
                className="primaryButton"
              >
                Ver identidad del producto
                <span>→</span>
              </a>
            )}

            {dppUrl && certificado.dpp && (
              <a
                href={dppUrl}
                className="secondaryButton"
              >
                Consultar DPP
              </a>
            )}
          </div>
        </section>

        {/* ===================================================
            INFO
        =================================================== */}

        <section className="trustGrid">
          <TrustCard
            icon="⌁"
            title="NFC + QR"
            text="La identidad física puede vincularse mediante identificadores NFC y QR."
          />

          <TrustCard
            icon="◈"
            title="Pasaporte Digital"
            text="El certificado puede relacionarse con el Pasaporte Digital de Producto."
          />

          <TrustCard
            icon="↗"
            title="Trazabilidad"
            text="La identidad Vinculab permite conectar producto, lote, unidad y eventos verificables."
          />
        </section>

        {/* ===================================================
            DISCLAIMER
        =================================================== */}

        <section className="disclaimer">
          <strong>
            Sobre este certificado
          </strong>

          <p>
            Este documento corresponde a un
            certificado digital de identidad y
            autenticidad emitido dentro de la
            plataforma Vinculab. Su estado puede
            verificarse en línea mediante este
            registro. No constituye por sí mismo
            una certificación regulatoria,
            normativa ni una acreditación de un
            organismo público, salvo que se
            indique expresamente lo contrario.
          </p>
        </section>

        {/* ===================================================
            FOOTER
        =================================================== */}

        <footer>
          <div className="footerBrand">
            VINCULAB
          </div>

          <div>
            Identidad digital · DPP · NFC/QR ·
            Trazabilidad
          </div>

          <div>
            vinculab.cl
          </div>
        </footer>
      </main>

      {/* =====================================================
          ESTILOS
      ===================================================== */}

      <style jsx global>{`
        html,
        body {
          margin: 0;
          padding: 0;
          background: #08090b;
        }

        body {
          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 80% 15%,
              rgba(255, 106, 0, 0.08),
              transparent 25%
            ),
            #08090b;
          color: #ffffff;
        }

        /* ================================================
           HEADER
        ================================================ */

        .header {
          max-width: 1180px;
          margin: 0 auto;
          padding: 30px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #1d2025;
        }

        .brand {
          color: #ff6a00;
          font-size: 24px;
          font-weight: 900;
          letter-spacing: 5px;
          text-decoration: none;
        }

        .headerRight {
          color: #8e95a3;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow:
            0 0 12px rgba(
              34,
              197,
              94,
              0.7
            );
        }

        /* ================================================
           HERO
        ================================================ */

        .hero {
          max-width: 1180px;
          margin: 0 auto;
          padding: 80px 24px 55px;
          display: grid;
          grid-template-columns:
            1fr auto;
          gap: 50px;
          align-items: center;
        }

        .eyebrow {
          color: #ff6a00;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 2px;
          margin-bottom: 14px;
        }

        h1 {
          margin: 0;
          font-size: clamp(
            44px,
            7vw,
            78px
          );
          line-height: 0.98;
          letter-spacing: -3px;
        }

        .heroText {
          max-width: 620px;
          color: #9da4b2;
          line-height: 1.7;
          font-size: 17px;
          margin: 25px 0 0;
        }

        .status {
          min-width: 300px;
          padding: 22px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .status.valid {
          background: rgba(
            34,
            197,
            94,
            0.08
          );
          border: 1px solid
            rgba(
              34,
              197,
              94,
              0.5
            );
        }

        .status.revoked {
          background: rgba(
            239,
            68,
            68,
            0.08
          );
          border: 1px solid
            rgba(
              239,
              68,
              68,
              0.5
            );
        }

        .status.suspended,
        .status.expired {
          background: rgba(
            245,
            158,
            11,
            0.08
          );
          border: 1px solid
            rgba(
              245,
              158,
              11,
              0.5
            );
        }

        .status.neutral {
          background: #14161a;
          border: 1px solid #343840;
        }

        .statusIcon {
          width: 48px;
          height: 48px;
          flex: 0 0 48px;
          border-radius: 50%;
          border: 2px solid
            currentColor;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .status.valid {
          color: #22c55e;
        }

        .status.revoked {
          color: #ef4444;
        }

        .status.suspended,
        .status.expired {
          color: #f59e0b;
        }

        .status strong {
          display: block;
          color: #ffffff;
          font-size: 14px;
          margin-bottom: 5px;
        }

        .status span {
          display: block;
          color: #9da4b2;
          font-size: 12px;
        }

        /* ================================================
           CERTIFICATE
        ================================================ */

        .certificate {
          max-width: 1050px;
          margin: 0 auto;
          background:
            linear-gradient(
              145deg,
              #15171b,
              #101216
            );
          border: 1px solid #30343b;
          border-radius: 24px;
          padding: 50px;
          position: relative;
          overflow: hidden;
          box-shadow:
            0 30px 80px
            rgba(0, 0, 0, 0.35);
        }

        .certificate::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background:
            linear-gradient(
              90deg,
              #ff6a00,
              #ff8a00,
              transparent
            );
        }

        .certificateTop {
          display: flex;
          justify-content: space-between;
          gap: 30px;
          align-items: flex-start;
          padding-bottom: 35px;
          border-bottom: 1px solid #2b2f35;
        }

        .certificateLabel,
        .sectionTitle {
          color: #ff6a00;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .certificate h2 {
          margin: 10px 0 0;
          font-size: 34px;
          letter-spacing: -1px;
        }

        .seal {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .sealCircle {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: 2px solid #ff6a00;
          color: #ff6a00;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .seal strong {
          display: block;
          letter-spacing: 2px;
        }

        .seal span {
          display: block;
          margin-top: 4px;
          color: #858c99;
          font-size: 11px;
        }

        .certificateNumber {
          margin: 35px 0 15px;
        }

        .certificateNumber span {
          display: block;
          color: #7f8795;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.5px;
          margin-bottom: 8px;
        }

        .certificateNumber strong {
          display: block;
          font-size: clamp(
            23px,
            4vw,
            38px
          );
          color: #ffffff;
          letter-spacing: 1px;
        }

        .description {
          max-width: 760px;
          color: #9da4b2;
          line-height: 1.7;
          margin-bottom: 40px;
        }

        .sectionTitle {
          margin-top: 40px;
          margin-bottom: 18px;
        }

        .sectionTitle.spaced {
          margin-top: 45px;
        }

        .mainProduct {
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 24px;
          background: #0c0e11;
          border: 1px solid #292d34;
          border-radius: 16px;
        }

        .productIcon {
          width: 54px;
          height: 54px;
          border-radius: 14px;
          background:
            rgba(
              255,
              106,
              0,
              0.1
            );
          border: 1px solid
            rgba(
              255,
              106,
              0,
              0.35
            );
          color: #ff6a00;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
        }

        .mainProduct span,
        .mainProduct small {
          display: block;
        }

        .mainProduct span {
          color: #747c8a;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.5px;
          margin-bottom: 6px;
        }

        .mainProduct strong {
          display: block;
          font-size: 20px;
        }

        .mainProduct small {
          color: #8f97a5;
          margin-top: 5px;
        }

        /* ================================================
           DATA
        ================================================ */

        .dataGrid,
        .identityGrid {
          display: grid;
          grid-template-columns:
            repeat(4, 1fr);
          gap: 12px;
          margin-top: 14px;
        }

        /* ================================================
           DPP
        ================================================ */

        .dppBox {
          margin-top: 28px;
          padding: 20px 22px;
          background:
            rgba(
              59,
              130,
              246,
              0.07
            );
          border: 1px solid
            rgba(
              59,
              130,
              246,
              0.3
            );
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .dppBox span {
          display: block;
          color: #7f8da5;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1.4px;
          margin-bottom: 7px;
        }

        .dppBox strong {
          font-size: 14px;
        }

        .miniStatus {
          padding: 7px 11px;
          border-radius: 999px;
          color: #22c55e;
          background:
            rgba(
              34,
              197,
              94,
              0.1
            );
          border: 1px solid
            rgba(
              34,
              197,
              94,
              0.3
            );
          font-size: 9px;
          font-weight: 900;
        }

        /* ================================================
           VERIFICATION
        ================================================ */

        .verification {
          margin-top: 35px;
          padding: 28px;
          border-radius: 18px;
          background:
            linear-gradient(
              135deg,
              rgba(
                255,
                106,
                0,
                0.09
              ),
              rgba(
                255,
                106,
                0,
                0.02
              )
            );
          border: 1px solid
            rgba(
              255,
              106,
              0,
              0.3
            );
          display: flex;
          gap: 20px;
        }

        .verifyIcon {
          width: 54px;
          height: 54px;
          flex: 0 0 54px;
          border-radius: 50%;
          border: 2px solid #ff6a00;
          color: #ff6a00;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 27px;
        }

        .verifyContent > span {
          color: #ff6a00;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1.5px;
        }

        .verifyContent h3 {
          margin: 7px 0 8px;
          font-size: 22px;
        }

        .verifyContent p {
          margin: 0;
          color: #9ca3af;
          line-height: 1.6;
          font-size: 14px;
        }

        .reference {
          display: inline-block;
          margin-top: 15px;
          padding: 9px 12px;
          background: #090a0c;
          border: 1px solid #343840;
          border-radius: 8px;
          color: #c3c8d1;
          font-family: monospace;
          font-size: 12px;
        }

        /* ================================================
           DATES
        ================================================ */

        .dateGrid {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 12px;
          margin-top: 30px;
        }

        .dateGrid > div {
          padding: 18px;
          border: 1px solid #2b2f35;
          border-radius: 12px;
          background: #0d0f12;
        }

        .dateGrid span {
          display: block;
          color: #727a88;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1.2px;
          margin-bottom: 7px;
        }

        .dateGrid strong {
          font-size: 13px;
        }

        /* ================================================
           ACTIONS
        ================================================ */

        .actions {
          margin-top: 30px;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .primaryButton,
        .secondaryButton {
          min-height: 48px;
          padding: 0 18px;
          border-radius: 10px;
          text-decoration: none;
          font-size: 13px;
          font-weight: 800;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
        }

        .primaryButton {
          background: #ff6a00;
          color: #ffffff;
        }

        .secondaryButton {
          color: #ffffff;
          background: #191c21;
          border: 1px solid #343840;
        }

        /* ================================================
           TRUST
        ================================================ */

        .trustGrid {
          max-width: 1050px;
          margin: 22px auto 0;
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 12px;
        }

        /* ================================================
           DISCLAIMER
        ================================================ */

        .disclaimer {
          max-width: 1050px;
          margin: 22px auto 0;
          padding: 25px;
          background: #101216;
          border: 1px solid #282c33;
          border-radius: 14px;
        }

        .disclaimer strong {
          font-size: 12px;
          color: #c4c9d2;
        }

        .disclaimer p {
          color: #7f8795;
          line-height: 1.7;
          font-size: 12px;
          margin: 8px 0 0;
        }

        /* ================================================
           FOOTER
        ================================================ */

        footer {
          max-width: 1180px;
          margin: 70px auto 0;
          padding: 30px 24px 40px;
          border-top: 1px solid #1d2025;
          color: #666e7b;
          font-size: 11px;
          display: flex;
          justify-content: space-between;
          gap: 20px;
        }

        .footerBrand {
          color: #ff6a00;
          font-weight: 900;
          letter-spacing: 3px;
        }

        /* ================================================
           RESPONSIVE
        ================================================ */

        @media (
          max-width: 900px
        ) {
          .hero {
            grid-template-columns:
              1fr;
          }

          .status {
            width: 100%;
            min-width: 0;
          }

          .dataGrid,
          .identityGrid {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .trustGrid {
            grid-template-columns:
              1fr;
            padding: 0 18px;
          }

          .disclaimer {
            margin-left: 18px;
            margin-right: 18px;
          }
        }

        @media (
          max-width: 650px
        ) {
          .header {
            padding: 22px 18px;
          }

          .brand {
            font-size: 19px;
            letter-spacing: 4px;
          }

          .headerRight {
            font-size: 9px;
          }

          .hero {
            padding:
              50px 18px
              35px;
          }

          h1 {
            letter-spacing: -2px;
          }

          .certificate {
            margin: 0 12px;
            padding: 28px 18px;
            border-radius: 18px;
          }

          .certificateTop {
            display: block;
          }

          .seal {
            margin-top: 25px;
          }

          .certificate h2 {
            font-size: 27px;
          }

          .dataGrid,
          .identityGrid,
          .dateGrid {
            grid-template-columns:
              1fr;
          }

          .verification {
            display: block;
          }

          .verifyIcon {
            margin-bottom: 18px;
          }

          .dppBox {
            display: block;
          }

          .miniStatus {
            display: inline-block;
            margin-top: 15px;
          }

          .actions {
            display: grid;
          }

          .primaryButton,
          .secondaryButton {
            width: 100%;
          }

          footer {
            margin-top: 45px;
            padding: 25px 18px;
            display: block;
            text-align: center;
            line-height: 2;
          }
        }
      `}</style>
    </>
  )
}

// ============================================================
// COMPONENTES
// ============================================================

function Info({
  label,
  value
}: {
  label: string
  value: string
}) {
  return (
    <>
      <div className="info">
        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>
      </div>

      <style jsx>{`
        .info {
          min-height: 88px;
          padding: 16px;
          border-radius: 12px;
          background: #0d0f12;
          border: 1px solid #292d34;
        }

        span {
          display: block;
          color: #747c89;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        strong {
          color: #ffffff;
          font-size: 13px;
          line-height: 1.4;
          word-break: break-word;
        }
      `}</style>
    </>
  )
}

function Identity({
  label,
  value
}: {
  label: string
  value: string
}) {
  return (
    <>
      <div className="identity">
        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>
      </div>

      <style jsx>{`
        .identity {
          padding: 16px;
          border-radius: 12px;
          background:
            rgba(
              255,
              106,
              0,
              0.045
            );
          border: 1px solid
            rgba(
              255,
              106,
              0,
              0.2
            );
        }

        span {
          display: block;
          color: #9a725a;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        strong {
          color: #ffffff;
          font-size: 13px;
          line-height: 1.4;
          word-break: break-word;
        }
      `}</style>
    </>
  )
}

function TrustCard({
  icon,
  title,
  text
}: {
  icon: string
  title: string
  text: string
}) {
  return (
    <>
      <div className="card">
        <div className="icon">
          {icon}
        </div>

        <strong>
          {title}
        </strong>

        <p>
          {text}
        </p>
      </div>

      <style jsx>{`
        .card {
          padding: 24px;
          background: #101216;
          border: 1px solid #282c33;
          border-radius: 14px;
        }

        .icon {
          width: 38px;
          height: 38px;
          margin-bottom: 18px;
          border-radius: 10px;
          background:
            rgba(
              255,
              106,
              0,
              0.08
            );
          border: 1px solid
            rgba(
              255,
              106,
              0,
              0.25
            );
          color: #ff6a00;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }

        strong {
          font-size: 14px;
        }

        p {
          margin: 9px 0 0;
          color: #7f8795;
          font-size: 12px;
          line-height: 1.6;
        }
      `}</style>
    </>
  )
}
