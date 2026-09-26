"use client"
import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

export default function Page() {
  const [debug, setDebug] = useState<string>("Cargando...")
  const [empresas, setEmpresas] = useState<any[]>([])

  useEffect(() => { check() }, [])

  async function check() {
    let log = `URL: ${supabaseUrl ? "OK " + supabaseUrl.slice(0,20) : "FALTA"}\n`
    log += `KEY: ${supabaseKey ? "OK " + supabaseKey.slice(0,10) : "FALTA"}\n`

    if(!supabase) {
      setDebug(log + "\nERROR: Faltan variables en Vercel. Ve a Vercel > Settings > Environment Variables")
      return
    }

    log += "\nProbando conexion a empresas...\n"
    const { data, error } = await supabase.from("empresas").select("*")
    if(error) {
      log += `ERROR SUPABASE: ${error.message}\nCodigo: ${error.code}\n\nSOLUCION: Ve a Supabase > SQL Editor y ejecuta:\nALTER TABLE empresas DISABLE ROW LEVEL SECURITY;`
      setDebug(log)
    } else {
      log += `Datos encontrados: ${data?.length || 0}\n${JSON.stringify(data?.slice(0,2), null, 2)}`
      setDebug(log)
      setEmpresas(data || [])
    }
  }

  return (
    <div style={{ padding: 20, background: "#0a0a0a", minHeight: "100vh", color: "white", fontFamily: "monospace" }}>
      <h1 style={{ color: "#ff6a00" }}>DEBUG VINCULAB</h1>
      <pre style={{ background: "#111", padding: 16, border: "1px solid #333", borderRadius: 8, whiteSpace: "pre-wrap", fontSize: 12, marginTop: 16 }}>{debug}</pre>
      
      <div style={{ marginTop: 20 }}>
        {empresas.map((e:any) => <div key={e.id} style={{ padding: 10, background: "#151515", marginBottom: 6, border: "1px solid #222" }}>{e.nombre} - {e.id}</div>)}
      </div>

      <div style={{ marginTop: 30, background: "#1a1a1a", padding: 16, borderRadius: 8 }}>
        <h3>CHECKLIST PARA ARREGLAR:</h3>
        <ol style={{ fontSize: 13, color: "#aaa", lineHeight: "1.8" }}>
          <li>1. Vercel > tu proyecto ddp-qr-test-2 > Settings > Environment Variables. ¿Están NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY?</li>
          <li>2. Supabase > SQL Editor > New Query > Pega y RUN: <br/><code>ALTER TABLE empresas DISABLE ROW LEVEL SECURITY; ALTER TABLE productos DISABLE ROW LEVEL SECURITY; ALTER TABLE modelos DISABLE ROW LEVEL SECURITY;</code></li>
          <li>3. Supabase > Table Editor > empresas > ¿Hay filas? Si está vacía, inserta Hercom Chile y Trimar</li>
          <li>4. Haz screenshot de este debug y mándamelo</li>
        </ol>
      </div>
    </div>
  )
}
