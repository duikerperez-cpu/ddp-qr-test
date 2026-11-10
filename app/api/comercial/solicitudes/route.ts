import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

const MAX_BODY_BYTES = 12000
const allowedServices = new Set([
  'Software a medida', 'Producción y calidad', 'QR, NFC y trazabilidad',
  'Automatización e IA', 'Desarrollo web', 'Otro',
])

function clean(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max + 1) : ''
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''
    if (!contentType.toLowerCase().includes('application/json')) {
      return NextResponse.json({ error: 'Se requiere JSON.' }, { status: 415 })
    }

    const raw = await request.text()
    if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: 'Solicitud demasiado grande.' }, { status: 413 })
    }

    let body: Record<string, unknown>
    try {
      const parsed: unknown = JSON.parse(raw)
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('invalid')
      body = parsed as Record<string, unknown>
    } catch {
      return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 })
    }

    // Campo trampa para bots. Debe quedar vacío y oculto visualmente en el formulario.
    if (body.website) return NextResponse.json({ ok: true }, { status: 200 })

    const nombre = clean(body.nombre, 120)
    const empresa = clean(body.empresa, 160)
    const correo = clean(body.correo, 254).toLowerCase()
    const telefono = clean(body.telefono, 40)
    const servicio = clean(body.servicio, 100) || 'Otro'
    const requerimiento = clean(body.requerimiento, 5000)

    if (
      nombre.length < 2 || nombre.length > 120 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo) || correo.length > 254 ||
      empresa.length > 160 || telefono.length > 40 ||
      !allowedServices.has(servicio) ||
      requerimiento.length < 10 || requerimiento.length > 5000
    ) {
      return NextResponse.json({ error: 'Revisa los datos ingresados.' }, { status: 400 })
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const secret = process.env.SUPABASE_SECRET_KEY
    if (!url || !secret) {
      console.error('Falta configuración privada de Supabase')
      return NextResponse.json({ error: 'Servicio temporalmente no disponible.' }, { status: 503 })
    }

    const supabase = createClient(url, secret, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const { error } = await supabase.from('solicitudes_comerciales').insert({
      nombre, empresa: empresa || null, correo, telefono: telefono || null,
      servicio, requerimiento, origen: 'asistente_web', estado: 'nuevo',
    })

    if (error) {
      console.error('Error al guardar solicitud comercial:', error.code)
      return NextResponse.json({ error: 'No pudimos guardar la solicitud.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, mensaje: 'Solicitud recibida correctamente.' }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'No se pudo procesar la solicitud.' }, { status: 500 })
  }
}
