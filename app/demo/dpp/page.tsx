'use client'

import { useRouter } from 'next/navigation'

export default function DemoDPP() {
  const router = useRouter()

  const sections = [
    {
      icon: '◆',
      title: 'Identidad del producto',
      items: [
        ['Identificador único', 'CARR-000031'],
        ['Producto', 'Chaqueta Técnica Andes X1'],
        ['Modelo', 'Andes X1'],
        ['Lote', 'LT-2026-001'],
        ['Estado', 'Activo'],
      ],
    },
    {
      icon: '▣',
      title: 'Fabricante',
      items: [
        ['Empresa', 'Andes Outdoor SpA'],
        ['País', 'Chile'],
        ['Sector', 'Textil / Outdoor'],
        ['Planta', 'Santiago, Chile'],
        ['Estado fabricante', 'Verificado'],
      ],
    },
    {
      icon: '◈',
      title: 'Fabricación',
      items: [
        ['Fecha fabricación', '18 septiembre 2026'],
        ['Lote', 'LT-2026-001'],
        ['Cantidad lote', '250 unidades'],
        ['Control de calidad', 'Aprobado'],
        ['Identificación', 'NFC + QR'],
      ],
    },
    {
      icon: '◎',
      title: 'Materiales',
      items: [
        ['Tejido exterior', 'Poliéster reciclado'],
        ['Membrana', 'Impermeable / respirable'],
        ['Forro', 'Poliéster'],
        ['Cierres', 'Polímero + metal'],
        ['Contenido reciclado', '65%'],
      ],
    },
  ]

  const events = [
    ['18 SEP 2026', 'Fabricación', 'Unidad producida y asociada al lote LT-2026-001'],
    ['19 SEP 2026', 'Control de calidad', 'Producto aprobado para liberación'],
    ['20 SEP 2026', 'Identidad digital', 'Identificador CARR-000031 creado en Vinculab'],
    ['20 SEP 2026', 'NFC + QR', 'Identificadores físicos vinculados a la unidad'],
    ['21 SEP 2026', 'DPP activado', 'Pasaporte Digital de Producto publicado'],
    ['HOY', 'Verificación', 'Identidad digital consultada correctamente'],
  ]

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

          background: linear-gradient(135deg, #1476ff, #00cfaa);
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

        .verified {
          display: inline-flex;
          align-items: center;
          gap: 7px;

          padding: 7px 11px;

          border-radius: 100px;

          color: #3be1b6;
          background: rgba(36, 224, 176, 0.08);
          border: 1px solid rgba(36, 224, 176, 0.18);

          font-size: 10px;
          font-weight: 900;
        }

        .hero {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 30px;

          padding-bottom: 35px;

          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        }

        .eyebrow {
          color: #5b9fff;

          font-size: 11px;
          font-weight: 900;
          letter-spacing: 1.5px;

          margin-bottom: 14px;
        }

        h1 {
          margin: 0;

          font-size: clamp(38px, 5vw, 62px);
          line-height: 1.02;
          letter-spacing: -2px;
        }

        .subtitle {
          max-width: 680px;

          margin-top: 20px;

          color: #909bab;
          font-size: 16px;
          line-height: 1.65;
        }

        .identity {
          padding: 23px;

          border-radius: 20px;

          background: linear-gradient(
            145deg,
            rgba(22, 28, 38, 0.95),
            rgba(9, 12, 18, 0.96)
          );

          border: 1px solid rgba(255, 255, 255, 0.09);
        }

        .identityTop {
          display: flex;
          align-items: center;
          gap: 12px;

          padding-bottom: 18px;

          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        }

        .productIcon {
          width: 46px;
          height: 46px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 13px;

          background: linear-gradient(135deg, #1476ff, #00cfaa);
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

        .id {
          margin-top: 18px;

          padding: 15px;

          border-radius: 12px;

          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .code {
          margin-top: 6px;

          color: #63a6ff;

          font-family: monospace;
          font-size: 16px;
          font-weight: 700;
        }

        .identityStatus {
          margin-top: 13px;

          display: flex;
          justify-content: space-between;

          color: #798698;

          font-size: 11px;
        }

        .green {
          color: #39dfb4;
          font-weight: 800;
        }

        .passportHeader {
          margin: 50px 0 23px;
        }

        .passportHeader h2 {
          margin: 5px 0 8px;

          font-size: 30px;
          letter-spacing: -1px;
        }

        .passportHeader p {
          margin: 0;

          color: #8490a0;
          font-size: 14px;
        }

        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .card {
          padding: 23px;

          border-radius: 18px;

          background: rgba(255, 255, 255, 0.025);
          border: 1px solid rgba(255, 255, 255, 0.075);
        }

        .cardHeader {
          display: flex;
          align-items: center;
          gap: 11px;

          padding-bottom: 17px;

          border-bottom: 1px solid rgba(255, 255, 255, 0.065);
        }

        .cardIcon {
          width: 35px;
          height: 35px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 10px;

          color: #61a5ff;
          background: rgba(20, 118, 255, 0.09);
          border: 1px solid rgba(20, 118, 255, 0.15);
        }

        .card h3 {
          margin: 0;
          font-size: 15px;
        }

        .row {
          display: grid;
          grid-template-columns: 1fr 1.25fr;
          gap: 15px;

          padding: 12px 0;

          border-bottom: 1px solid rgba(255, 255, 255, 0.05);

          font-size: 12px;
        }

        .row:last-child {
          border-bottom: 0;
          padding-bottom: 0;
        }

        .row span {
          color: #748194;
        }

        .row strong {
          text-align: right;
        }

        .sustainability {
          margin-top: 14px;

          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        .metric {
          padding: 20px;

          border-radius: 16px;

          background: rgba(255, 255, 255, 0.025);
          border: 1px solid rgba(255, 255, 255, 0.07);
        }

        .metricValue {
          margin-top: 12px;

          font-size: 24px;
          font-weight: 900;
        }

        .metricLabel {
          margin-top: 4px;

          color: #748194;
          font-size: 10px;
        }

        .timelineCard {
          margin-top: 14px;
          padding: 26px;

          border-radius: 18px;

          background: rgba(255, 255, 255, 0.025);
          border: 1px solid rgba(255, 255, 255, 0.075);
        }

        .timelineCard h3 {
          margin: 0 0 25px;
        }

        .event {
          display: grid;
          grid-template-columns: 90px 18px 1fr;
          gap: 12px;

          min-height: 70px;
        }

        .date {
          color: #667386;

          font-size: 9px;
          font-weight: 800;

          padding-top: 3px;
        }

        .line {
          position: relative;
        }

        .dot {
          width: 9px;
          height: 9px;

          border-radius: 50%;

          background: #2482ff;

          box-shadow: 0 0 10px rgba(36, 130, 255, 0.6);
        }

        .line::after {
          content: '';

          position: absolute;

          top: 12px;
          left: 4px;

          width: 1px;
          height: 55px;

          background: rgba(64, 139, 255, 0.2);
        }

        .event:last-child .line::after {
          display: none;
        }

        .event strong {
          display: block;
          font-size: 12px;
        }

        .event p {
          margin: 5px 0 0;

          color: #748194;

          font-size: 11px;
        }

        .documents {
          margin-top: 14px;

          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .document {
          padding: 18px;

          border-radius: 15px;

          background: rgba(255, 255, 255, 0.025);
          border: 1px solid rgba(255, 255, 255, 0.07);
        }

        .document strong {
          display: block;

          margin: 10px 0 5px;

          font-size: 13px;
        }

        .document span {
          color: #748194;
          font-size: 10px;
        }

        .actions {
          margin-top: 35px;

          display: flex;
          justify-content: space-between;
          gap: 12px;
        }

        .secondary,
        .primary {
          padding: 13px 19px;

          border-radius: 10px;

          color: white;

          cursor: pointer;
          font-weight: 800;
        }

        .secondary {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .primary {
          border: 0;
          background: #1478ff;
        }

        .note {
          margin-top: 30px;

          text-align: center;

          color: #566172;
          font-size: 9px;
        }

        @media (max-width: 800px) {
          .hero {
            grid-template-columns: 1fr;
          }

          .grid {
            grid-template-columns: 1fr;
          }

          .sustainability {
            grid-template-columns: 1fr 1fr;
          }

          .documents {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 520px) {
          .demo {
            display: none;
          }

          .container {
            padding: 35px 17px 60px;
          }

          .nav {
            padding: 0 17px;
          }

          h1 {
            font-size: 40px;
          }

          .sustainability {
            grid-template-columns: 1fr;
          }

          .event {
            grid-template-columns: 65px 15px 1fr;
          }

          .actions {
            flex-direction: column;
          }

          .secondary,
          .primary {
            width: 100%;
          }
        }
      `}</style>

      <nav className="nav">
        <div
          className="brand"
          onClick={() => router.push('/')}
        >
          <div className="logo">V</div>
          VINCULAB
        </div>

        <div className="navRight">
          <div className="demo">
            DPP · DEMOSTRACIÓN
          </div>

          <button
            className="back"
            onClick={() => router.push('/demo')}
          >
            ← Volver al demo
          </button>
        </div>
      </nav>

      <div className="container">

        <section className="hero">

          <div>
            <div className="eyebrow">
              DIGITAL PRODUCT PASSPORT
            </div>

            <h1>
              Chaqueta Técnica
              <br />
              Andes X1
            </h1>

            <p className="subtitle">
              Pasaporte Digital de Producto asociado a una identidad
              individual Vinculab. Centraliza información del producto,
              fabricación, materiales, documentación y eventos de su
              ciclo de vida.
            </p>

            <div className="verified">
              ✓ PASAPORTE DIGITAL ACTIVO
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
                  Andes X1
                </strong>
              </div>
            </div>

            <div className="id">
              <div className="small">
                IDENTIFICADOR ÚNICO
              </div>

              <div className="code">
                CARR-000031
              </div>
            </div>

            <div className="identityStatus">
              <span>Autenticidad</span>
              <span className="green">
                Verificada ✓
              </span>
            </div>

            <div className="identityStatus">
              <span>Identificación</span>
              <strong>NFC + QR</strong>
            </div>

            <div className="identityStatus">
              <span>DPP</span>
              <span className="green">
                Activo ✓
              </span>
            </div>

          </div>

        </section>

        <div className="passportHeader">
          <div className="eyebrow">
            INFORMACIÓN DEL PASAPORTE
          </div>

          <h2>
            Datos del producto
          </h2>

          <p>
            Información demostrativa asociada a esta unidad.
          </p>
        </div>

        <section className="grid">

          {sections.map((section) => (
            <article
              className="card"
              key={section.title}
            >
              <div className="cardHeader">
                <div className="cardIcon">
                  {section.icon}
                </div>

                <h3>
                  {section.title}
                </h3>
              </div>

              {section.items.map(([label, value]) => (
                <div
                  className="row"
                  key={label}
                >
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </article>
          ))}

        </section>

        <div className="passportHeader">
          <div className="eyebrow">
            SOSTENIBILIDAD
          </div>

          <h2>
            Indicadores del producto
          </h2>
        </div>

        <section className="sustainability">

          <div className="metric">
            <div className="small">
              MATERIAL RECICLADO
            </div>
            <div className="metricValue">
              65%
            </div>
            <div className="metricLabel">
              contenido declarado
            </div>
          </div>

          <div className="metric">
            <div className="small">
              REPARABILIDAD
            </div>
            <div className="metricValue">
              8/10
            </div>
            <div className="metricLabel">
              índice demostrativo
            </div>
          </div>

          <div className="metric">
            <div className="small">
              VIDA ÚTIL ESTIMADA
            </div>
            <div className="metricValue">
              5 años
            </div>
            <div className="metricLabel">
              uso recomendado
            </div>
          </div>

          <div className="metric">
            <div className="small">
              RECICLABILIDAD
            </div>
            <div className="metricValue">
              72%
            </div>
            <div className="metricLabel">
              materiales recuperables
            </div>
          </div>

        </section>

        <div className="passportHeader">
          <div className="eyebrow">
            DOCUMENTACIÓN DIGITAL
          </div>

          <h2>
            Documentos asociados
          </h2>
        </div>

        <section className="documents">

          <div className="document">
            <div>▤</div>
            <strong>
              Certificado de autenticidad
            </strong>
            <span>
              Vinculado a CARR-000031
            </span>
          </div>

          <div className="document">
            <div>✓</div>
            <strong>
              Control de calidad
            </strong>
            <span>
              Estado: aprobado
            </span>
          </div>

          <div className="document">
            <div>◎</div>
            <strong>
              Información de materiales
            </strong>
            <span>
              Declaración del fabricante
            </span>
          </div>

        </section>

        <div className="passportHeader">
          <div className="eyebrow">
            CICLO DE VIDA
          </div>

          <h2>
            Historial del producto
          </h2>
        </div>

        <section className="timelineCard">

          {events.map(([date, title, description]) => (
            <div
              className="event"
              key={`${date}-${title}`}
            >
              <div className="date">
                {date}
              </div>

              <div className="line">
                <div className="dot" />
              </div>

              <div>
                <strong>
                  {title}
                </strong>

                <p>
                  {description}
                </p>
              </div>
            </div>
          ))}

        </section>

        <div className="actions">

          <button
            className="secondary"
            onClick={() => router.push('/demo')}
          >
            ← Volver a demostración
          </button>

          <button
            className="primary"
            onClick={() => router.push('/demo/trazabilidad')}
          >
            Ver trazabilidad completa →
          </button>

        </div>

        <div className="note">
          DPP de demostración Vinculab · Información ficticia utilizada
          exclusivamente para demostrar las capacidades de la plataforma.
        </div>

      </div>
    </main>
  )
}
