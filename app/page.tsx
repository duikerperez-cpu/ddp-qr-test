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

  const buscarYGuardar = async (codigo: string) => {
    if (!codigo) return;
    setLoading(true);
    setStatus('Guardando...');
    setQrId(codigo);
    
    try {
      // 1. GUARDAR EN ESCANEOS
      const { error: insertError } = await supabase
        .from('Escaneos')
        .insert([{ "Código": codigo, "Dispositivo": "web-alpha" } as any]);

      if (insertError) {
        setStatus(`Error: ${insertError.message}`);
      } else {
        setStatus(`Escaneo ${codigo} guardado ✓`);
      }

      // 2. BUSCAR PRODUCTO - AHORA POR qr_id
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
        setStatus(`Producto encontrado: ${data.nombre || data.sku || codigo} ✓`);
      } else {
        setProducto({ qr_id: codigo, nombre: 'Producto no encontrado en dpp_test ni productos_test', sku: 'Revisa que exista PROD-TEST-001 en la tabla' });
      }

    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    }
    setLoading(false);
  };

  return (
    <main style={{ minHeight: '100vh', background: '#f5f5f5', padding: '24px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '500px', margin: '40px auto', background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>DDP-QR v2.3</h1>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>Vinculab - qr_id fix</p>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <input
            style={{ flex: 1, border: '1px solid #ddd', borderRadius: '8px', padding: '8px 12px' }}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button
            onClick={() => buscarYGuardar(inputValue)}
            disabled={loading}
            style={{ background: 'black', color: 'white', borderRadius: '8px', padding: '8px 16px', border: 'none', fontWeight: 'bold' }}
          >
            {loading ? '...' : 'Escanear'}
          </button>
        </div>

        {status && <p style={{ fontSize: '13px', color: '#333', marginBottom: '16px' }}>{status}</p>}

        {producto && (
          <div style={{ border: '1px solid #eee', borderRadius: '12px', padding: '16px', background: '#fafafa' }}>
            <p style={{ fontSize: '11px', color: '#999', margin: 0 }}>Código</p>
            <p style={{ fontFamily: 'monospace', fontWeight: 'bold', marginBottom: '12px' }}>{qrId}</p>
            <p style={{ fontSize: '11px', color: '#999', margin: 0 }}>Datos DPP</p>
            <pre style={{ fontSize: '12px', overflow: 'auto', whiteSpace: 'pre-wrap', margin: 0 }}>
              {JSON.stringify(producto, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}
