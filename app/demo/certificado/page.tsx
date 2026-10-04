'use client'

import { useRouter } from 'next/navigation'

export default function DemoCertificado() {
  const router = useRouter()

  const certificateData = [
    ['N° Certificado', 'VIN-CERT-2026-000031'],
    ['Identidad digital', 'CARR-000031'],
    ['Producto', 'Chaqueta Técnica Andes X1'],
    ['Modelo', 'Andes X1'],
    ['Lote', 'LT-2026-001'],
    ['Fabricante', 'Andes Outdoor SpA'],
    ['País de origen', 'Chile'],
    ['Identificación', 'NFC + QR'],
    ['Fecha de emisión', '21 septiembre 2026'],
    ['Estado', 'Válido'],
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
              circle at 82% 5%,
              rgba(20, 118, 255, 0.14),
              transparent 27%
            ),
            radial-gradient(
              circle at 8% 85%,
              rgba(0, 207, 170, 0.07),
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

          border-bottom:
            1px solid
            rgba(255, 255, 255, 0.07);
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

          background:
            linear-gradient(
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

          background:
            rgba(255, 177, 40, 0.08);

          border:
            1px solid
            rgba(255, 177, 40, 0.2);

          font-size: 10px;
          font-weight: 800;
        }

        .back {
          padding: 9px 14px;

          border-radius: 9px;

          color: white;

          background:
            rgba(255, 255, 255, 0.04);

          border:
            1px solid
            rgba(255, 255, 255, 0.1);

          cursor: pointer;
        }

        .container {
          max-width: 1180px;
          margin: auto;

          padding: 50px 25px 80px;
        }

        .hero {
          text-align: center;

          max-width: 850px;
          margin: auto;
        }

        .eyebrow {
          margin-bottom: 14px;

          color: #5b9fff;

          font-size: 11px;
          font-weight: 900;
          letter-spacing: 1.5px;
        }

        h1 {
          margin: 0;

          font-size:
            clamp(
              40px,
              5vw,
              64px
            );

          line-height: 1.03;

          letter-spacing: -2px;
        }

        .subtitle {
          max-width: 670px;

          margin:
            20px
            auto
            0;

          color: #909bab;

          font-size: 16px;
          line-height: 1.65;
        }

        .validBadge {
          display: inline-flex;
          align-items: center;
          gap: 7px;

          margin-top: 22px;

          padding: 8px 13px;

          border-radius: 100px;

          color: #3be1b6;

          background:
            rgba(36, 224, 176, 0.08);

          border:
            1px solid
            rgba(36, 224, 176, 0.2);

          font-size: 10px;
          font-weight: 900;
        }

        .certificate {
          position: relative;

          overflow: hidden;

          max-width: 900px;

          margin:
            45px
            auto
            0;

          padding: 2px;

          border-radius: 25px;

          background:
            linear-gradient(
              135deg,
              rgba(20, 118, 255, 0.7),
              rgba(0, 207, 170, 0.5),
              rgba(255, 255, 255, 0.08)
            );
        }

        .certificateInner {
          position: relative;

          overflow: hidden;

          padding: 40px;

          border-radius: 23px;

          background:
            linear-gradient(
              145deg,
              #10151e,
              #090c12
            );
        }

        .glow {
          position: absolute;

          top: -160px;
          right: -160px;

          width: 360px;
          height: 360px;

          border-radius: 50%;

          background:
            rgba(20, 118, 255, 0.1);

          filter: blur(10px);

          pointer-events: none;
        }

        .certTop {
          position: relative;

          display: flex;
          align-items: flex-start;
          justify-content: space-between;

          gap: 25px;

          padding-bottom: 28px;

          border-bottom:
            1px solid
            rgba(255, 255, 255, 0.08);
        }

        .certBrand {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .certLogo {
          width: 50px;
          height: 50px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 14px;

          background:
            linear-gradient(
              135deg,
              #1476ff,
              #00cfaa
            );

          font-size: 20px;
          font-weight: 900;
        }

        .certBrandName {
          font-size: 18px;
          font-weight: 900;

          letter-spacing: 2px;
        }

        .certType {
          margin-top: 5px;

          color: #728095;

          font-size: 9px;

          letter-spacing: 1.3px;
        }

        .status {
          text-align: right;
        }

        .statusLabel {
          color: #718095;

          font-size: 8px;

          letter-spacing: 1px;
        }

        .statusValue {
          margin-top: 6px;

          color: #3be1b6;

          font-size: 17px;
          font-weight: 900;
        }

        .certificateTitle {
          position: relative;

          padding:
            35px
            0
            30px;

          text-align: center;
        }

        .certificateTitle .small {
          color: #5b9fff;

          font-size: 9px;
          font-weight: 900;

          letter-spacing: 1.6px;
        }

        .certificateTitle h2 {
          margin:
            10px
            0
            8px;

          font-size: 31px;

          letter-spacing: -1px;
        }

        .certificateTitle p {
          margin: 0;

          color: #79879a;

          font-size: 12px;
        }

        .certNumber {
          display: inline-block;

          margin-top: 18px;

          padding: 11px 16px;

          border-radius: 10px;

          color: #63a6ff;

          background:
            rgba(20, 118, 255, 0.07);

          border:
            1px solid
            rgba(20, 118, 255, 0.14);

          font-family: monospace;

          font-size: 15px;
          font-weight: 800;
        }

        .productIdentity {
          position: relative;

          display: grid;

          grid-template-columns:
            60px
            minmax(0, 1fr)
            auto;

          align-items: center;

          gap: 16px;

          margin-bottom: 25px;

          padding: 18px;

          border-radius: 15px;

          background:
            rgba(255, 255, 255, 0.025);

          border:
            1px solid
            rgba(255, 255, 255, 0.07);
        }

        .productIcon {
          width: 55px;
          height: 55px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 14px;

          color: white;

          background:
            linear-gradient(
              135deg,
              #1476ff,
              #00cfaa
            );

          font-size: 18px;
        }

        .label {
          color: #718095;

          font-size: 8px;

          letter-spacing: 1px;
        }

        .productIdentity h3 {
          margin:
            5px
            0
            4px;

          font-size: 17px;
        }

        .productIdentity p {
          margin: 0;

          color: #758296;

          font-size: 10px;
        }

        .auth {
          padding: 8px 11px;

          border-radius: 100px;

          color: #3be1b6;

          background:
            rgba(36, 224, 176, 0.07);

          border:
            1px solid
            rgba(36, 224, 176, 0.17);

          font-size: 9px;
          font-weight: 900;

          white-space: nowrap;
        }

        .dataGrid {
          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 10px;
        }

        .dataItem {
          padding: 14px;

          border-radius: 11px;

          background:
            rgba(255, 255, 255, 0.022);

          border:
            1px solid
            rgba(255, 255, 255, 0.055);
        }

        .dataItem span {
          display: block;

          color: #657286;

          font-size: 8px;

          letter-spacing: 0.7px;
        }

        .dataItem strong {
          display: block;

          margin-top: 6px;

          font-size: 11px;
        }

        .valid {
          color: #3be1b6;
        }

        .verification {
          position: relative;

          margin-top: 25px;

          padding: 20px;

          display: grid;

          grid-template-columns:
            90px
            minmax(0, 1fr);

          gap: 20px;

          align-items: center;

          border-radius: 15px;

          background:
            linear-gradient(
              120deg,
              rgba(20, 118, 255, 0.08),
              rgba(0, 207, 170, 0.05)
            );

          border:
            1px solid
            rgba(68, 151, 255, 0.14);
        }

        .qr {
          width: 86px;
          height: 86px;

          padding: 8px;

          display: grid;

          grid-template-columns:
            repeat(7, 1fr);

          gap: 2px;

          border-radius: 8px;

          background: white;
        }

        .qrCell {
          border-radius: 1px;

          background: #090b0f;
        }

        .qrCell.white {
          background: white;
        }

        .verification h3 {
          margin:
            6px
            0
            7px;

          font-size: 16px;
        }

        .verification p {
          margin: 0;

          color: #7f8c9e;

          font-size: 11px;
          line-height: 1.5;
        }

        .hash {
          margin-top: 10px;

          color: #5d6b7d;

          font-family: monospace;

          font-size: 8px;

          word-break: break-all;
        }

        .signature {
          margin-top: 30px;

          display: flex;
          align-items: flex-end;
          justify-content: space-between;

          gap: 20px;

          padding-top: 22px;

          border-top:
            1px solid
            rgba(255, 255, 255, 0.07);
        }

        .signatureName {
          margin-top: 7px;

          font-size: 15px;
          font-weight: 900;

          letter-spacing: 1px;
        }

        .signatureText {
          margin-top: 4px;

          color: #687589;

          font-size: 9px;
        }

        .seal {
          width: 70px;
          height: 70px;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          color: #54a0ff;

          border:
            1px solid
            rgba(84, 160, 255, 0.3);

          background:
            rgba(20, 118, 255, 0.05);

          font-size: 8px;
          font-weight: 900;

          text-align: center;

          transform: rotate(-7deg);
        }

        .seal strong {
          display: block;

          margin-bottom: 2px;

          font-size: 17px;
        }

        .infoSection {
          max-width: 900px;

          margin:
            30px
            auto
            0;

          display: grid;

          grid-template-columns:
            repeat(3, 1fr);

          gap: 12px;
        }

        .infoCard {
          padding: 19px;

          border-radius: 15px;

          background:
            rgba(255, 255, 255, 0.025);

          border:
            1px solid
            rgba(255, 255, 255, 0.07);
        }

        .infoIcon {
          width: 35px;
          height: 35px;

          display: flex;
          align-items: center;
          justify-content: center;

          margin-bottom: 13px;

          border-radius: 10px;

          color: #61a5ff;

          background:
            rgba(20, 118, 255, 0.09);

          border:
            1px solid
            rgba(20, 118, 255, 0.15);
        }

        .infoCard strong {
          display: block;

          font-size: 12px;
        }

        .infoCard p {
          margin:
            6px
            0
            0;

          color: #718095;

          font-size: 10px;
          line-height: 1.5;
        }

        .actions {
          max-width: 900px;

          margin:
            30px
            auto
            0;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 12px;
        }

        .actionGroup {
          display: flex;
          gap: 10px;
        }

        .primary,
        .secondary {
          padding: 13px 18px;

          border-radius: 10px;

          color: white;

          font-weight: 800;

          cursor: pointer;
        }

        .primary {
          border: 0;

          background: #1478ff;
        }

        .secondary {
          background:
            rgba(255, 255, 255, 0.04);

          border:
            1px solid
            rgba(255, 255, 255, 0.1);
        }

        .note {
          max-width: 900px;

          margin:
            30px
            auto
            0;

          color: #566172;

          font-size: 9px;

          text-align: center;
        }

        @media (max-width: 750px) {
          .dataGrid {
            grid-template-columns: 1fr;
          }

          .infoSection {
            grid-template-columns: 1fr;
          }

          .productIdentity {
            grid-template-columns:
              55px
              1fr;
          }

          .auth {
            grid-column:
              1 / -1;

            width: fit-content;
          }

          .actions {
            flex-direction: column;
            align-items: stretch;
          }

          .actionGroup {
            width: 100%;
          }

          .primary,
          .secondary {
            flex: 1;
          }
        }

        @media (max-width: 520px) {
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
            font-size: 40px;
          }

          .certificateInner {
            padding:
              28px
              18px;
          }

          .certTop {
            flex-direction: column;
          }

          .status {
            text-align: left;
          }

          .verification {
            grid-template-columns: 1fr;
          }

          .qr {
            margin: auto;
          }

          .signature {
            align-items: flex-start;
          }

          .actionGroup {
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
            CERTIFICADO · DEMO
          </div>

          <button
            className="back"
            onClick={() =>
              router.push(
                '/demo/trazabilidad'
              )
            }
          >
            ← Volver
          </button>

        </div>

      </nav>

      <div className="container">

        <section className="hero">

          <div className="eyebrow">
            CERTIFICACIÓN DIGITAL
          </div>

          <h1>
            Certificado de
            <br />
            autenticidad.
          </h1>

          <p className="subtitle">
            Certificado digital asociado
            directamente a la identidad
            individual del producto y a sus
            registros en Vinculab.
          </p>

          <div className="validBadge">
            ✓ CERTIFICADO VÁLIDO
          </div>

        </section>

        <section className="certificate">

          <div className="certificateInner">

            <div className="glow" />

            <div className="certTop">

              <div className="certBrand">

                <div className="certLogo">
                  V
                </div>

                <div>

                  <div className="certBrandName">
                    VINCULAB
                  </div>

                  <div className="certType">
                    DIGITAL PRODUCT IDENTITY
                  </div>

                </div>

              </div>

              <div className="status">

                <div className="statusLabel">
                  ESTADO DEL CERTIFICADO
                </div>

                <div className="statusValue">
                  VÁLIDO ✓
                </div>

              </div>

            </div>

            <div className="certificateTitle">

              <div className="small">
                CERTIFICADO DIGITAL
              </div>

              <h2>
                Certificado de Autenticidad
              </h2>

              <p>
                Identidad individual
                verificada por Vinculab
              </p>

              <div className="certNumber">
                VIN-CERT-2026-000031
              </div>

            </div>

            <div className="productIdentity">

              <div className="productIcon">
                ◆
              </div>

              <div>

                <div className="label">
                  PRODUCTO CERTIFICADO
                </div>

                <h3>
                  Chaqueta Técnica Andes X1
                </h3>

                <p>
                  Andes Outdoor SpA · Chile
                </p>

              </div>

              <div className="auth">
                ✓ AUTÉNTICO
              </div>

            </div>

            <div className="dataGrid">

              {certificateData.map(
                ([label, value]) => (

                  <div
                    className="dataItem"
                    key={label}
                  >

                    <span>
                      {label.toUpperCase()}
                    </span>

                    <strong
                      className={
                        label === 'Estado'
                          ? 'valid'
                          : ''
                      }
                    >
                      {value}
                    </strong>

                  </div>

                )
              )}

            </div>

            <div className="verification">

              <div
                className="qr"
                aria-label="QR demostrativo"
              >
                {[
                  1,1,1,0,1,1,1,
                  1,0,1,0,1,0,1,
                  1,1,1,1,1,1,1,
                  0,0,1,0,1,0,0,
                  1,1,1,1,0,1,1,
                  1,0,0,1,1,0,1,
                  1,1,1,0,1,1,1,
                ].map((cell, index) => (
                  <div
                    key={index}
                    className={
                      cell
                        ? 'qrCell'
                        : 'qrCell white'
                    }
                  />
                ))}
              </div>

              <div>

                <div className="label">
                  VERIFICACIÓN DIGITAL
                </div>

                <h3>
                  Identidad confirmada
                </h3>

                <p>
                  Este certificado está
                  asociado a la identidad
                  digital CARR-000031.
                  La autenticidad puede
                  consultarse mediante los
                  identificadores NFC y QR
                  vinculados al producto.
                </p>

                <div className="hash">
                  REF:
                  VCL-CARR-000031-LT2026001-CERT
                </div>

              </div>

            </div>

            <div className="signature">

              <div>

                <div className="label">
                  CERTIFICACIÓN DIGITAL
                </div>

                <div className="signatureName">
                  VINCULAB
                </div>

                <div className="signatureText">
                  Plataforma de Identidad
                  Digital de Productos
                </div>

              </div>

              <div className="seal">
                <strong>
                  ✓
                </strong>

                IDENTIDAD
                <br />
                VERIFICADA
              </div>

            </div>

          </div>

        </section>

        <section className="infoSection">

          <div className="infoCard">

            <div className="infoIcon">
              ⌁
            </div>

            <strong>
              NFC + QR
            </strong>

            <p>
              Identificadores físicos
              vinculados a la identidad
              digital individual.
            </p>

          </div>

          <div className="infoCard">

            <div className="infoIcon">
              ◎
            </div>

            <strong>
              Pasaporte Digital
            </strong>

            <p>
              El producto dispone de
              información digital sobre
              fabricación, materiales y
              ciclo de vida.
            </p>

          </div>

          <div className="infoCard">

            <div className="infoIcon">
              ✓
            </div>

            <strong>
              Trazabilidad
            </strong>

            <p>
              Los principales eventos
              asociados a la identidad
              pueden consultarse desde
              Vinculab.
            </p>

          </div>

        </section>

        <div className="actions">

          <button
            className="secondary"
            onClick={() =>
              router.push('/demo')
            }
          >
            ← Volver a demostración
          </button>

          <div className="actionGroup">

            <button
              className="secondary"
              onClick={() =>
                router.push(
                  '/demo/dpp'
                )
              }
            >
              Ver DPP
            </button>

            <button
              className="primary"
              onClick={() =>
                router.push(
                  '/demo/trazabilidad'
                )
              }
            >
              Ver trazabilidad →
            </button>

          </div>

        </div>

        <div className="note">
          Certificado de demostración
          Vinculab · Los datos presentados
          son ficticios y se utilizan
          exclusivamente para demostrar
          las capacidades de la plataforma.
          Este documento no constituye
          una certificación oficial o
          regulatoria.
        </div>

      </div>

    </main>
  )
}
