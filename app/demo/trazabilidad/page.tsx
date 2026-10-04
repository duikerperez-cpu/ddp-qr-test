'use client'

import { useRouter } from 'next/navigation'

const events = [
  {
    date: '18 SEP 2026',
    time: '08:42',
    title: 'Fabricación completada',
    description:
      'La unidad fue fabricada y asociada al lote de producción LT-2026-001.',
    location: 'Santiago · Chile',
    responsible: 'Andes Outdoor SpA',
    type: 'FABRICACIÓN',
    icon: '◆',
  },
  {
    date: '19 SEP 2026',
    time: '11:15',
    title: 'Control de calidad aprobado',
    description:
      'La unidad superó el control de calidad previo a su liberación.',
    location: 'Santiago · Chile',
    responsible: 'Control de Calidad',
    type: 'CALIDAD',
    icon: '✓',
  },
  {
    date: '20 SEP 2026',
    time: '09:30',
    title: 'Identidad digital creada',
    description:
      'Vinculab generó la identidad digital individual CARR-000031.',
    location: 'Plataforma Vinculab',
    responsible: 'Sistema Vinculab',
    type: 'IDENTIDAD',
    icon: '◇',
  },
  {
    date: '20 SEP 2026',
    time: '09:34',
    title: 'NFC + QR vinculados',
    description:
      'Los identificadores físicos fueron asociados a la identidad digital de la unidad.',
    location: 'Planta de identificación',
    responsible: 'Andes Outdoor SpA',
    type: 'IDENTIFICACIÓN',
    icon: '⌁',
  },
  {
    date: '21 SEP 2026',
    time: '10:05',
    title: 'Pasaporte Digital activado',
    description:
      'El Digital Product Passport quedó disponible para consulta.',
    location: 'Plataforma Vinculab',
    responsible: 'Sistema Vinculab',
    type: 'DPP',
    icon: '◎',
  },
  {
    date: '23 SEP 2026',
    time: '16:20',
    title: 'Producto despachado',
    description:
      'La unidad fue registrada como despachada desde el centro de distribución.',
    location: 'Santiago · Chile',
    responsible: 'Logística',
    type: 'LOGÍSTICA',
    icon: '↗',
  },
  {
    date: 'HOY',
    time: '02:18',
    title: 'Producto verificado',
    description:
      'Un usuario consultó el identificador y Vinculab confirmó la autenticidad del producto.',
    location: 'Chile',
    responsible: 'Verificación pública',
    type: 'VERIFICACIÓN',
    icon: '✓',
  },
]

export default function DemoTrazabilidad() {
  const router = useRouter()

  return (
    <main className="page">
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #07090d;
          color: white;
        }

        button {
          font-family: inherit;
        }
      `}</style>

      <style jsx>{`
        .page {
          min-height: 100vh;

          background:
            radial-gradient(
              circle at 80% 5%,
              rgba(20, 118, 255, 0.13),
              transparent 27%
            ),
            radial-gradient(
              circle at 10% 80%,
              rgba(0, 207, 170, 0.06),
              transparent 30%
            ),
            #07090d;
        }

        .nav {
          height: 68px;
          max-width: 1320px;
          margin: auto;
          padding: 0 25px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 10px;

          font-weight: 900;
          letter-spacing: 2px;

          cursor: pointer;
        }

        .logo {
          width: 35px;
          height: 35px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 10px;

          background: linear-gradient(
            135deg,
            #1476ff,
            #00cfaa
          );
        }

        .navRight {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .demo {
          padding: 6px 10px;

          border-radius: 100px;

          color: #ffcf70;
          background: rgba(255, 177, 40, 0.08);
          border: 1px solid rgba(255, 177, 40, 0.2);

          font-size: 10px;
          font-weight: 800;
        }

        .back {
          padding: 9px 14px;

          border-radius: 9px;

          color: white;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);

          cursor: pointer;
        }

        .container {
          max-width: 1180px;
          margin: auto;

          padding: 50px 25px 80px;
        }

        .hero {
          display: grid;

          grid-template-columns:
            minmax(0, 1fr)
            350px;

          gap: 35px;

          padding-bottom: 40px;

          border-bottom:
            1px solid
            rgba(255, 255, 255, 0.07);
        }

        .eyebrow {
          margin-bottom: 13px;

          color: #5b9fff;

          font-size: 11px;
          font-weight: 900;
          letter-spacing: 1.5px;
        }

        h1 {
          margin: 0;

          font-size: clamp(
            40px,
            5vw,
            64px
          );

          line-height: 1.02;

          letter-spacing: -2px;
        }

        .subtitle {
          max-width: 680px;

          margin: 20px 0 0;

          color: #909bab;

          font-size: 16px;
          line-height: 1.65;
        }

        .verified {
          display: inline-flex;
          align-items: center;

          margin-top: 22px;

          padding: 7px 11px;

          border-radius: 100px;

          color: #3be1b6;

          background:
            rgba(36, 224, 176, 0.08);

          border:
            1px solid
            rgba(36, 224, 176, 0.18);

          font-size: 10px;
          font-weight: 900;
        }

        .identity {
          padding: 23px;

          border-radius: 20px;

          background:
            linear-gradient(
              145deg,
              rgba(22, 28, 38, 0.95),
              rgba(9, 12, 18, 0.96)
            );

          border:
            1px solid
            rgba(255, 255, 255, 0.09);
        }

        .identityTop {
          display: flex;
          align-items: center;

          gap: 12px;

          padding-bottom: 18px;

          border-bottom:
            1px solid
            rgba(255, 255, 255, 0.07);
        }

        .productIcon {
          width: 46px;
          height: 46px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 13px;

          background:
            linear-gradient(
              135deg,
              #1476ff,
              #00cfaa
            );
        }

        .small {
          color: #738094;

          font-size: 9px;
          letter-spacing: 1px;
        }

        .identity strong {
          display: block;

          margin-top: 4px;
        }

        .idBox {
          margin-top: 18px;

          padding: 15px;

          border-radius: 12px;

          background:
            rgba(255, 255, 255, 0.03);

          border:
            1px solid
            rgba(255, 255, 255, 0.06);
        }

        .code {
          margin-top: 6px;

          color: #63a6ff;

          font-family: monospace;
          font-size: 16px;
          font-weight: 700;
        }

        .identityRow {
          display: flex;
          justify-content: space-between;

          margin-top: 13px;

          color: #798698;

          font-size: 11px;
        }

        .green {
          color: #39dfb4;

          font-weight: 800;
        }

        .summary {
          display: grid;

          grid-template-columns:
            repeat(4, 1fr);

          gap: 12px;

          margin: 35px 0;
        }

        .metric {
          padding: 19px;

          border-radius: 16px;

          background:
            rgba(255, 255, 255, 0.025);

          border:
            1px solid
            rgba(255, 255, 255, 0.07);
        }

        .metricValue {
          margin-top: 10px;

          font-size: 24px;
          font-weight: 900;
        }

        .metricText {
          margin-top: 4px;

          color: #748194;

          font-size: 10px;
        }

        .sectionHeader {
          margin: 45px 0 24px;
        }

        .sectionHeader h2 {
          margin: 5px 0 8px;

          font-size: 31px;

          letter-spacing: -1px;
        }

        .sectionHeader p {
          margin: 0;

          color: #8490a0;

          font-size: 14px;
        }

        .flow {
          display: grid;

          grid-template-columns:
            repeat(6, 1fr);

          gap: 8px;

          margin-bottom: 30px;
        }

        .flowItem {
          position: relative;

          padding: 16px 10px;

          text-align: center;

          border-radius: 14px;

          background:
            rgba(255, 255, 255, 0.025);

          border:
            1px solid
            rgba(255, 255, 255, 0.07);
        }

        .flowIcon {
          width: 35px;
          height: 35px;

          margin: auto auto 9px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 10px;

          color: #5da3ff;

          background:
            rgba(20, 118, 255, 0.09);

          border:
            1px solid
            rgba(20, 118, 255, 0.16);
        }

        .flowItem strong {
          display: block;

          font-size: 10px;
        }

        .flowItem span {
          display: block;

          margin-top: 4px;

          color: #697689;

          font-size: 8px;
        }

        .timeline {
          padding: 28px;

          border-radius: 20px;

          background:
            rgba(255, 255, 255, 0.02);

          border:
            1px solid
            rgba(255, 255, 255, 0.075);
        }

        .event {
          display: grid;

          grid-template-columns:
            100px
            40px
            minmax(0, 1fr);

          min-height: 145px;
        }

        .event:last-child {
          min-height: auto;
        }

        .eventDate {
          padding-top: 5px;
        }

        .eventDate strong {
          display: block;

          color: #8492a5;

          font-size: 10px;
        }

        .eventDate span {
          display: block;

          margin-top: 5px;

          color: #556274;

          font-size: 9px;
        }

        .eventLine {
          position: relative;

          display: flex;
          justify-content: center;
        }

        .dot {
          position: relative;

          z-index: 2;

          width: 13px;
          height: 13px;

          margin-top: 5px;

          border-radius: 50%;

          background: #2482ff;

          border:
            3px solid
            #0d1724;

          box-shadow:
            0 0 15px
            rgba(36, 130, 255, 0.7);
        }

        .eventLine::after {
          content: '';

          position: absolute;

          top: 18px;
          bottom: -5px;

          width: 1px;

          background:
            linear-gradient(
              #2482ff,
              rgba(36, 130, 255, 0.15)
            );
        }

        .event:last-child
        .eventLine::after {
          display: none;
        }

        .eventCard {
          margin-bottom: 18px;

          padding: 18px;

          border-radius: 15px;

          background:
            rgba(255, 255, 255, 0.025);

          border:
            1px solid
            rgba(255, 255, 255, 0.07);
        }

        .eventTop {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 15px;
        }

        .eventType {
          color: #5c9fff;

          font-size: 9px;
          font-weight: 900;

          letter-spacing: 1px;
        }

        .eventStatus {
          color: #39dfb4;

          font-size: 9px;
          font-weight: 900;
        }

        .eventCard h3 {
          margin: 8px 0 7px;

          font-size: 17px;
        }

        .eventCard p {
          margin: 0;

          color: #8490a0;

          font-size: 12px;
          line-height: 1.5;
        }

        .eventMeta {
          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 10px;

          margin-top: 15px;
        }

        .meta {
          padding: 10px;

          border-radius: 9px;

          background:
            rgba(255, 255, 255, 0.025);
        }

        .meta span {
          display: block;

          color: #657286;

          font-size: 8px;
        }

        .meta strong {
          display: block;

          margin-top: 4px;

          font-size: 10px;
        }

        .certificate {
          margin-top: 30px;

          padding: 26px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 25px;

          border-radius: 19px;

          background:
            linear-gradient(
              120deg,
              rgba(20, 118, 255, 0.11),
              rgba(0, 207, 170, 0.07)
            );

          border:
            1px solid
            rgba(53, 146, 255, 0.16);
        }

        .certificate h3 {
          margin: 7px 0;

          font-size: 21px;
        }

        .certificate p {
          margin: 0;

          color: #8290a1;

          font-size: 12px;
        }

        .primary {
          padding: 13px 18px;

          border: 0;
          border-radius: 10px;

          color: white;

          background: #1478ff;

          font-weight: 800;

          cursor: pointer;

          white-space: nowrap;
        }

        .actions {
          margin-top: 30px;

          display: flex;
          justify-content: space-between;

          gap: 12px;
        }

        .secondary {
          padding: 13px 18px;

          border-radius: 10px;

          color: white;

          background:
            rgba(255, 255, 255, 0.04);

          border:
            1px solid
            rgba(255, 255, 255, 0.1);

          font-weight: 800;

          cursor: pointer;
        }

        .note {
          margin-top: 30px;

          color: #566172;

          font-size: 9px;

          text-align: center;
        }

        @media (max-width: 850px) {
          .hero {
            grid-template-columns: 1fr;
          }

          .summary {
            grid-template-columns:
              1fr 1fr;
          }

          .flow {
            grid-template-columns:
              repeat(3, 1fr);
          }
        }

        @media (max-width: 600px) {
          .demo {
            display: none;
          }

          .nav {
            padding: 0 16px;
          }

          .container {
            padding:
              35px
              16px
              60px;
          }

          h1 {
            font-size: 41px;
          }

          .summary {
            grid-template-columns: 1fr;
          }

          .flow {
            grid-template-columns:
              1fr 1fr;
          }

          .timeline {
            padding: 18px 13px;
          }

          .event {
            grid-template-columns:
              65px
              25px
              1fr;

            min-height: 170px;
          }

          .eventMeta {
            grid-template-columns: 1fr;
          }

          .certificate {
            align-items: flex-start;
            flex-direction: column;
          }

          .actions {
            flex-direction: column;
          }

          .primary,
          .secondary {
            width: 100%;
          }
        }
      `}</style>

      <nav className="nav">

        <div
          className="brand"
          onClick={() =>
            router.push('/')
          }
        >
          <div className="logo">
            V
          </div>

          VINCULAB
        </div>

        <div className="navRight">

          <div className="demo">
            TRAZABILIDAD · DEMO
          </div>

          <button
            className="back"
            onClick={() =>
              router.push('/demo/dpp')
            }
          >
            ← Volver al DPP
          </button>

        </div>

      </nav>

      <div className="container">

        <section className="hero">

          <div>

            <div className="eyebrow">
              TRAZABILIDAD DIGITAL
            </div>

            <h1>
              Historia verificable
              <br />
              del producto.
            </h1>

            <p className="subtitle">
              Vinculab registra los principales
              eventos asociados a la identidad
              digital del producto, permitiendo
              construir una historia consultable
              desde su fabricación hasta sus
              verificaciones posteriores.
            </p>

            <div className="verified">
              ✓ TRAZABILIDAD VERIFICADA
            </div>

          </div>

          <div className="identity">

            <div className="identityTop">

              <div className="productIcon">
                ◆
              </div>

              <div>
                <div className="small">
                  PRODUCTO
                </div>

                <strong>
                  Chaqueta Técnica Andes X1
                </strong>
              </div>

            </div>

            <div className="idBox">

              <div className="small">
                IDENTIDAD DIGITAL
              </div>

              <div className="code">
                CARR-000031
              </div>

            </div>

            <div className="identityRow">
              <span>Lote</span>
              <strong>
                LT-2026-001
              </strong>
            </div>

            <div className="identityRow">
              <span>Fabricante</span>
              <strong>
                Andes Outdoor
              </strong>
            </div>

            <div className="identityRow">
              <span>Estado</span>

              <span className="green">
                Activo ✓
              </span>
            </div>

          </div>

        </section>

        <section className="summary">

          <div className="metric">
            <div className="small">
              EVENTOS
            </div>

            <div className="metricValue">
              7
            </div>

            <div className="metricText">
              registrados
            </div>
          </div>

          <div className="metric">
            <div className="small">
              IDENTIDAD
            </div>

            <div className="metricValue green">
              ✓
            </div>

            <div className="metricText">
              verificada
            </div>
          </div>

          <div className="metric">
            <div className="small">
              ORIGEN
            </div>

            <div className="metricValue">
              CL
            </div>

            <div className="metricText">
              Chile
            </div>
          </div>

          <div className="metric">
            <div className="small">
              ÚLTIMO EVENTO
            </div>

            <div className="metricValue">
              Hoy
            </div>

            <div className="metricText">
              verificación
            </div>
          </div>

        </section>

        <div className="sectionHeader">

          <div className="eyebrow">
            RECORRIDO DEL PRODUCTO
          </div>

          <h2>
            Ciclo digital
          </h2>

          <p>
            Principales etapas asociadas
            a esta identidad.
          </p>

        </div>

        <section className="flow">

          <div className="flowItem">
            <div className="flowIcon">
              ◆
            </div>
            <strong>
              Fabricación
            </strong>
            <span>
              18 SEP
            </span>
          </div>

          <div className="flowItem">
            <div className="flowIcon">
              ✓
            </div>
            <strong>
              Calidad
            </strong>
            <span>
              19 SEP
            </span>
          </div>

          <div className="flowItem">
            <div className="flowIcon">
              ◇
            </div>
            <strong>
              Identidad
            </strong>
            <span>
              20 SEP
            </span>
          </div>

          <div className="flowItem">
            <div className="flowIcon">
              ⌁
            </div>
            <strong>
              NFC + QR
            </strong>
            <span>
              20 SEP
            </span>
          </div>

          <div className="flowItem">
            <div className="flowIcon">
              ◎
            </div>
            <strong>
              DPP
            </strong>
            <span>
              21 SEP
            </span>
          </div>

          <div className="flowItem">
            <div className="flowIcon">
              ↗
            </div>
            <strong>
              Verificación
            </strong>
            <span>
              HOY
            </span>
          </div>

        </section>

        <div className="sectionHeader">

          <div className="eyebrow">
            HISTORIAL
          </div>

          <h2>
            Eventos registrados
          </h2>

          <p>
            Cronología demostrativa
            asociada a CARR-000031.
          </p>

        </div>

        <section className="timeline">

          {events.map(
            (
              event,
              index
            ) => (

              <div
                className="event"
                key={`${event.date}-${event.title}`}
              >

                <div className="eventDate">

                  <strong>
                    {event.date}
                  </strong>

                  <span>
                    {event.time}
                  </span>

                </div>

                <div className="eventLine">
                  <div className="dot" />
                </div>

                <div className="eventCard">

                  <div className="eventTop">

                    <div className="eventType">
                      {event.icon}{' '}
                      {event.type}
                    </div>

                    <div className="eventStatus">
                      ✓ VERIFICADO
                    </div>

                  </div>

                  <h3>
                    {event.title}
                  </h3>

                  <p>
                    {event.description}
                  </p>

                  <div className="eventMeta">

                    <div className="meta">

                      <span>
                        UBICACIÓN
                      </span>

                      <strong>
                        {event.location}
                      </strong>

                    </div>

                    <div className="meta">

                      <span>
                        RESPONSABLE
                      </span>

                      <strong>
                        {event.responsible}
                      </strong>

                    </div>

                  </div>

                </div>

              </div>

            )
          )}

        </section>

        <section className="certificate">

          <div>

            <div className="eyebrow">
              CERTIFICACIÓN DIGITAL
            </div>

            <h3>
              Certificado Vinculab
            </h3>

            <p>
              Consulta el certificado digital
              asociado a esta identidad individual.
            </p>

          </div>

          <button
            className="primary"
            onClick={() =>
              router.push(
                '/demo/certificado'
              )
            }
          >
            Ver certificado →
          </button>

        </section>

        <div className="actions">

          <button
            className="secondary"
            onClick={() =>
              router.push(
                '/demo/dpp'
              )
            }
          >
            ← Volver al DPP
          </button>

          <button
            className="primary"
            onClick={() =>
              router.push(
                '/demo/certificado'
              )
            }
          >
            Continuar al certificado →
          </button>

        </div>

        <div className="note">
          Trazabilidad de demostración
          Vinculab · Los eventos,
          ubicaciones, fechas y responsables
          mostrados son ficticios.
        </div>

      </div>

    </main>
  )
}
