'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const steps = [
  {
    id: 1,
    title: 'Empresa',
    icon: '◆',
    eyebrow: 'EMPRESA DEMO',
    heading: 'Andes Outdoor SpA',
    description:
      'Empresa ficticia incorporada a Vinculab para administrar la identidad digital y trazabilidad de sus productos.',
  },
  {
    id: 2,
    title: 'Producto',
    icon: '◈',
    eyebrow: 'PRODUCTO',
    heading: 'Chaqueta Técnica Andes X1',
    description:
      'Producto registrado dentro del ecosistema Vinculab y asociado a su fabricante.',
  },
  {
    id: 3,
    title: 'Lote',
    icon: '▦',
    eyebrow: 'LOTE DE PRODUCCIÓN',
    heading: 'LT-2026-001',
    description:
      'El producto se vincula a su lote de fabricación para mantener trazabilidad desde su origen.',
  },
  {
    id: 4,
    title: 'Unidad',
    icon: '◇',
    eyebrow: 'IDENTIDAD ÚNICA',
    heading: 'CARR-000031',
    description:
      'Cada unidad física recibe una identidad digital individual y verificable.',
  },
  {
    id: 5,
    title: 'NFC + QR',
    icon: '⌁',
    eyebrow: 'IDENTIFICADOR FÍSICO',
    heading: 'NFC + QR vinculados',
    description:
      'La identidad digital se conecta con el producto físico mediante NFC y código QR.',
  },
  {
    id: 6,
    title: 'Verificación',
    icon: '✓',
    eyebrow: 'VERIFICACIÓN',
    heading: 'Producto auténtico',
    description:
      'El usuario escanea el producto y Vinculab verifica inmediatamente su identidad digital.',
  },
  {
    id: 7,
    title: 'DPP',
    icon: '◎',
    eyebrow: 'PASAPORTE DIGITAL',
    heading: 'Digital Product Passport',
    description:
      'Información estructurada del producto disponible durante todo su ciclo de vida.',
  },
  {
    id: 8,
    title: 'Trazabilidad',
    icon: '↗',
    eyebrow: 'HISTORIAL DIGITAL',
    heading: 'Trazabilidad completa',
    description:
      'Los principales eventos del producto quedan asociados a su identidad digital.',
  },
]

export default function DemoPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [scans, setScans] = useState(24)
  const [scanning, setScanning] = useState(false)
  const [lastScan, setLastScan] = useState('Hoy · 01:52')

  const current = steps[step - 1]

  const next = () => {
    if (step < steps.length) {
      setStep(step + 1)
    }
  }

  const previous = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const simulateScan = () => {
    if (scanning) return

    setScanning(true)

    setTimeout(() => {
      setScans((value) => value + 1)
      setLastScan('Ahora')
      setScanning(false)
      setStep(6)
    }, 1200)
  }

  return (
    <main className="page">
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
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
              circle at 75% 15%,
              rgba(24, 112, 255, 0.13),
              transparent 30%
            ),
            radial-gradient(
              circle at 15% 80%,
              rgba(0, 213, 170, 0.07),
              transparent 30%
            ),
            #07090d;
        }

        .nav {
          max-width: 1280px;
          height: 76px;
          padding: 0 28px;
          margin: auto;

          display: flex;
          align-items: center;
          justify-content: space-between;

          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 11px;

          font-size: 19px;
          font-weight: 900;
          letter-spacing: 2px;
          cursor: pointer;
        }

        .logo {
          width: 36px;
          height: 36px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 10px;
          background: linear-gradient(135deg, #1476ff, #00cfaa);

          font-weight: 900;
        }

        .navRight {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .demoBadge {
          padding: 7px 11px;
          border-radius: 100px;

          color: #ffcf70;
          background: rgba(255, 177, 40, 0.08);
          border: 1px solid rgba(255, 177, 40, 0.2);

          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.8px;
        }

        .exit {
          padding: 9px 15px;
          border-radius: 9px;

          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);

          color: white;
          cursor: pointer;
        }

        .container {
          max-width: 1280px;
          margin: auto;
          padding: 48px 28px 90px;
        }

        .intro {
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 30px;
          margin-bottom: 34px;
        }

        .introTag {
          color: #5aa0ff;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1.5px;
          margin-bottom: 10px;
        }

        h1 {
          font-size: clamp(32px, 4vw, 49px);
          letter-spacing: -1.8px;
          margin: 0;
        }

        .intro p {
          color: #8e99a9;
          line-height: 1.6;
          max-width: 610px;
          margin: 12px 0 0;
        }

        .progressText {
          color: #788496;
          font-size: 13px;
          white-space: nowrap;
        }

        .progress {
          height: 4px;
          max-width: 1280px;
          margin: auto;
          background: rgba(255, 255, 255, 0.06);
        }

        .progressFill {
          height: 100%;
          background: linear-gradient(90deg, #1676ff, #20ddb2);
          transition: width 0.35s ease;
        }

        .steps {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 7px;
          margin-bottom: 25px;
        }

        .step {
          padding: 11px 8px;

          background: rgba(255, 255, 255, 0.025);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 11px;

          color: #697587;
          cursor: pointer;

          text-align: center;
          transition: 0.2s;
        }

        .step:hover {
          border-color: rgba(58, 145, 255, 0.35);
        }

        .stepActive {
          background: rgba(24, 112, 255, 0.11);
          border-color: rgba(41, 134, 255, 0.4);
          color: white;
        }

        .stepDone {
          color: #38dfb5;
        }

        .stepIcon {
          display: block;
          font-size: 17px;
          margin-bottom: 5px;
        }

        .stepTitle {
          font-size: 10px;
          font-weight: 700;
        }

        .workspace {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 22px;
        }

        .mainCard,
        .sideCard {
          border-radius: 21px;

          background: linear-gradient(
            145deg,
            rgba(22, 27, 37, 0.92),
            rgba(10, 13, 19, 0.95)
          );

          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .mainCard {
          min-height: 490px;
          padding: 38px;

          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .stepNumber {
          width: 55px;
          height: 55px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 15px;

          background: linear-gradient(135deg, #126fff, #00cda7);

          font-size: 25px;
          margin-bottom: 32px;

          box-shadow: 0 12px 35px rgba(18, 111, 255, 0.2);
        }

        .eyebrow {
          color: #5d9fff;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 1.5px;
        }

        .mainCard h2 {
          margin: 10px 0 13px;
          font-size: clamp(29px, 4vw, 45px);
          letter-spacing: -1.5px;
        }

        .description {
          max-width: 650px;
          color: #9ba6b5;
          line-height: 1.7;
          font-size: 16px;
        }

        .detailBox {
          margin-top: 28px;
          max-width: 660px;

          padding: 18px;

          border-radius: 14px;

          background: rgba(255, 255, 255, 0.025);
          border: 1px solid rgba(255, 255, 255, 0.07);
        }

        .detailLabel {
          color: #707d90;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.3px;
        }

        .detailValue {
          margin-top: 7px;
          font-weight: 700;
        }

        .authentic {
          display: inline-flex;
          align-items: center;
          gap: 8px;

          margin-top: 20px;
          padding: 9px 13px;

          border-radius: 100px;

          color: #39e4b8;
          background: rgba(33, 221, 175, 0.08);
          border: 1px solid rgba(33, 221, 175, 0.18);

          font-size: 12px;
          font-weight: 800;
        }

        .navigation {
          margin-top: 40px;
          display: flex;
          justify-content: space-between;
          gap: 12px;
        }

        .back,
        .next {
          padding: 13px 20px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 700;
        }

        .back {
          color: white;
          background: rgba(255, 255, 255, 0.035);
          border: 1px solid rgba(255, 255, 255, 0.09);
        }

        .back:disabled {
          opacity: 0.3;
          cursor: default;
        }

        .next {
          color: white;
          border: 0;
          background: #1478ff;
        }

        .side {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .sideCard {
          padding: 22px;
        }

        .sideTitle {
          font-size: 11px;
          color: #778497;
          letter-spacing: 1.3px;
          font-weight: 800;
          margin-bottom: 18px;
        }

        .product {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-bottom: 18px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        }

        .productIcon {
          width: 43px;
          height: 43px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 12px;

          background: linear-gradient(135deg, #1476ff, #00cfaa);
        }

        .muted {
          color: #778497;
          font-size: 11px;
        }

        .product strong {
          display: block;
          margin-top: 4px;
        }

        .dataRow {
          display: flex;
          justify-content: space-between;
          align-items: center;

          padding: 14px 0;

          border-bottom: 1px solid rgba(255, 255, 255, 0.055);

          font-size: 13px;
        }

        .dataRow:last-child {
          border-bottom: 0;
        }

        .dataRow span {
          color: #778497;
        }

        .green {
          color: #38dfb5;
        }

        .scanButton {
          width: 100%;

          padding: 15px;
          margin-top: 17px;

          border-radius: 11px;
          border: 1px solid rgba(31, 219, 173, 0.2);

          background: linear-gradient(
            90deg,
            rgba(17, 112, 255, 0.15),
            rgba(31, 219, 173, 0.1)
          );

          color: white;
          font-weight: 800;
          cursor: pointer;
        }

        .scanButton:hover {
          border-color: rgba(31, 219, 173, 0.45);
        }

        .scanButton:disabled {
          cursor: wait;
          opacity: 0.7;
        }

        .live {
          display: inline-block;
          width: 7px;
          height: 7px;
          background: #31e1b4;
          border-radius: 50%;
          margin-right: 5px;
          box-shadow: 0 0 10px #31e1b4;
        }

        .timeline {
          position: relative;
        }

        .event {
          display: grid;
          grid-template-columns: 16px 1fr;
          gap: 10px;
          padding-bottom: 17px;
        }

        .event:last-child {
          padding-bottom: 0;
        }

        .eventDot {
          width: 9px;
          height: 9px;
          margin-top: 4px;
          border-radius: 50%;
          background: #2482ff;
          box-shadow: 0 0 8px rgba(36, 130, 255, 0.5);
        }

        .event strong {
          display: block;
          font-size: 12px;
          margin-bottom: 3px;
        }

        .event span {
          color: #707d90;
          font-size: 10px;
        }

        .bottomNote {
          margin-top: 22px;
          text-align: center;
          color: #5e6979;
          font-size: 11px;
        }

        @media (max-width: 950px) {
          .workspace {
            grid-template-columns: 1fr;
          }

          .steps {
            overflow-x: auto;
            display: flex;
            padding-bottom: 5px;
          }

          .step {
            min-width: 105px;
          }
        }

        @media (max-width: 600px) {
          .nav {
            padding: 0 17px;
          }

          .demoBadge {
            display: none;
          }

          .container {
            padding: 35px 17px 60px;
          }

          .intro {
            display: block;
          }

          .progressText {
            margin-top: 18px;
          }

          .mainCard {
            padding: 25px 20px;
            min-height: 470px;
          }

          .navigation {
            flex-direction: column-reverse;
          }

          .back,
          .next {
            width: 100%;
          }
        }
      `}</style>

      <nav className="nav">
        <div className="brand" onClick={() => router.push('/')}>
          <div className="logo">V</div>
          VINCULAB
        </div>

        <div className="navRight">
          <div className="demoBadge">
            DEMO · DATOS DE DEMOSTRACIÓN
          </div>

          <button
            className="exit"
            onClick={() => router.push('/')}
          >
            Salir del demo
          </button>
        </div>
      </nav>

      <div
        className="progress"
        aria-label="Progreso de la demostración"
      >
        <div
          className="progressFill"
          style={{ width: `${(step / steps.length) * 100}%` }}
        />
      </div>

      <div className="container">

        <div className="intro">
          <div>
            <div className="introTag">
              DEMOSTRACIÓN INTERACTIVA
            </div>

            <h1>
              Así funciona Vinculab
            </h1>

            <p>
              Sigue el recorrido de un producto físico desde su registro
              hasta su identificación, verificación y trazabilidad digital.
            </p>
          </div>

          <div className="progressText">
            Paso {step} de {steps.length}
          </div>
        </div>

        <div className="steps">
          {steps.map((item) => (
            <button
              key={item.id}
              className={`
                step
                ${step === item.id ? 'stepActive' : ''}
                ${step > item.id ? 'stepDone' : ''}
              `}
              onClick={() => setStep(item.id)}
            >
              <span className="stepIcon">
                {step > item.id ? '✓' : item.icon}
              </span>

              <span className="stepTitle">
                {item.title}
              </span>
            </button>
          ))}
        </div>

        <div className="workspace">

          <section className="mainCard">

            <div>

              <div className="stepNumber">
                {current.icon}
              </div>

              <div className="eyebrow">
                {current.eyebrow}
              </div>

              <h2>
                {current.heading}
              </h2>

              <div className="description">
                {current.description}
              </div>

              {step === 1 && (
                <div className="detailBox">
                  <div className="detailLabel">
                    ORGANIZACIÓN
                  </div>

                  <div className="detailValue">
                    Andes Outdoor SpA · Chile
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="detailBox">
                  <div className="detailLabel">
                    PRODUCTO REGISTRADO
                  </div>

                  <div className="detailValue">
                    Chaqueta Técnica Andes X1
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="detailBox">
                  <div className="detailLabel">
                    FABRICACIÓN
                  </div>

                  <div className="detailValue">
                    Lote LT-2026-001 · 250 unidades
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="detailBox">
                  <div className="detailLabel">
                    IDENTIFICADOR VINCULAB
                  </div>

                  <div
                    className="detailValue"
                    style={{ color: '#5ca2ff', fontFamily: 'monospace' }}
                  >
                    CARR-000031
                  </div>
                </div>
              )}

              {step === 5 && (
                <>
                  <div className="detailBox">
                    <div className="detailLabel">
                      TECNOLOGÍA ASOCIADA
                    </div>

                    <div className="detailValue">
                      NFC + Código QR
                    </div>
                  </div>

                  <div className="authentic">
                    ✓ Identidad física vinculada
                  </div>
                </>
              )}

              {step === 6 && (
                <>
                  <div className="authentic">
                    ✓ PRODUCTO AUTÉNTICO
                  </div>

                  <div className="detailBox">
                    <div className="detailLabel">
                      RESULTADO DE VERIFICACIÓN
                    </div>

                    <div className="detailValue">
                      Identidad digital confirmada por Vinculab
                    </div>
                  </div>
                </>
              )}

              {step === 7 && (
                <div className="detailBox">
                  <div className="detailLabel">
                    DIGITAL PRODUCT PASSPORT
                  </div>

                  <div className="detailValue">
                    Estado: Activo · Información del producto disponible
                  </div>
                </div>
              )}

              {step === 8 && (
                <>
                  <div className="detailBox">
                    <div className="detailLabel">
                      CICLO DIGITAL
                    </div>

                    <div className="detailValue">
                      Fabricación → Identificación → Activación →
                      Verificación
                    </div>
                  </div>

                  <div className="authentic">
                    ✓ Trazabilidad verificada
                  </div>
                </>
              )}

            </div>

            <div className="navigation">

              <button
                className="back"
                disabled={step === 1}
                onClick={previous}
              >
                ← Anterior
              </button>

              {step < steps.length ? (
                <button
                  className="next"
                  onClick={next}
                >
                  Siguiente →
                </button>
              ) : (
                <button
                  className="next"
                  onClick={() => setStep(1)}
                >
                  Reiniciar demo ↻
                </button>
              )}

            </div>

          </section>

          <aside className="side">

            <div className="sideCard">

              <div className="sideTitle">
                PRODUCTO DEMOSTRACIÓN
              </div>

              <div className="product">

                <div className="productIcon">
                  ◆
                </div>

                <div>
                  <div className="muted">
                    ANDES OUTDOOR
                  </div>

                  <strong>
                    Chaqueta Técnica X1
                  </strong>
                </div>

              </div>

              <div className="dataRow">
                <span>ID</span>
                <strong>CARR-000031</strong>
              </div>

              <div className="dataRow">
                <span>Lote</span>
                <strong>LT-2026-001</strong>
              </div>

              <div className="dataRow">
                <span>DPP</span>
                <strong className="green">
                  Activo ✓
                </strong>
              </div>

              <div className="dataRow">
                <span>Identificación</span>
                <strong>NFC + QR</strong>
              </div>

              <div className="dataRow">
                <span>Estado</span>
                <strong className="green">
                  Auténtico ✓
                </strong>
              </div>

              <button
                className="scanButton"
                onClick={simulateScan}
                disabled={scanning}
              >
                {scanning
                  ? '◌ Verificando identidad...'
                  : '◉ Simular escaneo NFC / QR'}
              </button>

            </div>

            <div className="sideCard">

              <div className="sideTitle">
                ACTIVIDAD DEL PRODUCTO
              </div>

              <div className="timeline">

                <div className="event">
                  <div className="eventDot" />
                  <div>
                    <strong>
                      Producto registrado
                    </strong>
                    <span>
                      Identidad Vinculab creada
                    </span>
                  </div>
                </div>

                <div className="event">
                  <div className="eventDot" />
                  <div>
                    <strong>
                      NFC + QR vinculados
                    </strong>
                    <span>
                      Identificador físico activado
                    </span>
                  </div>
                </div>

                <div className="event">
                  <div className="eventDot" />
                  <div>
                    <strong>
                      Última verificación
                    </strong>
                    <span>
                      {lastScan}
                    </span>
                  </div>
                </div>

              </div>

            </div>

            <div className="sideCard">

              <div className="dataRow">
                <span>
                  Verificaciones
                </span>

                <strong>
                  <span className="live" />
                  {scans}
                </strong>
              </div>

              <div className="dataRow">
                <span>
                  Estado sistema
                </span>

                <strong className="green">
                  Operativo
                </strong>
              </div>

            </div>

          </aside>

        </div>

        <div className="bottomNote">
          Entorno demostrativo Vinculab · Los datos mostrados son ficticios
          y no corresponden a una empresa real.
        </div>

      </div>
    </main>
  )
}
