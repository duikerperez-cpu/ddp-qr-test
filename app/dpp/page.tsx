'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

const PLANTILLAS: any = {
  mineria: {
    label: 'Minería / Estructuras - HERCOM',
    prefijo: 'DPP-HERCOM-',
    fields: [
      { key: 'tipo_acero', label: 'Tipo Acero', placeholder: 'Ej: A36, A572 Gr50' },
      { key: 'norma', label: 'Norma', placeholder: 'Ej: NCh 427, EN 131' },
      { key: 'carga_max', label: 'Carga Máxima (kg)', placeholder: '5000' },
      { key: 'soldador', label: 'Soldador / ID', placeholder: 'Juan Pérez - WPQ-001' },
      { key: 'lote_acero', label: 'Lote Acero / Colada', placeholder: 'COL-2026-123' },
      { key: 'fecha_fabricacion', label: 'Fecha Fabricación', type: 'date' },
      { key: 'certificado_url', label: 'Link Certificado PDF', placeholder: 'https://...' },
      { key: 'foto_url', label: 'Foto Estructura URL', placeholder: 'https://...' },
      { key: 'ubicacion_obra', label: 'Obra / Faena Minera', placeholder: 'Mina Escondida' },
    ]
  },
  alimentos: {
    label: 'Alimentos / Bebidas - AUKA',
    prefijo: 'DDP-AUKA-',
    fields: [
      { key: 'ingredientes', label: 'Ingredientes (%)', placeholder: '80% Kombucha, 15% Tuna, 5% Berries' },
      { key: 'parcela', label: 'Parcela / Origen', placeholder: 'Parcela 12 - Panquehue' },
      { key: 'fecha_cosecha', label: 'Fecha Cosecha', type: 'date' },
      { key: 'fecha_vencimiento', label: 'Fecha Vencimiento', type: 'date' },
      { key: 'lote_produccion', label: 'Lote Producción', placeholder: 'LOTE-20260926' },
      { key: 'foto_url', label: 'Foto Producto URL', placeholder: 'https://...' },
      { key: 'link_tienda', label: 'Link Tienda / Recompra', placeholder: 'https://auka.cl' },
      { key: 'cert_sanitario', label: 'Resolución Sanitaria', placeholder: 'N° 12345' },
      { key: 'historia', label: 'Historia / Productor', type: 'textarea', placeholder: 'Cosechado a mano por...' },
    ]
  }
}

export default function DppPage(){
  const [plantilla, setPlantilla] = useState('mineria')
  const [lotes, setLotes] = useState<any[]>([])
  const [form, setForm] = useState<any>({})
  const [codigo, setCodigo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [loteId, setLoteId] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(()=>{
    supabase.from('lotes').select('id, codigo').order('created_at', {ascending:false}).limit(20).then(r=>setLotes(r.data||[]))
    const random = Math.floor(Math.random()*9000)+1000
    setCodigo(PLANTILLAS[plantilla].prefijo + random)
  },[plantilla])

  const save = async()=>{
    setSaving(true)
    const { data, error } = await supabase.from('dpps').insert({
      codigo,
      descripcion,
      lote_id: loteId || null,
      materiales: form.tipo_acero || form.ingredientes || '',
      origen: form.ubicacion_obra || form.parcela || '',
      huella_carbono: form.carga_max? `${form.carga_max} kg` : '3.0 Kg CO2e',
      datos: form, // TODO: AQUÍ ESTÁ LA CLAVE GENÉRICA
      plantilla
    }).select().single()
    setSaving(false)
    if(error) alert(error.message)
    else {
      alert(`DPP Creado: ${data.codigo} - QR: vinculab.cl/p/${data.codigo}`)
      window.open(`/p/${data.codigo}`, '_blank')
    }
  }

  const fields = PLANTILLAS[plantilla].fields

  return (
    <div style={{background:'#09090b', minHeight:'100vh', color:'white', padding:24}}>
      <div style={{maxWidth:800, margin:'0 auto'}}>
        <h1 style={{fontSize:24, fontWeight:900}}>Crear DPP <span style={{color:'#ff6a00'}}>Genérico</span></h1>

        <div style={{marginTop:16, display:'flex', gap:8}}>
          <button onClick={()=>setPlantilla('mineria')} style={{padding:'10px 16px', borderRadius:8, background: plantilla==='mineria'?'#ff6a00':'#27272a', fontWeight:700}}>HERCOM - Minería</button>
          <button onClick={()=>setPlantilla('alimentos')} style={{padding:'10px 16px', borderRadius:8, background: plantilla==='alimentos'?'#ff6a00':'#27272a', fontWeight:700}}>AUKA - Alimentos</button>
        </div>

        <div style={{marginTop:20, background:'#18181b', padding:20, borderRadius:12, border:'1px solid #27272a', display:'grid', gap:12}}>
          <label>Código DPP (QR) <input value={codigo} onChange={e=>setCodigo(e.target.value)} style={{width:'100%', background:'#09090b', padding:10, borderRadius:8, marginTop:4}} /></label>
          <label>Descripción corta <input value={descripcion} onChange={e=>setDescripcion(e.target.value)} placeholder={plantilla==='mineria'?'Escalera minera 5m':'Kombucha Berries Tuna'} style={{width:'100%', background:'#09090b', padding:10, borderRadius:8, marginTop:4}} /></label>
          <label>Lote asociado (opcional)
            <select value={loteId} onChange={e=>setLoteId(e.target.value)} style={{width:'100%', background:'#09090b', padding:10, borderRadius:8, marginTop:4}}>
              <option value="">Sin lote</option>
              {lotes.map((l:any)=><option key={l.id} value={l.id}>{l.codigo}</option>)}
            </select>
          </label>

          <hr style={{borderColor:'#27272a', margin:'10px 0'}} />
          <h3 style={{fontWeight:800, color:'#ff6a00'}}>{PLANTILLAS[plantilla].label}</h3>

          {fields.map((f:any)=>(
            <label key={f.key} style={{fontSize:13}}>{f.label}
              {f.type==='textarea'?
                <textarea value={form[f.key]||''} onChange={e=>setForm({...form, [f.key]: e.target.value})} placeholder={f.placeholder} style={{width:'100%', background:'#09090b', padding:10, borderRadius:8, marginTop:4, minHeight:80}} />
                :
                <input type={f.type||'text'} value={form[f.key]||''} onChange={e=>setForm({...form, [f.key]: e.target.value})} placeholder={f.placeholder} style={{width:'100%', background:'#09090b', padding:10, borderRadius:8, marginTop:4}} />
              }
            </label>
          ))}

          <button onClick={save} disabled={saving} style={{marginTop:10, background:'#ff6a00', padding:14, borderRadius:10, fontWeight:900, fontSize:16}}>
            {saving?'Guardando...':'CREAR DPP + QR →'}
          </button>
          <p style={{fontSize:11, opacity:0.5, textAlign:'center'}}>El QR apuntará a vinculab.cl/p/{codigo} - Genérico para 1000 clientes</p>
        </div>
      </div>
    </div>
  )
}
