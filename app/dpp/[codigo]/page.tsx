import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import QRCode from 'qrcode'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Props = {
  params: Promise<{
    codigo: string
  }>
}

type Atributo = {
  id?: string
  modelo_id?: string | null
  nombre?: string | null
  valor?: string | null
  unidad?: string | null
  grupo?: string | null
}

function texto(valor: any, fallback = 'No informado') {
  if (valor === null || valor === undefined || valor === '') {
    return fallback
  }

  return String(valor)
}

function fecha(valor: any) {
  if (!valor) return 'No informada'

  try {
    const d = new Date(valor)

    if (Number.isNaN(d.getTime())) {
      return String(valor)
    }

    return new Intl.DateTimeFormat('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d)
  } catch {
    return String(valor)
  }
}

async function buscarPorId(tabla: string, id: any) {
  if (!id) return null

  const { data, error } = await supabase
    .from(tabla)
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error(`Error consultando ${tabla}:`, error)
    return null
  }

  return data
}

export default async function DPPPage({ params }: Props) {
  const { codigo } = await params
  const codigoLimpio = decodeURIComponent(codigo)

  /* =========================================================
     1. IDENTIDAD DIGITAL
  ========================================================= */

  const { data: identidad, error: identidadError } = await supabase
    .from('productos_individuales')
    .select('*')
    .eq('codigo_publico', codigoLimpio)
    .maybeSingle()

  if (identidadError) {
    console.error('Error identidad:', identidadError)
  }

  if (!identidad) {
    notFound()
  }

  /* =========================================================
     2. EMPRESA Y LOTE
  ========================================================= */

  const [empresa, lote] = await Promise.all([
    buscarPorId('empresas', identidad.empresa_id),
    buscarPorId('lotes', identidad.lote_id),
  ])

  /*
    Compatibilidad con registros antiguos:
    si producto_id o modelo_id no están en la identidad,
    intentamos recuperarlos desde el lote.
  */

  const productoId =
    identidad.producto_id ||
    lote?.producto_id ||
    null

  const modeloId =
    identidad.modelo_id ||
    lote?.modelo_id ||
    null

  /* =========================================================
     3. PRODUCTO Y MODELO
  ========================================================= */

  const [producto, modelo] = await Promise.all([
    buscarPorId('productos', productoId),
    buscarPorId('modelos', modeloId),
  ])

  /* =========================================================
     4. ATRIBUTOS DINÁMICOS
  ========================================================= */

  let atributos: Atributo[] = []

  if (modeloId) {
    const { data, error } = await supabase
      .from('modelo_atributos')
      .select('*')
      .eq('modelo_id', modeloId)
      .order('grupo', { ascending: true })
      .order('nombre', { ascending: true })

    if (error) {
      console.error('Error atributos:', error)
    } else {
      atributos = data || []
    }
  }

  /*
    Esto permite que Vinculab sea multisectorial.

    Ejemplo industrial:
      MATERIALES
      DIMENSIONES
      NORMATIVA

    Ejemplo alimentos:
      INGREDIENTES
      INFORMACIÓN NUTRICIONAL
      FERMENTACIÓN
      CONSERVACIÓN
  */

  const grupos = atributos.reduce<Record<string, Atributo[]>>(
    (acc, atributo) => {
      const grupo =
        atributo.grupo?.trim() ||
        'Especificaciones'

      if (!acc[grupo]) {
        acc[grupo] = []
      }

      acc[grupo].push(atributo)

      return acc
    },
    {}
  )

  /* =========================================================
     5. DATOS NORMALIZADOS
  ========================================================= */

  const empresaNombre =
    empresa?.razon_social ||
    empresa?.nombre ||
    empresa?.name ||
    empresa?.empresa_nombre ||
    'Empresa no identificada'

  const productoNombre =
    producto?.nombre ||
    'Producto no identificado'

  const modeloNombre =
    modelo?.nombre ||
    'Modelo no identificado'

  const descripcion =
    modelo?.descripcion ||
    producto?.descripcion ||
    'Producto registrado en la plataforma de identidad digital VINCULAB.'

  const estado =
    identidad.estado ||
    'activo'

  const activo =
    String(estado).toLowerCase() === 'activo' ||
    String(estado).toLowerCase() === 'active'

  const numeroUnidad =
    identidad.numero_unidad
      ? `Unidad #${identidad.numero_unidad}`
      : 'Unidad individual'

  const qrAsociado = Boolean(
    identidad.codigo_qr
  )

  const nfcAsociado = Boolean(
    identidad.nfc_uid
  )

  const urlPublica =
    identidad.url_dpp ||
    `https://vinculab.cl/dpp/${encodeURIComponent(codigoLimpio)}`

  const qrDataUrl = await QRCode.toDataURL(urlPublica, {
    width: 420,
    margin: 2,
    errorCorrectionLevel: 'H',
    color: { dark: '#071018', light: '#ffffff' },
  })

  return (
    <main className="page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="header">

        <div className="headerInner">

          <div className="brand">

            <div className="logo">
              VINCULA<span>B</span>
            </div>

            <div className="brandSub">
              DIGITAL PRODUCT IDENTITY
            </div>

          </div>

          <div className="passportHeader">

            <div className="passportDot" />

            <span>
              DIGITAL PRODUCT PASSPORT
            </span>

          </div>

        </div>

      </header>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="heroWrapper">

        <div className="hero">

          <div className="heroContent">

            <div className="registered">
              <span className="registeredIcon">
                ✓
              </span>

              IDENTIDAD DIGITAL REGISTRADA
            </div>

            <div className="heroEyebrow">
              PASAPORTE DIGITAL DE PRODUCTO
            </div>

            <h1>
              {productoNombre}
            </h1>

            <div className="modelName">
              {modeloNombre}
            </div>

            <p className="description">
              {descripcion}
            </p>

            <div className="heroIdentity">

              <div>
                <span>
                  IDENTIDAD ÚNICA
                </span>

                <strong>
                  {codigoLimpio}
                </strong>
              </div>

              <div className="unitBadge">
                {numeroUnidad}
              </div>

            </div>

          </div>

          {/* ESTADO */}

          <div className="statusCard">

            <div
              className={
                activo
                  ? 'statusCircle statusCircleActive'
                  : 'statusCircle statusCircleInactive'
              }
            >
              {activo ? '✓' : '!'}
            </div>

            <span className="statusLabel">
              ESTADO DEL REGISTRO
            </span>

            <strong
              className={
                activo
                  ? 'statusActive'
                  : 'statusInactive'
              }
            >
              {String(estado).toUpperCase()}
            </strong>

            <div className="statusDivider" />

            <small>
              Registro digital VINCULAB
            </small>

            <small>
              Identidad: {codigoLimpio}
            </small>

          </div>

        </div>

      </section>

      {/* =====================================================
          CONTENIDO PRINCIPAL
      ===================================================== */}

      <section className="container">

        {/* PASSPORT BANNER */}

        <div className="passportBanner">

          <div className="passportBannerIdentity">

            <span>
              PASAPORTE DIGITAL
            </span>

            <strong>
              {codigoLimpio}
            </strong>

            <small>
              Identificador público único
            </small>

          </div>

          <div className="passportBannerRight">

            <span>
              REGISTRO
            </span>

            <strong>
              VINCULAB
            </strong>

            <small>
              Digital Product Identity
            </small>

          </div>

        </div>

        {/* ===================================================
            IDENTIDAD DEL PRODUCTO
        =================================================== */}

        <SectionHeader
          eyebrow="IDENTIFICACIÓN"
          title="Identidad del producto"
          description="Información principal asociada a esta unidad física."
        />

        <div className="identityGrid">

          <InfoCard
            number="01"
            label="Producto"
            value={productoNombre}
          />

          <InfoCard
            number="02"
            label="Modelo"
            value={modeloNombre}
          />

          <InfoCard
            number="03"
            label="Empresa"
            value={empresaNombre}
          />

          <InfoCard
            number="04"
            label="Unidad"
            value={numeroUnidad}
          />

        </div>

        {/* ===================================================
            TRAZABILIDAD DE PRODUCCIÓN
        =================================================== */}

        <SectionHeader
          eyebrow="ORIGEN"
          title="Trazabilidad de producción"
          description="Información del lote al que pertenece esta unidad."
        />

        <div className="traceLayout">

          <div className="traceCard">

            <TraceRow
              label="Código de lote"
              value={lote?.codigo}
              highlight
            />

            <TraceRow
              label="Cantidad del lote"
              value={lote?.cantidad}
            />

            <TraceRow
              label="Fecha de producción"
              value={fecha(lote?.fecha_produccion)}
            />

            <TraceRow
              label="Fecha de vencimiento"
              value={fecha(lote?.fecha_vencimiento)}
            />

            <TraceRow
              label="Ubicación"
              value={lote?.ubicacion}
            />

            <TraceRow
              label="Estado del lote"
              value={lote?.estado}
            />

          </div>

          <div className="traceSummary">

            <div className="traceSummaryIcon">
              ↗
            </div>

            <span>
              CADENA DE IDENTIDAD
            </span>

            <div className="chain">

              <ChainItem
                number="1"
                label="Empresa"
                value={empresaNombre}
              />

              <ChainItem
                number="2"
                label="Producto"
                value={productoNombre}
              />

              <ChainItem
                number="3"
                label="Modelo"
                value={modeloNombre}
              />

              <ChainItem
                number="4"
                label="Lote"
                value={lote?.codigo || 'No informado'}
              />

              <ChainItem
                number="5"
                label="Unidad"
                value={numeroUnidad}
                last
              />

            </div>

          </div>

        </div>

        {/* ===================================================
            ATRIBUTOS DINÁMICOS
        =================================================== */}

        {Object.keys(grupos).length > 0 && (
          <>

            <SectionHeader
              eyebrow="DATOS DEL PRODUCTO"
              title="Información técnica"
              description="Características y atributos definidos para este modelo."
            />

            <div className="attributesGrid">

              {Object.entries(grupos).map(
                ([grupo, items]) => (

                  <div
                    className="attributeCard"
                    key={grupo}
                  >

                    <div className="attributeHeader">

                      <span className="attributeDot" />

                      <h2>
                        {grupo.toUpperCase()}
                      </h2>

                    </div>

                    <div className="attributeContent">

                      {items.map(
                        (item, index) => (

                          <div
                            className="attributeRow"
                            key={
                              item.id ||
                              `${grupo}-${item.nombre}-${index}`
                            }
                          >

                            <span>
                              {texto(item.nombre)}
                            </span>

                            <strong>
                              {texto(item.valor)}

                              {item.unidad
                                ? ` ${item.unidad}`
                                : ''}
                            </strong>

                          </div>

                        )
                      )}

                    </div>

                  </div>

                )
              )}

            </div>

          </>
        )}

        {/* ===================================================
            IDENTIDAD DIGITAL
        =================================================== */}

        <SectionHeader
          eyebrow="IDENTIDAD DIGITAL"
          title="Tecnologías de identificación"
          description="Mecanismos digitales asociados a esta unidad."
        />

        <div className="digitalLayout">

          <div className="digitalCard">

            <DigitalItem
              icon="ID"
              label="Código público"
              value={codigoLimpio}
              active
            />

            <DigitalItem
              icon="QR"
              label="Código QR"
              value={
                qrAsociado
                  ? 'Asociado'
                  : 'No asociado'
              }
              active={qrAsociado}
            />

            <DigitalItem
              icon="N"
              label="NFC"
              value={
                nfcAsociado
                  ? 'Asociado'
                  : 'No asociado'
              }
              active={nfcAsociado}
            />

          </div>

          <div className="digitalPassport">

            <div className="digitalPassportTop">

              <div className="miniLogo">
                V<span>B</span>
              </div>

              <div className="digitalPassportTitle">

                <span>
                  DIGITAL PRODUCT PASSPORT
                </span>

                <strong>
                  {codigoLimpio}
                </strong>

              </div>

            </div>

            <div className="digitalPassportProduct">
              {productoNombre}
            </div>

            <div className="digitalPassportModel">
              {modeloNombre}
            </div>

            <div className="digitalPassportFooter">

              <span>
                {numeroUnidad}
              </span>

              <span className="registeredMini">
                ● REGISTRADO
              </span>

            </div>

          </div>

        </div>

        <div className="publicUrl">

          <div className="publicUrlIcon">
            ↗
          </div>

          <div>

            <span>
              DIRECCIÓN PÚBLICA DEL PASAPORTE
            </span>

            <strong>
              {urlPublica}
            </strong>

          </div>

        </div>

        <div className="qrPanel">
          <div className="qrFrame">
            <img src={qrDataUrl} alt={`Código QR del pasaporte digital ${codigoLimpio}`} className="qrImage" />
          </div>
          <div className="qrContent">
            <span className="qrEyebrow">ACCESO AL PASAPORTE DIGITAL</span>
            <h2>Escanea para verificar esta unidad</h2>
            <p>Este QR abre directamente el Pasaporte Digital de Producto de esta unidad física registrada en VINCULAB.</p>
            <div className="qrMeta">
              <div><span>IDENTIDAD</span><strong>{codigoLimpio}</strong></div>
              <div><span>UNIDAD</span><strong>{numeroUnidad}</strong></div>
              <div><span>ESTADO</span><strong className={activo ? 'qrStatusActive' : 'qrStatusInactive'}>{String(estado).toUpperCase()}</strong></div>
            </div>
            <a href={urlPublica} className="qrOpenButton" target="_blank" rel="noreferrer">Abrir pasaporte digital ↗</a>
          </div>
        </div>

        {/* ===================================================
            HISTORIAL DE TRAZABILIDAD
        =================================================== */}

        <section className="section traceHistorySection">
          <div className="sectionTop">
            <div>
              <div className="sectionEyebrow">CICLO DE VIDA</div>
              <h2>Historial de trazabilidad</h2>
            </div>
            <div className="sectionMeta">
              {eventosTrazabilidad.length > 0
                ? `${eventosTrazabilidad.length} evento${eventosTrazabilidad.length === 1 ? '' : 's'} registrado${eventosTrazabilidad.length === 1 ? '' : 's'}`
                : 'Sin eventos adicionales'}
            </div>
          </div>

          {eventosTrazabilidad.length === 0 ? (
            <div className="traceEmpty">
              <div className="traceEmptyIcon">◎</div>
              <div>
                <strong>Esta unidad aún no registra eventos adicionales en su ciclo de vida.</strong>
                <p>Cuando se registren controles, despachos, instalaciones, mantenimientos, reparaciones u otros hitos, aparecerán aquí automáticamente.</p>
              </div>
            </div>
          ) : (
            <div className="traceTimeline">
              {eventosTrazabilidad.map((evento: any, index: number) => {
                const tituloEvento = evento.titulo || evento.tipo_evento || 'Evento de trazabilidad'
                const fechaEvento = evento.fecha_evento || evento.created_at
                return (
                  <div className="traceEvent" key={evento.id || `${tituloEvento}-${index}`}>
                    <div className="traceRail">
                      <div className="traceDot">{String(index + 1).padStart(2, '0')}</div>
                      {index < eventosTrazabilidad.length - 1 && <div className="traceLine" />}
                    </div>

                    <div className="traceCard">
                      <div className="traceCardTop">
                        <div>
                          <span className="traceType">{evento.tipo_evento || 'TRAZABILIDAD'}</span>
                          <h3>{tituloEvento}</h3>
                        </div>
                        <time>{formatEventDate(fechaEvento)}</time>
                      </div>

                      {evento.descripcion && <p className="traceDescription">{evento.descripcion}</p>}

                      <div className="traceDetails">
                        {evento.responsable && (
                          <div><span>RESPONSABLE</span><strong>{evento.responsable}</strong></div>
                        )}
                        {evento.ubicacion && (
                          <div><span>UBICACIÓN</span><strong>{evento.ubicacion}</strong></div>
                        )}
                        <div><span>REGISTRO</span><strong>VINCULAB</strong></div>
                      </div>

                      {evento.archivo_url && (
                        <a
                          href={evento.archivo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="traceFile"
                        >
                          <span>▣</span>
                          <div>
                            <small>EVIDENCIA / DOCUMENTO</small>
                            <strong>{evento.archivo_nombre || 'Ver archivo adjunto'}</strong>
                            {evento.archivo_tipo && <em>{evento.archivo_tipo}</em>}
                          </div>
                          <b>↗</b>
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* ===================================================
            RESPONSABLE
        =================================================== */}

        <SectionHeader
          eyebrow="ORGANIZACIÓN"
          title="Responsable del producto"
          description="Organización asociada al registro de esta identidad."
        />

        <div className="companyCard">

          <div className="companyIdentity">

            <div className="companyIcon">
              {empresaNombre
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>

              <span className="companyLabel">
                EMPRESA RESPONSABLE
              </span>

              <h2>
                {empresaNombre}
              </h2>

              <p>
                {empresa?.sector || 'Sector no informado'}

                {empresa?.pais
                  ? ` · ${empresa.pais}`
                  : ''}
              </p>

            </div>

          </div>

          <div className="companyData">

            {empresa?.rut && (
              <div>
                <span>RUT</span>
                <strong>
                  {empresa.rut}
                </strong>
              </div>
            )}

            {empresa?.pais && (
              <div>
                <span>PAÍS</span>
                <strong>
                  {empresa.pais}
                </strong>
              </div>
            )}

            {empresa?.sector && (
              <div>
                <span>SECTOR</span>
                <strong>
                  {empresa.sector}
                </strong>
              </div>
            )}

          </div>

        </div>

        {/* ===================================================
            REGISTRO FINAL
        =================================================== */}

        <div className="verification">

          <div className="verificationIcon">
            ✓
          </div>

          <div className="verificationContent">

            <span>
              REGISTRO DIGITAL
            </span>

            <strong>
              Identidad digital registrada en VINCULAB
            </strong>

            <p>
              Esta unidad física posee una identidad digital
              única asociada a su producto, modelo, empresa y
              lote de origen.
            </p>

          </div>

          <div className="verificationCode">

            <span>
              IDENTIDAD
            </span>

            <strong>
              {codigoLimpio}
            </strong>

          </div>

        </div>

      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer>

        <div className="footerInner">

          <div>

            <div className="footerLogo">
              VINCULA<span>B</span>
            </div>

            <p>
              Plataforma de Identidad Digital de Productos
            </p>

          </div>

          <div className="footerRight">

            <span>
              DIGITAL PRODUCT PASSPORT
            </span>

            <small>
              Trazabilidad · QR · NFC · Identidad Digital
            </small>

          </div>

        </div>

      </footer>

      {/* =====================================================
          CSS
      ===================================================== */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        html {
          background: #070a0e;
        }

        body {
          margin: 0;
          background: #070a0e;
        }

        .page {
          min-height: 100vh;

          background:
            radial-gradient(
              circle at 80% 0%,
              rgba(255, 102, 0, .08),
              transparent 26%
            ),
            radial-gradient(
              circle at 10% 30%,
              rgba(25, 55, 80, .10),
              transparent 30%
            ),
            #080b0f;

          color: #f5f7fa;

          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }

        /* ==============================================
           HEADER
        ============================================== */

        .header {
          min-height: 82px;

          display: flex;
          align-items: center;

          border-bottom: 1px solid #1e2933;

          background: rgba(10, 15, 21, .96);
        }

        .headerInner {
          width: min(1500px, 92vw);

          margin: 0 auto;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 30px;
        }

        .logo,
        .footerLogo {
          font-size: 25px;
          font-weight: 900;

          letter-spacing: -1px;
        }

        .logo span,
        .footerLogo span,
        .miniLogo span {
          color: #ff6600;
        }

        .brandSub {
          margin-top: 5px;

          color: #607a91;

          font-size: 8px;
          font-weight: 700;

          letter-spacing: 2.2px;
        }

        .passportHeader {
          display: flex;
          align-items: center;

          gap: 10px;

          color: #8298ab;

          font-size: 10px;
          font-weight: 800;

          letter-spacing: 2px;
        }

        .passportDot {
          width: 7px;
          height: 7px;

          border-radius: 50%;

          background: #ff6600;

          box-shadow:
            0 0 15px rgba(255, 102, 0, .8);
        }

        /* ==============================================
           HERO
        ============================================== */

        .heroWrapper {
          border-bottom: 1px solid #1d2832;
        }

        .hero {
          width: min(1500px, 92vw);

          margin: 0 auto;

          padding: 75px 0;

          display: grid;

          grid-template-columns:
            minmax(0, 1fr)
            310px;

          gap: 70px;

          align-items: center;
        }

        .registered {
          display: inline-flex;
          align-items: center;

          gap: 8px;

          padding: 8px 13px;

          border: 1px solid #14563f;
          border-radius: 20px;

          background: #082c20;

          color: #32e697;

          font-size: 10px;
          font-weight: 900;

          letter-spacing: 1.2px;
        }

        .registeredIcon {
          width: 18px;
          height: 18px;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background: #0c543a;

          font-size: 10px;
        }

        .heroEyebrow {
          margin-top: 30px;

          color: #667e93;

          font-size: 9px;
          font-weight: 900;

          letter-spacing: 2.4px;
        }

        h1 {
          max-width: 1000px;

          margin:
            14px 0
            7px;

          font-size: clamp(
            46px,
            5.3vw,
            82px
          );

          line-height: .98;

          letter-spacing: -3px;
        }

        .modelName {
          color: #ff6a00;

          font-size: 23px;
          font-weight: 800;

          letter-spacing: -.4px;
        }

        .description {
          max-width: 800px;

          margin:
            25px 0
            0;

          color: #899daf;

          font-size: 15px;

          line-height: 1.75;
        }

        .heroIdentity {
          max-width: 800px;

          margin-top: 35px;

          display: flex;
          align-items: flex-end;
          justify-content: space-between;

          gap: 25px;

          padding-top: 25px;

          border-top: 1px solid #202c36;
        }

        .heroIdentity > div:first-child {
          display: flex;
          flex-direction: column;

          gap: 8px;
        }

        .heroIdentity span {
          color: #5d758a;

          font-size: 9px;
          font-weight: 900;

          letter-spacing: 2px;
        }

        .heroIdentity strong {
          font-size: 20px;

          letter-spacing: 2px;
        }

        .unitBadge {
          padding: 8px 13px;

          border: 1px solid #303d48;
          border-radius: 7px;

          background: #111820;

          color: #9bb0c2;

          font-size: 11px;
          font-weight: 800;
        }

        /* ==============================================
           STATUS
        ============================================== */

        .statusCard {
          min-height: 300px;

          padding: 30px;

          display: flex;
          flex-direction: column;

          align-items: center;
          justify-content: center;

          text-align: center;

          border: 1px solid #25323d;
          border-radius: 18px;

          background:
            linear-gradient(
              145deg,
              #121a22,
              #0c1218
            );

          box-shadow:
            0 25px 80px rgba(0, 0, 0, .22);
        }

        .statusCircle {
          width: 64px;
          height: 64px;

          display: flex;
          align-items: center;
          justify-content: center;

          margin-bottom: 22px;

          border-radius: 50%;

          font-size: 28px;
          font-weight: 900;
        }

        .statusCircleActive {
          border: 1px solid #146044;

          background: #073a29;

          color: #2ae590;

          box-shadow:
            0 0 35px rgba(42, 229, 144, .10);
        }

        .statusCircleInactive {
          border: 1px solid #6a431e;

          background: #35210e;

          color: #ff9a43;
        }

        .statusLabel {
          color: #657d92;

          font-size: 9px;
          font-weight: 900;

          letter-spacing: 2px;
        }

        .statusCard > strong {
          margin:
            10px 0
            15px;

          font-size: 18px;
        }

        .statusActive {
          color: #2ae590;
        }

        .statusInactive {
          color: #ff9a43;
        }

        .statusDivider {
          width: 50px;
          height: 1px;

          margin-bottom: 15px;

          background: #2b3741;
        }

        .statusCard small {
          margin-top: 5px;

          color: #61778a;

          font-size: 10px;
        }

        /* ==============================================
           CONTAINER
        ============================================== */

        .container {
          width: min(1500px, 92vw);

          margin: 0 auto;

          padding:
            60px 0
            100px;
        }

        /* ==============================================
           PASSPORT BANNER
        ============================================== */

        .passportBanner {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 40px;

          margin-bottom: 70px;

          padding: 25px 28px;

          border: 1px solid #293640;
          border-left: 4px solid #ff6600;

          border-radius: 12px;

          background:
            linear-gradient(
              90deg,
              #111922,
              #0c1218
            );
        }

        .passportBannerIdentity,
        .passportBannerRight {
          display: flex;
          flex-direction: column;

          gap: 6px;
        }

        .passportBanner span {
          color: #668097;

          font-size: 9px;
          font-weight: 900;

          letter-spacing: 2px;
        }

        .passportBanner strong {
          color: #fff;

          font-size: 17px;

          letter-spacing: 1px;
        }

        .passportBanner small {
          color: #506779;

          font-size: 10px;
        }

        .passportBannerRight {
          text-align: right;
        }

        .passportBannerRight strong {
          color: #ff6600;
        }

        /* ==============================================
           SECTION HEADER
        ============================================== */

        .sectionHeader {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;

          gap: 30px;

          margin:
            70px 0
            20px;
        }

        .sectionHeader:first-of-type {
          margin-top: 0;
        }

        .sectionEyebrow {
          display: block;

          margin-bottom: 8px;

          color: #ff6600;

          font-size: 9px;
          font-weight: 900;

          letter-spacing: 2px;
        }

        .sectionHeader h2 {
          margin: 0;

          font-size: 25px;

          letter-spacing: -.5px;
        }

        .sectionHeader p {
          max-width: 500px;

          margin: 0;

          color: #687f93;

          font-size: 11px;

          line-height: 1.6;

          text-align: right;
        }

        /* ==============================================
           IDENTITY CARDS
        ============================================== */

        .identityGrid {
          display: grid;

          grid-template-columns:
            repeat(4, 1fr);

          gap: 15px;
        }

        .infoCard {
          min-height: 145px;

          position: relative;

          padding: 24px;

          overflow: hidden;

          border: 1px solid #25323d;
          border-radius: 12px;

          background:
            linear-gradient(
              145deg,
              #111922,
              #0d141b
            );
        }

        .infoNumber {
          position: absolute;

          right: 17px;
          top: 14px;

          color: #263642;

          font-size: 30px;
          font-weight: 900;
        }

        .infoCard span:not(.infoNumber) {
          display: block;

          margin-bottom: 16px;

          color: #688298;

          font-size: 9px;
          font-weight: 900;

          letter-spacing: 1.5px;
        }

        .infoCard strong {
          position: relative;

          z-index: 2;

          display: block;

          max-width: 90%;

          font-size: 18px;

          line-height: 1.35;
        }

        /* ==============================================
           TRACE
        ============================================== */

        .traceLayout {
          display: grid;

          grid-template-columns:
            minmax(0, 1.5fr)
            minmax(300px, .7fr);

          gap: 18px;
        }

        .traceCard,
        .traceSummary,
        .attributeCard,
        .digitalCard,
        .digitalPassport,
        .companyCard {
          border: 1px solid #25323d;
          border-radius: 12px;

          background: #10171f;
        }

        .traceCard {
          overflow: hidden;
        }

        .traceRow {
          min-height: 57px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 30px;

          padding: 16px 22px;

          border-bottom: 1px solid #202b34;
        }

        .traceRow:last-child {
          border-bottom: none;
        }

        .traceRow span {
          color: #72899d;

          font-size: 12px;
        }

        .traceRow strong {
          text-align: right;

          font-size: 13px;
        }

        .traceHighlight {
          color: #ff7519;
        }

        /* CHAIN */

        .traceSummary {
          padding: 23px;
        }

        .traceSummaryIcon {
          width: 36px;
          height: 36px;

          display: flex;
          align-items: center;
          justify-content: center;

          margin-bottom: 18px;

          border-radius: 8px;

          background: rgba(255, 102, 0, .10);

          color: #ff6600;

          font-size: 18px;
        }

        .traceSummary > span {
          color: #70889d;

          font-size: 9px;
          font-weight: 900;

          letter-spacing: 1.7px;
        }

        .chain {
          margin-top: 23px;
        }

        .chainItem {
          position: relative;

          display: grid;

          grid-template-columns:
            28px 1fr;

          gap: 12px;

          padding-bottom: 18px;
        }

        .chainLine {
          position: absolute;

          left: 13px;
          top: 27px;

          width: 1px;
          height: calc(100% - 10px);

          background: #2a3945;
        }

        .chainNumber {
          width: 27px;
          height: 27px;

          position: relative;

          z-index: 2;

          display: flex;
          align-items: center;
          justify-content: center;

          border: 1px solid #344653;
          border-radius: 50%;

          background: #121c24;

          color: #ff7417;

          font-size: 9px;
          font-weight: 900;
        }

        .chainText {
          display: flex;
          flex-direction: column;

          gap: 3px;
        }

        .chainText span {
          color: #5e778b;

          font-size: 8px;
          font-weight: 800;

          letter-spacing: 1px;
        }

        .chainText strong {
          color: #dce4eb;

          font-size: 11px;
        }

        /* ==============================================
           ATTRIBUTES
        ============================================== */

        .attributesGrid {
          display: grid;

          grid-template-columns:
            repeat(2, 1fr);

          gap: 18px;
        }

        .attributeCard {
          overflow: hidden;
        }

        .attributeHeader {
          display: flex;
          align-items: center;

          gap: 10px;

          padding: 18px 20px;

          border-bottom: 1px solid #26323c;
        }

        .attributeDot {
          width: 7px;
          height: 7px;

          flex-shrink: 0;

          border-radius: 50%;

          background: #ff6600;
        }

        .attributeHeader h2 {
          margin: 0;

          color: #ff7417;

          font-size: 10px;

          letter-spacing: 1.6px;
        }

        .attributeRow {
          display: flex;
          justify-content: space-between;

          gap: 25px;

          padding: 15px 20px;

          border-bottom: 1px solid #202a33;
        }

        .attributeRow:last-child {
          border-bottom: none;
        }

        .attributeRow span {
          color: #8095a8;

          font-size: 12px;
        }

        .attributeRow strong {
          text-align: right;

          font-size: 12px;
        }

        /* ==============================================
           DIGITAL IDENTITY
        ============================================== */

        .digitalLayout {
          display: grid;

          grid-template-columns:
            minmax(0, 1.4fr)
            minmax(330px, .6fr);

          gap: 18px;
        }

        .digitalCard {
          display: grid;

          grid-template-columns:
            repeat(3, 1fr);

          overflow: hidden;
        }

        .digitalItem {
          min-height: 170px;

          padding: 25px;

          display: flex;
          flex-direction: column;

          justify-content: space-between;

          border-right: 1px solid #26323c;
        }

        .digitalItem:last-child {
          border-right: none;
        }

        .digitalIcon {
          width: 40px;
          height: 40px;

          display: flex;
          align-items: center;
          justify-content: center;

          border: 1px solid #31414e;
          border-radius: 9px;

          background: #121c24;

          color: #738da3;

          font-size: 10px;
          font-weight: 900;
        }

        .digitalIconActive {
          border-color: rgba(255, 102, 0, .35);

          background: rgba(255, 102, 0, .08);

          color: #ff7317;
        }

        .digitalItemText {
          display: flex;
          flex-direction: column;

          gap: 7px;
        }

        .digitalItemText span {
          color: #68849a;

          font-size: 9px;
          font-weight: 900;

          letter-spacing: 1.4px;
        }

        .digitalItemText strong {
          font-size: 13px;

          word-break: break-word;
        }

        .digitalPassport {
          padding: 24px;

          display: flex;
          flex-direction: column;

          justify-content: space-between;

          background:
            radial-gradient(
              circle at 100% 0%,
              rgba(255, 102, 0, .15),
              transparent 40%
            ),
            #10171f;
        }

        .digitalPassportTop {
          display: flex;
          align-items: center;

          gap: 14px;
        }

        .miniLogo {
          width: 44px;
          height: 44px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border: 1px solid #33434f;
          border-radius: 10px;

          background: #0b1117;

          font-size: 16px;
          font-weight: 900;
        }

        .digitalPassportTitle {
          display: flex;
          flex-direction: column;

          gap: 5px;
        }

        .digitalPassportTitle span {
          color: #617b91;

          font-size: 7px;
          font-weight: 900;

          letter-spacing: 1.2px;
        }

        .digitalPassportTitle strong {
          font-size: 11px;

          letter-spacing: 1px;
        }

        .digitalPassportProduct {
          margin-top: 28px;

          font-size: 19px;
          font-weight: 900;
        }

        .digitalPassportModel {
          margin-top: 5px;

          color: #ff7114;

          font-size: 11px;
          font-weight: 800;
        }

        .digitalPassportFooter {
          margin-top: 30px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 15px;

          padding-top: 15px;

          border-top: 1px solid #2b3741;

          color: #71899d;

          font-size: 9px;
          font-weight: 800;
        }

        .registeredMini {
          color: #28dc8b;
        }

        /* PUBLIC URL */

        .publicUrl {
          display: flex;
          align-items: center;

          gap: 15px;

          margin-top: 15px;

          padding: 18px 20px;

          border: 1px solid #25323d;
          border-radius: 10px;

          background: #0d141b;
        }

        .publicUrlIcon {
          width: 38px;
          height: 38px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 8px;

          background: rgba(255, 102, 0, .09);

          color: #ff6600;
        }

        .publicUrl > div:last-child {
          min-width: 0;

          display: flex;
          flex-direction: column;

          gap: 5px;
        }

        .publicUrl span {
          color: #637d93;

          font-size: 8px;
          font-weight: 900;

          letter-spacing: 1.5px;
        }

        .publicUrl strong {
          overflow-wrap: anywhere;

          font-size: 11px;
        }


        .qrPanel {
          display:grid; grid-template-columns:240px minmax(0,1fr); gap:32px;
          align-items:center; margin-top:18px; padding:28px;
          border:1px solid #25323d; border-radius:12px;
          background:radial-gradient(circle at 0 0,rgba(255,102,0,.10),transparent 34%),#10171f;
        }
        .qrFrame {
          width:210px; height:210px; padding:12px; margin:auto;
          border:1px solid #354552; border-radius:16px; background:#fff;
          box-shadow:0 20px 55px rgba(0,0,0,.28);
        }
        .qrImage { display:block; width:100%; height:100%; object-fit:contain; }
        .qrEyebrow { color:#ff6600; font-size:9px; font-weight:900; letter-spacing:2px; }
        .qrContent h2 { margin:10px 0 12px; font-size:25px; letter-spacing:-.5px; }
        .qrContent p { max-width:760px; margin:0; color:#7f94a6; font-size:12px; line-height:1.7; }
        .qrMeta { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; margin-top:22px; }
        .qrMeta>div { min-width:0; padding:13px 15px; border:1px solid #273540; border-radius:9px; background:#0c1319; }
        .qrMeta span { display:block; margin-bottom:6px; color:#617b90; font-size:8px; font-weight:900; letter-spacing:1.4px; }
        .qrMeta strong { display:block; overflow-wrap:anywhere; font-size:11px; }
        .qrStatusActive { color:#2ae590; }
        .qrStatusInactive { color:#ff9a43; }
        .qrOpenButton {
          display:inline-flex; margin-top:20px; padding:11px 15px;
          border:1px solid rgba(255,102,0,.42); border-radius:8px;
          background:rgba(255,102,0,.08); color:#ff7417;
          font-size:11px; font-weight:900; text-decoration:none;
        }
        .qrOpenButton:hover { background:rgba(255,102,0,.14); }


        /* ==============================================
           TRACEABILITY HISTORY
        ============================================== */

        .traceHistorySection { margin-top:28px; }
        .traceTimeline { margin-top:18px; }
        .traceEvent { display:grid; grid-template-columns:52px minmax(0,1fr); gap:15px; }
        .traceRail { position:relative; display:flex; flex-direction:column; align-items:center; }
        .traceDot {
          position:relative; z-index:2; width:36px; height:36px;
          display:flex; align-items:center; justify-content:center;
          border:1px solid rgba(255,102,0,.55); border-radius:50%;
          background:#121a21; color:#ff6600; font-size:9px; font-weight:950;
          box-shadow:0 0 0 5px #080d12;
        }
        .traceLine { width:1px; flex:1; min-height:40px; background:linear-gradient(#ff6600,#283641); }
        .traceCard {
          margin-bottom:18px; padding:20px 22px; border:1px solid #273540;
          border-radius:10px; background:#10171f;
        }
        .traceCardTop { display:flex; justify-content:space-between; gap:20px; align-items:flex-start; }
        .traceType { color:#ff6600; font-size:8px; font-weight:950; letter-spacing:1.5px; text-transform:uppercase; }
        .traceCard h3 { margin:6px 0 0; font-size:16px; }
        .traceCard time { color:#6f879a; font-size:9px; white-space:nowrap; }
        .traceDescription { margin:14px 0 0; color:#8da0af; font-size:11px; line-height:1.65; }
        .traceDetails { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:8px; margin-top:16px; }
        .traceDetails>div { padding:11px 12px; border:1px solid #25323c; border-radius:7px; background:#0b1218; }
        .traceDetails span { display:block; margin-bottom:5px; color:#5f778b; font-size:7px; font-weight:900; letter-spacing:1.1px; }
        .traceDetails strong { font-size:9px; overflow-wrap:anywhere; }
        .traceFile {
          display:flex; align-items:center; gap:12px; margin-top:14px; padding:12px 14px;
          border:1px solid rgba(255,102,0,.25); border-radius:8px;
          background:rgba(255,102,0,.05); color:#fff; text-decoration:none;
        }
        .traceFile>span { color:#ff6600; font-size:18px; }
        .traceFile div { min-width:0; flex:1; }
        .traceFile small { display:block; color:#6d8294; font-size:7px; font-weight:900; letter-spacing:1px; }
        .traceFile strong { display:block; margin-top:3px; font-size:10px; overflow-wrap:anywhere; }
        .traceFile em { display:block; margin-top:3px; color:#687f91; font-size:8px; font-style:normal; }
        .traceFile>b { color:#ff6600; }
        .traceEmpty {
          display:flex; gap:15px; align-items:center; margin-top:18px; padding:20px;
          border:1px dashed #2b3a45; border-radius:10px; background:#0c1319;
        }
        .traceEmptyIcon {
          width:40px; height:40px; flex:0 0 40px; display:flex; align-items:center; justify-content:center;
          border-radius:50%; background:rgba(255,102,0,.09); color:#ff6600; font-size:20px;
        }
        .traceEmpty strong { font-size:11px; }
        .traceEmpty p { margin:5px 0 0; color:#71889a; font-size:9px; line-height:1.5; }

        /* ==============================================
           COMPANY
        ============================================== */

        .companyCard {
          padding: 28px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 40px;
        }

        .companyIdentity {
          display: flex;
          align-items: center;

          gap: 20px;
        }

        .companyIcon {
          width: 64px;
          height: 64px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 13px;

          background:
            linear-gradient(
              145deg,
              #ff7417,
              #e95700
            );

          color: white;

          font-size: 25px;
          font-weight: 900;

          box-shadow:
            0 10px 35px rgba(255, 102, 0, .15);
        }

        .companyLabel {
          color: #687f93;

          font-size: 8px;
          font-weight: 900;

          letter-spacing: 1.5px;
        }

        .companyIdentity h2 {
          margin:
            5px 0
            5px;

          font-size: 22px;
        }

        .companyIdentity p {
          margin: 0;

          color: #8096a8;

          font-size: 11px;
        }

        .companyData {
          display: flex;

          gap: 35px;
        }

        .companyData > div {
          display: flex;
          flex-direction: column;

          gap: 6px;
        }

        .companyData span {
          color: #60798e;

          font-size: 8px;
          font-weight: 900;

          letter-spacing: 1.4px;
        }

        .companyData strong {
          font-size: 11px;
        }

        /* ==============================================
           VERIFICATION
        ============================================== */

        .verification {
          display: grid;

          grid-template-columns:
            auto
            minmax(0, 1fr)
            auto;

          align-items: center;

          gap: 20px;

          margin-top: 70px;

          padding: 27px 30px;

          border: 1px solid #14523d;
          border-radius: 13px;

          background:
            linear-gradient(
              90deg,
              #08251c,
              #0a1d18
            );
        }

        .verificationIcon {
          width: 48px;
          height: 48px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background: #0c5239;

          color: #29e893;

          font-size: 21px;
          font-weight: 900;
        }

        .verificationContent {
          display: flex;
          flex-direction: column;

          gap: 5px;
        }

        .verificationContent span,
        .verificationCode span {
          color: #5c9c80;

          font-size: 8px;
          font-weight: 900;

          letter-spacing: 1.6px;
        }

        .verificationContent strong {
          color: #31e996;

          font-size: 14px;
        }

        .verificationContent p {
          margin: 0;

          color: #79a795;

          font-size: 11px;

          line-height: 1.5;
        }

        .verificationCode {
          display: flex;
          flex-direction: column;

          gap: 6px;

          text-align: right;
        }

        .verificationCode strong {
          font-size: 12px;

          letter-spacing: 1px;
        }

        /* ==============================================
           FOOTER
        ============================================== */

        footer {
          padding:
            45px 0;

          border-top: 1px solid #1e2933;

          background: #070b0f;
        }

        .footerInner {
          width: min(1500px, 92vw);

          margin: 0 auto;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 30px;
        }

        footer p {
          margin:
            7px 0
            0;

          color: #657d91;

          font-size: 10px;
        }

        .footerRight {
          display: flex;
          flex-direction: column;

          gap: 6px;

          text-align: right;
        }

        .footerRight span {
          color: #71889c;

          font-size: 9px;
          font-weight: 900;

          letter-spacing: 1.6px;
        }

        .footerRight small {
          color: #485e70;

          font-size: 9px;
        }

        /* ==============================================
           TABLET
        ============================================== */

        @media (max-width: 1000px) {

          .hero {
            grid-template-columns: 1fr;

            gap: 35px;

            padding:
              55px 0;
          }

          .statusCard {
            min-height: 200px;
          }

          .identityGrid {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .traceLayout,
          .digitalLayout {
            grid-template-columns: 1fr;
          }

          .attributesGrid {
            grid-template-columns: 1fr;
          }

          .companyCard {
            align-items: flex-start;

            flex-direction: column;
          }

        }

        /* ==============================================
           MOBILE
        ============================================== */

        @media (max-width: 650px) {

          .header {
            min-height: auto;
          }

          .headerInner {
            padding:
              18px 0;

            flex-direction: column;
            align-items: flex-start;

            gap: 13px;
          }

          .passportHeader {
            font-size: 8px;
          }

          .hero {
            width: 90vw;

            padding:
              42px 0;
          }

          h1 {
            font-size: 43px;

            letter-spacing: -2px;
          }

          .modelName {
            font-size: 18px;
          }

          .description {
            font-size: 13px;
          }

          .heroIdentity {
            align-items: flex-start;

            flex-direction: column;
          }

          .container {
            width: 90vw;

            padding:
              40px 0
              70px;
          }

          .passportBanner {
            align-items: flex-start;

            flex-direction: column;

            margin-bottom: 50px;
          }

          .passportBannerRight {
            text-align: left;
          }

          .sectionHeader {
            align-items: flex-start;

            flex-direction: column;

            gap: 8px;

            margin-top: 55px;
          }

          .sectionHeader p {
            text-align: left;
          }

          .identityGrid {
            grid-template-columns: 1fr;
          }

          .traceRow {
            align-items: flex-start;

            flex-direction: column;

            gap: 7px;
          }

          .traceRow strong {
            text-align: left;
          }

          .digitalCard {
            grid-template-columns: 1fr;
          }

          .digitalItem {
            min-height: 120px;

            border-right: none;
            border-bottom: 1px solid #26323c;
          }

          .digitalItem:last-child {
            border-bottom: none;
          }

          .companyData {
            flex-direction: column;

            gap: 18px;
          }

          .verification {
            grid-template-columns:
              auto
              1fr;
          }

          .verificationCode {
            grid-column:
              1 / -1;

            padding-top: 15px;

            border-top: 1px solid #16513e;

            text-align: left;
          }

          .footerInner {
            align-items: flex-start;

            flex-direction: column;
          }

          .footerRight {
            text-align: left;
          }

        }


        @media (max-width: 1000px) {
          .qrPanel { grid-template-columns: 210px minmax(0,1fr); }
          .qrFrame { width:185px; height:185px; }
        }
        @media (max-width: 650px) {
          .traceEvent { grid-template-columns:38px minmax(0,1fr); gap:8px; }
          .traceDot { width:30px; height:30px; }
          .traceCard { padding:16px; }
          .traceCardTop { flex-direction:column; gap:8px; }
          .traceDetails { grid-template-columns:1fr; }
          .qrPanel { grid-template-columns:1fr; padding:22px; }
          .qrFrame { width:min(240px,72vw); height:min(240px,72vw); }
          .qrContent { text-align:center; }
          .qrMeta { grid-template-columns:1fr; text-align:left; }
          .qrOpenButton { width:100%; justify-content:center; }
        }

      `}</style>

    </main>
  )
}

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className="sectionHeader">

      <div>

        <span className="sectionEyebrow">
          {eyebrow}
        </span>

        <h2>
          {title}
        </h2>

      </div>

      <p>
        {description}
      </p>

    </div>
  )
}

/* =========================================================
   INFO CARD
========================================================= */

function InfoCard({
  number,
  label,
  value,
}: {
  number: string
  label: string
  value: any
}) {
  return (
    <div className="infoCard">

      <span className="infoNumber">
        {number}
      </span>

      <span>
        {label.toUpperCase()}
      </span>

      <strong>
        {texto(value)}
      </strong>

    </div>
  )
}

/* =========================================================
   TRACE ROW
========================================================= */

function TraceRow({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: any
  highlight?: boolean
}) {
  return (
    <div className="traceRow">

      <span>
        {label}
      </span>

      <strong
        className={
          highlight
            ? 'traceHighlight'
            : ''
        }
      >
        {texto(value)}
      </strong>

    </div>
  )
}

/* =========================================================
   CHAIN ITEM
========================================================= */

function ChainItem({
  number,
  label,
  value,
  last = false,
}: {
  number: string
  label: string
  value: string
  last?: boolean
}) {
  return (
    <div className="chainItem">

      {!last && (
        <div className="chainLine" />
      )}

      <div className="chainNumber">
        {number}
      </div>

      <div className="chainText">

        <span>
          {label.toUpperCase()}
        </span>

        <strong>
          {value}
        </strong>

      </div>

    </div>
  )
}

/* =========================================================
   DIGITAL ITEM
========================================================= */

function DigitalItem({
  icon,
  label,
  value,
  active,
}: {
  icon: string
  label: string
  value: string
  active: boolean
}) {
  return (
    <div className="digitalItem">

      <div
        className={
          active
            ? 'digitalIcon digitalIconActive'
            : 'digitalIcon'
        }
      >
        {icon}
      </div>

      <div className="digitalItemText">

        <span>
          {label.toUpperCase()}
        </span>

        <strong>
          {active && label !== 'Código público'
            ? `✓ ${value}`
            : value}
        </strong>

      </div>

    </div>
  )
}
