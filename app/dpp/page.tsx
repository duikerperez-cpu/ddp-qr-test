'use client'
import { useEffect, useState, Suspense } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useSearchParams } from 'next/navigation'
import QRWithLogo from '../components/QRWithLogo'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
export const dynamic = 'force-dynamic'

const PLANTILLAS: any = {
  mineria: {
    label: 'HERCOM - Minería',
    code: 'HERCOM',
    logo: '/hercom-logo.png',
    fields: [
      { key:'tipo_acero', label:'Tipo Acero *', placeholder:'A36' },
      { key:'norma', label:'Norma *', placeholder:'NCH 427' },
      { key:'carga_max', label:'Carga Max (kg)', placeholder:'5000' },
      { key:'soldador', label:'Soldador', placeholder:'Alex Hernandez' },
      { key:'lote_acero', label:'Lote Acero *', placeholder:'COL-2026-123' },
      { key:'fecha_fabricacion', label:'Fecha Fabricación', type:'date' },
      { key:'ubicacion_obra', label:'Ubicación Obra', placeholder:'Mina Escondida' },
      { key:'foto_url', label:'Foto URL', placeholder:'https://...' },
      { key:'certificado_url', label:'Certificado PDF URL', placeholder:'https://...' },
    ]
  },
  kombucha: {
    label: 'AUKA - Kombucha',
    code: 'AUKA',
    logo: '/auka-logo.png',
    fields: [
      { key:'sabor', label:'Sabor *', placeholder:'Hibisco, Original, Jengibre' },
      { key:'volumen', label:'Volumen *', placeholder:'350ml' },
      { key:'lote', label:'Lote *', placeholder:'AUKA-2026-1001' },
      { key:'fecha_elaboracion', label:'Elaboración *', type:'date' },
      { key:'fecha_vencimiento', label:'Vencimiento *', type:'date' },
      { key:'ingredientes', label:'Ingredientes *', placeholder:'Té verde, azúcar, SCOBY...' },
      { key:'azucar_g', label:'Azúcar g/100ml', placeholder:'4g' },
      { key:'resolucion_sanitaria', label:'Res. Sanitaria *', placeholder:'Res. 12345' },
      { key:'certificacion', label:'Certificación', placeholder:'Orgánico' },
      { key:'foto_url', label:'Foto Botella URL', placeholder:'https://...' },
      { key:'certificado_url', label:'Análisis Lab PDF', placeholder:'https://...' },
    ]
  }
}

function DPPContent(){
  const searchParams = useSearchParams()
  const editCodigo = searchParams.get('edit')
  const [plantilla, setPlantilla] = useState('kombucha')
  const [form, setForm] = useState<any>({})
  const [descripcion, setDescripcion] = useState('')
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState('')

  useEffect(()=>{
    if(editCodigo){
      supabase.from('dpps').select('*').eq('codigo', editCodigo).single().then(r=>{
        if(r.data){
          setPlantilla(r.data.plantilla==='inmobiliaria'?'kombucha':r.data.plantilla)
          setForm(r.data.datos||{})
          setDescripcion(r.data.descripcion||'')
        }
      })
    }
  },[editCodigo])

  const save = async()=>{
    if(!descripcion){ alert("Pon descripción"); return; }
    setSaving(true)
    try{
      if(editCodigo){
        await supabase.from('dpps').update({ descripcion, datos: form, plantilla }).eq('codigo', editCodigo)
        setResult(`https://vinculab.cl/p/${editCodigo}`)
      }else{
        const codigo = `DPP-${PLANTILLAS[plantilla].code}-${Math.floor(1000+Math.random()*9000)}`
        await supabase.from('dpps').insert([{ codigo, plantilla, descripcion, datos: form }])
        setResult(`https://vinculab.cl/p/${codigo}`)
      }
    }catch(e:any){ alert(e.message) }
    setSaving(false)
  }

  return (
    <div style={{background:'#09090b', minHeight:'100vh', color:'white', padding:20, fontFamily:'system-ui'}}>
      <div style={{maxWidth:700, margin:'0 auto'}}>
        <h1 style={{fontWeight:900, fontSize:22}}>{editCodigo?`Editando ${editCodigo}`:'Crear DPP'} <span style={{color:'#ff6a00'}}>VINCULAB</span></h1>

        {!editCodigo && (
          <div style={{display:'flex', gap:10, margin:'20px 0'}}>
            {Object.keys(PLANTILLAS).map(k=>(
              <button key={k} onClick={()=>{setPlantilla(k); setForm({})}} style={{padding:'10px 16px', borderRadius:10, fontWeight:900, fontSize:12, border:'1px solid #3f3f46', background: plantilla===k?'#ff6a00':'#18181b', color:'white', cursor:'pointer'}}>{PLANTILLAS[k].label}</button>
            ))}
          </div>
        )}

        <div style={{background:'#18181b', border:'1px solid #27272a', borderRadius:12, padding:20}}>
          <label style={{fontSize:11, color:'#a1a1aa', fontWeight:700}}>DESCRIPCIÓN *</label>
          <input value={descripcion} onChange={e=>setDescripcion(e.target.value)} placeholder={plantilla==='kombucha'?"AUKA Hibisco 350ml":"Escalera Minera 5M"} style={{width:'100%', background:'#09090b', border:'1px solid #3f3f46', borderRadius:8, padding:12, color:'white', marginTop:6, marginBottom:16}} />
          {PLANTILLAS[plantilla].fields.map((f:any)=>(
            <div key={f.key} style={{marginBottom:12}}>
              <label style={{fontSize:11, color:'#a1a1aa', fontWeight:700}}>{f.label.toUpperCase()}</label>
              <input type={f.type||'text'} value={form[f.key]||''} onChange={e=>setForm({...form, [f.key]: e.target.value})} placeholder={f.placeholder} style={{width:'100%', background:'#09090b', border:'1px solid #3f3f46', borderRadius:8, padding:12, color:'white', marginTop:6}} />
            </div>
          ))}
          <button onClick={save} disabled={saving} style={{width:'100%', background: saving?'#444':'#ff6a00', color:'white', padding:14, borderRadius:10, fontWeight:900, border:'none', cursor:'pointer'}}>{saving?'GUARDANDO...': editCodigo?'💾 GUARDAR':'🚀 CREAR DPP + QR'}</button>

          {result && (
            <div style={{marginTop:20, background:'#052e16', border:'1px solid #16a34a', padding:20, borderRadius:12, textAlign:'center'}}>
              <p style={{margin:0, color:'#86efac', fontSize:12, fontWeight:800}}>¡DPP CREADO! ✅</p>
              <a href={result} target="_blank" style={{color:'white', fontWeight:800, fontSize:13, wordBreak:'break-all'}}>{result}</a>
              <div style={{marginTop:16, display:'flex', justifyContent:'center'}}>
                <QRWithLogo data={result} logo={PLANTILLAS[plantilla].logo} size={260} />
              </div>
              <p style={{fontSize:10, color:'#86efac', marginTop:10}}>QR con logo {PLANTILLAS[plantilla].code} listo para imprimir</p>
              <a href={result} target="_blank" style={{display:'inline-block', marginTop:12, background:'white', color:'#052e16', padding:'8px 16px', borderRadius:8, fontWeight:900, fontSize:12, textDecoration:'none'}}>VER FICHA PÚBLICA →</a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Page(){
  return <Suspense fallback={<div style={{padding:40, background:'#09090b', color:'white'}}>Cargando...</div>}><DPPContent /></Suspense>
}
