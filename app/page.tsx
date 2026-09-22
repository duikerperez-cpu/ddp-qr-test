"use client";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [code, setCode] = useState<string | null>(null);
  const [product, setProduct] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const qrRef = useRef<any>(null);

  const buscarProducto = async (qrId: string) => {
    setCode(qrId);
    // 1. Guarda el escaneo
    await supabase.from("Escaneos").insert({ "Código": qrId, "Dispositivo": "web-alpha" }).catch(()=>{});
    // 2. Busca en dpp_test
    const { data } = await supabase.from("dpp_test").select("*").eq("qr_id", qrId).limit(1).single();
    if(data) setProduct(data);
    else {
      // intenta con productos_test también
      const { data: p2 } = await supabase.from("productos_test").select("*").eq("qr_id", qrId).limit(1).single();
      setProduct(p2 || { qr_id: qrId, Material: "No encontrado", Orígenes: "No encontrado" });
    }
  };

  useEffect(() => {
    if (!isScanning) return;
    (async () => {
      const { Html5Qrcode } = await import("html5-qrcode");
      const qr = new Html5Qrcode("reader");
      qrRef.current = qr;
      await qr.start({ facingMode: "environment" }, { fps: 15, qrbox: 280 },
        async (decoded: string) => {
          await buscarProducto(decoded);
          try{ await qr.stop(); }catch{} setIsScanning(false);
        }, ()=>{}
      );
    })();
    return () => { qrRef.current?.stop().catch(()=>{}); };
  }, [isScanning]);

  return (
    <div style={{ fontFamily:'system-ui', maxWidth:480, margin:'0 auto', padding:20 }}>
      <h1 style={{ fontSize:24, fontWeight:800 }}>Vinculab DPP 🌿</h1>
      <p style={{ color:'#666' }}>Escanea PROD-TEST-001</p>

      {!isScanning? <button onClick={()=>setIsScanning(true)} style={{ width:'100%', padding:16, background:'black', color:'white', borderRadius:12, fontWeight:700, marginTop:20 }}>📷 ESCANEAR QR</button>
      : <button onClick={async()=>{try{await qrRef.current?.stop()}catch{}; setIsScanning(false)}} style={{ width:'100%', padding:16, background:'#ff4444', color:'white', borderRadius:12 }}>Cancelar</button>}

      <div id="reader" style={{ width:'100%', marginTop:20, borderRadius:12, overflow:'hidden' }}></div>

      {code && (
        <div style={{ marginTop:20, padding:16, background:'#f0fdf4', border:'2px solid #16a34a', borderRadius:12 }}>
          <div style={{ fontSize:12, color:'#16a34a', fontWeight:700 }}>QR: {code}</div>
          {product? (
            <div style={{ marginTop:10 }}>
              <div><b>Material:</b> {product.Material || product.material}</div>
              <div><b>Origen:</b> {product.Orígenes || product.origenes}</div>
              <div style={{ marginTop:8, fontSize:12, color:'#555' }}>ID: {product.id}</div>
              <pre style={{ marginTop:10, fontSize:10, background:'#fff', padding:8, overflow:'auto' }}>{JSON.stringify(product.datos_dummy || product, null, 2)}</pre>
            </div>
          ) : <div>Buscando...</div>}
        </div>
      )}
    </div>
  );
}
