'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  const goTo = (path: string) => {
    router.push(path)
    setMenuOpen(false)
  }

  return (
    <main>
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
          color: #ffffff;
        }

        button,
        a {
          font-family: inherit;
        }
      `}</style>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 70% 15%,
              rgba(31, 122, 255, 0.15),
              transparent 30%
            ),
            radial-gradient(
              circle at 20% 60%,
              rgba(0, 210, 170, 0.08),
              transparent 35%
            ),
            #07090d;
          overflow: hidden;
        }

        /* NAVBAR */

        .nav {
          height: 78px;
          max-width: 1240px;
          margin: auto;
          padding: 0 28px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 800;
          letter-spacing: 2px;
          font-size: 20px;
          cursor: pointer;
        }

        .brandIcon {
          width: 36px;
          height: 36px;
          border-radius: 10px;

          display: flex;
          align-items: center;
          justify-content: center;

          background: linear-gradient(135deg, #126bff, #00cfa6);
          box-shadow: 0 0 30px rgba(18, 107, 255, 0.3);

          font-size: 17px;
        }

        .links {
          display: flex;
          align-items: center;
          gap: 30px;
        }

        .links a {
          color: #aeb7c6;
          text-decoration: none;
          font-size: 14px;
          transition: 0.2s;
        }

        .links a:hover {
          color: white;
        }

        .loginButton {
          border: 1px solid rgba(255, 255, 255, 0.15);
          background: rgba(255, 255, 255, 0.05);
          color: white;

          padding: 10px 18px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
        }

        .loginButton:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .mobileButton {
          display: none;
          background: transparent;
          color: white;
          border: 0;
          font-size: 28px;
          cursor: pointer;
        }

        /* HERO */

        .hero {
          max-width: 1240px;
          margin: auto;
          min-height: 680px;

          padding: 90px 28px 70px;

          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          align-items: center;
          gap: 70px;
        }

        .tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;

          padding: 8px 13px;
          border-radius: 100px;

          background: rgba(17, 108, 255, 0.1);
          border: 1px solid rgba(52, 139, 255, 0.25);

          color: #69a9ff;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 24px;
        }

        .tagDot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #2be5b5;
          box-shadow: 0 0 12px #2be5b5;
        }

        h1 {
          font-size: clamp(46px, 6vw, 78px);
          line-height: 0.98;
          letter-spacing: -3px;
          margin: 0;
          max-width: 720px;
        }

        .gradientText {
          background: linear-gradient(90deg, #3788ff, #24e0b0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .subtitle {
          max-width: 640px;
          color: #9ca7b7;
          font-size: 19px;
          line-height: 1.7;
          margin-top: 28px;
        }

        .actions {
          display: flex;
          gap: 14px;
          margin-top: 36px;
          flex-wrap: wrap;
        }

        .primary {
          border: 0;
          color: white;
          font-weight: 700;
          font-size: 15px;
          padding: 15px 24px;
          border-radius: 11px;

          background: linear-gradient(135deg, #126bff, #087eff);
          box-shadow: 0 10px 35px rgba(18, 107, 255, 0.3);

          cursor: pointer;
        }

        .secondary {
          color: white;
          font-weight: 700;
          font-size: 15px;
          padding: 14px 24px;
          border-radius: 11px;

          border: 1px solid rgba(255, 255, 255, 0.13);
          background: rgba(255, 255, 255, 0.035);

          cursor: pointer;
        }

        .primary:hover,
        .secondary:hover {
          transform: translateY(-2px);
        }

        .trust {
          margin-top: 35px;
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          color: #778394;
          font-size: 13px;
        }

        .trust span {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .check {
          color: #2be5b5;
        }

        /* DIGITAL PRODUCT CARD */

        .visual {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .glow {
          position: absolute;
          width: 380px;
          height: 380px;
          border-radius: 50%;
          background: rgba(17, 108, 255, 0.17);
          filter: blur(90px);
        }

        .productCard {
          width: 100%;
          max-width: 470px;
          position: relative;
          z-index: 2;

          padding: 24px;

          border-radius: 24px;

          background: linear-gradient(
            145deg,
            rgba(24, 29, 39, 0.94),
            rgba(10, 13, 19, 0.95)
          );

          border: 1px solid rgba(255, 255, 255, 0.1);

          box-shadow:
            0 40px 100px rgba(0, 0, 0, 0.45),
            inset 0 1px 0 rgba(255, 255, 255, 0.04);
        }

        .cardTop {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .productIdentity {
          display: flex;
          gap: 13px;
          align-items: center;
        }

        .cube {
          width: 48px;
          height: 48px;
          border-radius: 13px;

          display: flex;
          align-items: center;
          justify-content: center;

          background: linear-gradient(135deg, #116cff, #00cfa6);
          font-size: 22px;
        }

        .smallLabel {
          color: #778394;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1.3px;
        }

        .productName {
          margin-top: 4px;
          font-weight: 700;
          font-size: 16px;
        }

        .verified {
          padding: 7px 10px;
          border-radius: 100px;
          background: rgba(36, 224, 176, 0.1);
          color: #37e6b9;
          border: 1px solid rgba(36, 224, 176, 0.2);
          font-size: 11px;
          font-weight: 800;
        }

        .identity {
          margin-top: 22px;
          padding: 17px;
          border-radius: 15px;
          background: rgba(255, 255, 255, 0.035);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .code {
          font-family: monospace;
          color: #62a6ff;
          margin-top: 7px;
          font-size: 16px;
        }

        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 12px;
        }

        .info {
          padding: 15px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.025);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .info strong {
          display: block;
          margin-top: 7px;
          font-size: 14px;
        }

        .scan {
          margin-top: 15px;
          padding: 17px;
          border-radius: 14px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          background: linear-gradient(
            90deg,
            rgba(18, 107, 255, 0.12),
            rgba(36, 224, 176, 0.08)
          );

          border: 1px solid rgba(44, 143, 255, 0.15);
        }

        .scanLeft {
          display: flex;
          gap: 11px;
          align-items: center;
        }

        .scanIcon {
          font-size: 23px;
        }

        .live {
          color: #36e4b7;
          font-size: 12px;
          font-weight: 800;
        }

        /* FEATURES */

        .features {
          max-width: 1240px;
          margin: auto;
          padding: 80px 28px 110px;
        }

        .sectionHeader {
          max-width: 700px;
          margin-bottom: 45px;
        }

        .sectionHeader h2 {
          font-size: clamp(32px, 4vw, 48px);
          letter-spacing: -1.5px;
          margin: 0;
        }

        .sectionHeader p {
          color: #8e99a9;
          font-size: 17px;
          line-height: 1.6;
        }

        .featureGrid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .feature {
          min-height: 190px;
          padding: 23px;
          border-radius: 18px;

          background: rgba(255, 255, 255, 0.025);
          border: 1px solid rgba(255, 255, 255, 0.07);
        }

        .featureIcon {
          font-size: 27px;
          margin-bottom: 28px;
        }

        .feature h3 {
          margin: 0 0 10px;
          font-size: 17px;
        }

        .feature p {
          color: #7f8a9a;
          font-size: 14px;
          line-height: 1.6;
          margin: 0;
        }

        /* CTA */

        .ctaWrapper {
          max-width: 1240px;
          margin: auto;
          padding: 0 28px 100px;
        }

        .cta {
          padding: 60px;
          border-radius: 25px;
          text-align: center;

          background:
            radial-gradient(
              circle at 50% 0%,
              rgba(25, 120, 255, 0.22),
              transparent 60%
            ),
            rgba(255, 255, 255, 0.025);

          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .cta h2 {
          margin: 0;
          font-size: 37px;
        }

        .cta p {
          color: #8e99a9;
          margin: 14px auto 28px;
          max-width: 600px;
          line-height: 1.6;
        }

        footer {
          border-top: 1px solid rgba(255, 255, 255, 0.07);
          padding: 28px;
          color: #697485;
          text-align: center;
          font-size: 13px;
        }

        /* MOBILE */

        @media (max-width: 900px) {
          .links {
            display: none;
          }

          .mobileButton {
            display: block;
          }

          .mobileMenu {
            position: absolute;
            z-index: 20;
            top: 78px;
            left: 18px;
            right: 18px;

            padding: 20px;
            border-radius: 15px;

            background: #11151d;
            border: 1px solid rgba(255, 255, 255, 0.1);

            display: flex;
            flex-direction: column;
            gap: 18px;
          }

          .mobileMenu a {
            color: white;
            text-decoration: none;
          }

          .hero {
            grid-template-columns: 1fr;
            padding-top: 65px;
            text-align: center;
          }

          .subtitle {
            margin-left: auto;
            margin-right: auto;
          }

          .actions,
          .trust {
            justify-content: center;
          }

          .visual {
            margin-top: 20px;
          }

          .featureGrid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 600px) {
          .nav {
            padding: 0 18px;
          }

          .hero {
            padding: 55px 18px 60px;
          }

          h1 {
            font-size: 46px;
            letter-spacing: -2px;
          }

          .subtitle {
            font-size: 16px;
          }

          .actions {
            flex-direction: column;
          }

          .primary,
          .secondary {
            width: 100%;
          }

          .featureGrid {
            grid-template-columns: 1fr;
          }

          .features {
            padding: 65px 18px;
          }

          .ctaWrapper {
            padding: 0 18px 70px;
          }

          .cta {
            padding: 40px 22px;
          }

          .cta h2 {
            font-size: 29px;
          }

          .grid {
            grid-template-columns: 1fr;
          }

          .productCard {
            padding: 18px;
          }
        }
      `}</style>

      <div className="page">

        {/* NAVBAR */}

        <nav className="nav">

          <div className="brand">
            <div className="brandIcon">V</div>
            VINCULAB
          </div>

          <div className="links">
            <a href="#soluciones">Soluciones</a>
            <a href="#tecnologia">Tecnología</a>
            <a href="/demo">Demo</a>

            <button
              className="loginButton"
              onClick={() => goTo('/login')}
            >
              Ingresar
            </button>
          </div>

          <button
            className="mobileButton"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>

          {menuOpen && (
            <div className="mobileMenu">
              <a href="#soluciones" onClick={() => setMenuOpen(false)}>
                Soluciones
              </a>

              <a href="#tecnologia" onClick={() => setMenuOpen(false)}>
                Tecnología
              </a>

              <a href="/demo">Demo</a>

              <button
                className="loginButton"
                onClick={() => goTo('/login')}
              >
                Ingresar
              </button>
            </div>
          )}

        </nav>

        {/* HERO */}

        <section className="hero">

          <div>

            <div className="tag">
              <span className="tagDot"></span>
              IDENTIDAD DIGITAL DE PRODUCTOS
            </div>

            <h1>
              Cada producto
              <br />
              merece una
              <br />
              <span className="gradientText">
                identidad digital.
              </span>
            </h1>

            <p className="subtitle">
              Vinculab conecta productos físicos con identidades digitales
              verificables mediante NFC, QR, trazabilidad y Pasaporte Digital
              de Producto.
            </p>

            <div className="actions">

              <button
                className="primary"
                onClick={() => goTo('/demo')}
              >
                Ver demostración →
              </button>

              <button
                className="secondary"
                onClick={() => goTo('/login')}
              >
                Acceso plataforma
              </button>

            </div>

            <div className="trust">
              <span>
                <b className="check">✓</b>
                NFC + QR
              </span>

              <span>
                <b className="check">✓</b>
                Trazabilidad
              </span>

              <span>
                <b className="check">✓</b>
                DPP
              </span>

              <span>
                <b className="check">✓</b>
                Verificación digital
              </span>
            </div>

          </div>

          {/* PRODUCT DIGITAL ID */}

          <div className="visual">

            <div className="glow"></div>

            <div className="productCard">

              <div className="cardTop">

                <div className="productIdentity">

                  <div className="cube">◆</div>

                  <div>
                    <div className="smallLabel">
                      IDENTIDAD DIGITAL
                    </div>

                    <div className="productName">
                      Producto Vinculado
                    </div>
                  </div>

                </div>

                <div className="verified">
                  ✓ AUTÉNTICO
                </div>

              </div>

              <div className="identity">

                <div className="smallLabel">
                  IDENTIFICADOR ÚNICO
                </div>

                <div className="code">
                  CARR-000031
                </div>

              </div>

              <div className="grid">

                <div className="info">
                  <div className="smallLabel">
                    PASAPORTE DIGITAL
                  </div>
                  <strong>Activo ✓</strong>
                </div>

                <div className="info">
                  <div className="smallLabel">
                    TRAZABILIDAD
                  </div>
                  <strong>Verificada ✓</strong>
                </div>

                <div className="info">
                  <div className="smallLabel">
                    IDENTIFICACIÓN
                  </div>
                  <strong>NFC + QR</strong>
                </div>

                <div className="info">
                  <div className="smallLabel">
                    ESTADO
                  </div>
                  <strong>Registrado</strong>
                </div>

              </div>

              <div className="scan">

                <div className="scanLeft">
                  <div className="scanIcon">◉</div>

                  <div>
                    <div className="smallLabel">
                      ÚLTIMA VERIFICACIÓN
                    </div>

                    <strong>Producto verificado</strong>
                  </div>
                </div>

                <div className="live">
                  ● LIVE
                </div>

              </div>

            </div>

          </div>

        </section>

        {/* SOLUTIONS */}

        <section
          className="features"
          id="soluciones"
        >

          <div className="sectionHeader">

            <div className="tag">
              PLATAFORMA VINCULAB
            </div>

            <h2>
              Del producto físico a su identidad digital
            </h2>

            <p>
              Una infraestructura para identificar, autenticar y seguir
              productos durante todo su ciclo de vida.
            </p>

          </div>

          <div
            className="featureGrid"
            id="tecnologia"
          >

            <div className="feature">
              <div className="featureIcon">◈</div>
              <h3>NFC + QR</h3>
              <p>
                Cada unidad obtiene un identificador digital único conectado
                directamente con el producto físico.
              </p>
            </div>

            <div className="feature">
              <div className="featureIcon">◎</div>
              <h3>Pasaporte Digital</h3>
              <p>
                Información estructurada del producto disponible durante todo
                su ciclo de vida.
              </p>
            </div>

            <div className="feature">
              <div className="featureIcon">⌁</div>
              <h3>Trazabilidad</h3>
              <p>
                Registra eventos y movimientos desde la fabricación hasta las
                verificaciones posteriores.
              </p>
            </div>

            <div className="feature">
              <div className="featureIcon">✓</div>
              <h3>Autenticidad</h3>
              <p>
                Permite verificar la identidad de cada producto mediante una
                experiencia digital accesible desde cualquier teléfono.
              </p>
            </div>

          </div>

        </section>

        {/* CTA */}

        <section className="ctaWrapper">

          <div className="cta">

            <h2>
              Conoce Vinculab en funcionamiento
            </h2>

            <p>
              Recorre una demostración completa desde la creación del producto
              hasta su identificación mediante NFC y QR.
            </p>

            <button
              className="primary"
              onClick={() => goTo('/demo')}
            >
              Iniciar demostración →
            </button>

          </div>

        </section>

        <footer>
          © {new Date().getFullYear()} Vinculab · Plataforma de Identidad
          Digital de Productos
        </footer>

      </div>
    </main>
  )
}
