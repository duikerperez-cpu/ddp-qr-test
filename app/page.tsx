'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Cliente Supabase - usa tus variables de Vercel
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
    setStatus('Buscando...');
    setQrId(codigo);
    
    try {
      // 1. GUARDAR EN ESCANEOS (con tilde)
      const { error: insertError } = await supabase
        .from('Escaneos')
        .insert([{ "Código": codigo, "Dispositivo": "web-alpha" } as any]);

      if (insertError) {
        console.error(insertError);
        setStatus(`Error guardando: ${insertError.message}`);
      } else {
        setStatus(`Escaneo ${codigo} guardado ✓`);
      }

      // 2. BUSCAR PRODUCTO EN dpp_test o productos_test
      // Probamos dpp_test primero
      let { data, error } = await supabase
        .from('dpp_test')
        .select('*')
        .eq('codigo', codigo)
        .maybeSingle();

      if (!data) {
        // Si no está en dpp_test, prueba productos_test
        const res2 = await supabase
          .from('productos_test')
          .select('*')
          .eq('codigo', codigo)
          .maybeSingle();
        data = res2.data;
        error = res2.error as any;
      }

      if (data) {
        setProducto(data);
      } else {
        setProducto({ codigo: codigo, material: 'No encontrado, pero escaneo guardado en Escaneos' });
      }

    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6 mt-10">
        <h1 className="text-xl font-bold mb-1">DDP-QR v2.2</h1>
        <p className="text-sm text-gray-500 mb-6">Vinculab - estable</p>

        <div className="flex gap-2 mb-4">
          <input
            className="flex-1 border rounded-lg px-3 py-2 text-sm"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="PROD-TEST-001"
          />
          <button
            onClick={() => buscarYGuardar(inputValue)}
            disabled={loading}
            className="bg-black text-white rounded-lg px-4 py-2 text-sm font-medium"
          >
            {loading ? '...' : 'Escanear'}
          </button>
        </div>

        {status && <p className="text-xs text-gray-600 mb-4">{status}</p>}

        {producto && (
          <div className="border rounded-xl p-4 bg-gray-50">
            <p className="text-xs text-gray-400">Código</p>
            <p className="font-mono font-bold mb-3">{qrId}</p>
            
            <p className="text-xs text-gray-400">Datos DPP</p>
            <pre className="text-xs overflow-auto whitespace-pre-wrap">
              {JSON.stringify(producto, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-6 text-center">
          <a href="https://supabase.com/dashboard/project/fgfoahonirhpmlbanzvy/editor" target="_blank" className="text-xs text-blue-600 underline">
            Ver tabla Escaneos en Supabase
          </a>
        </div>
      </div>
    </main>
  );
}
