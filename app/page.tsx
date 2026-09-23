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
  const [counts, setCounts] = useState({empresas:2, productos:0, modelos:0, lotes:0})
  const [empresas, setEmpresas] = useState<any[]>([
    {nombre:'Hercom Chile', rut:'76.123.456-7', id:'HERCOM'},
    {nombre:'Trimar Hotel', rut:'77.987.654-3', id:'TRIMAR'}
  ])

  useEffect(()=>{
    async function load(){
      const filtro = ['Hercom Chile', 'Trimar Hotel']
      try {
        const [e,p,m,l] = await Promise.all([
          supabase.from('empresas').select('*', {count:'exact', head:true}).in('nombre', filtro),
          supabase.from('productos').select('*', {count:'exact', head:true}),
          supabase.from('modelos').select('*', {count:'exact', head:true}),
          supabase.from('lotes').select('*', {count:'exact', head:true}),
        ])
        setCounts({
          empresas: e.count || 2,
          productos: p.count || 0,
          modelos: m.count || 0,
          lotes: l.count || 0
        })
        const {data} = await supabase.from('empresas').select('*').in('nombre', filtro)
        if(data && data.length > 0){
          setEmpresas(data)
        }
      } catch(err){
        console.log('Usando datos locales de prueba', err)
      }
    }
    load()
  },[])

  return (
    <div style={{display:'flex', minHeight:'100vh', background:'#09090b', color:'white', fontFamily:'Inter, Arial, sans-serif'}}>
      {/* SIDEBAR */}
      <div style={{width:250, background:'#0f1012', borderRight:'1px solid #1f1f23', display:'flex', flexDirection:'column', position:'sticky', top:0, height:'100vh'}}>
        <div style={{padding:'18px 20px', borderBottom:'1px solid #1f1f23'}}>
          <div style={{fontWeight:900, fontSize:20, letterSpacing:2}}>VINCULA<span style={{color:'#ff6a00'}}>B</span></div>
          <div style={{fontSize:8, color:'#666', letterSpacing:1.5, marginTop:2}}>DIGITAL PRODUCT IDENTITY</div>
        </div>
        <div style={{flex:1, padding:'15px 10px', overflowY:'auto'}}>
          {menu.map(group=>(
            <div key={group.section} style={{marginBottom:20}}>
              <div style={{fontSize:9, color:'#555', letterSpacing:2, padding:'10px 12px', fontWeight:700}}>{group.section}</div>
              {group.items.map(item=>{
                const active = tab===item.id
                return (
                  <button key={item.id} onClick={()=>setTab(item.id)}
                    style={{width:'100%', textAlign:'left', display:'flex', alignItems:'center', gap:10, background: active ? '#1c1917' : 'transparent', color: active ? 'white' : '#b0b0b0', border:'none', borderLeft: active ? '3px solid #ff6a00' : '3px solid transparent', padding:'10px 12px', borderRadius:6, cursor:'pointer', fontSize:13, fontWeight: active ? 700 : 400}}>
                    <span style={{color:'#ff6a00', fontSize:14}}>{item.icon}</span>{item.label}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* MAIN */}
      <div style={{flex:1, display:'flex', flexDirection:'column'}}>
        <div style={{height:56, background:'#111214', borderBottom:'1px solid #1f1f23', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 25px'}}>
          <div style={{fontSize:11, color:'#666', letterSpacing:1}}>PLATAFORMA DE IDENTIDAD DIGITAL DE PRODUCTOS</div>
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <div style={{textAlign:'right'}}><div style={{fontSize:9, color:'#666'}}>USUARIO</div><div style={{fontSize:12, fontWeight:700}}>Administrador</div></div>
            <div style={{width:32, height:32, background:'#ff6a00', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900}}>A</div>
          </div>
        </div>

        <div style={{flex:1, background:'#09090b', padding:25}}>
          {tab==='dashboard' && (
            <>
              <h1 style={{fontSize:26, margin:0, fontWeight:800}}>Dashboard</h1>
              <p style={{color:'#666', fontSize:13, marginTop:4}}>Vista general - Solo 2 empresas activas.</p>
              <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:15, marginTop:25}}>
                <div style={{background:'#15161a', border:'1px solid #1f1f23', borderLeft:'4px solid #ff4500', borderRadius:8, padding:'18px 20px'}}><div style={{fontSize:10, color:'#666'}}>EMPRESAS</div><div style={{fontSize:32, fontWeight:900, marginTop:8}}>{counts.empresas}</div><div style={{fontSize:10, color:'#888', marginTop:5}}>Hercom + Trimar</div></div>
                <div style={{background:'#15161a', border:'1px solid #1f1f23', borderLeft:'4px solid #ff4500', borderRadius:8, padding:'18px 20px'}}><div style={{fontSize:10, color:'#666'}}>PRODUCTOS</div><div style={{fontSize:32, fontWeight:900, marginTop:8}}>{counts.productos}</div></div>
                <div style={{background:'#15161a', border:'1px solid #1f1f23', borderLeft:'4px solid #ff4500', borderRadius:8, padding:'18px 20px'}}><div style={{fontSize:10, color:'#666'}}>MODELOS</div><div style={{fontSize:32, fontWeight:900, marginTop:8}}>{counts.modelos}</div></div>
                <div style={{background:'#15161a', border:'1px solid #1f1f23', borderLeft:'4px solid #ff4500', borderRadius:8, padding:'18px 20px'}}><div style={{fontSize:10, color:'#666'}}>LOTES</div><div style={{fontSize:32, fontWeight:900, marginTop:8}}>{counts.lotes}</div></div>
              </div>
            </>
          )}

          {tab==='empresas' && (
            <div>
              <h1 style={{fontSize:24, fontWeight:800}}>Empresas ({empresas.length})</h1>
              <div style={{background:'#15161a', border:'1px solid #1f1f23', borderRadius:8, marginTop:15, overflow:'hidden'}}>
                <div style={{display:'grid', gridTemplateColumns:'1.5fr 1fr 1fr', padding:'12px 20px', background:'#1a1a1e', fontSize:10, color:'#666', letterSpacing:1}}><div>EMPRESA</div><div>RUT / ID</div><div>ESTADO</div></div>
                {empresas.map((emp:any, i:number)=>(
                  <div key={i} style={{display:'grid', gridTemplateColumns:'1.5fr 1fr 1fr', padding:'16px 20px', borderTop:'1px solid #1f1f23', fontSize:13, alignItems:'center'}}>
                    <div style={{fontWeight:600}}>{emp.nombre}</div>
                    <div style={{color:'#888'}}>{emp.rut || emp.id}</div>
                    <div><span style={{background:'#052e16', color:'#22c55e', padding:'4px 10px', borderRadius:20, fontSize:11}}>● Activa</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab!=='dashboard' && tab!=='empresas' && (
            <div style={{background:'#15161a', border:'1px solid #1f1f23', borderRadius:8, padding:30, marginTop:10}}>
              <h2 style={{margin:0, fontWeight:800}}>{menu.flatMap(g=>g.items).find(i=>i.id===tab)?.label}</h2>
              <p style={{color:'#888', fontSize:13, marginTop:8}}>Módulo {tab} listo. Filtrado para Hercom Chile y Trimar Hotel.</p>
              {tab==='nfc' && <img src="/api/qr?data=https://ddp-qr-test-2-alpha.vercel.app/p/VIN-CL-000015" style={{marginTop:20, background:'white', padding:10, borderRadius:8}} />}
              {tab==='dpp' && <a href="/p/VIN-CL-000015" target="_blank" style={{color:'#ff6a00', display:'block', marginTop:15, fontWeight:700}}>Ver DPP de prueba →</a>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
