'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useSearchParams, useRouter } from 'next/navigation'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

const PLANTILLAS: any = {
  mineria: {
    label: 'Minería - Estructura',
    fields: [
      { key:'tipo_acero', label:'Tipo Acero', placeholder:'A36, A572' },
      { key:'norma', label:'Norma', placeholder:'NCH 427' },
      { key:'carga_max', label:'Carga Max (kg)', placeholder:'5000' },
      { key:'soldador', label:'Soldador', placeholder:'Alex Hernandez - WPQ-001' },
      { key:'lote_acero', label:'Lote Acero', placeholder:'COL-2026-123' },
      { key:'fecha_fabricacion', label:'Fecha Fabricación', type:'date' },
      { key:'ubicacion_obra', label:'Ubicación Obra', placeholder:'Mina Escondida' },
      { key:'foto_url', label:'Foto URL (.jpg)', placeholder:'https://...' },
      { key:'certificado_url', label:'Certificado PDF URL', placeholder:'https://...' },
    ]
  },
  inmobiliaria: {
    label: 'Inmobiliario',
    fields: [
      { key:'tipo', label:'Tipo', placeholder:'Departamento' },
      { key:'superficie', label:'Superficie m2', placeholder:'72' },
      { key:'norma', label:'Norma', placeholder:'NCH 433' },
      { key:'ubicacion_obra', label:'Ubicación', placeholder:'La Florida' },
      { key:'foto_url', label:'Foto URL', placeholder:'https://...' },
      { key:'certificado_url', label:'Certificado URL', placeholder:'https://...' },
    ]
  }
}

export default function DPPPage(){
  const searchParams = useSearchParams()
  const editCodigo = searchParams.get('edit')
  const router = useRouter()
  const [plantilla, setPlantilla] = useState('mineria')
  const [form, setForm] = useState<any>({})
  const [descripcion, setDescripcion] = useState('')
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState('')

  // CARGAR SI ESTA EDITANDO
  useEffect(()=>{
    if(editCodigo){
      supabase.from('dpps').select('*').eq('codigo', editCodigo).single().then(r=>{
        if(r.data){
          setPlantilla(r.data.plantilla)
          setForm(r.data.datos||{})
          setDescripcion(r.data.descripcion||'')
        }
      })
    }
  },[editCodigo])

  const save = async()=>{
    const vacios = PLANTILLAS[plantilla].fields.filter((f:any)=> f.key!=='foto_url' && f.key!=='certificado_url' && (!form[f.key] || String(form[f.key]).trim()===""))
    if(vacios.length>0){ alert("Faltan campos obligatorios: "+vacios.map((f:any)=>f.label).join(", ")); return; }
    if(!descripcion){ alert("Pon descripción del producto"); return; }
    setSaving(true)
    setResult('')

    try{
      if(editCodigo){
        // UPDATE
        const {error} = await supabase.from('dpps').update({ descripcion, datos: form, plantilla }).eq('codigo', editCodigo)
        if(error) throw error
        setResult(`https://vinculab.cl/p/${editCodigo}`)
        alert("Actualizado! ✅")
      }else{
        // CREATE
        const codigo = `DPP-${plantilla==='mineria'?'HERCOM':'AUKA'}-${Math.floor(1000+Math.random()*9000)}`
        const {error} = await supabase.from('dpps').insert([{ codigo, plantilla, descripcion, datos: form }])
        if(error) throw error
        setResult(`https://vinculab.cl/p/${codigo}`)
      }
    }catch(e:any){
      alert("Error: "+e.message)
    }
    setSaving(false)
  }

  return (
    <div style={{background:'#09090b', minHeight:'100vh', color:'white', padding:20, fontFamily:'system-ui'}}>
      <div style={{maxWidth:700, margin:'0 auto'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20}}>
          <h1 style={{fontWeight:900, fontSize:22}}>{editCodigo? `Editando ${editCodigo}` : 'Crear DPP'} <span style={{color:'#ff6a00'}}>VINCULAB</span></h1>
          <a href="/dpp/admin" style={{background:'#27272a', padding:'8px 14px', borderRadius:8, color:'white', textDecoration:'none', fontSize:12, border:'1px solid #3f3f46'}}>Ver todos →</a>
        </div>

        {!editCodigo && (
          <div style={{display:'flex', gap:10, marginBottom:16}}>
            {Object.keys(PLANTILLAS).map(k=>(
              <button key={k} onClick={()=>setPlantilla(k)} style={{padding:'8px 14px', borderRadius:8, fontWeight:800, fontSize:12, border:'1px solid #3f3f46', background: plantilla===k?'#ff6a00':'#18181b', color:'white', cursor:'pointer'}}>{PLANTILLAS[k].label}</button>
            ))}
          </div>
        )}

        <div style={{background:'#18181b', border:'1px solid #27272a', borderRadius:12, padding:20}}>
          <label style={{fontSize:11, color:'#a1a1aa', fontWeight:700}}>DESCRIPCIÓN PRODUCTO *</label>
          <input value={descripcion} onChange={e=>setDescripcion(e.target.value)} placeholder="Ej: Escalera Minera 5M Certificada" style={{width:'100%', background:'#09090b', border:'1px solid #3f3f46', borderRadius:8, padding:12, color:'white', marginTop:6, marginBottom:16}} />

          {PLANTILLAS[plantilla].fields.map((f:any)=>(
            <div key={f.key} style={{marginBottom:12}}>
              <label style={{fontSize:11, color:'#a1a1aa', fontWeight:700}}>{f.label.toUpperCase()} {f.key!=='foto_url'&&f.key!=='certificado_url'?'*':''}</label>
              <input type={f.type||'text'} value={form[f.key]||''} onChange={e=>setForm({...form, [f.key]: e.target.value})} placeholder={f.placeholder} style={{width:'100%', background:'#09090b', border:'1px solid #3f3f46', borderRadius:8, padding:12, color:'white', marginTop:6}} />
            </div>
          ))}

          <button onClick={save} disabled={saving} style={{width:'100%', background: saving?'#444':'#ff6a00', color:'white', padding:14, borderRadius:10, fontWeight:900, border:'none', cursor:'pointer', marginTop:10}}>
            {saving? 'GUARDANDO...' : editCodigo? '💾 GUARDAR CAMBIOS' : '🚀 CREAR DPP + QR'}
          </button>

          {result && (
            <div style={{marginTop:16, background:'#052e16', border:'1px solid #16a34a', padding:12, borderRadius:8, textAlign:'center'}}>
              <p style={{margin:0, fontSize:12, color:'#86efac'}}>DPP Creado ✅</p>
              <a href={result} target="_blank" style={{color:'white', fontWeight:800, wordBreak:'break-all'}}>{result}</a>
              <div style={{marginTop:8}}><img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${result}`} style={{borderRadius:8, border:'2px solid white'}} /></div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
