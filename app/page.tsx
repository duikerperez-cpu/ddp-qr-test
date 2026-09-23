'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const menu = [
  {section:'PRINCIPAL', items:[{id:'dashboard', label:'Dashboard', icon:'⌂'}]},
  {section:'GESTIÓN', items:[
    {id:'empresas', label:'Empresas', icon:'◫'},
    {id:'productos', label:'Productos', icon:'⬙'},
    {id:'modelos', label:'Modelos', icon:'◇'},
    {id:'lotes', label:'Lotes', icon:'☰'},
    {id:'individuales', label:'Productos Individuales', icon:'◉'},
  ]},
  {section:'IDENTIDAD DIGITAL', items:[
    {id:'dpp', label:'DPP', icon:'▤'},
    {id:'nfc', label:'NFC / QR', icon:'≋'},
    {id:'certificados', label:'Certificados', icon:'✓'},
    {id:'trazabilidad', label:'Trazabilidad', icon:'◍'},
  ]},
]

export default function Page() {
  const [tab, setTab] = useState('dashboard')
  const [counts, setCounts] = useState({empresas:0, productos:0, modelos:0, lotes:0})
  const [empresas, setEmpresas] = useState<any[]>([])

  useEffect(()=>{
    async function load(){
      const [e,p,m,l] = await Promise.all([
        supabase.from('empresas').select('*', {count:'exact', head:true}),
        supabase.from('productos').select('*', {count:'exact', head:true}),
        supabase.from('modelos').select('*', {count:'exact', head:true}),
        supabase.from('lotes').select('*', {count:'exact', head:true}),
      ])
      setCounts({
        empresas: e.count || 0,
        productos: p.count || 0,
        modelos: m.count || 0,
        lotes: l.count || 0
      })
      // carga lista empresas
      const {data} = await supabase.from('empresas').select('*').limit(50)
      if(data) setEmpresas(data)
    }
    load()
  },[])

  return (
    <div style={{display:'flex', minHeight:'100vh', background:'#09090b', color:'white', fontFamily:'Inter, Arial'}}>
      <div style={{width:250, background:'#0f1012', borderRight:'1px solid #1f1f23', display:'flex', flexDirection:'column'}}>
        <div style={{padding:'18px 20px', borderBottom:'1px solid #1f1f23'}}>
          <div style={{fontWeight:900, fontSize:20, letterSpacing:2}}>VINCULA<span style={{color:'#ff6a00'}}>B</span></div>
          <div style={{fontSize:8, color:'#666', letterSpacing:1.5}}>DIGITAL PRODUCT IDENTITY</div>
        </div>
        <div style={{flex:1, padding:'15px 10px'}}>
          {menu.map(group=>(
            <div key={group.section} style={{marginBottom:20}}>
              <div style={{fontSize:9, color:'#555', letterSpacing:2, padding:'10px 12px', fontWeight:700}}>{group.section}</div>
              {group.items.map(item=>{
                const active = tab===item.id
                return (
                  <button key={item.id} onClick={()=>setTab(item.id)}
                    style={{width:'100%', textAlign:'left', display:'flex', gap:10, background: active ? '#1c1917' : 'transparent', color: active ? 'white' : '#9ca3af', border:'none', borderLeft: active ? '3px solid #ff6a00' : '3px solid transparent', padding:'10px 12px', borderRadius:6, cursor:'pointer', fontSize:13}}>
                    <span style={{color:'#ff6a00'}}>{item.icon}</span>{item.label}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <div style={{flex:1, display:'flex', flexDirection:'column'}}>
        <div style={{height:56, background:'#111214', borderBottom:'1px solid #1f1f23', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 25px'}}>
          <div style={{fontSize:11, color:'#666', letterSpacing:1}}>PLATAFORMA DE IDENTIDAD DIGITAL DE PRODUCTOS</div>
          <div style={{display:'flex', gap:10, alignItems:'center'}}><div style={{textAlign:'right'}}><div style={{fontSize:9, color:'#666'}}>USUARIO</div><div style={{fontSize:12, fontWeight:700}}>Administrador</div></div><div style={{width:32, height:32, background:'#ff6a00', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900}}>A</div></div>
        </div>

        <div style={{flex:1, background:'#09090b', padding:25}}>
          {tab==='dashboard' && (
            <>
              <h1 style={{fontSize:26, margin:0, fontWeight:800}}>Dashboard</h1>
              <p style={{color:'#666', fontSize:13}}>Vista general de la plataforma Vinculab.</p>
              <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:15, marginTop:25}}>
                <div style={{background:'#15161a', border:'1px solid #1f1f23', borderLeft:'4px solid #ff4500', borderRadius:8, padding:'18px 20px'}}><div style={{fontSize:10, color:'#666'}}>EMPRESAS</div><div style={{fontSize:32, fontWeight:900, marginTop:8}}>{counts.empresas}</div></div>
                <div style={{background:'#15161a', border:'1px solid #1f1f23', borderLeft:'4px solid #ff4500', borderRadius:8, padding:'18px 20px'}}><div style={{fontSize:10, color:'#666'}}>PRODUCTOS</div><div style={{fontSize:32, fontWeight:900, marginTop:8}}>{counts.productos}</div></div>
                <div style={{background:'#15161a', border:'1px solid #1f1f23', borderLeft:'4px solid #ff4500', borderRadius:8, padding:'18px 20px'}}><div style={{fontSize:10, color:'#666'}}>MODELOS</div><div style={{fontSize:32, fontWeight:900, marginTop:8}}>{counts.modelos}</div></div>
                <div style={{background:'#15161a', border:'1px solid #1f1f23', borderLeft:'4px solid #ff4500', borderRadius:8, padding:'18px 20px'}}><div style={{fontSize:10, color:'#666'}}>LOTES</div><div style={{fontSize:32, fontWeight:900, marginTop:8}}>{counts.lotes}</div></div>
              </div>
            </>
          )}

          {tab==='empresas' && (
            <div>
              <h1 style={{fontSize:24}}>Empresas ({counts.empresas})</h1>
              <div style={{background:'#15161a', border:'1px solid #1f1f23', borderRadius:8, marginTop:15, overflow:'hidden'}}>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', padding:'12px 20px', background:'#1a1a1e', fontSize:10, color:'#666'}}> <div>NOMBRE</div><div>RUT</div><div>ESTADO</div> </div>
                {empresas.map((emp:any, i:number)=>(
                  <div key={i} style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', padding:'14px 20px', borderTop:'1px solid #1f1f23', fontSize:13}}>
                    <div>{emp.nombre || emp.name || 'Empresa '+(i+1)}</div><div style={{color:'#888'}}>{emp.rut || emp.id}</div><div style={{color:'#22c55e'}}>● Activa</div>
                  </div>
                ))}
                {empresas.length===0 && <div style={{padding:30, color:'#666', textAlign:'center'}}>No hay empresas en Supabase aún. Importa tus Google Sheets.</div>}
              </div>
            </div>
          )}

          {tab!=='dashboard' && tab!=='empresas' && (
            <div style={{background:'#15161a', border:'1px solid #1f1f23', borderRadius:8, padding:30}}>
              <h2>{menu.flatMap(g=>g.items).find(i=>i.id===tab)?.label}</h2>
              <p style={{color:'#888'}}>Módulo {tab} listo para conectar. Cantidad actual: {counts[tab as keyof typeof counts] || 0}</p>
              {tab==='nfc' && <img src="/api/qr?data=https://ddp-qr-test-2-alpha.vercel.app/p/VIN-CL-000015" style={{marginTop:20, background:'white', padding:10, borderRadius:8}} />}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
