async function guardarLote(){
  if(!loteEmpresa||!loteModelo||!loteCantidad) return alert("Falta empresa, modelo y cantidad")
  
  // Solo enviamos lo que tu tabla realmente acepta como TEXTO
  const payload:any = {
    codigo: loteCodigo,
    cantidad: parseInt(loteCantidad),
    modelo_id: loteModelo,
    empresa_id: loteEmpresa,
    producto_id: loteProducto, // ahora es text, ya no falla con PROD-xxx
    estado: "activo"
  }
  const {error}=await supabase.from("lotes").insert(payload)
  if(error){
    // Si aún falla por producto_id, intentamos sin producto_id
    console.log("Fallo con producto_id, reintentando sin el:", error)
    const {producto_id, ...payloadSinProducto} = payload
    const {error: error2}=await supabase.from("lotes").insert(payloadSinProducto)
    if(error2) alert("Error final lotes: "+error2.message)
    else { setShowLoteModal(false); genCodigo(); load(); alert("Lote creado (sin producto_id): "+loteCodigo) }
  } else { 
    setShowLoteModal(false); genCodigo(); load(); alert("Lote creado: "+loteCodigo) 
  }
}
