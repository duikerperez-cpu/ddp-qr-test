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
    {id:'1', nombre:'Hercom Chile', rut:'76.123.456-7'},
    {id:'2', nombre:'Trimar Hotel', rut:'77.987.654-3'}
  ])
  const [productos, setProductos] = useState<any[]>([])
  const [lotes, setLotes] = useState<any[]>([])

  useEffect(()=>{
    async function load(){
      const filtroNombres = ['Hercom Chile', 'Trimar Hotel']
      try {
        // 1. Trae las 2 empresas y saca sus IDs reales
        const {data: empData} = await supabase.from('empresas').select('*').in('nombre', filtroNombres)
        const listaEmpresas = empData && empData.length > 0 ? empData : empresas
        setEmpresas(listaEmpresas)
        const ids = listaEmpresas.map((e:any)=>e.id)

        // 2. Productos solo de esas 2 empresas
        const {data: prodData, count: prodCount} = await supabase.from('productos').select('*', {count:'exact'}).in('empresa_id', ids)
        const {data: prodData2, count: prodCount2} = await supabase.from('productos').select('*', {count:'exact'}).in('empresa_nombre', filtroNombres)
        
        // Usa el que tenga datos
        const prods = (prodData && prodData.length > 0) ? prodData : (prodData2 && prodData2.length > 0 ? prodData2 : [])
        setProductos(prods)
        
        // 3. Lotes solo de esas 2 empresas
        const {data: lotesData} = await supabase.from('lotes').select('*').in('empresa_id', ids)
        setLotes(lotesData || [])

        // Counts
        const [e,m] = await Promise.all([
          supabase.from('empresas').select('*', {count:'exact', head:true}).in('nombre', filtroNombres),
          supabase.from('modelos').select('*', {count:'exact', head:true}),
        ])
        setCounts({
          empresas: e.count || 2,
          productos: prods.length || prodCount || prodCount2 || 0,
          modelos: m.count || 0,
          lotes: lotesData?.length || 0
        })

      } catch(err){
        console.log('Usando datos locales', err)
      }
    }
    load()
  },[])

  return (
    <div style={{display:'flex', minHeight:'100vh', background:'#09090b', color:'white', fontFamily:'Inter, Arial'}}>
      <div style={{width:250, background:'#0f1012', borderRight:'1px solid #1f1f23', display:'flex', flexDirection:'column', position:'sticky', top:0, height:'100vh'}}>
        <div style={{padding:'18px 20px', borderBottom:'1px solid #1f1f23'}}>
          <div style={{fontWeight:900, fontSize:20, letterSpacing:2}}>VINCULA<span style={{color:'#ff6a00'}}>B</span></div>
          <div style={{fontSize:8, color:'#666', letterSpacing:1.5}}>DIGITAL PRODUCT IDENTITY</div>
        </div>
        <div style={{flex:1, padding:'15px 10px', overflowY:'auto'}}>
          {menu.map(group=>(
            <div key={group.section} style={{marginBottom:20}}>
              <div style={{fontSize:9, color:'#555', letterSpacing:2, padding:'10px 12px', fontWeight:700}}>{group.section}</div>
              {group.items.map(item=>{
                const active = tab===item.id
                return <button key={item.id} onClick={()=>setTab(item.id)} style={{width:'100%', textAlign:'left', display:'flex', gap:10, background: active ? '#1c1917' : 'transparent', color: active ? 'white' : '#b0b0b0', border:'none', borderLeft: active ? '3px solid #ff6a00' : '3px solid transparent', padding:'10px 12px', borderRadius:6, cursor:'pointer', fontSize:13, fontWeight: active ? 700 : 400}}><span style={{color:'#ff6a00'}}>{item.icon}</span>{item.label}</button>
              })}
            </div>
          ))}
        </div>
      </div>

      <div style={{flex:1, display:'flex', flexDirection:'column'}}>
        <div style={{height:56, background:'#111214', borderBottom:'1px solid #1f1f23', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 25px'}}>
          <div style={{fontSize:11, color:'#666'}}>PLATAFORMA DE IDENTIDAD DIGITAL DE PRODUCTOS</div>
          <div style={{display:'flex', gap:10, alignItems:'center'}}><div style={{textAlign:'right'}}><div style={{fontSize:9, color:'#666'}}>FILTRO ACTIVO</div><div style={{fontSize:11, fontWeight:700, color:'#ff6a00'}}>Hercom + Trimar</div></div><div style={{width:32, height:32, background:'#ff6a00', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900}}>A</div></div>
        </div>

        <div style={{flex:1, background:'#09090b', padding:25}}>
          {tab==='dashboard' && (
            <>
              <h1 style={{fontSize:26, margin:0, fontWeight:800}}>Dashboard</h1>
              <p style={{color:'#666', fontSize:13}}>Filtrado solo para Hercom Chile y Trimar Hotel.</p>
              <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:15, marginTop:25}}>
                <div style={{background:'#15161a', border:'1px solid #1f1f23', borderLeft:'4px solid #ff4500', borderRadius:8, padding:18}}><div style={{fontSize:10, color:'#666'}}>EMPRESAS</div><div style={{fontSize:32, fontWeight:900, marginTop:8}}>{counts.empresas}</div></div>
                <div style={{background:'#15161a', border:'1px solid #1f1f23', borderLeft:'4px solid #ff4500', borderRadius:8, padding:18}}><div style={{fontSize:10, color:'#666'}}>PRODUCTOS</div><div style={{fontSize:32, fontWeight:900, marginTop:8}}>{counts.productos}</div></div>
                <div style={{background:'#15161a', border:'1px solid #1f1f23', borderLeft:'4px solid #ff4500', borderRadius:8, padding:18}}><div style={{fontSize:10, color:'#666'}}>MODELOS</div><div style={{fontSize:32, fontWeight:900, marginTop:8}}>{counts.modelos}</div></div>
                <div style={{background:'#15161a', border:'1px solid #1f1f23', borderLeft:'4px solid #ff4500', borderRadius:8, padding:18}}><div style={{fontSize:10, color:'#666'}}>LOTES</div><div style={{fontSize:32, fontWeight:900, marginTop:8}}>{counts.lotes}</div></div>
              </div>
            </>
          )}

          {tab==='empresas' && (
            <div><h1 style={{fontSize:24, fontWeight:800}}>Empresas ({empresas.length})</h1><div style={{background:'#15161a', border:'1px solid #1f1f23', borderRadius:8, marginTop:15, overflow:'hidden'}}><div style={{display:'grid', gridTemplateColumns:'1.5fr 1fr 1fr', padding:'12px 20px', background:'#1a1a1e', fontSize:10, color:'#666'}}><div>EMPRESA</div><div>RUT</div><div>ESTADO</div></div>{empresas.map((emp:any,i:number)=><div key={i} style={{display:'grid', gridTemplateColumns:'1.5fr 1fr 1fr', padding:'16px 20px', borderTop:'1px solid #1f1f23', fontSize:13}}><div style={{fontWeight:600}}>{emp.nombre}</div><div style={{color:'#888'}}>{emp.rut}</div><div><span style={{background:'#052e16', color:'#22c55e', padding:'4px 10px', borderRadius:20, fontSize:11}}>● Activa</span></div></div>)}</div></div>
          )}

          {tab==='productos' && (
            <div><h1 style={{fontSize:24, fontWeight:800}}>Productos ({productos.length})</h1><p style={{color:'#666', fontSize:12}}>Solo productos de Hercom Chile y Trimar Hotel</p><div style={{background:'#15161a', border:'1px solid #1f1f23', borderRadius:8, marginTop:15}}>{productos.length===0 ? <div style={{padding:30, color:'#666', textAlign:'center'}}>No hay productos para estas 2 empresas aún. Importa desde Google Sheets.</div> : productos.map((p:any,i:number)=><div key={i} style={{padding:'14px 20px', borderTop: i===0 ? 'none' : '1px solid #1f1f23', display:'flex', justifyContent:'space-between'}}><div><div style={{fontWeight:600}}>{p.nombre || p.name}</div><div style={{fontSize:11, color:'#666'}}>{p.empresa_nombre || p.empresa_id}</div></div><div style={{color:'#888', fontSize:12}}>{p.sku || p.id}</div></div>)}</div></div>
          )}

          {tab==='lotes' && (
            <div><h1 style={{fontSize:24, fontWeight:800}}>Lotes ({lotes.length})</h1><div style={{background:'#15161a', border:'1px solid #1f1f23', borderRadius:8, marginTop:15}}>{lotes.length===0 ? <div style={{padding:30, color:'#666', textAlign:'center'}}>No hay lotes para estas 2 empresas aún.</div> : lotes.map((l:any,i:number)=><div key={i} style={{padding:'14px 20px', borderTop: i===0 ? 'none' : '1px solid #1f1f23'}}>{l.codigo || l.id}</div>)}</div></div>
          )}

          {tab!=='dashboard' && tab!=='empresas' && tab!=='productos' && tab!=='lotes' && (
            <div style={{background:'#15161a', border:'1px solid #1f1f23', borderRadius:8, padding:30}}><h2>{menu.flatMap(g=>g.items).find(i=>i.id===tab)?.label}</h2><p style={{color:'#888'}}>Módulo filtrado para Hercom + Trimar</p></div>
          )}
        </div>
      </div>
    </div>
  )
}
