'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

const servicios = [
  { icon: '⌘', title: 'Software a medida', description: 'Plataformas web y aplicaciones adaptadas a los procesos reales de tu empresa.' },
  { icon: '✦', title: 'Inteligencia artificial', description: 'Asistentes, análisis de información y automatización inteligente de tareas.' },
  { icon: '▦', title: 'Gestión empresarial', description: 'Control de producción, calidad, inventarios, personal e indicadores.' },
  { icon: '◇', title: 'Identidad digital', description: 'Trazabilidad, verificación y experiencias conectadas mediante QR y NFC.' },
]

const productos = [
  { number: '01', name: 'Vinculab Producción', category: 'Industria', description: 'Control de órdenes de trabajo, procesos, calidad, horas hombre y materiales.', status: 'Piloto en desarrollo' },
  { number: '02', name: 'Vinculab Identidad', category: 'Trazabilidad', description: 'Identidad digital de productos, QR, NFC y pasaportes digitales.', status: 'Demo disponible' },
  { number: '03', name: 'Vinculab Agua', category: 'Servicios', description: 'Lectura de medidores y registro digital para la gestión del servicio.', status: 'En diseño' },
  { number: '04', name: 'Vinculab Seguridad', category: 'Operaciones', description: 'Checklists, registros y seguimiento de controles operacionales.', status: 'En desarrollo' },
]

type ChatMessage = { role: 'bot' | 'user'; text: string }
const greeting = '¡Hola! Soy el asistente comercial de Vinculab. Puedo orientarte sobre nuestros servicios y ayudarte a preparar una cotización. ¿Qué necesitas?'
const choices = ['Software a medida', 'Producción y calidad', 'QR, NFC y trazabilidad', 'Automatización e IA', 'Solicitar cotización']
function answerFor(message: string): string {
  const t = message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  if (/precio|costo|valor|cotiza|presupuesto|cuanto|contratar/.test(t)) return 'Cada proyecto se cotiza según sus funciones, usuarios e integraciones. Cuéntame qué problema necesitas resolver y podemos preparar un correo con tus requerimientos para el equipo de Vinculab.'
  if (/produccion|maestranza|calidad|inventario|bodega|horas hombre/.test(t)) return 'Podemos desarrollar sistemas para órdenes de trabajo, avance de procesos, inspecciones de calidad, horas hombre, materiales e indicadores. ¿Qué proceso te gustaría digitalizar primero?'
  if (/qr|nfc|trazabilidad|identidad|pasaporte/.test(t)) return 'Vinculab trabaja con fichas digitales, códigos QR, etiquetas NFC, verificación e historial de trazabilidad. ¿Quieres identificar productos, equipos o personas?'
  if (/ia|inteligencia|automatiza|asistente|chatbot/.test(t)) return 'Podemos evaluar automatizaciones, asistentes virtuales e integración de IA con tus procesos. ¿Qué tarea repetitiva o consulta quieres automatizar?'
  if (/web|pagina|app|software|sistema|plataforma|desarrollo/.test(t)) return 'Desarrollamos plataformas web y software a medida para empresas. Para orientarte, cuéntame qué usuarios lo utilizarán y cuál es la función principal que necesitas.'
  if (/hola|buenas|ayuda/.test(t)) return greeting
  return 'Gracias por contarme. Para preparar una propuesta, sería útil saber qué hace tu empresa, qué problema deseas resolver y qué funciones esperas del sistema. Puedes seguir escribiendo o seleccionar “Preparar correo de cotización”.'
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'bot', text: greeting }])
  const [leadName, setLeadName] = useState('')
  const [leadCompany, setLeadCompany] = useState('')
  const [leadEmail, setLeadEmail] = useState('')
  const [leadDetails, setLeadDetails] = useState('')
  const [showLead, setShowLead] = useState(false)
  const chatEnd = useRef<HTMLDivElement>(null)
  useEffect(() => { if (chatOpen) chatEnd.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }) }, [messages, chatOpen, showLead])
  const sendMessage = (value: string) => {
    const clean = value.trim().slice(0, 1000)
    if (!clean) return
    setMessages(prev => [...prev, { role: 'user', text: clean }, { role: 'bot', text: answerFor(clean) }])
    setChatInput('')
    if (/cotiza|presupuesto|precio/i.test(clean)) setShowLead(true)
  }
  const prepareEmail = () => {
    const summary = messages.filter(m => m.role === 'user').map(m => `- ${m.text}`).join('\n')
    const body = `Nombre: ${leadName.trim()}\nEmpresa: ${leadCompany.trim()}\nCorreo: ${leadEmail.trim()}\n\nRequerimiento:\n${leadDetails.trim()}\n\nResumen de la conversación:\n${summary || 'Sin mensajes adicionales'}`
    const url = `mailto:contacto@vinculab.cl?subject=${encodeURIComponent('Solicitud de cotización - Vinculab')}&body=${encodeURIComponent(body)}`
    window.location.href = url
  }

  return (
    <main className="site">
      <header className="header">
        <div className="container nav">
          <Link href="/" className="brand" onClick={closeMenu} aria-label="Vinculab inicio">
            <span className="brandMark">V</span><span>VINCULAB</span>
          </Link>
          <nav className={`navLinks ${menuOpen ? 'open' : ''}`} aria-label="Navegación principal">
            <a href="#servicios" onClick={closeMenu}>Servicios</a>
            <a href="#soluciones" onClick={closeMenu}>Soluciones</a>
            <a href="#nosotros" onClick={closeMenu}>Nosotros</a>
            <Link href="/demo" onClick={closeMenu}>Demo</Link>
            <Link href="/login" className="access" onClick={closeMenu}>Ingresar</Link>
          </nav>
          <button className="menuButton" type="button" aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? '✕' : '☰'}</button>
        </div>
      </header>

      <section className="hero container">
        <div className="heroCopy">
          <div className="eyebrow"><span className="dot"/> TECNOLOGÍA PARA EMPRESAS QUE AVANZAN</div>
          <h1>Transformamos ideas en <span className="gradient">soluciones tecnológicas.</span></h1>
          <p className="lead">Desarrollamos software a medida, plataformas empresariales y herramientas inteligentes para digitalizar procesos, optimizar operaciones y hacer crecer tu negocio.</p>
          <div className="actions">
            <a className="btn primary" href="#contacto">Solicitar una cotización <span aria-hidden="true">↗</span></a>
            <a className="btn secondary" href="#soluciones">Explorar soluciones <span aria-hidden="true">→</span></a>
          </div>
          <div className="highlights"><span>✓ Desarrollo a medida</span><span>✓ Automatización e IA</span><span>✓ Soluciones escalables</span></div>
        </div>
        <div className="heroVisual" aria-label="Vista ilustrativa de un panel de gestión empresarial">
          <div className="halo"/>
          <div className="dashboard">
            <div className="dashTop"><div className="dashBrand"><span className="dashLogo">V</span><div><small>VINCULAB / PLATAFORMAS</small><strong>Centro de operaciones</strong></div></div><span className="sample">VISTA ILUSTRATIVA</span></div>
            <div className="dashBody">
              <div className="dashHeading"><div><small>VISIÓN GENERAL</small><h3>Todo conectado.</h3></div><span className="pulse">● Sistema digital</span></div>
              <div className="metrics"><div><small>PRODUCCIÓN</small><strong>Procesos</strong><span className="metricLine blue"/></div><div><small>CALIDAD</small><strong>Controles</strong><span className="metricLine green"/></div><div><small>GESTIÓN</small><strong>Indicadores</strong><span className="metricLine purple"/></div></div>
              <div className="chart"><div className="chartHeader"><span>Actividad operacional</span><small>Ejemplo visual</small></div><div className="bars">{[30,48,42,68,54,79,62,89,73,94,82,100].map((height, index) => <span key={index} style={{height: `${height}%`}} />)}</div><div className="chartFooter"><span>Procesos</span><span>Seguimiento digital</span></div></div>
              <div className="dashBottom"><span className="miniDot"/> Información centralizada <span className="dashBottomRight">Software · Datos · IA</span></div>
            </div>
          </div>
          <div className="floating"><span>✦</span><div><small>INNOVACIÓN APLICADA</small><strong>Soluciones para tu negocio</strong></div></div>
        </div>
      </section>

      <section id="servicios" className="section container">
        <div className="sectionIntro"><span className="overline">QUÉ HACEMOS</span><h2>La tecnología al servicio de <span className="gradient">tu operación.</span></h2><p>Diseñamos soluciones útiles, conectadas con las necesidades de cada empresa.</p></div>
        <div className="serviceGrid">{servicios.map(item => <article className="serviceCard" key={item.title}><span className="serviceIcon">{item.icon}</span><h3>{item.title}</h3><p>{item.description}</p></article>)}</div>
      </section>

      <section id="soluciones" className="section solutionsBand"><div className="container"><div className="sectionIntro"><span className="overline">ECOSISTEMA VINCULAB</span><h2>Soluciones propias. <span className="gradient">Problemas reales.</span></h2><p>Desarrollamos productos tecnológicos que pueden adaptarse a distintos sectores y empresas.</p></div><div className="productGrid">{productos.map(item => <article className="productCard" key={item.number}><div className="productTop"><span className="productNumber">{item.number} / {item.category}</span><span className="productStatus">{item.status}</span></div><div className="productSymbol">{item.number === '01' ? '▥' : item.number === '02' ? '◇' : item.number === '03' ? '≈' : '✳'}</div><h3>{item.name}</h3><p>{item.description}</p>{item.number === '02' && <Link href="/demo" className="productLink">Explorar demostración →</Link>}</article>)}</div></div></section>

      <section id="nosotros" className="section container about"><div><span className="overline">SOBRE VINCULAB</span><h2>Más que desarrollar código, <span className="gradient">creamos soluciones.</span></h2></div><div><p>Somos una empresa tecnológica chilena enfocada en el desarrollo de software a medida y productos digitales. Combinamos conocimiento de procesos operacionales, diseño y tecnología para convertir desafíos en herramientas prácticas.</p><p>Trabajamos con una visión de largo plazo: crear sistemas seguros, fáciles de usar y preparados para crecer junto a cada negocio.</p></div></section>

      <section id="contacto" className="contactWrap container"><div className="contact"><span className="overline">HABLEMOS DE TU PROYECTO</span><h2>¿Tienes una idea o un proceso que necesitas mejorar?</h2><p>Cuéntanos qué necesita tu empresa. Podemos evaluar una solución a medida y sus próximas etapas.</p><a className="btn primary" href="mailto:contacto@vinculab.cl?subject=Cotizaci%C3%B3n%20de%20software%20-%20Vinculab">Solicitar cotización por correo ↗</a><small>El botón abre tu aplicación de correo. Confirma que contacto@vinculab.cl sea una casilla activa antes de publicar.</small></div></section>

      <footer className="footer"><div className="container footerInner"><span><strong>VINCULAB</strong> · Tecnología que conecta ideas y soluciones</span><span>© {new Date().getFullYear()} Vinculab SpA · Chile</span></div></footer>

      {/* Asistente comercial gratuito: reglas locales, sin API ni almacenamiento de datos */}
      <div className="chatLayer">
        {chatOpen && <section className="chatPanel" role="dialog" aria-label="Asistente comercial Vinculab">
          <div className="chatHead"><span className="chatAvatar">V</span><div><strong>Vinculab · Asistente comercial</strong><small>Respuestas orientativas · Sin IA generativa</small></div><button type="button" className="chatClose" aria-label="Cerrar asistente" onClick={() => setChatOpen(false)}>✕</button></div>
          <div className="chatHistory" aria-live="polite">
            {messages.map((m, i) => <div key={i} className={`chatBubble ${m.role === 'user' ? 'fromUser' : 'fromBot'}`}>{m.text}</div>)}
            <div ref={chatEnd} />
          </div>
          {!showLead ? <>
            <div className="chatChoices">{choices.map(choice => <button key={choice} type="button" onClick={() => { if (choice === 'Solicitar cotización') { setShowLead(true); setMessages(prev => [...prev, {role:'user',text:choice},{role:'bot',text:'Completa los datos que quieras compartir y podrás enviar tu solicitud desde tu aplicación de correo.'}]) } else sendMessage(choice) }}>{choice}</button>)}</div>
            <form className="chatForm" onSubmit={e => { e.preventDefault(); sendMessage(chatInput) }}><input aria-label="Tu consulta" maxLength={1000} value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Escribe tu consulta..." /><button type="submit" disabled={!chatInput.trim()} aria-label="Enviar mensaje">➤</button></form>
          </> : <form className="leadForm" onSubmit={e => { e.preventDefault(); prepareEmail() }}>
            <strong>Preparar solicitud de cotización</strong>
            <input aria-label="Nombre" placeholder="Tu nombre *" value={leadName} maxLength={100} onChange={e => setLeadName(e.target.value)} required />
            <input aria-label="Empresa" placeholder="Empresa (opcional)" value={leadCompany} maxLength={120} onChange={e => setLeadCompany(e.target.value)} />
            <input aria-label="Correo electrónico" type="email" placeholder="Tu correo *" value={leadEmail} maxLength={150} onChange={e => setLeadEmail(e.target.value)} required />
            <textarea aria-label="Requerimiento" placeholder="¿Qué necesitas desarrollar? *" rows={3} maxLength={2000} value={leadDetails} onChange={e => setLeadDetails(e.target.value)} required />
            <p>Al pulsar enviar se abrirá tu correo con la solicitud preparada. No se enviará automáticamente ni se guardará en esta web.</p>
            <div className="leadActions"><button type="button" onClick={() => setShowLead(false)}>Volver</button><button type="submit">Abrir correo ↗</button></div>
          </form>}
        </section>}
        <button className="chatLauncher" type="button" onClick={() => setChatOpen(v => !v)} aria-label={chatOpen ? 'Cerrar asistente comercial' : 'Abrir asistente comercial'} aria-expanded={chatOpen}><span>{chatOpen ? '✕' : '✦'}</span><span className="launcherText">¿Hablamos?</span></button>
      </div>

      <style jsx>{`
        .chatLayer{position:fixed;bottom:22px;right:22px;z-index:100;display:flex;flex-direction:column;align-items:flex-end;gap:12px}.chatLauncher{border:1px solid #4b95f9;border-radius:999px;background:linear-gradient(135deg,#126bff,#00bfa9);color:white;box-shadow:0 12px 35px #0009;cursor:pointer;padding:13px 18px;display:flex;align-items:center;gap:9px;font-weight:800}.chatLauncher>span:first-child{font-size:21px}.chatPanel{width:min(390px,calc(100vw - 24px));height:min(600px,calc(100dvh - 105px));display:flex;flex-direction:column;background:#101a2a;border:1px solid #355071;border-radius:18px;overflow:hidden;box-shadow:0 25px 70px #000b;color:#f5f8ff}.chatHead{display:flex;align-items:center;gap:10px;padding:15px;background:#17263b;border-bottom:1px solid #33455d}.chatAvatar{display:grid;place-items:center;background:linear-gradient(135deg,#137aff,#00c4ae);width:38px;height:38px;border-radius:11px;font-weight:900}.chatHead div{flex:1;min-width:0}.chatHead strong{display:block;font-size:13px}.chatHead small{display:block;color:#a6b8cc;font-size:10px;margin-top:4px}.chatClose{background:transparent;border:0;color:#c7d7e8;cursor:pointer;padding:8px}.chatHistory{padding:15px;flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:10px;overscroll-behavior:contain}.chatBubble{max-width:92%;font-size:13px;line-height:1.55;padding:11px 13px;border-radius:14px;white-space:pre-wrap;overflow-wrap:anywhere}.fromBot{align-self:flex-start;background:#20314a;border-bottom-left-radius:4px}.fromUser{align-self:flex-end;background:#126bdf;border-bottom-right-radius:4px}.chatChoices{padding:10px 12px 4px;display:flex;flex-wrap:wrap;gap:6px;border-top:1px solid #2d3d52}.chatChoices button{border:1px solid #3c628a;background:#15283f;color:#c5e5ff;border-radius:16px;font-size:11px;padding:7px 10px;cursor:pointer}.chatChoices button:hover{background:#21456a}.chatForm{display:flex;gap:8px;padding:10px 12px 13px}.chatForm input,.leadForm input,.leadForm textarea{background:#0c1523;border:1px solid #3c4f69;border-radius:9px;color:#fff;padding:11px;font:inherit;font-size:13px;min-width:0;outline-offset:2px}.chatForm input{flex:1}.chatForm button{background:#147bff;color:white;border:0;border-radius:9px;padding:0 15px;cursor:pointer}.chatForm button:disabled{opacity:.45;cursor:not-allowed}.leadForm{display:flex;flex-direction:column;gap:9px;padding:14px;overflow-y:auto;border-top:1px solid #33455d}.leadForm>strong{font-size:13px}.leadForm textarea{resize:vertical}.leadForm p{color:#a9bad0;font-size:11px;line-height:1.45;margin:2px 0}.leadActions{display:flex;gap:8px}.leadActions button{flex:1;border:1px solid #3c628a;background:#1b2e46;color:white;border-radius:9px;padding:11px;cursor:pointer;font-size:12px}.leadActions button:last-child{background:#126bff;border-color:#126bff;font-weight:700}
        @media(max-width:700px){.chatLayer{right:12px;bottom:12px}.chatPanel{height:min(600px,calc(100dvh - 88px))}.launcherText{font-size:12px}}
      `}</style>
      <style jsx global>{`
        *{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:#070b13;color:#f5f8ff;font-family:Arial,Helvetica,sans-serif}a{color:inherit;text-decoration:none}button{font:inherit}::selection{background:#127dff;color:white}
      `}</style>
      <style jsx>{`
        .site{overflow:hidden;background:radial-gradient(ellipse at 75% 9%,rgba(18,107,255,.15),transparent 28%),radial-gradient(ellipse at 10% 36%,rgba(0,208,181,.055),transparent 28%),#070b13;min-height:100vh}.container{max-width:1240px;margin:auto;padding-left:28px;padding-right:28px}.header{border-bottom:1px solid rgba(255,255,255,.08);position:relative;z-index:10;background:rgba(7,11,19,.85)}.nav{min-height:78px;display:flex;align-items:center;justify-content:space-between;gap:20px}.brand{display:flex;align-items:center;gap:12px;font-size:21px;letter-spacing:2px;font-weight:800}.brandMark,.dashLogo{display:grid;place-items:center;background:linear-gradient(135deg,#1678ff,#00cdb7);border-radius:11px;width:39px;height:39px;color:white;font-weight:900;letter-spacing:0}.navLinks{display:flex;align-items:center;gap:28px;color:#b2bed0;font-size:14px}.navLinks a:hover{color:#fff}.access{padding:11px 19px;border:1px solid #364252;border-radius:11px;color:white!important}.menuButton{display:none;background:none;border:0;color:white;font-size:26px;cursor:pointer}.hero{min-height:670px;padding-top:100px;padding-bottom:100px;display:grid;grid-template-columns:1.07fr .93fr;align-items:center;gap:50px}.eyebrow,.overline{font-size:12px;letter-spacing:1.4px;font-weight:800;color:#69b2ff}.eyebrow{display:inline-flex;align-items:center;gap:9px;padding:10px 14px;border:1px solid #1d426c;border-radius:50px;background:#0c1c31;letter-spacing:.6px}.dot,.miniDot{display:inline-block;width:7px;height:7px;border-radius:50%;background:#22dfba;box-shadow:0 0 14px #22dfba}.hero h1{font-size:clamp(45px,5.1vw,72px);line-height:1.04;letter-spacing:-3px;margin:27px 0 0;max-width:720px}.gradient{background:linear-gradient(95deg,#418cff,#21d4b5);background-clip:text;-webkit-background-clip:text;color:transparent}.lead{font-size:18px;line-height:1.75;color:#a9b7c9;max-width:620px;margin:27px 0 0}.actions{display:flex;gap:13px;flex-wrap:wrap;margin-top:33px}.btn{display:inline-flex;align-items:center;justify-content:center;gap:12px;border-radius:11px;padding:15px 21px;font-size:14px;font-weight:700;transition:transform .2s}.btn:hover{transform:translateY(-2px)}.primary{background:linear-gradient(120deg,#136fff,#0588e8);box-shadow:0 12px 32px #126bff30;color:white}.secondary{border:1px solid #354052;background:#ffffff08;color:white}.highlights{display:flex;flex-wrap:wrap;gap:18px;margin-top:30px;font-size:12px;color:#8fa3b8}.heroVisual{position:relative;min-width:0}.halo{position:absolute;inset:10%;background:#127aff35;filter:blur(95px);border-radius:50%}.dashboard{position:relative;background:linear-gradient(145deg,#192334,#0d131e);border:1px solid #334052;border-radius:22px;box-shadow:0 35px 95px #0009;overflow:hidden}.dashTop{padding:19px 21px;display:flex;justify-content:space-between;align-items:center;gap:10px;border-bottom:1px solid #ffffff12}.dashBrand{display:flex;gap:11px;align-items:center}.dashLogo{width:37px;height:37px}.dashBrand small,.dashBrand strong{display:block}.dashBrand small,.dashHeading small,.metrics small,.floating small{font-size:9px;color:#7f98b4;letter-spacing:1px}.dashBrand strong{font-size:13px;margin-top:5px}.sample{font-size:9px;color:#46d9bd;border:1px solid #1c665f;border-radius:20px;padding:7px;white-space:nowrap}.dashBody{padding:22px}.dashHeading{display:flex;justify-content:space-between;align-items:center;gap:10px}.dashHeading h3{font-size:24px;letter-spacing:-.6px;margin:6px 0 0}.pulse{font-size:10px;color:#3bdbb6}.metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:23px 0}.metrics>div{background:#ffffff07;border:1px solid #ffffff10;border-radius:13px;padding:14px 11px;min-width:0}.metrics strong{display:block;margin:10px 0;font-size:13px}.metricLine{height:4px;display:block;border-radius:10px}.blue{background:linear-gradient(90deg,#167aff 75%,#293b50 75%)}.green{background:linear-gradient(90deg,#24d4ad 85%,#293b50 85%)}.purple{background:linear-gradient(90deg,#a18cff 65%,#293b50 65%)}.chart{border:1px solid #ffffff12;background:#080f1c88;border-radius:14px;padding:17px}.chartHeader,.chartFooter{display:flex;justify-content:space-between;gap:8px}.chartHeader{font-size:12px;font-weight:700}.chartHeader small,.chartFooter{color:#778da6;font-size:10px}.bars{display:flex;align-items:end;gap:9px;height:130px;padding-top:18px;border-bottom:1px solid #354253;margin-bottom:11px}.bars span{flex:1;background:linear-gradient(0deg,#1765d5,#24c4c5);border-radius:4px 4px 0 0;min-width:0}.dashBottom{display:flex;align-items:center;gap:8px;margin-top:19px;color:#a2b4c7;font-size:11px}.dashBottomRight{margin-left:auto;color:#43d8bc}.floating{position:absolute;right:-15px;bottom:-26px;display:flex;align-items:center;gap:12px;background:#152439;border:1px solid #32506d;padding:13px 17px;border-radius:14px;box-shadow:0 20px 35px #0007}.floating>span{font-size:25px;color:#2ddbb9}.floating strong{display:block;font-size:12px;margin-top:5px}.section{padding-top:85px;padding-bottom:100px;scroll-margin-top:30px}.sectionIntro{max-width:720px;margin-bottom:38px}.sectionIntro h2,.about h2{font-size:clamp(33px,4vw,49px);line-height:1.13;letter-spacing:-1.8px;margin:15px 0}.sectionIntro p,.about p{color:#9aabc0;font-size:16px;line-height:1.75}.serviceGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:15px}.serviceCard,.productCard{background:#ffffff06;border:1px solid #ffffff13;border-radius:19px;padding:26px;transition:border-color .2s,transform .2s}.serviceCard:hover,.productCard:hover{border-color:#2376a8;transform:translateY(-3px)}.serviceIcon{display:grid;place-items:center;background:#0d2c45;color:#37c7e5;border-radius:12px;width:48px;height:48px;font-size:27px;margin-bottom:30px}.serviceCard h3,.productCard h3{font-size:18px;margin:0 0 12px}.serviceCard p,.productCard p{font-size:14px;color:#93a3b8;line-height:1.7;margin:0}.solutionsBand{background:#0b111c;border-top:1px solid #ffffff0b;border-bottom:1px solid #ffffff0b}.productGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:17px}.productCard{background:linear-gradient(140deg,#172132,#0e1622);min-height:250px}.productTop{display:flex;justify-content:space-between;gap:10px;align-items:start}.productNumber{color:#6c9ed4;font-size:11px;letter-spacing:1px;text-transform:uppercase}.productStatus{font-size:10px;color:#44d8bd;border:1px solid #1c5c5c;border-radius:20px;padding:6px 9px;text-align:center}.productSymbol{font-size:35px;color:#40c9d2;margin:22px 0}.productLink{display:inline-block;margin-top:20px;font-size:13px;font-weight:700;color:#69b2ff}.about{display:grid;grid-template-columns:1fr 1fr;gap:70px}.about p:first-child{margin-top:0}.contactWrap{padding-bottom:95px;scroll-margin-top:40px}.contact{text-align:center;padding:65px 25px;background:radial-gradient(ellipse at 50% 0%,#1252a83b,transparent 65%),#111a28;border:1px solid #ffffff18;border-radius:25px}.contact h2{font-size:clamp(30px,4vw,43px);letter-spacing:-1px;max-width:720px;margin:15px auto}.contact p{color:#a8b8ca;line-height:1.7;max-width:600px;margin:0 auto 26px}.contact small{display:block;margin:18px auto 0;color:#8394a8;font-size:11px;max-width:500px;line-height:1.5}.footer{border-top:1px solid #ffffff12;color:#8190a5;font-size:12px}.footerInner{min-height:90px;display:flex;align-items:center;justify-content:space-between;gap:20px}.footer strong{color:white;letter-spacing:1px}
        @media(max-width:1050px){.hero{grid-template-columns:1fr;gap:65px;padding-top:75px}.heroCopy{text-align:center}.hero h1,.lead{margin-left:auto;margin-right:auto}.actions,.highlights{justify-content:center}.heroVisual{width:100%;max-width:560px;margin:auto}.serviceGrid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:700px){.container{padding-left:19px;padding-right:19px}.nav{min-height:72px}.brand{font-size:18px}.menuButton{display:block}.navLinks{display:none;position:absolute;top:72px;left:15px;right:15px;background:#121b2a;border:1px solid #334152;border-radius:15px;padding:20px;flex-direction:column;align-items:stretch;gap:20px}.navLinks.open{display:flex}.hero{padding-top:58px;padding-bottom:80px;gap:55px}.hero h1{font-size:clamp(42px,10vw,58px);letter-spacing:-2px}.lead{font-size:16px}.actions{flex-direction:column}.btn{width:100%}.highlights{gap:12px}.floating{right:0;bottom:-32px}.dashBody{padding:14px}.dashTop{padding:13px}.sample{font-size:8px}.metrics{gap:6px}.metrics>div{padding:11px 7px}.metrics strong{font-size:11px}.dashHeading h3{font-size:21px}.section{padding-top:65px;padding-bottom:75px}.serviceGrid,.productGrid,.about{grid-template-columns:1fr}.about{gap:10px}.contactWrap{padding-bottom:65px}.contact{padding:45px 18px}.footerInner{padding-top:25px;padding-bottom:25px;flex-direction:column;text-align:center;justify-content:center}.eyebrow{font-size:10px}}
        @media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}.btn,.serviceCard,.productCard{transition:none}}
      `}</style>
    </main>
  )
}
