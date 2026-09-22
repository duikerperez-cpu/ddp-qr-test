'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Home() {
  const [qrId, setQrId] = useState('');
  const [producto, setProducto] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [inputValue, setInputValue] = useState('PROD-TEST-001');
  const [totalEscaneos, setTotalEscaneos] = useState(0);

  const buscarYGuardar = async (codigo: string) => {
    if (!codigo) return;
    setLoading(true);
    setStatus('Guardando...');
    setQrId(codigo);
    
    try {
      // 1. GUARDAR EN Escaneos (con tilde, como está en tu tabla)
      const { error: insertError } = await supabase
        .from('Escaneos')
        .insert([{ "Código": codigo, "Dispositivo": "web-alpha" } as any]);

      if (insertError) {
        setStatus(`Error guardando: ${insertError.message}`);
      } else {
        // Contar cuantos van
        const { count } = await supabase.from('Escaneos').select('*', { count: 'exact', head: true });
        setTotalEscaneos(count || 0);
        setStatus(`Escaneo ${codigo} guardado ✓ - Total: ${count}`);
      }

      // 2. BUSCAR PRODUCTO POR qr_id
      let { data } = await supabase
        .from('productos_test')
        .select('*')
        .eq('qr_id', codigo)
        .maybeSingle();

      if (!data) {
        const res2 = await supabase
          .from('dpp_test')
          .select('*')
          .eq('qr_id', codigo)
          .maybeSingle();
        data = res2.data;
      }

      if (data) {
        setProducto(data);
      } else {
        setProducto({ qr_id: codigo, error: 'Producto no existe en dpp_test ni productos_test. Crea uno con ese qr_id' });
      }

    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    }
    setLoading(false);
  };

  return (
    <main style={{ minHeight: '100vh', background: '#f5f5f5', padding: '24px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '520px', margin: '40px auto', background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 'bold', margin: 0 }}>DDP-QR v2.3</h1>
        <p style={{ fontSize: '13px', color: '#888', margin: '4px 0 20px' }}>Vinculab - Trazabilidad OK</p>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <input
            style={{ flex: 1, border: '1px solid #ddd', borderRadius: '10px', padding: '10px 14px', fontSize: '16px' }}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="PROD-TEST-001"
          />
          <button
            onClick={() => buscarYGuardar(inputValue)}
            disabled={loading}
            style={{ background: 'black', color: 'white', borderRadius: '10px', padding: '10px 18px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {loading ? '...' : 'Escanear'}
          </button>
        </div>

        {status && <div style={{ fontSize: '13px', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '8px 12px', borderRadius: '8px', marginBottom: '16px' }}>{status}</div>}

        {producto && (
          <div style={{ border: '1px solid #eee', borderRadius: '12px', padding: '16px', background: '#fafafa' }}>
            <p style={{ fontSize: '11px', color: '#999', margin: 0, textTransform: 'uppercase' }}>Código Escaneado</p>
            <p style={{ fontFamily: 'monospace', fontWeight: 'bold', margin: '2px 0 12px' }}>{qrId}</p>
            <p style={{ fontSize: '11px', color: '#999', margin: 0, textTransform: 'uppercase' }}>Datos DPP</p>
            <pre style={{ fontSize: '12px', overflow: 'auto', whiteSpace: 'pre-wrap', margin: '8px 0 0', background: 'white', padding: '12px', borderRadius: '8px' }}>
              {JSON.stringify(producto, null, 2)}
            </pre>
          </div>
        )}

        <p style={{ fontSize: '11px', color: '#aaa', marginTop: '16px', textAlign: 'center' }}>Guarda en: public."Escaneos" | Lee de: productos_test.qr_id</p>
      </div>
    </main>
  );
}
