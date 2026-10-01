'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

const PLANTILLAS: any = {
  mineria: {
    label: 'Minería / Estructuras - HERCOM', prefijo: 'DPP-HERCOM-',
    fields: [
      { key: 'tipo_acero', label: 'Tipo Acero', placeholder: 'A36' },
      { key: 'norma', label: 'Norma', placeholder: 'NCh 427' },
      { key: 'carga_max', label: 'Carga Máxima (kg)', placeholder: '5000' },
      { key: 'soldador', label: 'Soldador / ID', placeholder: 'Juan Perez' },
      { key: 'lote_acero', label: 'Lote Acero', placeholder: 'COL-123' },
      { key: 'fecha_fabricacion', label: 'Fecha Fab', type: 'date' },
      { key: 'certificado_url', label: 'Link Certificado PDF', placeholder: 'https://...' },
      { key: 'foto_url', label: 'Foto URL', placeholder: 'https://...' },
      { key: 'ubicacion_obra', label: 'Obra / Faena', placeholder: 'Escondida' },
    ]
  },
  alimentos: {
    label: 'Alimentos / Bebidas - AUKA', prefijo: 'DPP-AUKA-',
    fields: [
      { key: 'ingredientes', label: 'Ingredientes', placeholder: 'Kombucha, Tuna' },
      { key: 'parcela', label: 'Parcela', placeholder: 'Panquehue' },
      { key: 'fecha_cosecha', label: 'Fecha Cosecha', type: 'date' },
      { key: 'fecha_vencimiento', label: 'Vencimiento', type: 'date' },
      { key: 'lote_produccion', label: 'Lote Prod', placeholder: 'LOTE-1' },
      { key: 'foto_url', label: 'Foto URL', placeholder: 'https://...' },
      { key: 'link_tienda', label: 'Link Tienda', placeholder: 'https://auka.cl' },
      { key: 'cert_sanitario', label: 'Res Sanitaria', placeholder: 'N° 123' },
      { key: 'historia', label: 'Historia', type: 'textarea', placeholder: 'Cosechado a mano...' },
    ]
  }
}
const inputStyle = { width:'100%', background:'#27272a', color:'white', border:'1px solid #3f3f46', padding:'12px', borderRadius:8, marginTop:6, outline:'none' } as any

export default function DppPage(){
  const [plantilla, setPlantilla] = useState('mineria')
  const [form, setForm] = useState<any>({})
  const [codigo, setCodigo] = useState('DPP-HERCOM-'+Math.floor(Math.random()*9000+1000))
  const [descripcion, setDescripcion] = useState('')
  const [saving, setSaving] = useState(false)
  useEffect(()=>{ setCodigo(PLANTILLAS[plantilla].prefijo + Math.floor(Math.random()*9000+1000)) },[plantilla])

  const save = async()=>{
    setSaving(true)
    console.log("GUARDANDO FORM:", form)
    const payload = {
      codigo,
      descripcion,
      materiales: form.tipo_acero || form.ingredientes || '',
      origen: form.ubicacion_obra || form.parcela || '',
      huella_carbono: form.carga_max? `${form.carga_max} KG` : '3.0 Kg CO2e',
      datos: form,
      plantilla
    }
    console.log("PAYLOAD:", payload)
    const { data, error } = await supabase.from('dpps').insert(payload).select().single()
    setSaving(false)
    if(error){ alert("ERROR SUPABASE: "+error.message); console.error(error) }
    else {
      alert(`OK GUARDADO: ${JSON.stringify(data.datos).slice(0,100)}`);
      window.open(`/p/${data.codigo}`, '_blank')
    }
  }
  return (
    <div style={{background:'#09090b', minHeight:'100vh', color:'white', padding:24}}>
      <div style={{maxWidth:800, margin:'0 auto'}}>
        <h1 style={{fontWeight:900}}>Crear DPP - <span style={{color:'#ff6a00'}}>{PLANTILLAS[plantilla].label}</span></h1>
        <div style={{display:'flex', gap:8, marginTop:12}}>
          <button onClick={()=>{setPlantilla('mineria'); setForm({})}} style={{padding:10, borderRadius:8, background:plantilla==='mineria'?'#ff6a00':'#27272a', color:'white', border:'1px solid #3f3f46'}}>HERCOM</button>
          <button onClick={()=>{setPlantilla('alimentos'); setForm({})}} style={{padding:10, borderRadius:8, background:plantilla==='alimentos'?'#ff6a00':'#27272a', color:'white', border:'1px solid #3f3f46'}}>AUKA</button>
        </div>
        <div style={{background:'#18181b', padding:20, borderRadius:12, border:'1px solid #27272a', display:'grid', gap:12, marginTop:16}}>
          <label>Código<input value={codigo} onChange={e=>setCodigo(e.target.value)} style={inputStyle} /></label>
          <label>Descripción<input value={descripcion} onChange={e=>setDescripcion(e.target.value)} placeholder="Escalera 5m" style={inputStyle} /></label>
          {PLANTILLAS[plantilla].fields.map((f:any)=><label key={f.key}>{f.label}{f.type==='textarea'?<textarea value={form[f.key]||''} onChange={e=>setForm({...form,[f.key]:e.target.value})} placeholder={f.placeholder} style={{...inputStyle, minHeight:60}} />:<input type={f.type||'text'} value={form[f.key]||''} onChange={e=>setForm({...form,[f.key]:e.target.value})} placeholder={f.placeholder} style={inputStyle} />}</label>)}
          <button onClick={save} disabled={saving} style={{background:'#ff6a00', color:'white', padding:14, borderRadius:10, fontWeight:900, border:'none'}}>{saving?'Guardando...':'CREAR DPP + QR'}</button>
        </div>
      </div>
    </div>
  )
}
