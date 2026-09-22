'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Home() {
  const [inputValue, setInputValue] = useState('PROD-TEST-001');
  const [producto, setProducto] = useState<any>(null);
  const [escaneos, setEscaneos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const escanear = async (codigo: string) => {
    if (!codigo) return;
    setLoading(true);
    setStatus('Registrando escaneo...');

    // 1. Guardar escaneo
    await supabase.from('Escaneos').insert([{ "Código": codigo, "Dispositivo": "web-alpha" } as any]);
    
    // 2. Buscar producto
    let prod = null;
    const q1 = await supabase.from('productos_test').select('*').eq('qr_id', codigo).maybeSingle();
    if (q1.data) prod = q1.data;
    else {
      const q2 = await supabase.from('dpp_test').select('*').eq('qr_id', codigo).maybeSingle();
      prod = q2.data;
    }

    // 3. Traer historial de ese producto
    const { data: historial } = await supabase.from('Escaneos').select('*').eq('Código', codigo).order('created_at', { ascending: false });

    setProducto(prod || { qr_id: codigo, nombre: 'Producto de Prueba - Piso Madera', material: 'Madera Nativa + Barniz Ecológico', origen: 'Temuco, Chile', carbono: '12.5 kg CO2', fabricante: 'Vinculab Test' });
    setEscaneos(historial || []);
    setStatus(`✓ Verificado - ${historial?.length || 1} escaneos registrados`);
    setLoading(false);
  };

  return (
    <main style={{ minHeight: '100vh', background: '#f6f5f2', padding: '16px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ maxWidth: '440px', margin: '0 auto' }}>
        
        {/* HEADER */}
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: '11px', letterSpacing: '2px', color: '#999', fontWeight: 600 }}>VINCULAB / DDP</div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0' }}>Pasaporte Digital</h1>
          <p style={{ fontSize: '13px', color: '#888' }}>Trazabilidad de Producto</p>
        </div>

        {/* BUSCADOR */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '16px', display: 'flex', gap: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', marginBottom: '16px' }}>
          <input value={inputValue} onChange={e=>setInputValue(e.target.value)} style={{ flex: 1, border: '1px solid #eee', borderRadius: '10px', padding: '12px', fontSize: '15px' }} placeholder="Código QR" />
          <button onClick={()=>escanear(inputValue)} disabled={loading} style={{ background: '#111', color: 'white', border: 'none', borderRadius: '10px', padding: '0 20px', fontWeight: 700, cursor: 'pointer' }}>{loading ? '...' : 'Verificar'}</button>
        </div>

        {status && <div style={{ background: '#111', color: 'white', fontSize: '12px', padding: '10px 14px', borderRadius: '10px', marginBottom: '16px', textAlign: 'center' }}>{status}</div>}

        {producto && (
          <>
            {/* CARD PRODUCTO */}
            <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', marginBottom: '16px' }}>
              <div style={{ height: '8px', background: 'linear-gradient(90deg, #16a34a, #22c55e)' }}></div>
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700, letterSpacing: '1px' }}>VERIFICADO ✓</div>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '4px 0 2px' }}>{producto.nombre || producto.name || 'Piso Madera Nativa'}</h2>
                    <p style={{ fontSize: '13px', color: '#888', margin: 0, fontFamily: 'monospace' }}>{producto.qr_id}</p>
                  </div>
                  <div style={{ background: '#f0fdf4', color: '#16a34a', fontSize: '11px', fontWeight: 700, padding: '6px 10px', borderRadius: '20px' }}>A+</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '20px' }}>
                  <div style={{ background: '#fafaf9', padding: '12px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase' }}>Origen</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '2px' }}>{producto.origen || 'Temuco, Chile'}</div>
                  </div>
                  <div style={{ background: '#fafaf9', padding: '12px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase' }}>Fabricante</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '2px' }}>{producto.fabricante || 'Vinculab'}</div>
                  </div>
                  <div style={{ background: '#fafaf9', padding: '12px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase' }}>Material Principal</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '2px' }}>{producto.material || 'Madera Nativa Certificada'}</div>
                  </div>
                  <div style={{ background: '#fafaf9', padding: '12px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase' }}>Huella CO2</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '2px', color: '#16a34a' }}>{producto.carbono || '12.5 kg CO2'}</div>
                  </div>
                </div>

                <div style={{ marginTop: '16px', padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #e2e8f0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, marginBottom: '6px' }}>COMPOSICIÓN</div>
                  <div style={{ fontSize: '12px', color: '#334155', lineHeight: '1.5' }}>
                    • 92% Madera Nativa de Bosque Sostenible<br/>
                    • 6% Barniz Base Agua Bajo VOC<br/>
                    • 2% Unión sin Formaldehído
                  </div>
                </div>
              </div>
            </div>

            {/* HISTORIAL */}
            <div style={{ background: 'white', borderRadius: '20px', padding: '20px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>Historial de Trazabilidad</h3>
                <span style={{ fontSize: '11px', background: '#111', color: 'white', padding: '4px 8px', borderRadius: '20px' }}>{escaneos.length} escaneos</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {escaneos.map((e, i) => (
                  <div key={e.id} style={{ display: 'flex', gap: '10px', fontSize: '12px' }}>
                    <div style={{ width: '8px', height: '8px', background: i===0 ? '#16a34a' : '#ddd', borderRadius: '50%', marginTop: '5px' }}></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{i===0 ? 'Verificación Actual - Web' : `Escaneo #${escaneos.length - i}`} - {e.Dispositivo}</div>
                      <div style={{ color: '#888', fontSize: '11px' }}>{new Date(e.created_at).toLocaleString('es-CL')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <p style={{ textAlign: 'center', fontSize: '11px', color: '#bbb', marginTop: '24px' }}>ddp-qr-test-2-alpha.vercel.app • Supabase Escaneos: {escaneos.length}</p>
      </div>
    </main>
  );
}
