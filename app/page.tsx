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
      // 1. GUARDAR EN ESCANEOS - con tilde y as any para que compile
      const { error: insertError } = await supabase
        .from('Escaneos')
        .insert([{ "Código": codigo, "Dispositivo": "web-alpha" } as any]);

      if (insertError) {
        setStatus(`Error guardando: ${insertError.message}`);
        console.error(insertError);
      } else {
        setStatus(`Escaneo ${codigo} guardado ✓`);
      }

      // 2. BUSCAR PRODUCTO
      let { data } = await supabase
        .from('dpp_test')
        .select('*')
        .eq('codigo', codigo)
        .maybeSingle();

      if (!data) {
        const res2 = await supabase
          .from('productos_test')
          .select('*')
          .eq('codigo', codigo)
          .maybeSingle();
        data = res2.data;
      }

      setProducto(data || { codigo: codigo, mensaje: 'Guardado en Escaneos, producto no encontrado en dpp_test' });

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
            className="bg-black text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
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
            Ver tabla Escaneos
          </a>
        </div>
      </div>
    </main>
  );
}
