import { supabase } from '@/lib/supabase'

export default async function Page({ params }: { params: { id: string } }) {
  const { data: producto } = await supabase.from('productos_individuales').select('*').eq('codigo_qr', params.id).single()
  if(!producto) return <div className="p-10">No encontrado: {params.id}</div>
  const { data: lote } = await supabase.from('lotes').select('*, empresas(*)').eq('id', producto.lote_id).single()

  return (
    <div className="min-h-screen bg-[#f1f3f6] p-4">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl border shadow-xl overflow-hidden">

        {/* HEADER VINCULAB SIN IMAGEN - CSS PURO */}
        <div className="flex items-center gap-3 p-5 border-b bg-white">
          <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-black text-xl">V</div>
          <div>
            <p className="font-black tracking-[0.3em] text-sm">VINCULAB</p>
            <p className="text-[11px] text-slate-500">Plataforma Oficial DPP • UE 2023/1542</p>
          </div>
          <div className="ml-auto bg-slate-900 text-white text-[10px] px-3 py-1 rounded-full">✓ VERIFICADO</div>
        </div>

        <div className="p-6 bg-[#f8fafc]">
          <div className="flex justify-between">
            <div>
              <h1 className="text-2xl font-black">ESCALERA DE SEGURIDAD</h1>
              <p className="font-mono text-xs text-slate-500 mt-1">{producto.codigo_qr} • {lote?.codigo_lote}</p>
            </div>
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://vinculab.cl/p/${producto.codigo_qr}`} className="w-16 h-16 border rounded-lg p-1 bg-white" alt="QR"/>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-white border rounded-xl p-5">
              <p className="text-[10px] font-black tracking-widest text-slate-400">🏭 FABRICANTE - CLIENTE DINÁMICO</p>
              <div className="flex gap-3 mt-3">
                <div className="w-14 h-14 rounded-lg bg-orange-500 text-white flex items-center justify-center font-black">H</div>
                <div className="text-xs"><b>{lote?.empresas?.nombre || 'HERCOM CHILE'}</b><br/><span className="text-slate-500">Planta Santiago, Chile<br/>RUT: 76.XXX.XXX-5</span></div>
              </div>
            </div>
            <div className="bg-white border rounded-xl p-5"><p className="text-[10px] font-black text-slate-400">📦 PRODUCTO</p><p className="text-xs mt-2">Modelo: her092026<br/>Lote: {lote?.codigo_lote}<br/>Cantidad: {lote?.cantidad}</p></div>
            <div className="bg-[#0f172a] text-white rounded-xl p-5 text-center"><p className="text-[10px] opacity-60">HUELLA DE CARBONO</p><p className="text-4xl font-black mt-2">45.5 kg CO2e</p></div>
            <div className="bg-white border rounded-xl p-5"><p className="text-[10px] font-black text-slate-400">♻️ CIRCULARIDAD</p><p className="text-xs mt-2">Reciclable 95% • Índice 82/100<br/>Diseñado para desmontaje</p></div>
          </div>

          <div className="mt-6 pt-4 border-t flex justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center font-bold">V</div> VINCULAB - Plataforma oficial</span>
            <span>vinculab.cl • {producto.codigo_qr}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
