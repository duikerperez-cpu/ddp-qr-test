"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [scanned, setScanned] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (!isScanning) return;
    let html5QrCode: any;
    (async () => {
      const { Html5Qrcode } = await import("html5-qrcode");
      html5QrCode = new Html5Qrcode("reader");
      html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decoded: string) => {
          setScanned(decoded);
          setHistory(h => [decoded,...h].slice(0, 20));
          setIsScanning(false);
          html5QrCode.stop();
        },
        () => {}
      );
    })();
    return () => { if(html5QrCode) html5QrCode.stop().catch(()=>{}); };
  }, [isScanning]);

  return (
    <div style={{ fontFamily: 'system-ui', maxWidth: 480, margin: '0 auto', padding: 20 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>DDP-QR v2</h1>
      <p style={{ color: '#666' }}>Lector para Vinculab</p>

      {!isScanning? (
        <button onClick={()=>setIsScanning(true)} style={{ width: '100%', padding: 16, marginTop: 20, background: 'black', color: 'white', borderRadius: 12, fontSize: 18, fontWeight: 700 }}>
          📷 Escanear QR
        </button>
      ) : (
        <button onClick={()=>setIsScanning(false)} style={{ width: '100%', padding: 16, marginTop: 20, background: '#ff4444', color: 'white', borderRadius: 12, fontSize: 18 }}>
          Cancelar
        </button>
      )}

      <div id="reader" style={{ width: '100%', marginTop: 20, borderRadius: 12, overflow: 'hidden' }}></div>

      {scanned && (
        <div style={{ marginTop: 20, padding: 16, background: '#e6ffe6', border: '1px solid #00cc00', borderRadius: 12 }}>
          <strong>Último QR:</strong>
          <div style={{ wordBreak: 'break-all', marginTop: 8, fontSize: 18 }}>{scanned}</div>
          <button onClick={()=>{navigator.clipboard.writeText(scanned); alert('Copiado!')}} style={{ marginTop: 12, padding: '8px 12px' }}>Copiar</button>
        </div>
      )}

      {history.length > 0 && (
        <div style={{ marginTop: 30 }}>
          <h3>Historial ({history.length})</h3>
          {history.map((h,i)=><div key={i} style={{ padding: 10, borderBottom: '1px solid #eee', wordBreak: 'break-all', fontSize: 14 }}>{h}</div>)}
          <button onClick={()=>setHistory([])} style={{ marginTop: 10, color: '#999' }}>Borrar historial</button>
        </div>
      )}
    </div>
  );
}
