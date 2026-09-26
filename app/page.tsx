{tab==="individuales" && (
  <>
    <div style={{display:"flex", justifyContent:"space-between"}}>
      <h1>Productos Individuales ({individuales.length})</h1>
      <div style={{display:"flex", gap:8}}>
        <button onClick={async()=>{
          if(lotes.length===0) return alert("No hay lotes")
          for(const lote of lotes){
            const yaExiste = individuales.some(i=>i.lote_id===lote.id || i.lote_id===lote.codigo)
            if(yaExiste) continue
            await generarIndividuales(lote, lote.cantidad||2)
          }
          load()
        }} style={{background:"#1e1e1e", border:"1px solid #333", color:"#ff6a00", padding:"8px 14px", borderRadius:6, fontSize:11, fontWeight:700}}>
          ♻️ Generar QRs de los {lotes.length} lotes existentes
        </button>
        <button onClick={()=>setTab("lotes")} style={{background:"#ff6a00", border:"none", color:"white", padding:"8px 14px", borderRadius:6, fontSize:11}}>+ Nuevo Lote</button>
      </div>
    </div>
    <div style={{marginTop:20, display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:12}}>
      {individuales.map((ind:any)=>(
        <div key={ind.id} style={{background:"#151518", border:"1px solid #222", borderRadius:10, padding:12, textAlign:"center"}}>
          <div style={{fontSize:11, fontWeight:700, marginBottom:8}}>{ind.id}</div>
          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(ind.url_dpp)}`} style={{width:140, height:140, background:"white", padding:6, borderRadius:6}} />
          <div style={{fontSize:9, color:"#888", marginTop:8, wordBreak:"break-all"}}>{ind.url_dpp}</div>
        </div>
      ))}
      {individuales.length===0 && <div style={{gridColumn:"1 / -1", background:"#151518", border:"1px dashed #333", padding:24, borderRadius:8, textAlign:"center", color:"#666"}}>Tienes {lotes.length} lotes sin QR. Dale a "Generar QRs de los {lotes.length} lotes existentes" arriba.</div>}
    </div>
  </>
)}
