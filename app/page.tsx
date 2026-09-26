"use client"
import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

export default function Page() {
  const [debug, setDebug] = useState("Cargando...")
  const [empresas, setEmpresas] = useState<any[]>([])

  useEffect(() => { check() }, [])

  async function check() {
    let log = `URL: ${supabaseUrl ? "OK " + supabaseUrl.slice(0,20) : "FALTA - No hay env var"}\n`
    log += `KEY: ${supabaseKey ? "OK " + supabaseKey.slice(0,10) : "FALTA - No hay env var"}\n`
    if(!supabase) {
      setDebug(log + "\nERROR: Faltan variables en Vercel. Ve a Vercel > Settings > Environment Variables y agrega las 2 de Supabase")
      return
    }
    log += "\nProbando conexion a empresas...\n"
    const { data, error } = await supabase.from("empresas").select("*")
    if(error) {
      log += `ERROR SUPABASE: ${error.message}\nCodigo: ${error.code}\n\nSOLUCION: En Supabase SQL Editor ejecuta: ALTER TABLE empresas DISABLE ROW LEVEL SECURITY;`
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
    </div>
  )
}
