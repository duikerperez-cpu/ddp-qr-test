'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const steps = [
  { id: 1, title: 'Empresa', icon: '◆', eyebrow: 'EMPRESA DEMO', heading: 'Andes Outdoor SpA', description: 'Empresa ficticia incorporada a Vinculab para administrar la identidad digital y trazabilidad de sus productos.' },
  { id: 2, title: 'Producto', icon: '◈', eyebrow: 'PRODUCTO', heading: 'Chaqueta Técnica Andes X1', description: 'Producto registrado dentro del ecosistema Vinculab y asociado a su fabricante.' },
  { id: 3, title: 'Lote', icon: '▦', eyebrow: 'LOTE DE PRODUCCIÓN', heading: 'LT-2026-001', description: 'El producto se vincula a su lote de fabricación para mantener trazabilidad desde su origen.' },
  { id: 4, title: 'Unidad', icon: '◇', eyebrow: 'IDENTIDAD ÚNICA', heading: 'CARR-000031', description: 'Cada unidad física recibe una identidad digital individual y verificable.' },
  { id: 5, title: 'NFC + QR', icon: '⌁', eyebrow: 'IDENTIFICADOR FÍSICO', heading: 'NFC + QR vinculados', description: 'La identidad digital se conecta con el producto físico mediante NFC y código QR.' },
  { id: 6, title: 'Verificación', icon: '✓', eyebrow: 'VERIFICACIÓN', heading: 'Producto auténtico', description: 'El usuario escanea el producto y Vinculab verifica inmediatamente su identidad digital.' },
  { id: 7, title: 'DPP', icon: '◎', eyebrow: 'PASAPORTE DIGITAL', heading: 'Digital Product Passport', description: 'Información estructurada del producto disponible durante todo su ciclo de vida.' },
  { id: 8, title: 'Trazabilidad', icon: '↗', eyebrow: 'HISTORIAL DIGITAL', heading: 'Trazabilidad completa', description: 'Los principales eventos del producto quedan asociados a su identidad digital.' },
]

type ScanStage = 'idle' | 'approach' | 'detected' | 'verifying' | 'verified' | 'profile'

export default function DemoPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [scans, setScans] = useState(24)
  const [lastScan, setLastScan] = useState('Hoy · 01:52')
  const [scanStage, setScanStage] = useState<ScanStage>('idle')
  const [phoneOpen, setPhoneOpen] = useState(false)

  const current = steps[step - 1]
  const scanning = !['idle', 'profile'].includes(scanStage)

  useEffect(() => {
    if (!phoneOpen || scanStage === 'idle' || scanStage === 'profile') return

    const delays: Record<Exclude<ScanStage, 'idle' | 'profile'>, number> = {
      approach: 900,
      detected: 850,
      verifying: 1200,
      verified: 1100,
    }

    const nextStage: Record<Exclude<ScanStage, 'idle' | 'profile'>, ScanStage> = {
      approach: 'detected',
      detected: 'verifying',
      verifying: 'verified',
      verified: 'profile',
    }

    const timer = window.setTimeout(() => {
      if (scanStage === 'verifying') {
        setScans((value) => value + 1)
        setLastScan('Ahora')
        setStep(6)
      }
      setScanStage(nextStage[scanStage as Exclude<ScanStage, 'idle' | 'profile'>])
    }, delays[scanStage as Exclude<ScanStage, 'idle' | 'profile'>])

    return () => window.clearTimeout(timer)
  }, [phoneOpen, scanStage])

  const simulateScan = () => {
    if (scanning) return
    setPhoneOpen(true)
    setScanStage('approach')
  }

  const closePhone = () => {
    setPhoneOpen(false)
    setScanStage('idle')
  }

  const resetDemo = () => {
    setStep(1)
    setScans(24)
    setLastScan('Hoy · 01:52')
    closePhone()
  }

  return (
    <main className="page">
      <style jsx global>{`
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; background: #07090d; color: white; }
        button { font-family: inherit; }
      `}</style>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background:
            radial-gradient(circle at 75% 12%, rgba(24,112,255,.13), transparent 28%),
            radial-gradient(circle at 12% 85%, rgba(0,213,170,.07), transparent 30%),
            #07090d;
        }
        .nav {
          max-width: 1360px; height: 66px; padding: 0 24px; margin: auto;
          display: flex; align-items: center; justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,.07);
        }
        .brand { display:flex; align-items:center; gap:10px; font-size:18px; font-weight:900; letter-spacing:2px; cursor:pointer; }
        .logo { width:34px; height:34px; display:flex; align-items:center; justify-content:center; border-radius:10px; background:linear-gradient(135deg,#1476ff,#00cfaa); }
        .navRight { display:flex; align-items:center; gap:12px; }
        .demoBadge { padding:6px 10px; border-radius:100px; color:#ffcf70; background:rgba(255,177,40,.08); border:1px solid rgba(255,177,40,.2); font-size:10px; font-weight:800; letter-spacing:.8px; }
        .exit { padding:8px 14px; border-radius:9px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.1); color:white; cursor:pointer; }
        .progress { height:3px; max-width:1360px; margin:auto; background:rgba(255,255,255,.06); }
        .progressFill { height:100%; background:linear-gradient(90deg,#1676ff,#20ddb2); transition:width .35s ease; }
        .container { max-width:1360px; margin:auto; padding:25px 24px 40px; }
        .intro { display:flex; justify-content:space-between; align-items:end; gap:20px; margin-bottom:18px; }
        .introTag,.eyebrow { color:#5aa0ff; font-size:10px; font-weight:900; letter-spacing:1.4px; }
        h1 { font-size:clamp(28px,3vw,40px); letter-spacing:-1.5px; margin:5px 0 0; }
        .intro p { color:#8e99a9; line-height:1.5; max-width:680px; margin:7px 0 0; font-size:14px; }
        .progressText { color:#788496; font-size:12px; white-space:nowrap; }
        .steps { display:grid; grid-template-columns:repeat(8,1fr); gap:6px; margin-bottom:14px; }
        .step { padding:8px 6px; background:rgba(255,255,255,.025); border:1px solid rgba(255,255,255,.07); border-radius:9px; color:#697587; cursor:pointer; text-align:center; transition:.2s; }
        .step:hover { border-color:rgba(58,145,255,.35); }
        .stepActive { background:rgba(24,112,255,.11); border-color:rgba(41,134,255,.4); color:white; }
        .stepDone { color:#38dfb5; }
        .stepIcon { display:inline-block; font-size:13px; margin-right:5px; }
        .stepTitle { font-size:9px; font-weight:800; }
        .workspace { display:grid; grid-template-columns:minmax(0,1fr) 365px; gap:14px; align-items:start; }
        .mainCard,.sideCard { border-radius:18px; background:linear-gradient(145deg,rgba(22,27,37,.92),rgba(10,13,19,.95)); border:1px solid rgba(255,255,255,.08); }
        .mainCard { min-height:440px; padding:27px; display:flex; flex-direction:column; justify-content:space-between; }
        .stepNumber { width:48px; height:48px; display:flex; align-items:center; justify-content:center; border-radius:14px; background:linear-gradient(135deg,#126fff,#00cda7); font-size:21px; margin-bottom:22px; box-shadow:0 12px 35px rgba(18,111,255,.2); }
        .mainCard h2 { margin:8px 0 9px; font-size:clamp(27px,3.2vw,39px); letter-spacing:-1.3px; }
        .description { max-width:720px; color:#9ba6b5; line-height:1.55; font-size:14px; }
        .detailBox { margin-top:18px; max-width:720px; padding:15px; border-radius:13px; background:rgba(255,255,255,.025); border:1px solid rgba(255,255,255,.07); }
        .detailLabel,.sideTitle { color:#707d90; font-size:9px; font-weight:900; letter-spacing:1.3px; }
        .detailValue { margin-top:6px; font-weight:700; font-size:14px; }
        .authentic { display:inline-flex; align-items:center; gap:8px; margin-top:14px; padding:8px 12px; border-radius:100px; color:#39e4b8; background:rgba(33,221,175,.08); border:1px solid rgba(33,221,175,.18); font-size:11px; font-weight:800; }
        .navigation { margin-top:24px; display:flex; justify-content:space-between; gap:10px; }
        .back,.next { padding:11px 18px; border-radius:9px; cursor:pointer; font-weight:700; }
        .back { color:white; background:rgba(255,255,255,.035); border:1px solid rgba(255,255,255,.09); }
        .back:disabled { opacity:.3; cursor:default; }
        .next { color:white; border:0; background:#1478ff; }
        .side { display:flex; flex-direction:column; gap:10px; }
        .sideCard { padding:17px; }
        .sideTitle { margin-bottom:12px; }
        .product { display:flex; align-items:center; gap:10px; padding-bottom:12px; border-bottom:1px solid rgba(255,255,255,.07); }
        .productIcon { width:39px; height:39px; display:flex; align-items:center; justify-content:center; border-radius:11px; background:linear-gradient(135deg,#1476ff,#00cfaa); }
        .muted { color:#778497; font-size:9px; }
        .product strong { display:block; margin-top:3px; font-size:13px; }
        .dataRow { display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid rgba(255,255,255,.055); font-size:11px; }
        .dataRow:last-child { border-bottom:0; }
        .dataRow span { color:#778497; }
        .green { color:#38dfb5; }
        .scanButton { width:100%; padding:12px; margin-top:11px; border-radius:10px; border:1px solid rgba(31,219,173,.22); background:linear-gradient(90deg,rgba(17,112,255,.16),rgba(31,219,173,.11)); color:white; font-weight:800; cursor:pointer; font-size:12px; }
        .scanButton:hover { border-color:rgba(31,219,173,.5); }
        .event { display:grid; grid-template-columns:14px 1fr; gap:8px; padding-bottom:11px; }
        .event:last-child { padding-bottom:0; }
        .eventDot { width:8px; height:8px; margin-top:3px; border-radius:50%; background:#2482ff; box-shadow:0 0 8px rgba(36,130,255,.5); }
        .event strong { display:block; font-size:10px; margin-bottom:2px; }
        .event span { color:#707d90; font-size:9px; }
        .live { display:inline-block; width:6px; height:6px; background:#31e1b4; border-radius:50%; margin-right:5px; box-shadow:0 0 10px #31e1b4; }
        .bottomNote { margin-top:12px; text-align:center; color:#5e6979; font-size:9px; }

        /* PHONE EXPERIENCE */
        .overlay {
          position:fixed; inset:0; z-index:100; display:flex; align-items:center; justify-content:center;
          padding:20px; background:rgba(2,5,9,.84); backdrop-filter:blur(12px);
          animation:fadeIn .25s ease;
        }
        .experience {
          width:min(920px,100%); min-height:600px; border-radius:28px; overflow:hidden;
          display:grid; grid-template-columns:1fr 370px;
          background:linear-gradient(145deg,#111722,#070a0f);
          border:1px solid rgba(255,255,255,.12);
          box-shadow:0 40px 120px rgba(0,0,0,.65);
        }
        .experienceInfo { padding:46px; display:flex; flex-direction:column; justify-content:center; position:relative; overflow:hidden; }
        .experienceInfo:before { content:''; position:absolute; width:360px; height:360px; border-radius:50%; background:rgba(20,118,255,.13); filter:blur(70px); top:50px; left:60px; }
        .experienceInfo > * { position:relative; z-index:1; }
        .experienceTag { color:#5aa0ff; font-size:10px; font-weight:900; letter-spacing:1.5px; }
        .experienceInfo h2 { font-size:38px; letter-spacing:-1.5px; margin:10px 0 12px; }
        .experienceInfo p { color:#8f9aaa; line-height:1.6; max-width:420px; font-size:14px; }
        .nfcWaves { width:170px; height:170px; position:relative; margin:35px 0 10px; display:flex; align-items:center; justify-content:center; }
        .nfcCore { width:54px; height:54px; border-radius:17px; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,#1476ff,#00d2a8); font-size:22px; z-index:2; box-shadow:0 0 35px rgba(25,130,255,.4); }
        .wave { position:absolute; border:1px solid rgba(52,155,255,.4); border-radius:50%; animation:pulse 1.8s infinite; }
        .wave1 { width:85px; height:85px; }
        .wave2 { width:125px; height:125px; animation-delay:.35s; }
        .wave3 { width:165px; height:165px; animation-delay:.7s; }
        .stageText { color:#38dfb5; font-weight:800; font-size:13px; min-height:22px; }
        .close { position:absolute; top:18px; right:18px; width:36px; height:36px; border-radius:50%; background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1); color:white; cursor:pointer; z-index:5; }

        .phoneArea { display:flex; align-items:center; justify-content:center; padding:25px; background:rgba(255,255,255,.018); border-left:1px solid rgba(255,255,255,.07); }
        .phone {
          width:292px; height:560px; border-radius:42px; padding:10px; position:relative;
          background:#020304; border:1px solid #313946; box-shadow:0 30px 70px rgba(0,0,0,.55);
          transform:translateY(0); animation:phoneIn .45s ease;
        }
        .phone:before { content:''; position:absolute; width:82px; height:22px; border-radius:0 0 14px 14px; background:#020304; left:50%; transform:translateX(-50%); top:8px; z-index:5; }
        .screen { height:100%; border-radius:34px; overflow:hidden; background:#090d13; position:relative; }
        .phoneStatus { height:35px; padding:11px 17px 0; display:flex; justify-content:space-between; font-size:8px; color:#a9b3c0; }
        .phoneContent { padding:14px; }
        .phoneBrand { display:flex; align-items:center; gap:7px; font-size:10px; font-weight:900; letter-spacing:1px; }
        .miniLogo { width:24px; height:24px; display:flex; align-items:center; justify-content:center; border-radius:7px; background:linear-gradient(135deg,#1476ff,#00cfaa); font-size:9px; }
        .phoneHero { margin-top:18px; padding:17px; border-radius:17px; background:linear-gradient(145deg,rgba(24,112,255,.15),rgba(0,207,170,.07)); border:1px solid rgba(60,145,255,.16); }
        .phoneEyebrow { color:#73849a; font-size:7px; font-weight:800; letter-spacing:1px; }
        .phoneHero h3 { margin:6px 0; font-size:18px; line-height:1.15; }
        .verifiedBadge { display:inline-flex; padding:6px 8px; margin-top:7px; border-radius:100px; background:rgba(36,224,176,.09); border:1px solid rgba(36,224,176,.18); color:#3be1b6; font-size:8px; font-weight:900; }
        .phoneGrid { display:grid; grid-template-columns:1fr 1fr; gap:7px; margin-top:9px; }
        .phoneBox { padding:10px; border-radius:11px; background:rgba(255,255,255,.035); border:1px solid rgba(255,255,255,.06); }
        .phoneBox span { display:block; color:#6f7c8d; font-size:7px; margin-bottom:5px; }
        .phoneBox strong { font-size:9px; }
        .phoneAction { width:100%; margin-top:9px; padding:10px; border:0; border-radius:10px; color:white; font-size:9px; font-weight:800; background:#1478ff; cursor:pointer; }
        .scanScreen { height:450px; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:25px; }
        .scanCircle { width:80px; height:80px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:28px; background:rgba(20,120,255,.1); border:1px solid rgba(40,140,255,.25); margin-bottom:18px; animation:softPulse 1.3s infinite; }
        .scanScreen h3 { font-size:17px; margin:0 0 8px; }
        .scanScreen p { color:#7d8999; font-size:10px; line-height:1.5; margin:0; }
        .successCircle { background:rgba(36,224,176,.1); border-color:rgba(36,224,176,.3); color:#38dfb5; animation:none; }
        .spinner { width:30px; height:30px; border:3px solid rgba(255,255,255,.1); border-top-color:#2582ff; border-radius:50%; animation:spin .8s linear infinite; }
        .phoneFooter { position:absolute; bottom:9px; left:50%; transform:translateX(-50%); width:95px; height:4px; border-radius:100px; background:rgba(255,255,255,.28); }

        @keyframes pulse { 0%{transform:scale(.75);opacity:.9} 100%{transform:scale(1.15);opacity:0} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes phoneIn { from{transform:translateY(25px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes softPulse { 50%{box-shadow:0 0 35px rgba(20,120,255,.18)} }

        @media (max-width:950px) {
          .workspace { grid-template-columns:1fr; }
          .steps { overflow-x:auto; display:flex; padding-bottom:4px; }
          .step { min-width:100px; }
          .experience { grid-template-columns:1fr 330px; }
          .experienceInfo { padding:30px; }
        }
        @media (max-width:700px) {
          .experience { display:block; min-height:auto; max-height:95vh; overflow:auto; }
          .experienceInfo { padding:28px 24px 20px; text-align:center; align-items:center; }
          .experienceInfo h2 { font-size:27px; }
          .nfcWaves { width:110px; height:110px; margin:18px 0 5px; }
          .wave1 { width:60px;height:60px }.wave2{width:85px;height:85px}.wave3{width:110px;height:110px}
          .phoneArea { border-left:0; border-top:1px solid rgba(255,255,255,.07); padding:18px; }
          .phone { width:260px; height:500px; }
        }
        @media (max-width:600px) {
          .nav { padding:0 15px; }
          .demoBadge { display:none; }
          .container { padding:22px 15px 35px; }
          .intro { display:block; }
          .progressText { margin-top:10px; }
          .mainCard { padding:22px 18px; min-height:410px; }
          .navigation { flex-direction:column-reverse; }
          .back,.next { width:100%; }
        }
      `}</style>

      <nav className="nav">
        <div className="brand" onClick={() => router.push('/')}>
          <div className="logo">V</div>VINCULAB
        </div>
        <div className="navRight">
          <div className="demoBadge">DEMO · DATOS DE DEMOSTRACIÓN</div>
          <button className="exit" onClick={() => router.push('/')}>Salir del demo</button>
        </div>
      </nav>

      <div className="progress">
        <div className="progressFill" style={{ width: `${(step / steps.length) * 100}%` }} />
      </div>

      <div className="container">
        <div className="intro">
          <div>
            <div className="introTag">DEMOSTRACIÓN INTERACTIVA</div>
            <h1>Así funciona Vinculab</h1>
            <p>Sigue el recorrido de un producto físico desde su registro hasta su identificación, verificación y trazabilidad digital.</p>
          </div>
          <div className="progressText">Paso {step} de {steps.length}</div>
        </div>

        <div className="steps">
          {steps.map((item) => (
            <button key={item.id} className={`step ${step === item.id ? 'stepActive' : ''} ${step > item.id ? 'stepDone' : ''}`} onClick={() => setStep(item.id)}>
              <span className="stepIcon">{step > item.id ? '✓' : item.icon}</span>
              <span className="stepTitle">{item.title}</span>
            </button>
          ))}
        </div>

        <div className="workspace">
          <section className="mainCard">
            <div>
              <div className="stepNumber">{current.icon}</div>
              <div className="eyebrow">{current.eyebrow}</div>
              <h2>{current.heading}</h2>
              <div className="description">{current.description}</div>

              {step === 1 && <div className="detailBox"><div className="detailLabel">ORGANIZACIÓN</div><div className="detailValue">Andes Outdoor SpA · Chile</div></div>}
              {step === 2 && <div className="detailBox"><div className="detailLabel">PRODUCTO REGISTRADO</div><div className="detailValue">Chaqueta Técnica Andes X1</div></div>}
              {step === 3 && <div className="detailBox"><div className="detailLabel">FABRICACIÓN</div><div className="detailValue">Lote LT-2026-001 · 250 unidades</div></div>}
              {step === 4 && <div className="detailBox"><div className="detailLabel">IDENTIFICADOR VINCULAB</div><div className="detailValue" style={{color:'#5ca2ff',fontFamily:'monospace'}}>CARR-000031</div></div>}
              {step === 5 && <>
                <div className="detailBox"><div className="detailLabel">TECNOLOGÍA ASOCIADA</div><div className="detailValue">NFC + Código QR</div></div>
                <div className="authentic">✓ Identidad física vinculada</div>
              </>}
              {step === 6 && <>
                <div className="authentic">✓ PRODUCTO AUTÉNTICO</div>
                <div className="detailBox"><div className="detailLabel">RESULTADO DE VERIFICACIÓN</div><div className="detailValue">Identidad digital confirmada por Vinculab</div></div>
              </>}
              {step === 7 && <div className="detailBox"><div className="detailLabel">DIGITAL PRODUCT PASSPORT</div><div className="detailValue">Estado: Activo · Información del producto disponible</div></div>}
              {step === 8 && <>
                <div className="detailBox"><div className="detailLabel">CICLO DIGITAL</div><div className="detailValue">Fabricación → Identificación → Activación → Verificación</div></div>
                <div className="authentic">✓ Trazabilidad verificada</div>
              </>}
            </div>

            <div className="navigation">
              <button className="back" disabled={step === 1} onClick={() => step > 1 && setStep(step - 1)}>← Anterior</button>
              {step < steps.length
                ? <button className="next" onClick={() => setStep(step + 1)}>Siguiente →</button>
                : <button className="next" onClick={resetDemo}>Reiniciar demo ↻</button>}
            </div>
          </section>

          <aside className="side">
            <div className="sideCard">
              <div className="sideTitle">PRODUCTO DEMOSTRACIÓN</div>
              <div className="product">
                <div className="productIcon">◆</div>
                <div><div className="muted">ANDES OUTDOOR</div><strong>Chaqueta Técnica X1</strong></div>
              </div>
              <div className="dataRow"><span>ID</span><strong>CARR-000031</strong></div>
              <div className="dataRow"><span>Lote</span><strong>LT-2026-001</strong></div>
              <div className="dataRow"><span>DPP</span><strong className="green">Activo ✓</strong></div>
              <div className="dataRow"><span>Identificación</span><strong>NFC + QR</strong></div>
              <div className="dataRow"><span>Estado</span><strong className="green">Auténtico ✓</strong></div>
              <button className="scanButton" onClick={simulateScan} disabled={scanning}>
                {scanning ? '◌ Verificando identidad...' : '◉ Simular escaneo NFC / QR'}
              </button>
            </div>

            <div className="sideCard">
              <div className="sideTitle">ACTIVIDAD DEL PRODUCTO</div>
              <div className="event"><div className="eventDot"/><div><strong>Producto registrado</strong><span>Identidad Vinculab creada</span></div></div>
              <div className="event"><div className="eventDot"/><div><strong>NFC + QR vinculados</strong><span>Identificador físico activado</span></div></div>
              <div className="event"><div className="eventDot"/><div><strong>Última verificación</strong><span>{lastScan}</span></div></div>
            </div>

            <div className="sideCard">
              <div className="dataRow"><span>Verificaciones</span><strong><span className="live"/>{scans}</strong></div>
              <div className="dataRow"><span>Estado sistema</span><strong className="green">Operativo</strong></div>
            </div>
          </aside>
        </div>

        <div className="bottomNote">Entorno demostrativo Vinculab · Los datos mostrados son ficticios y no corresponden a una empresa real.</div>
      </div>

      {phoneOpen && (
        <div className="overlay">
          <div className="experience">
            <button className="close" onClick={closePhone}>×</button>

            <section className="experienceInfo">
              <div className="experienceTag">EXPERIENCIA NFC + QR</div>
              <h2>Del producto físico a su identidad digital.</h2>
              <p>Vinculab conecta el identificador físico del producto con una identidad digital única, verificable y trazable.</p>

              <div className="nfcWaves">
                <div className="wave wave1"/>
                <div className="wave wave2"/>
                <div className="wave wave3"/>
                <div className="nfcCore">⌁</div>
              </div>

              <div className="stageText">
                {scanStage === 'approach' && 'Acercando producto al teléfono...'}
                {scanStage === 'detected' && 'NFC detectado · CARR-000031'}
                {scanStage === 'verifying' && 'Verificando identidad con Vinculab...'}
                {scanStage === 'verified' && '✓ Identidad confirmada · Producto auténtico'}
                {scanStage === 'profile' && '✓ Ficha digital del producto disponible'}
              </div>
            </section>

            <section className="phoneArea">
              <div className="phone">
                <div className="screen">
                  <div className="phoneStatus"><span>9:41</span><span>5G  ●</span></div>

                  {scanStage !== 'profile' ? (
                    <div className="scanScreen">
                      <div className={`scanCircle ${scanStage === 'verified' ? 'successCircle' : ''}`}>
                        {scanStage === 'verifying'
                          ? <div className="spinner"/>
                          : scanStage === 'verified'
                            ? '✓'
                            : scanStage === 'detected'
                              ? '⌁'
                              : '◉'}
                      </div>
                      <h3>
                        {scanStage === 'approach' && 'Acerca el producto'}
                        {scanStage === 'detected' && 'NFC detectado'}
                        {scanStage === 'verifying' && 'Verificando producto'}
                        {scanStage === 'verified' && 'Producto auténtico'}
                      </h3>
                      <p>
                        {scanStage === 'approach' && 'Acerca la etiqueta NFC del producto a la parte superior del teléfono.'}
                        {scanStage === 'detected' && 'Identificador CARR-000031 encontrado.'}
                        {scanStage === 'verifying' && 'Consultando la identidad digital y el estado del producto.'}
                        {scanStage === 'verified' && 'La identidad digital ha sido confirmada por Vinculab.'}
                      </p>
                    </div>
                  ) : (
                    <div className="phoneContent">
                      <div className="phoneBrand"><div className="miniLogo">V</div>VINCULAB</div>

                      <div className="phoneHero">
                        <div className="phoneEyebrow">IDENTIDAD DIGITAL</div>
                        <h3>Chaqueta Técnica Andes X1</h3>
                        <div className="phoneEyebrow">CARR-000031 · ANDES OUTDOOR</div>
                        <div className="verifiedBadge">✓ PRODUCTO AUTÉNTICO</div>
                      </div>

                      <div className="phoneGrid">
                        <div className="phoneBox"><span>DPP</span><strong className="green">Activo ✓</strong></div>
                        <div className="phoneBox"><span>LOTE</span><strong>LT-2026-001</strong></div>
                        <div className="phoneBox"><span>ORIGEN</span><strong>Chile</strong></div>
                        <div className="phoneBox"><span>ID</span><strong>NFC + QR</strong></div>
                      </div>

                      <button className="phoneAction" onClick={() => { closePhone(); setStep(7) }}>Ver Pasaporte Digital →</button>
                      <button className="phoneAction" style={{background:'rgba(255,255,255,.07)',border:'1px solid rgba(255,255,255,.08)'}} onClick={() => { closePhone(); setStep(8) }}>Ver trazabilidad →</button>
                    </div>
                  )}

                  <div className="phoneFooter"/>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}
    </main>
  )
}
