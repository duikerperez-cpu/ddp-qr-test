import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

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

  // ==========================================================
  // 1. IDENTIDAD DIGITAL
  // ==========================================================

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

  // ==========================================================
  // 2. RELACIONES
  // ==========================================================

  const [empresa, lote] = await Promise.all([
    buscarPorId('empresas', identidad.empresa_id),
    buscarPorId('lotes', identidad.lote_id),
  ])

  // Algunos registros antiguos podrían no tener producto_id/modelo_id
  // directamente en productos_individuales.
  const productoId =
    identidad.producto_id ||
    lote?.producto_id ||
    null

  const modeloId =
    identidad.modelo_id ||
    lote?.modelo_id ||
    null

  const [producto, modelo] = await Promise.all([
    buscarPorId('productos', productoId),
    buscarPorId('modelos', modeloId),
  ])

  // ==========================================================
  // 3. ATRIBUTOS DINÁMICOS DEL MODELO
  // ==========================================================

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

  // Agrupar especificaciones dinámicamente.
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

  const estado =
    identidad.estado ||
    'activo'

  const activo =
    String(estado).toLowerCase() === 'activo' ||
    String(estado).toLowerCase() === 'active'

  return (
    <main className="page">

      {/* ======================================================
          CABECERA
      ====================================================== */}

      <header className="header">
        <div className="brand">
          <div className="logo">
            VINCULA<span>B</span>
          </div>

          <div className="brandSub">
            DIGITAL PRODUCT IDENTITY
          </div>
        </div>

        <div className="passport">
          DIGITAL PRODUCT PASSPORT
        </div>
      </header>

      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="hero">

        <div className="heroContent">

          <div className="verified">
            ✓ IDENTIDAD DIGITAL VERIFICADA
          </div>

          <h1>{productoNombre}</h1>

          <div className="modelName">
            {modeloNombre}
          </div>

          <p className="description">
            {modelo?.descripcion ||
              'Producto registrado en la plataforma de identidad digital VINCULAB.'}
          </p>

          <div className="identityCode">
            <span>IDENTIDAD ÚNICA</span>
            <strong>{codigoLimpio}</strong>
          </div>

        </div>

        <div className="statusCard">

          <div className="statusIcon">
            ✓
          </div>

          <span>ESTADO</span>

          <strong className={activo ? 'active' : 'inactive'}>
            {String(estado).toUpperCase()}
          </strong>

          <small>
            Registro digital VINCULAB
          </small>

        </div>

      </section>

      {/* ======================================================
          CONTENIDO
      ====================================================== */}

      <section className="container">

        <div className="sectionTitle">
          IDENTIDAD DEL PRODUCTO
        </div>

        <div className="grid">

          <InfoCard
            label="Producto"
            value={productoNombre}
          />

          <InfoCard
            label="Modelo"
            value={modeloNombre}
          />

          <InfoCard
            label="Empresa"
            value={empresaNombre}
          />

          <InfoCard
            label="Unidad"
            value={
              identidad.numero_unidad
                ? `Unidad #${identidad.numero_unidad}`
                : 'Unidad individual'
            }
          />

        </div>

        {/* ====================================================
            LOTE
        ==================================================== */}

        <div className="sectionTitle">
          TRAZABILIDAD DE PRODUCCIÓN
        </div>

        <div className="traceCard">

          <TraceRow
            label="Código de lote"
            value={lote?.codigo}
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

        {/* ====================================================
            ATRIBUTOS DINÁMICOS
        ==================================================== */}

        {Object.keys(grupos).length > 0 && (
          <>
            <div className="sectionTitle">
              INFORMACIÓN DEL PRODUCTO
            </div>

            <div className="attributesGrid">

              {Object.entries(grupos).map(
                ([grupo, items]) => (

                  <div
                    className="attributeCard"
                    key={grupo}
                  >

                    <h2>
                      {grupo.toUpperCase()}
                    </h2>

                    {items.map((item, index) => (

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

                    ))}

                  </div>

                )
              )}

            </div>
          </>
        )}

        {/* ====================================================
            IDENTIDAD DIGITAL
        ==================================================== */}

        <div className="sectionTitle">
          IDENTIDAD DIGITAL
        </div>

        <div className="digitalCard">

          <div>
            <span>Código público</span>
            <strong>
              {codigoLimpio}
            </strong>
          </div>

          <div>
            <span>QR</span>
            <strong>
              {identidad.codigo_qr
                ? '✓ Asociado'
                : 'No asociado'}
            </strong>
          </div>

          <div>
            <span>NFC</span>
            <strong>
              {identidad.nfc_uid
                ? '✓ Asociado'
                : 'No asociado'}
            </strong>
          </div>

        </div>

        {/* ====================================================
            EMPRESA
        ==================================================== */}

        <div className="sectionTitle">
          RESPONSABLE DEL PRODUCTO
        </div>

        <div className="companyCard">

          <div className="companyIcon">
            V
          </div>

          <div>
            <h2>
              {empresaNombre}
            </h2>

            <p>
              {empresa?.sector &&
                `${empresa.sector} · `}
              {empresa?.pais || ''}
            </p>

            {empresa?.rut && (
              <small>
                RUT: {empresa.rut}
              </small>
            )}
          </div>

        </div>

        {/* ====================================================
            VERIFICACIÓN
        ==================================================== */}

        <div className="verification">

          <div className="verificationIcon">
            ✓
          </div>

          <div>
            <strong>
              Identidad digital registrada
            </strong>

            <p>
              Esta unidad física posee una identidad digital
              única registrada en VINCULAB.
            </p>
          </div>

        </div>

      </section>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <footer>

        <div className="footerLogo">
          VINCULA<span>B</span>
        </div>

        <p>
          Plataforma de Identidad Digital de Productos
        </p>

        <small>
          Digital Product Passport · Trazabilidad · QR · NFC
        </small>

      </footer>

      <style>{`

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #080b0f;
        }

        .page {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 80% 0%,
              rgba(255, 102, 0, .08),
              transparent 25%
            ),
            #080b0f;

          color: #f5f7fa;

          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }

        .header {
          height: 82px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 0 6%;

          border-bottom: 1px solid #202b35;

          background: #0c1117;
        }

        .logo,
        .footerLogo {
          font-size: 24px;
          font-weight: 900;
          letter-spacing: -1px;
        }

        .logo span,
        .footerLogo span {
          color: #ff6600;
        }

        .brandSub {
          margin-top: 5px;

          color: #69849c;

          font-size: 9px;
          letter-spacing: 2px;
        }

        .passport {
          color: #8ca3b7;

          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
        }

        .hero {
          display: grid;

          grid-template-columns:
            minmax(0, 1fr)
            280px;

          gap: 50px;

          padding:
            80px
            max(6%, calc((100% - 1250px) / 2));

          border-bottom: 1px solid #202b35;
        }

        .verified {
          display: inline-block;

          padding: 8px 12px;

          border: 1px solid #145b40;
          border-radius: 20px;

          background: #092d21;

          color: #30e996;

          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        h1 {
          margin:
            25px 0
            5px;

          font-size: clamp(38px, 6vw, 70px);

          line-height: 1;

          letter-spacing: -2px;
        }

        .modelName {
          color: #ff6600;

          font-size: 21px;
          font-weight: 700;
        }

        .description {
          max-width: 700px;

          margin-top: 22px;

          color: #8da1b4;

          font-size: 16px;
          line-height: 1.7;
        }

        .identityCode {
          display: flex;
          flex-direction: column;

          margin-top: 35px;
        }

        .identityCode span {
          color: #60798e;

          font-size: 10px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .identityCode strong {
          margin-top: 8px;

          color: #fff;

          font-size: 20px;
          letter-spacing: 2px;
        }

        .statusCard {
          min-height: 240px;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          border: 1px solid #24323e;
          border-radius: 16px;

          background: #101821;
        }

        .statusIcon {
          width: 55px;
          height: 55px;

          display: flex;
          align-items: center;
          justify-content: center;

          margin-bottom: 20px;

          border-radius: 50%;

          background: #063c2a;

          color: #25e38e;

          font-size: 25px;
        }

        .statusCard span {
          color: #66839c;

          font-size: 10px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .statusCard strong {
          margin: 10px 0;

          font-size: 16px;
        }

        .active {
          color: #26e691;
        }

        .inactive {
          color: #ff9a43;
        }

        .statusCard small {
          color: #657c8e;
        }

        .container {
          max-width: 1250px;

          margin: auto;

          padding: 60px 30px 90px;
        }

        .sectionTitle {
          margin:
            55px 0
            18px;

          color: #ff6600;

          font-size: 11px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .sectionTitle:first-child {
          margin-top: 0;
        }

        .grid {
          display: grid;

          grid-template-columns:
            repeat(4, 1fr);

          gap: 15px;
        }

        .infoCard {
          min-height: 115px;

          padding: 22px;

          border: 1px solid #23313d;
          border-radius: 12px;

          background: #10171f;
        }

        .infoCard span {
          display: block;

          margin-bottom: 12px;

          color: #69839a;

          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .infoCard strong {
          font-size: 17px;
        }

        .traceCard,
        .attributeCard,
        .digitalCard,
        .companyCard {
          border: 1px solid #23313d;
          border-radius: 12px;

          background: #10171f;
        }

        .traceCard {
          overflow: hidden;
        }

        .traceRow {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 30px;

          padding: 17px 22px;

          border-bottom: 1px solid #202b34;
        }

        .traceRow:last-child {
          border-bottom: none;
        }

        .traceRow span {
          color: #738da3;

          font-size: 13px;
        }

        .traceRow strong {
          text-align: right;

          font-size: 14px;
        }

        .attributesGrid {
          display: grid;

          grid-template-columns:
            repeat(2, 1fr);

          gap: 18px;
        }

        .attributeCard {
          overflow: hidden;
        }

        .attributeCard h2 {
          margin: 0;

          padding: 18px 20px;

          border-bottom: 1px solid #26323c;

          color: #ff6600;

          font-size: 11px;
          letter-spacing: 1.5px;
        }

        .attributeRow {
          display: flex;
          justify-content: space-between;

          gap: 20px;

          padding: 15px 20px;

          border-bottom: 1px solid #202a33;
        }

        .attributeRow:last-child {
          border-bottom: none;
        }

        .attributeRow span {
          color: #8095a8;

          font-size: 13px;
        }

        .attributeRow strong {
          text-align: right;

          font-size: 13px;
        }

        .digitalCard {
          display: grid;

          grid-template-columns:
            repeat(3, 1fr);

          overflow: hidden;
        }

        .digitalCard > div {
          padding: 25px;

          border-right: 1px solid #26323c;
        }

        .digitalCard > div:last-child {
          border-right: none;
        }

        .digitalCard span {
          display: block;

          margin-bottom: 10px;

          color: #68849a;

          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .digitalCard strong {
          font-size: 14px;
        }

        .companyCard {
          display: flex;
          align-items: center;

          gap: 20px;

          padding: 25px;
        }

        .companyIcon {
          width: 55px;
          height: 55px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 12px;

          background: #ff6600;

          color: white;

          font-size: 22px;
          font-weight: 900;
        }

        .companyCard h2 {
          margin: 0 0 6px;

          font-size: 20px;
        }

        .companyCard p {
          margin: 0 0 6px;

          color: #8ba0b2;
        }

        .companyCard small {
          color: #60798e;
        }

        .verification {
          display: flex;
          align-items: center;

          gap: 18px;

          margin-top: 50px;

          padding: 25px;

          border: 1px solid #12543d;
          border-radius: 12px;

          background: #08241c;
        }

        .verificationIcon {
          width: 42px;
          height: 42px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background: #0c5239;

          color: #29e893;

          font-size: 20px;
        }

        .verification strong {
          color: #30e996;
        }

        .verification p {
          margin: 6px 0 0;

          color: #82a899;

          font-size: 13px;
        }

        footer {
          padding: 50px 30px;

          border-top: 1px solid #202b35;

          background: #080c11;

          text-align: center;
        }

        footer p {
          margin: 10px 0;

          color: #7890a4;
        }

        footer small {
          color: #4f6678;
        }

        @media (max-width: 900px) {

          .hero {
            grid-template-columns: 1fr;

            padding:
              50px 25px;
          }

          .statusCard {
            min-height: 180px;
          }

          .grid {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .attributesGrid {
            grid-template-columns: 1fr;
          }

        }

        @media (max-width: 600px) {

          .header {
            height: auto;

            padding: 20px;

            flex-direction: column;
            align-items: flex-start;

            gap: 15px;
          }

          .passport {
            font-size: 9px;
          }

          .hero {
            padding: 40px 20px;
          }

          h1 {
            font-size: 42px;
          }

          .container {
            padding:
              40px 18px
              70px;
          }

          .grid {
            grid-template-columns: 1fr;
          }

          .digitalCard {
            grid-template-columns: 1fr;
          }

          .digitalCard > div {
            border-right: none;
            border-bottom: 1px solid #26323c;
          }

          .digitalCard > div:last-child {
            border-bottom: none;
          }

          .traceRow {
            align-items: flex-start;

            flex-direction: column;

            gap: 7px;
          }

          .traceRow strong {
            text-align: left;
          }

        }

      `}</style>

    </main>
  )
}

function InfoCard({
  label,
  value,
}: {
  label: string
  value: any
}) {
  return (
    <div className="infoCard">
      <span>{label.toUpperCase()}</span>
      <strong>{texto(value)}</strong>
    </div>
  )
}

function TraceRow({
  label,
  value,
}: {
  label: string
  value: any
}) {
  return (
    <div className="traceRow">
      <span>{label}</span>
      <strong>{texto(value)}</strong>
    </div>
  )
}
