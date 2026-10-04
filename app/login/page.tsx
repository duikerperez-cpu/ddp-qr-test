'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Perfil = {
  rol: string | null
  activo: boolean | null
  empresa_id: string | null
  nombre: string | null
}

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [mostrarPassword, setMostrarPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [verificandoSesion, setVerificandoSesion] = useState(true)

  const [error, setError] = useState('')

  /* =========================================================
     NORMALIZAR ROL
  ========================================================= */

  const normalizarRol = (rol: string | null | undefined) => {
    return String(rol || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/_/g, '')
      .replace(/-/g, '')
  }

  /* =========================================================
     DETERMINAR DESTINO SEGÚN PERFIL
  ========================================================= */

  const obtenerDestino = (perfil: Perfil) => {
    const rol = normalizarRol(perfil.rol)

    /*
      SUPER ADMIN VINCULAB

      Aceptamos:
      superadmin
      super_admin
      super-admin
      Super Admin
    */

    if (rol === 'superadmin') {
      return '/admin'
    }

    /*
      USUARIO DE EMPRESA

      Todo usuario que NO sea superadmin
      debe estar asociado a una empresa.

      Más adelante podremos diferenciar:
      administrador
      operador
      consulta
      etc.
    */

    if (perfil.empresa_id) {
      return '/portal'
    }

    return null
  }

  /* =========================================================
     OBTENER PERFIL DEL USUARIO
  ========================================================= */

  const obtenerPerfil = async (userId: string) => {
    const { data, error } = await supabase
      .from('perfiles')
      .select('rol, activo, empresa_id, nombre')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.error('Error obteniendo perfil:', error)
      return null
    }

    return data as Perfil | null
  }

  /* =========================================================
     VERIFICAR SI YA EXISTE SESIÓN
  ========================================================= */

  useEffect(() => {
    let activo = true

    const verificarSesion = async () => {
      try {
        const {
          data: { session }
        } = await supabase.auth.getSession()

        if (!activo) return

        if (!session?.user) {
          setVerificandoSesion(false)
          return
        }

        const perfil = await obtenerPerfil(session.user.id)

        if (!activo) return

        if (!perfil) {
          await supabase.auth.signOut()
          setVerificandoSesion(false)
          return
        }

        if (!perfil.activo) {
          await supabase.auth.signOut()
          setVerificandoSesion(false)
          return
        }

        const destino = obtenerDestino(perfil)

        if (!destino) {
          await supabase.auth.signOut()
          setVerificandoSesion(false)
          return
        }

        router.replace(destino)
        router.refresh()

      } catch (err) {
        console.error('Error verificando sesión:', err)

        if (activo) {
          setVerificandoSesion(false)
        }
      }
    }

    verificarSesion()

    return () => {
      activo = false
    }
  }, [])

  /* =========================================================
     INICIAR SESIÓN
  ========================================================= */

  const iniciarSesion = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim() || !password) {
      setError('Ingresa tu correo y contraseña.')
      return
    }

    setLoading(true)
    setError('')

    try {
      /* -------------------------------------------------------
         1. AUTENTICACIÓN SUPABASE
      ------------------------------------------------------- */

      const {
        data,
        error: loginError
      } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      })

      if (loginError) {
        console.error('Error login:', loginError)

        setError('Correo o contraseña incorrectos.')
        setLoading(false)
        return
      }

      if (!data.user) {
        setError('No fue posible iniciar sesión.')
        setLoading(false)
        return
      }

      /* -------------------------------------------------------
         2. CONSULTAR PERFIL
      ------------------------------------------------------- */

      const perfil = await obtenerPerfil(data.user.id)

      if (!perfil) {
        await supabase.auth.signOut()

        setError(
          'Este usuario no tiene un perfil autorizado en Vinculab.'
        )

        setLoading(false)
        return
      }

      /* -------------------------------------------------------
         3. VALIDAR USUARIO ACTIVO
      ------------------------------------------------------- */

      if (!perfil.activo) {
        await supabase.auth.signOut()

        setError(
          'Este usuario se encuentra desactivado.'
        )

        setLoading(false)
        return
      }

      /* -------------------------------------------------------
         4. DETERMINAR DESTINO
      ------------------------------------------------------- */

      const destino = obtenerDestino(perfil)

      if (!destino) {
        await supabase.auth.signOut()

        setError(
          'Este usuario no tiene una empresa o rol autorizado.'
        )

        setLoading(false)
        return
      }

      /* -------------------------------------------------------
         5. REDIRECCIONAR
      ------------------------------------------------------- */

      router.replace(destino)
      router.refresh()

    } catch (err) {
      console.error('Error iniciando sesión:', err)

      setError(
        'Ocurrió un problema al iniciar sesión. Intenta nuevamente.'
      )

      setLoading(false)
    }
  }

  /* =========================================================
     VERIFICANDO SESIÓN
  ========================================================= */

  if (verificandoSesion) {
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
            textAlign: 'center'
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
              marginTop: 12
            }}
          >
            Verificando sesión...
          </div>
        </div>
      </div>
    )
  }

  /* =========================================================
     LOGIN
  ========================================================= */

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
        {/* LOGO */}

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

        {/* TITULO */}

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
          Acceso seguro a tu espacio de administración
        </p>

        {/* FORMULARIO */}

        <form onSubmit={iniciarSesion}>

          {/* EMAIL */}

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
            onChange={(e) => {
              setEmail(e.target.value)

              if (error) {
                setError('')
              }
            }}
            placeholder="usuario@empresa.cl"
            autoComplete="email"
            disabled={loading}
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
              outline: 'none',
              opacity: loading ? 0.7 : 1
            }}
          />

          {/* CONTRASEÑA */}

          <label
            style={{
              color: '#d4d4d8',
              fontSize: 11,
              fontWeight: 800
            }}
          >
            CONTRASEÑA
          </label>

          <div
            style={{
              position: 'relative',
              marginTop: 7,
              marginBottom: 18
            }}
          >
            <input
              type={mostrarPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)

                if (error) {
                  setError('')
                }
              }}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={loading}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: '#09090b',
                border: '1px solid #3f3f46',
                borderRadius: 9,
                padding: '12px 80px 12px 13px',
                color: 'white',
                fontSize: 14,
                outline: 'none',
                opacity: loading ? 0.7 : 1
              }}
            />

            <button
              type="button"
              onClick={() => setMostrarPassword(!mostrarPassword)}
              disabled={loading}
              style={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 0,
                color: '#a1a1aa',
                fontSize: 11,
                fontWeight: 800,
                cursor: 'pointer',
                padding: 5
              }}
            >
              {mostrarPassword ? 'OCULTAR' : 'VER'}
            </button>
          </div>

          {/* ERROR */}

          {error && (
            <div
              style={{
                background: '#450a0a',
                border: '1px solid #7f1d1d',
                color: '#fecaca',
                borderRadius: 9,
                padding: 12,
                fontSize: 12,
                marginBottom: 18,
                lineHeight: 1.5
              }}
            >
              {error}
            </div>
          )}

          {/* BOTÓN */}

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
              cursor: loading ? 'wait' : 'pointer',
              transition: 'all .2s ease'
            }}
          >
            {loading
              ? 'Verificando acceso...'
              : 'Ingresar a Vinculab'}
          </button>

        </form>

        {/* FOOTER */}

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
