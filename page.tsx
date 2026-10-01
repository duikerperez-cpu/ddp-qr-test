'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function AdminDPP(){
  const [dpps, setDpps] = useState<any[]>([])
  const load = ()=>{ supabase.from('dpps').select('*').order('created_at',{ascending:false}).limit(50).then(r=>setDpps(r.data||[])) }
  useEffect(()=>{ load() },[])

  const borrar = async(codigo:string)=>{
    if(!confirm(`¿Borrar ${codigo}? No se puede recuperar`)) return
    const {error} = await supabase.from('dpps').delete().eq('codigo',codigo)
    if(error) alert(error.message)
    else load()
  }

  return (
    <div style={{background:'#09090b', minHeight:'100vh', color:'white', padding:24, fontFamily:'system-ui'}}>
      <div style={{maxWidth:1000, margin:'0 auto'}}>
        <h1 style={{fontSize:22, fontWeight:900}}>Admin DPPs <span style={{color:'#ff6a00'}}>{dpps.length} generados</span></h1>
        <p style={{color:'#a1a1aa', fontSize:13}}>Aquí están todos los que vas generando. Click para ver, editar o borrar.</p>
        
        <div style={{marginTop:20, display:'grid', gap:10}}>
          {dpps.map(d=>(
            <div key={d.codigo} style={{background:'#18181b', border:'1px solid #27272a', borderRadius:10, padding:14, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div>
                <b style={{color:'white'}}>{d.codigo}</b> <span style={{background: d.plantilla==='mineria'?'#ff6a00':'#22c55e', padding:'2px 8px', borderRadius:10, fontSize:10, fontWeight:800, marginLeft:8}}>{d.plantilla}</span>
                <p style={{margin:'4px 0', fontSize:12, color:'#a1a1aa'}}>{d.descripcion} • {d.created_at?.slice(0,16)}</p>
                <p style={{margin:0, fontSize:11, color:'#71717a'}}>{JSON.stringify(d.datos||{}).slice(0,100)}...</p>
              </div>
              <div style={{display:'flex', gap:8}}>
                <a href={`/p/${d.codigo}`} target="_blank" style={{background:'#27272a', color:'white', padding:'8px 12px', borderRadius:8, fontSize:12, textDecoration:'none', border:'1px solid #3f3f46'}}>Ver</a>
                <a href={`/dpp?edit=${d.codigo}`} style={{background:'#27272a', color:'white', padding:'8px 12px', borderRadius:8, fontSize:12, textDecoration:'none', border:'1px solid #3f3f46'}}>Editar</a>
                <button onClick={()=>borrar(d.codigo)} style={{background:'#ef4444', color:'white', padding:'8px 12px', borderRadius:8, fontSize:12, fontWeight:800, border:'none', cursor:'pointer'}}>Borrar</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
