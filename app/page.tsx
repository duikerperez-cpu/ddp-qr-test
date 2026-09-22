"use client";
import { useEffect, useState, useRef } from "react";

export default function Home() {
  const [scanned, setScanned] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const qrRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stopScan = async () => {
    try { await qrRef.current?.stop(); qrRef.current?.clear(); } catch {}
    setIsScanning(false);
  };

  useEffect(() => {
    if (!isScanning) return;
    (async () => {
      const { Html5Qrcode } = await import("html5-qrcode");
      const qr = new Html5Qrcode("reader", { verbose: false });
      qrRef.current = qr;
      try {
        await qr.start(
          { facingMode: "environment" },
          { fps: 15, qrbox: 280, aspectRatio: 1.0 },
          async (decoded: string) => {
            setScanned(decoded);
            setHistory(h => [decoded,...h].slice(0, 20));
            await stopScan();
          },
          () => {}
        );
      } catch {}
    })();
    return () => { stopScan(); };
  }, [isScanning]);

  const onFile = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { Html5Qrcode } = await import("html5-qrcode");
    const qr = new Html5Qrcode("reader-file");
    try {
      const decoded = await qr.scanFile(file, true);
      setScanned(decoded);
      setHistory(h => [decoded,...h].slice(0, 20));
    } catch { alert("No pude leer ese QR, prueba otra foto más nítida"); }
  };

  return (
    <div style={{ fontFamily: 'system-ui', maxWidth: 480, margin: '0 auto', padding: 20 }}>
      <h1 style={{ fontSize: 26, fontWeight: 800 }}>DDP-QR v2.2</h1>
      <p style={{ color: '#666' }}>Vinculab - estable</p>

      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        {!isScanning? (
          <button onClick={()=>setIsScanning(true)} style={{ flex: 1, padding: 16, background: 'black', color: 'white', borderRadius: 12, fontWeight: 700 }}>📷 Escanear</button>
        ) : (
          <button onClick={stopScan} style={{ flex: 1, padding: 16, background: '#ff4444', color: 'white', borderRadius: 12 }}>Cancelar</button>
        )}
        <button onClick={()=>fileInputRef.current?.click()} style={{ flex: 1, padding: 16, background: '#eee', borderRadius: 12, fontWeight: 700 }}>🖼️ Subir Foto</button>
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={onFile} style={{ display: 'none' }} />

      <div id="reader" style={{ width: '100%', marginTop: 20, borderRadius: 12, overflow: 'hidden' }}></div>
      <div id="reader-file" style={{ display: 'none' }}></div>

      {scanned && (
        <div style={{ marginTop: 20, padding: 16, background: '#e6ffe6', border: '2px solid #00aa00', borderRadius: 12 }}>
          <div style={{ fontSize: 12, color: '#008800' }}>LEÍDO CON ÉXITO</div>
          <div style={{ wordBreak: 'break-all', marginTop: 8, fontSize: 18, fontWeight: 600 }}>{scanned}</div>
          <button onClick={()=>{navigator.clipboard.writeText(scanned); alert('Copiado!')}} style={{ marginTop: 12, width: '100%', padding: 12, borderRadius: 8, background: 'black', color: 'white' }}>Copiar</button>
        </div>
      )}

      <div style={{ marginTop: 10, fontSize: 12, color: '#999', background: '#f5f5f5', padding: 10, borderRadius: 8 }}>
        Tip: Si no lee de la pantalla, sácale una foto nítida al QR y usa "Subir Foto". Es 10x más confiable.
      </div>

      {history.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3>Historial ({history.length})</h3>
          {history.map((h,i)=><div key={i} style={{ padding: 8, borderBottom: '1px solid #eee', wordBreak: 'break-all', fontSize: 13 }}>{i+1}. {h}</div>)}
        </div>
      )}
    </div>
  );
}
