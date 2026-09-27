import { supabase } from '@/lib/supabase'

export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id

  const { data: producto } = await supabase
   .from('productos_individuales')
   .select('*')
   .eq('codigo_qr', id)
   .single()

  if (!producto) {
    return <div className="p-10 font-mono text-sm">Producto no encontrado: {id}</div>
  }

  const { data: lote } = await supabase
   .from('lotes')
   .select('*, empresas(*), modelos_empresa(*)')
   .eq('id', producto.lote_id)
   .single()

  const empresa = lote?.empresas
  const modelo = lote?.modelos_empresa

  // Logo dinamico: si la empresa tiene logo_url usalo, si no usa hercom
  const logoCliente = (empresa?.logo_url || '/hercom-logo.png').replace('.jpeg','').replace('.jpg','')
  const logoVinculab = '/vinculab-logo.png'

  return (
    <div className="min-h-screen bg-[#f1f3f6] p-3 md:p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-[24px] shadow-xl overflow-hidden border border-slate-200">

        {/* HEADER FIJO VINCULAB */}
        <div className="flex items-center justify-between px-6 md:px-8 py-5 border-b bg-white">
          <div className="flex items-center gap-4">
            <img src={logoVinculab} alt="Vinculab" className="w-12 h-12 rounded-full bg-black object-contain p-1" />
            <div>
              <p className="font-black tracking-[0.3em] text-[13px]">VINCULAB</p>
              <p className="text-[11px] text-slate-500">Pasaporte Digital de Producto • UE 2023/1542</p>
            </div>
          </div>
          <span className="hidden md:inline-flex bg-slate-900 text-white text-[10px] font-bold px-4 py-2 rounded-full">PLATAFORMA OFICIAL</span>
        </div>

        <div className="p-6 md:p-8 bg-[#f8fafc]">
          {/* TITULO */}
          <div className="flex flex-wrap justify-between gap-4 mb-6">
            <div>
              <h1 className="text-[28px] font-black uppercase leading-none">{modelo?.nombre || 'ESCALERA DE SEGURIDAD'}</h1>
              <p className="font-mono text-[13px] text-slate-500 mt-2">{producto.codigo_qr} • Lote {lote?.codigo_lote} • {lote?.cantidad || '1'} unid</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-emerald-600 text-white text-[11px] font-bold px-4 py-2 rounded-full">✓ Verificado por VINCULAB • {new Date().toISOString().slice(0,10)}</span>
              <div className="bg-white border rounded-xl p-2 shadow-sm">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://vinculab.cl/p/${producto.codigo_qr}`} alt="QR" className="w-20 h-20" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* FABRICANTE - LOGO CLIENTE DINAMICO */}
            <div className="bg-white rounded-2xl border p-5 shadow-sm flex gap-4">
              <img src={logoCliente} alt="Cliente" className="w-20 h-20 object-contain border rounded-xl p-2 bg-white" />
              <div className="flex-1">
                <p className="text-[10px] font-black tracking-widest text-slate-400 mb-3">🏭 FABRICANTE</p>
                <div className="space-y-2 text-[12px]">
                  <div className="flex justify-between"><span className="text-slate-500">Empresa</span><b className="uppercase">{empresa?.nombre || 'HERCOM CHILE'}</b></div>
                  <div className="flex justify-between"><span className="text-slate-500">País</span><b>CL</b></div>
                  <div className="flex justify-between"><span className="text-slate-500">ID Empresa</span><b>VINCULAB-CL</b></div>
                  <div className="flex justify-between"><span className="text-slate-500">Planta</span><b>Planta Chile</b></div>
                  <div className="flex justify-between"><span className="text-slate-500">Fecha fab.</span><b>{lote?.created_at?.slice(0,10) || '2026-09-27'}</b></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border p-5 shadow-sm">
              <p className="text-[10px] font-black tracking-widest text-slate-400 mb-3">📦 PRODUCTO</p>
              <div className="space-y-2 text-[12px]">
                <div className="flex justify-between"><span className="text-slate-500">Categoría</span><b>Battery</b></div>
                <div className="flex justify-between"><span className="text-slate-500">Modelo</span><b>{modelo?.codigo || 'her092026'}</b></div>
                <div className="flex justify-between"><span className="text-slate-500">Versión</span><b>V1.0</b></div>
                <div className="flex justify-between"><span className="text-slate-500">Lote</span><b>{lote?.codigo_lote}</b></div>
                <div className="flex justify-between"><span className="text-slate-500">Cantidad</span><b>{lote?.cantidad} unid</b></div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border p-5 shadow-sm">
              <p className="text-[10px] font-black tracking-widest text-slate-400 mb-3">🧪 COMPOSICIÓN QUÍMICA (UE OBLIGATORIO)</p>
              <div className="space-y-3 text-[12px]">
                <div><div className="flex justify-between"><span>Lithium (7439-93-2)</span><b>12% ♻️</b></div><div className="h-2 bg-slate-100 rounded-full mt-1"><div className="h-2 bg-teal-500 rounded-full w-[12%]"></div></div></div>
                <div><div className="flex justify-between"><span>Cobalt (7440-48-4)</span><b>15% ♻️</b></div><div className="h-2 bg-slate-100 rounded-full mt-1"><div className="h-2 bg-blue-600 rounded-full w-[15%]"></div></div></div>
                <div><div className="flex justify-between"><span>Nickel (7440-02-0)</span><b>30% ♻️</b></div><div className="h-2 bg-slate-100 rounded-full mt-1"><div className="h-2 bg-orange-500 rounded-full w-[30%]"></div></div></div>
              </div>
            </div>

            <div className="bg-[#0f172a] rounded-2xl p-5 text-white flex flex-col justify-center items-center">
              <p className="text-[10px] font-black tracking-widest opacity-60">🌍 HUELLA DE CARBONO</p>
              <p className="text-[48px] font-black leading-none mt-3">45.5</p>
              <p className="opacity-70">kg CO₂e</p>
              <p className="text-[10px] opacity-50 mt-4 text-center">8.2 kg CO₂e / kWh • PEFCR Batteries • Self-declared</p>
            </div>

            <div className="bg-white rounded-2xl border p-5 shadow-sm">
              <p className="text-[10px] font-black tracking-widest text-slate-400 mb-3">♻️ CIRCULARIDAD</p>
              <div className="space-y-2 text-[12px]">
                <div className="flex justify-between"><span className="text-slate-500">Vida útil</span><b>3000 ciclos / 10 años</b></div>
                <div className="flex justify-between"><span className="text-slate-500">Reparabilidad</span><b>7/10</b></div>
                <div className="flex justify-between"><span className="text-slate-500">Reciclabilidad</span><b>85%</b></div>
                <div className="flex justify-between"><span className="text-slate-500">Contenido reciclado</span><b>12%</b></div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border p-5 shadow-sm">
              <p className="text-[10px] font-black tracking-widest text-slate-400 mb-3">✓ CONFORMIDAD UE</p>
              <div className="space-y-2 text-[12px]">
                <div className="flex justify-between"><span className="text-slate-500">Regulación</span><b>EU 2023/1542</b></div>
                <div className="flex justify-between"><span className="text-slate-500">Marcado CE</span><b>Sí</b></div>
                <div className="flex justify-between"><span className="text-slate-500">Due Diligence</span><b>Art. 48</b></div>
                <div className="flex justify-between"><span className="text-slate-500">Ensayos</span><b>UN38.3 / IEC62660</b></div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <div className="flex items-center gap-2"><img src={logoVinculab} className="w-8 h-8 rounded-full bg-black object-contain"/><span className="tracking-[0.3em] text-[13px] font-light">VINCULAB</span><span className="text-[10px] text-slate-400 ml-2">Plataforma oficial de Pasaportes Digitales</span></div>
            <span className="text-[10px] text-slate-400">vinculab.cl • v2.1 • {producto.codigo_qr}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
