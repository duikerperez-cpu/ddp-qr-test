'use client'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

type Perfil={id:string;empresa_id:string|null;rol:string;activo:boolean}
type Empresa={id:string;razon_social?:string|null;nombre?:string|null;name?:string|null;empresa_nombre?:string|null}
type Producto={id:string;nombre:string|null}
type Modelo={id:string;nombre:string|null}
type Lote={id:string;codigo:string|null}
type Unidad={id:string;codigo:string;lote_id:string;empresa_id:string|null;producto_id:string|null;modelo_id:string|null;numero_unidad:number;estado:string|null;created_at:string|null}

export default function UnidadesPage(){
 const router=useRouter()
 const [perfil,setPerfil]=useState<Perfil|null>(null)
 const [empresaUsuario,setEmpresaUsuario]=useState<Empresa|null>(null)
 const [unidades,setUnidades]=useState<Unidad[]>([])
 const [empresas,setEmpresas]=useState<Empresa[]>([])
 const [productos,setProductos]=useState<Producto[]>([])
 const [modelos,setModelos]=useState<Modelo[]>([])
 const [lotes,setLotes]=useState<Lote[]>([])
 const [buscar,setBuscar]=useState('')
 const [loading,setLoading]=useState(true)
 const [error,setError]=useState('')
 const esSuperadmin=perfil?.rol==='superadmin'
 const nombreEmpresa=empresaUsuario?.razon_social||empresaUsuario?.empresa_nombre||empresaUsuario?.nombre||empresaUsuario?.name||'Mi empresa'

 useEffect(()=>{iniciar()},[])

 async function iniciar(){
  setLoading(true);setError('')
  try{
   const {data:{user},error:userError}=await supabase.auth.getUser()
   if(userError||!user){router.replace('/login');return}
   const {data:p,error:pe}=await supabase.from('perfiles').select('id,empresa_id,rol,activo').eq('id',user.id).maybeSingle()
   if(pe||!p||p.activo===false){await supabase.auth.signOut();router.replace('/login');return}
   const superadmin=p.rol==='superadmin', adminEmpresa=p.rol==='admin_empresa'
   if(!superadmin&&!adminEmpresa){await supabase.auth.signOut();router.replace('/login');return}
   if(adminEmpresa&&!p.empresa_id){setError('Tu usuario no tiene una empresa asociada.');return}
   setPerfil(p as Perfil)
   if(adminEmpresa&&p.empresa_id){
    const {data:e,error:ee}=await supabase.from('empresas').select('id,razon_social,nombre,name,empresa_nombre').eq('id',p.empresa_id).maybeSingle()
    if(ee) throw ee
    setEmpresaUsuario((e||null) as Empresa|null)
   }
   await cargarDatos()
  }catch(err:any){console.error(err);setError(err?.message||'No fue posible cargar las unidades.')}
  finally{setLoading(false)}
 }

 async function cargarDatos(){
  const [u,e,p,m,l]=await Promise.all([
   supabase.from('unidades').select('id,codigo,lote_id,empresa_id,producto_id,modelo_id,numero_unidad,estado,created_at').order('created_at',{ascending:false}),
   supabase.from('empresas').select('id,razon_social,nombre,name,empresa_nombre'),
   supabase.from('productos').select('id,nombre'),
   supabase.from('modelos').select('id,nombre'),
   supabase.from('lotes').select('id,codigo')
  ])
  if(u.error)throw u.error;if(e.error)throw e.error;if(p.error)throw p.error;if(m.error)throw m.error;if(l.error)throw l.error
  setUnidades((u.data||[]) as Unidad[]);setEmpresas((e.data||[]) as Empresa[]);setProductos((p.data||[]) as Producto[]);setModelos((m.data||[]) as Modelo[]);setLotes((l.data||[]) as Lote[])
 }

 const empresaNombre=(id:string|null)=>{const x=empresas.find(v=>v.id===id);return x?.razon_social||x?.empresa_nombre||x?.nombre||x?.name||'—'}
 const productoNombre=(id:string|null)=>productos.find(v=>v.id===id)?.nombre||'—'
 const modeloNombre=(id:string|null)=>modelos.find(v=>v.id===id)?.nombre||'—'
 const loteCodigo=(id:string)=>lotes.find(v=>v.id===id)?.codigo||id.slice(0,12)

 const filtradas=useMemo(()=>{
  const q=buscar.trim().toLowerCase()
  if(!q)return unidades
  return unidades.filter(u=>[u.codigo,u.numero_unidad,u.estado,loteCodigo(u.lote_id),empresaNombre(u.empresa_id),productoNombre(u.producto_id),modeloNombre(u.modelo_id)].filter(v=>v!==null&&v!==undefined).join(' ').toLowerCase().includes(q))
 },[buscar,unidades,empresas,productos,modelos,lotes])

 const activas=unidades.filter(u=>(u.estado||'activo').toLowerCase()==='activo').length
 const lotesUnicos=new Set(unidades.map(u=>u.lote_id)).size

 if(loading)return <div style={S.loading}><div><b style={S.brand}>VINCULAB</b><div style={S.muted}>Cargando unidades...</div></div></div>

 return <div style={S.page}>
  <div style={S.header}>
   <div><div style={S.eyebrow}>{esSuperadmin?'VINCULAB · ADMINISTRACIÓN GLOBAL':`VINCULAB · ${nombreEmpresa.toUpperCase()}`}</div><h1 style={S.title}>Unidades</h1><div style={S.muted}>{esSuperadmin?'Identidades físicas individuales registradas en Vinculab.':`Identidades físicas individuales de ${nombreEmpresa}.`}</div></div>
   <div style={S.actions}><button onClick={()=>router.push(esSuperadmin?'/admin':'/portal')} style={S.btn}>← Dashboard</button><button onClick={async()=>{setLoading(true);try{await cargarDatos()}catch(e:any){setError(e?.message||'No fue posible actualizar.')}finally{setLoading(false)}}} style={S.btn}>↻ Actualizar</button></div>
  </div>

  <div style={{...S.access,...(!esSuperadmin?S.accessClient:{})}}>
   <div><div style={S.accessLabel}>{esSuperadmin?'SUPERADMINISTRADOR':'EMPRESA ACTIVA'}</div><b>{esSuperadmin?'Acceso global Vinculab':nombreEmpresa}</b></div>
   <div style={S.muted}>{esSuperadmin?'Puedes consultar unidades de todas las empresas.':'Solo puedes consultar unidades de tu empresa.'}</div>
  </div>

  {error&&<div style={S.error}>{error}</div>}

  <div style={S.stats}>
   <Stat t="UNIDADES" v={unidades.length}/><Stat t="ACTIVAS" v={activas}/><Stat t="LOTES" v={lotesUnicos}/><Stat t="EMPRESAS" v={esSuperadmin?empresas.length:1}/>
  </div>

  <div style={S.search}><input value={buscar} onChange={e=>setBuscar(e.target.value)} placeholder="Buscar código, producto, modelo, lote o estado..." style={S.input}/></div>

  <div style={S.tableBox}><table style={S.table}><thead><tr><Th>IDENTIDAD</Th><Th>PRODUCTO / MODELO</Th><Th>LOTE</Th><Th>EMPRESA</Th><Th>ESTADO</Th><Th>ACCIONES</Th></tr></thead>
   <tbody>
    {filtradas.length===0&&<tr><td colSpan={6} style={S.empty}>No se encontraron unidades.</td></tr>}
    {filtradas.map(u=><tr key={u.id} style={S.row}>
     <Td><b style={S.code}>{u.codigo}</b><div style={S.small}>Unidad #{u.numero_unidad}</div></Td>
     <Td><div>{productoNombre(u.producto_id)}</div><div style={S.small}>{modeloNombre(u.modelo_id)}</div></Td>
     <Td>{loteCodigo(u.lote_id)}</Td>
     <Td><span style={S.badge}>{empresaNombre(u.empresa_id)}</span></Td>
     <Td><span style={{...S.status,...((u.estado||'activo').toLowerCase()==='activo'?S.active:S.inactive)}}>{u.estado||'activo'}</span></Td>
     <Td><div style={S.actions}><button onClick={()=>window.open(`/u/${encodeURIComponent(u.codigo)}`,'_blank')} style={S.primary}>Ver identidad</button><button onClick={()=>window.open(`/p/${encodeURIComponent(u.codigo)}`,'_blank')} style={S.btnSmall}>Ver público</button></div></Td>
    </tr>)}
   </tbody>
  </table></div>
  <div style={S.footer}>Mostrando {filtradas.length} de {unidades.length} unidades.</div>
 </div>
}

function Stat({t,v}:{t:string;v:number}){return <div style={S.stat}><div style={S.statTitle}>{t}</div><div style={S.statValue}>{v}</div></div>}
function Th({children}:{children:React.ReactNode}){return <th style={S.th}>{children}</th>}
function Td({children}:{children:React.ReactNode}){return <td style={S.td}>{children}</td>}

const S:Record<string,React.CSSProperties>={
 page:{minHeight:'100vh',background:'#09090b',color:'#fff',padding:24,fontFamily:'Inter,system-ui,sans-serif'},
 loading:{minHeight:'100vh',background:'#09090b',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center',fontFamily:'system-ui'},
 brand:{color:'#ff6a00',letterSpacing:2},muted:{color:'#a1a1aa',fontSize:13,marginTop:7},
 header:{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:20,flexWrap:'wrap'},
 eyebrow:{color:'#ff6a00',fontSize:11,fontWeight:900,letterSpacing:1.5},title:{margin:'6px 0 5px',fontSize:32},
 actions:{display:'flex',gap:8,flexWrap:'wrap'},btn:{background:'#18181b',border:'1px solid #27272a',borderRadius:7,color:'#fff',padding:'10px 14px',fontWeight:800,cursor:'pointer'},
 access:{marginTop:20,padding:'12px 15px',borderRadius:10,background:'#18181b',border:'1px solid #27272a',display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap'},
 accessClient:{background:'#111c14',border:'1px solid #1f5130'},accessLabel:{fontSize:10,fontWeight:900,letterSpacing:1,color:'#86efac',marginBottom:4},
 error:{marginTop:18,padding:12,borderRadius:8,background:'#450a0a',border:'1px solid #7f1d1d',color:'#fecaca',fontSize:12},
 stats:{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))',gap:14,marginTop:24},
 stat:{background:'#111923',border:'1px solid #27313c',borderLeft:'3px solid #ff6a00',borderRadius:8,padding:'16px 18px'},
 statTitle:{color:'#7894af',fontSize:9,fontWeight:900,letterSpacing:1.2},statValue:{fontSize:27,fontWeight:900,marginTop:14},
 search:{marginTop:18,background:'#0e141b',border:'1px solid #222d38',borderRadius:8,padding:13},
 input:{width:'100%',maxWidth:720,height:40,boxSizing:'border-box',background:'#090e14',border:'1px solid #293542',borderRadius:6,outline:'none',color:'#fff',padding:'0 14px'},
 tableBox:{marginTop:14,background:'#0e141b',border:'1px solid #222d38',borderRadius:8,overflowX:'auto'},table:{width:'100%',minWidth:1000,borderCollapse:'collapse'},
 th:{textAlign:'left',padding:'13px 15px',color:'#6f8ca8',fontSize:8,fontWeight:900,letterSpacing:1.2,whiteSpace:'nowrap'},
 td:{padding:'14px 15px',verticalAlign:'middle'},row:{borderTop:'1px solid #202a34'},empty:{padding:55,textAlign:'center',color:'#70869c',fontSize:12},
 code:{color:'#ff6a00',fontSize:13},small:{color:'#64819c',fontSize:9,marginTop:4},
 badge:{display:'inline-block',background:'rgba(255,106,0,.10)',border:'1px solid rgba(255,106,0,.35)',color:'#ff812e',padding:'5px 8px',borderRadius:5,fontSize:10,fontWeight:800},
 status:{display:'inline-block',borderRadius:20,padding:'5px 9px',fontSize:8,fontWeight:900,textTransform:'uppercase'},active:{background:'#073524',color:'#31e790'},inactive:{background:'#202833',color:'#94a3b3'},
 primary:{background:'#ff6a00',border:0,borderRadius:6,color:'#fff',padding:'8px 11px',fontSize:10,fontWeight:800,cursor:'pointer'},btnSmall:{background:'#27272a',border:0,borderRadius:6,color:'#fff',padding:'8px 11px',fontSize:10,fontWeight:800,cursor:'pointer'},
 footer:{color:'#526b82',fontSize:10,marginTop:11}
}
