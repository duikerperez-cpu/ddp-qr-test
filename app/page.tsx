"use client";
import { useEffect, useState, useRef } from "react";

export default function Home() {
  const [scanned, setScanned] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const qrRef = useRef<any>(null);

  useEffect(() => {
    if (!isScanning) return;
    let mounted = true;
    (async () => {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (!mounted) return;
      const qr = new Html5Qrcode("reader");
      qrRef.current = qr;
      try {
        await qr.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decoded: string) => {
            setScanned(decoded);
            setHistory(h => [decoded,...h].slice(0, 20));
            try { await qr.stop(); } catch {}
            setIsScanning(false);
          },
          () => {}
        );
      } catch (e) { console.log(e); }
    })();
    return () => {
      mounted = false;
      if (qrRef.current) {
        qrRef.current.stop().catch(()=>{}).then(()=>qrRef.current?.clear());
      }
    };
  }, [isScanning]);

  return (
    <div style={{ fontFamily: 'system-ui', maxWidth: 480, margin: '0 auto', padding: 20 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>DDP-QR v2.1</h1>
      <p style={{ color: '#666' }}>Lector para Vinculab - Fix</p>

      {!isScanning? (
        <button onClick={()=>setIsScanning(true)} style={{ width: '100%', padding: 16, marginTop: 20, background: 'black', color: 'white', borderRadius: 12, fontSize: 18, fontWeight: 700 }}>
          📷 Escanear QR
        </button>
      ) : (
        <button onClick={async ()=>{
          try{ await qrRef.current?.stop(); }catch{}
          setIsScanning(false);
        }} style={{ width: '100%', padding: 16, marginTop: 20, background: '#ff4444', color: 'white', borderRadius: 12, fontSize: 18 }}>
          Cancelar
        </button>
      )}

      <div id="reader" style={{ width: '100%', marginTop: 20, borderRadius: 12, overflow: 'hidden' }}></div>

      {scanned && (
        <div style={{ marginTop: 20, padding: 16, background: '#e6ffe6', border: '1px solid #00cc00', borderRadius: 12 }}>
          <strong>Último QR:</strong>
          <div style={{ wordBreak: 'break-all', marginTop: 8, fontSize: 18 }}>{scanned}</div>
          <button onClick={()=>{navigator.clipboard.writeText(scanned); alert('Copiado!')}} style={{ marginTop: 12, padding: 8, width: '100%', borderRadius: 8, border: '1px solid #00aa00' }}>📋 Copiar</button>
        </div>
      )}

      {history.length > 0 && (
        <div style={{ marginTop: 30 }}>
          <h3>Historial ({history.length})</h3>
          {history.map((h,i)=><div key={i} style={{ padding: 10, borderBottom: '1px solid #eee', wordBreak: 'break-all', fontSize: 14 }}>{h}</div>)}
          <button onClick={()=>setHistory([])} style={{ marginTop: 10, color: '#999', background: 'none', border: 'none' }}>Borrar historial</button>
        </div>
      )}
    </div>
  );
}
