"use client";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [scanned, setScanned] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const qrRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadHistory = async () => {
    const { data } = await supabase.from("scans").select("*").order("created_at", { ascending: false }).limit(20);
    if (data) setHistory(data);
  };
  useEffect(() => { loadHistory(); }, []);

  const saveScan = async (code: string) => {
    setScanned(code);
    await supabase.from("scans").insert({ code, device: "celular" });
    loadHistory();
  };

  useEffect(() => {
    if (!isScanning) return;
    (async () => {
      const { Html5Qrcode } = await import("html5-qrcode");
      const qr = new Html5Qrcode("reader");
      qrRef.current = qr;
      await qr.start({ facingMode: "environment" }, { fps: 15, qrbox: 280 },
        async (decoded: string) => {
          await saveScan(decoded);
          try{ await qr.stop(); }catch{} setIsScanning(false);
        }, () => {}
      );
    })();
    return () => { qrRef.current?.stop().catch(()=>{}); };
  }, [isScanning]);

  return (
    <div style={{ fontFamily: 'system-ui', maxWidth: 480, margin: '0 auto', padding: 20 }}>
      <h1 style={{ fontSize: 26, fontWeight: 800 }}>DDP-QR v3 ☁️</h1>
      <p style={{ color: '#666' }}>Vinculab - con base de datos</p>
      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        {!isScanning? <button onClick={()=>setIsScanning(true)} style={{ flex:1, padding:16, background:'black', color:'white', borderRadius:12, fontWeight:700 }}>📷 Escanear</button>
        : <button onClick={async()=>{try{await qrRef.current?.stop()}catch{}; setIsScanning(false)}} style={{ flex:1, padding:16, background:'#ff4444', color:'white', borderRadius:12 }}>Cancelar</button>}
        <button onClick={()=>fileInputRef.current?.click()} style={{ flex:1, padding:16, background:'#eee', borderRadius:12 }}>🖼️ Foto</button>
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={async (e:any)=>{
        const file=e.target.files?.[0]; if(!file) return;
        const { Html5Qrcode } = await import("html5-qrcode");
        const qr = new Html5Qrcode("reader-file");
        try{ const d=await qr.scanFile(file,true); await saveScan(d); }catch{ alert("No leí el QR"); }
      }} style={{ display:'none' }} />
      <div id="reader" style={{ width:'100%', marginTop:20, borderRadius:12, overflow:'hidden' }}></div>
      <div id="reader-file" style={{ display:'none' }}></div>
      {scanned && <div style={{ marginTop:20, padding:16, background:'#e6ffe6', border:'2px solid #00aa00', borderRadius:12 }}><div style={{ fontSize:12 }}>GUARDADO EN LA NUBE ✅</div><div style={{ wordBreak:'break-all', marginTop:8 }}>{scanned}</div></div>}
      <div style={{ marginTop:30 }}><h3>Historial en la nube ({history.length})</h3>
        {history.map((h:any)=><div key={h.id} style={{ padding:8, borderBottom:'1px solid #eee', fontSize:12 }}>{new Date(h.created_at).toLocaleTimeString()} - {h.code}</div>)}
      </div>
    </div>
  );
}
