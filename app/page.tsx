'use client';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Home() {
  const [inputValue, setInputValue] = useState('PROD-TEST-001');
  const [data, setData] = useState<any>(null);
  const [escaneos, setEscaneos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const escanear = async (codigo: string) => {
    setLoading(true);
    await supabase.from('Escaneos').insert([{ "Código": codigo, "Dispositivo": "web-alpha" } as any]);
    let prod = null;
    const q1 = await supabase.from('productos_test').select('*').eq('qr_id', codigo).maybeSingle();
    if (q1.data) prod = q1.data;
    else {
      const q2 = await supabase.from('dpp_test').select('*').eq('qr_id', codigo).maybeSingle();
      prod = q2.data;
    }
    const { data: hist } = await supabase.from('Escaneos').select('*').eq('Código', codigo).order('created_at', { ascending: false });
    setData(prod || { qr_id: codigo, nombre: 'Piso Madera Dummy', origen: 'Temuco, Chile' });
    setEscaneos(hist || []);
    setLoading(false);
  };

  return (
    <main style={{ minHeight: '100vh', background: '#f4f4f5', padding: '12px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* BUSCADOR TEMPORAL */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '12px', display: 'flex', gap: '8px', marginBottom: '12px', border: '1px solid #e4e4e7' }}>
          <input value={inputValue} onChange={e=>setInputValue(e.target.value)} style={{ flex: 1, border: '1px solid #e4e4e7', borderRadius: '8px', padding: '10px', fontSize: '14px' }} />
          <button onClick={()=>escanear(inputValue)} style={{ background: '#111', color: 'white', border: 'none', borderRadius: '8px', padding: '0 16px', fontWeight: 700 }}>{loading ? '...' : 'Verificar'}</button>
        </div>

        {/* HEADER COMO TU FOTO */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '16px', border: '1px solid #e4e4e7', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div>
            <h1 style={{ fontSize: '16px', fontWeight: 800, margin: 0, textTransform: 'uppercase' }}>{data?.nombre || 'Piso Madera Dummy'}</h1>
            <p style={{ fontSize: '11px', color: '#71717a', margin: '2px 0', fontFamily: 'monospace' }}>VIN: {data?.qr_id || 'PROD-TEST-001'} - Lote hw100220 / Serie 1005404251</p>
            <div style={{ display: 'inline-flex', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', fontSize: '10px', fontWeight: 700, padding: '4px 8px', borderRadius: '20px', marginTop: '8px' }}>✓ Verificado por VINCULAB - 2026-09-19</div>
          </div>
          <div style={{ width: '88px', height: '88px', background: 'white', border: '1px solid #e4e4e7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#999' }}>
            QR<br/>{data?.qr_id}
          </div>
        </div>

        {/* GRID 2 COLUMNAS COMO TU FOTO */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          
          <div style={{ background: 'white', borderRadius: '12px', padding: '14px', border: '1px solid #e4e4e7' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', gap: '6px' }}>🏭 FABRICANTE</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#71717a' }}>Empresa</span><span style={{ fontWeight: 600 }}>HERCOM CHILE</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#71717a' }}>País</span><span style={{ fontWeight: 600 }}>CL</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#71717a' }}>ID Empresa</span><span style={{ fontWeight: 600 }}>VINCULAB-CL</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#71717a' }}>Planta</span><span style={{ fontWeight: 600 }}>Planta CChile</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#71717a' }}>Fecha fabricación</span><span style={{ fontWeight: 600 }}>2026-09-10</span></div>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '12px', padding: '14px', border: '1px solid #e4e4e7' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', marginBottom: '10px' }}>📦 PRODUCTO</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#71717a' }}>Categoría</span><span style={{ fontWeight: 600 }}>Battery</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#71717a' }}>Modelo</span><span style={{ fontWeight: 600 }}>hw100220</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#71717a' }}>Versión</span><span style={{ fontWeight: 600 }}>V1.0</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#71717a' }}>Lote</span><span style={{ fontWeight: 600 }}>{data?.qr_id || 'hw100220'}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#71717a' }}>Cantidad lote</span><span style={{ fontWeight: 600 }}>78 unid</span></div>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '12px', padding: '14px', border: '1px solid #e4e4e7' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', marginBottom: '10px' }}>🧪 COMPOSICIÓN QUÍMICA (DE OBLIGATORIO)</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Lithium (7439-93-2)</span><span style={{ fontWeight: 600 }}>12% 🔗</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Cobalt (7440-48-4)</span><span style={{ fontWeight: 600 }}>15% 🔗</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Nickel (7440-02-0)</span><span style={{ fontWeight: 600 }}>10%</span></div>
              <div style={{ height: '6px', background: '#e4e4e7', borderRadius: '10px', marginTop: '6px', display: 'flex' }}><div style={{ width: '12%', background: '#22c55e', borderRadius: '10px 0 0 10px' }}></div><div style={{ width: '15%', background: '#3b82f6' }}></div><div style={{ width: '10%', background: '#f97316', borderRadius: '0 10px 10px 0' }}></div></div>
              <div style={{ fontSize: '9px', color: '#a1a1aa', marginTop: '4px' }}>Materiales oficiales: Litio, Cobalto, Níquel<br/>Fuente reciclada</div>
            </div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, #111 0%, #f97316 100%)', borderRadius: '12px', padding: '14px', color: 'white' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, opacity: 0.7, textTransform: 'uppercase', marginBottom: '10px' }}>🌍 HUELLA DE CARBONO</div>
            <div style={{ fontSize: '22px', fontWeight: 800, lineHeight: 1 }}>45.6 kg CO₂e</div>
            <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '4px' }}>8.2 kg CO₂ / kWh • Metodología: PEFCR Batteries</div>
            <div style={{ fontSize: '9px', background: 'rgba(255,255,255,0.15)', padding: '6px 8px', borderRadius: '6px', marginTop: '10px', display: 'inline-block' }}>80% Verificación • Verificado: TÜV Rheinland</div>
          </div>

          <div style={{ background: 'white', borderRadius: '12px', padding: '14px', border: '1px solid #e4e4e7' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', marginBottom: '10px' }}>♻️ CIRCULARIDAD</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#71717a' }}>Vida útil</span><span style={{ fontWeight: 700 }}>3000 ciclos / 10 años</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#71717a' }}>Reparabilidad</span><span style={{ fontWeight: 600 }}>7/10</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#71717a' }}>Reciclabilidad</span><span style={{ fontWeight: 600 }}>85%</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#71717a' }}>Contenido reciclado</span><span style={{ fontWeight: 600 }}>12%</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#71717a' }}>Segunda vida</span><span>🔗</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#71717a' }}>Programa retorno VINCULAB</span><span>🔗</span></div>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '12px', padding: '14px', border: '1px solid #e4e4e7' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', marginBottom: '10px' }}>✓ CONFORMIDAD UE</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#71717a' }}>Regulación</span><span style={{ fontWeight: 600 }}>EU 2023/1542</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#71717a' }}>Marcado CE</span><span style={{ fontWeight: 600 }}>Sí</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#71717a' }}>Due Diligence</span><span style={{ fontWeight: 600 }}>Art. 49</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#71717a' }}>Ensayos</span><span style={{ fontWeight: 600 }}>UN38.3 / IEC62660</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}><span style={{ color: '#71717a' }}>Declaración</span><span style={{ fontWeight: 700, color: '#ea580c', textDecoration: 'underline' }}>Ver PDF</span></div>
            </div>
          </div>
        </div>

        {/* HISTORIAL */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '14px', border: '1px solid #e4e4e7', marginTop: '12px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', marginBottom: '10px' }}>↗ HISTORIAL DE TRAZABILIDAD</div>
          <div style={{ fontSize: '11px' }}>
            {escaneos.length > 0 ? escaneos.map((e, i) => (
              <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < escaneos.length -1 ? '1px solid #f4f4f5' : 'none' }}>
                <span style={{ fontWeight: i===0 ? 700 : 400 }}>{i===0 ? 'MANUFACTURED' : `SCAN #${escaneos.length - i}`} - {new Date(e.created_at).toLocaleDateString('es-CL')} - Chile</span>
                <span style={{ color: '#16a34a' }}>✓</span>
              </div>
            )) : <div style={{ color: '#a1a1aa' }}>MANUFACTURED - 2024-09-19 - Chile ✓</div>}
          </div>
        </div>

      </div>
    </main>
  );
}
