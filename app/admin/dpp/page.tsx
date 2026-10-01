'use client'
import { useState } from 'react'
import QRCode from 'qrcode'

const logos: any = {
  'AUKA - Kombucha': '/auka-logo.png',
  'HERCOM - Plano': '/hercom-logo.png',
  'VINCULAB - Plano': '/vinculab-logo.png'
}

export default function CrearDPP(){
  const [empresa,setEmpresa]=useState('AUKA - Kombucha')
  const [form,setForm]=useState({sabor:'Berries',lote:'2024-A01',medida:'12_39_x_3',asta:'ASTA-AC02',dpto:'DPTO-AC003',url:'URL-CERTIFICADO'})
  const [qr,setQr]=useState('')

  const generar=async()=>{
    const codigo=`DPP-${empresa.split(' ')[0]}-${Date.now().toString().slice(-4)}`
    const url=`https://vinculab.cl/p/${codigo}`
    const canvas=document.createElement('canvas')
    await QRCode.toCanvas(canvas,url,{width:400,margin:2,color:{dark:'#000',light:'#fff'}})
    const ctx=canvas.getContext('2d')!
    const logoImg=new Image()
    logoImg.src=logos[empresa]
    await new Promise(r=>{logoImg.onload=r; logoImg.onerror=r})
    try{
      const size=90
      ctx.fillStyle='white'
      ctx.fillRect(canvas.width/2-size/2-5,canvas.height/2-size/2-5,size+10,size+10)
      ctx.drawImage(logoImg,canvas.width/2-size/2,canvas.height/2-size/2,size,size)
    }catch{}
    setQr(canvas.toDataURL())
  }

  return (
    <div style={{maxWidth:900,margin:'0 auto'}}>
      <h1 style={{textAlign:'center',margin:0,fontSize:18}}>Crear DPP con QR y Logo</h1>
      <p style={{textAlign:'center',fontSize:11,color:'#768088',marginBottom:16}}>QR de alta resolución + logo con borde blanco central</p>
      <div style={{display:'flex',gap:8,justifyContent:'center',marginBottom:16}}>
        {Object.keys(logos).map(k=>(
          <button key={k} onClick={()=>setEmpresa(k)} style={{padding:'6px 12px',borderRadius:20,fontSize:10,fontWeight:800,border:'1px solid #333',background:k===empresa?'white':'#1a1a1a',color:k===empresa?'black':'white',cursor:'pointer'}}>{k}</button>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        <div style={{background:'white',borderRadius:12,padding:16,color:'black'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            <div><label style={{fontSize:8}}>MEDIDA</label><input value={form.medida} onChange={e=>setForm({...form,medida:e.target.value})} style={{width:'100%',border:'1px solid #ddd',borderRadius:6,padding:6,fontSize:12}}/></div>
            <div><label style={{fontSize:8}}>ASTA AC02</label><input value={form.asta} onChange={e=>setForm({...form,asta:e.target.value})} style={{width:'100%',border:'1px solid #ddd',borderRadius:6,padding:6,fontSize:12}}/></div>
            <div><label style={{fontSize:8}}>DPTO AC003</label><input value={form.dpto} onChange={e=>setForm({...form,dpto:e.target.value})} style={{width:'100%',border:'1px solid #ddd',borderRadius:6,padding:6,fontSize:12}}/></div>
            <div><label style={{fontSize:8}}>URL CERTIFICADO</label><input value={form.url} onChange={e=>setForm({...form,url:e.target.value})} style={{width:'100%',border:'1px solid #ddd',borderRadius:6,padding:6,fontSize:12}}/></div>
          </div>
          <button onClick={generar} style={{width:'100%',marginTop:12,background:'#ff6a00',color:'white',border:'none',borderRadius:8,padding:10,fontWeight:900,fontSize:11,cursor:'pointer'}}>CREAR DPP+QR + QR CON LOGO</button>
        </div>
        <div style={{background:'white',borderRadius:12,padding:16,display:'flex',alignItems:'center',justifyContent:'center',minHeight:260}}>
          {qr? <img src={qr} style={{width:'100%',maxWidth:300}}/> : <div style={{fontSize:10,color:'#999'}}>El QR con logo aparecerá por acá</div>}
        </div>
      </div>
    </div>
  )
}
