'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const iniciarSesion = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      setError('Ingresa tu correo y contraseña.')
      return
    }

    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    })

    if (error) {
      console.error(error)
      setError('Correo o contraseña incorrectos.')
      setLoading(false)
      return
    }

    if (!data.user) {
      setError('No fue posible iniciar sesión.')
      setLoading(false)
      return
    }

    const { data: perfil, error: perfilError } = await supabase
      .from('perfiles')
      .select('rol, activo, empresa_id, nombre')
      .eq('id', data.user.id)
      .maybeSingle()

    if (perfilError || !perfil) {
      await supabase.auth.signOut()
      setError('Este usuario no tiene un perfil autorizado en Vinculab.')
      setLoading(false)
      return
    }

    if (!perfil.activo) {
      await supabase.auth.signOut()
      setError('Este usuario se encuentra desactivado.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#09090b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        fontFamily: 'system-ui'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: '#18181b',
          border: '1px solid #27272a',
          borderRadius: 20,
          padding: 32,
          boxShadow: '0 25px 60px rgba(0,0,0,.45)'
        }}
      >
        <div
          style={{
            color: '#ff6a00',
            fontSize: 18,
            fontWeight: 900,
            letterSpacing: 3
          }}
        >
          VINCULAB
        </div>

        <div
          style={{
            color: '#a1a1aa',
            fontSize: 12,
            marginTop: 5
          }}
        >
          Plataforma de identidad y trazabilidad
        </div>

        <h1
          style={{
            color: 'white',
            fontSize: 26,
            marginTop: 35,
            marginBottom: 5
          }}
        >
          Iniciar sesión
        </h1>

        <p
          style={{
            color: '#a1a1aa',
            fontSize: 13,
            marginTop: 0,
            marginBottom: 25
          }}
        >
          Acceso al panel de administración
        </p>

        <form onSubmit={iniciarSesion}>

          <label
            style={{
              color: '#d4d4d8',
              fontSize: 11,
              fontWeight: 800
            }}
          >
            CORREO ELECTRÓNICO
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="contacto@vinculab.cl"
            autoComplete="email"
            style={{
              width: '100%',
              boxSizing: 'border-box',
              background: '#09090b',
              border: '1px solid #3f3f46',
              borderRadius: 9,
              padding: '12px 13px',
              color: 'white',
              fontSize: 14,
              marginTop: 7,
              marginBottom: 18,
              outline: 'none'
            }}
          />

          <label
            style={{
              color: '#d4d4d8',
              fontSize: 11,
              fontWeight: 800
            }}
          >
            CONTRASEÑA
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            style={{
              width: '100%',
              boxSizing: 'border-box',
              background: '#09090b',
              border: '1px solid #3f3f46',
              borderRadius: 9,
              padding: '12px 13px',
              color: 'white',
              fontSize: 14,
              marginTop: 7,
              marginBottom: 18,
              outline: 'none'
            }}
          />

          {error && (
            <div
              style={{
                background: '#450a0a',
                border: '1px solid #7f1d1d',
                color: '#fecaca',
                borderRadius: 9,
                padding: 12,
                fontSize: 12,
                marginBottom: 18
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? '#78350f' : '#ff6a00',
              border: 0,
              borderRadius: 9,
              padding: 13,
              color: 'white',
              fontSize: 14,
              fontWeight: 900,
              cursor: loading ? 'wait' : 'pointer'
            }}
          >
            {loading ? 'Ingresando...' : 'Ingresar a Vinculab'}
          </button>

        </form>

        <div
          style={{
            borderTop: '1px solid #27272a',
            marginTop: 28,
            paddingTop: 20,
            textAlign: 'center',
            color: '#71717a',
            fontSize: 10
          }}
        >
          ACCESO SEGURO • VINCULAB.CL
        </div>
      </div>
    </div>
  )
}
