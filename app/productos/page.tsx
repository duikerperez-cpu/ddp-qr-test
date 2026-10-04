'use client'

import {
  useEffect,
  useState
} from 'react'

import { useRouter } from 'next/navigation'

import {
  ProductosTable
} from './components/ProductosTable'

import {
  ProductoForm
} from './components/ProductoForm'

import {
  getProductos,
  createProducto,
  updateProducto,
  deleteProducto,
  getPerfilActual,
  getEmpresasProductos,
  supabase,
  PerfilActual,
  EmpresaProducto
} from './lib/queries'

import {
  Producto
} from './types'

export default function ProductosPage() {

  const router = useRouter()

  const [
    productos,
    setProductos
  ] = useState<Producto[]>([])

  const [
    perfil,
    setPerfil
  ] = useState<PerfilActual | null>(null)

  const [
    empresas,
    setEmpresas
  ] = useState<EmpresaProducto[]>([])

  const [
    empresaUsuario,
    setEmpresaUsuario
  ] = useState<EmpresaProducto | null>(null)

  const [
    show,
    setShow
  ] = useState(false)

  const [
    editing,
    setEditing
  ] = useState<Producto | null>(null)

  const [
    loading,
    setLoading
  ] = useState(true)

  const [
    error,
    setError
  ] = useState('')

  /* =========================================================
     VARIABLES DE ACCESO
  ========================================================= */

  const esSuperadmin =
    perfil?.rol === 'superadmin'

  const esAdminEmpresa =
    perfil?.rol === 'admin_empresa'

  const nombreEmpresa =
    empresaUsuario?.razon_social ||
    empresaUsuario?.empresa_nombre ||
    'Mi empresa'

  /* =========================================================
     INICIAR MÓDULO
  ========================================================= */

  useEffect(() => {
    iniciar()
  }, [])

  const iniciar = async () => {
    try {
      setLoading(true)
      setError('')

      /* -------------------------------------------------------
         1. PERFIL
      ------------------------------------------------------- */

      const {
        data: perfilData,
        error: perfilError
      } = await getPerfilActual()

      if (
        perfilError ||
        !perfilData ||
        perfilData.activo === false
      ) {
        console.error(
          'Perfil no autorizado:',
          perfilError
        )

        await supabase.auth.signOut()

        router.replace('/login')
        return
      }

      const superadmin =
        perfilData.rol === 'superadmin'

      const adminEmpresa =
        perfilData.rol === 'admin_empresa'

      if (
        !superadmin &&
        !adminEmpresa
      ) {
        await supabase.auth.signOut()

        router.replace('/login')
        return
      }

      if (
        adminEmpresa &&
        !perfilData.empresa_id
      ) {
        setError(
          'Tu usuario no tiene una empresa asociada.'
        )

        setLoading(false)
        return
      }

      setPerfil(perfilData)

      /* -------------------------------------------------------
         2. EMPRESAS
      ------------------------------------------------------- */

      const {
        data: empresasData,
        error: empresasError
      } = await getEmpresasProductos()

      if (empresasError) {
        console.error(
          'Error cargando empresas:',
          empresasError
        )
      }

      const listaEmpresas =
        (empresasData || []) as EmpresaProducto[]

      setEmpresas(listaEmpresas)

      if (
        adminEmpresa &&
        perfilData.empresa_id
      ) {
        const encontrada =
          listaEmpresas.find(
            (empresa) =>
              empresa.id ===
              perfilData.empresa_id
          )

        if (encontrada) {
          setEmpresaUsuario(encontrada)
        } else {
          /*
            Segunda consulta por seguridad.

            Con RLS el administrador debería
            poder consultar su propia empresa.
          */

          const {
            data: empresaData,
            error: empresaError
          } = await supabase
            .from('empresas')
            .select(`
              id,
              razon_social,
              empresa_nombre
            `)
            .eq(
              'id',
              perfilData.empresa_id
            )
            .maybeSingle()

          if (empresaError) {
            console.error(
              'Error obteniendo empresa:',
              empresaError
            )
          }

          if (empresaData) {
            setEmpresaUsuario(
              empresaData as EmpresaProducto
            )
          }
        }
      }

      /* -------------------------------------------------------
         3. PRODUCTOS
      ------------------------------------------------------- */

      await cargar()

    } catch (err) {
      console.error(
        'Error iniciando Productos:',
        err
      )

      setError(
        'No fue posible cargar el módulo de productos.'
      )

    } finally {
      setLoading(false)
    }
  }

  /* =========================================================
     CARGAR PRODUCTOS
  ========================================================= */

  const cargar = async () => {
    const {
      data,
      error
    } = await getProductos()

    if (error) {
      console.error(
        'Error cargando productos:',
        error
      )

      setError(
        'No fue posible cargar los productos.'
      )

      return
    }

    setProductos(
      (data || []) as Producto[]
    )
  }

  /* =========================================================
     GUARDAR
  ========================================================= */

  const handleSave = async (
    form: any
  ) => {
    setError('')

    const resultado =
      editing
        ? await updateProducto(
            editing.id,
            form
          )
        : await createProducto(form)

    if (resultado.error) {
      console.error(
        'Error guardando producto:',
        resultado.error
      )

      /*
        Lanzamos el error para que ProductoForm
        pueda mostrarlo y NO cerrar el modal.
      */

      throw resultado.error
    }

    setShow(false)
    setEditing(null)

    await cargar()

    return resultado
  }

  /* =========================================================
     ELIMINAR
  ========================================================= */

  const handleDelete = async (
    id: string
  ) => {
    const confirmar = confirm(
      '¿Estás seguro de que deseas borrar este producto?'
    )

    if (!confirmar) return

    setError('')

    const resultado =
      await deleteProducto(id)

    if (resultado.error) {
      console.error(
        'Error eliminando producto:',
        resultado.error
      )

      setError(
        resultado.error.message ||
        'No fue posible eliminar el producto.'
      )

      return
    }

    await cargar()
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <main
        style={{
          minHeight: '100vh',
          background: '#09090b',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily:
            'Inter, system-ui, sans-serif'
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
              fontWeight: 900,
              letterSpacing: 2,
              fontSize: 16
            }}
          >
            VINCULAB
          </div>

          <div
            style={{
              color: '#a1a1aa',
              marginTop: 10,
              fontSize: 13
            }}
          >
            Cargando productos...
          </div>
        </div>
      </main>
    )
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#09090b',
        padding: '32px',
        color: '#ffffff',
        fontFamily:
          'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
      }}
    >
      {/* ENCABEZADO */}

      <div
        style={{
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems: 'center',
          gap: 20,
          marginBottom: 28,
          flexWrap: 'wrap'
        }}
      >
        <div>
          <div
            style={{
              color: '#ff6a00',
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 1.5,
              marginBottom: 6
            }}
          >
            {esSuperadmin
              ? 'VINCULAB · ADMINISTRACIÓN GLOBAL'
              : `VINCULAB · ${nombreEmpresa.toUpperCase()}`}
          </div>

          <h1
            style={{
              margin: 0,
              color: '#ffffff',
              fontSize: 28,
              fontWeight: 700,
              lineHeight: 1.2
            }}
          >
            Productos
          </h1>

          <div
            style={{
              color: '#a1a1aa',
              fontSize: 13,
              marginTop: 7
            }}
          >
            {esSuperadmin
              ? 'Administra los productos registrados por las empresas de Vinculab.'
              : `Administra los productos registrados por ${nombreEmpresa}.`}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 10,
            alignItems: 'center'
          }}
        >
          <button
            type="button"
            onClick={() =>
              router.push(
                esSuperadmin
                  ? '/admin'
                  : '/portal'
              )
            }
            style={{
              background: '#18181b',
              color: '#d4d4d8',
              border:
                '1px solid #27272a',
              borderRadius: 9,
              padding: '12px 16px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            ← Dashboard
          </button>

          <button
            type="button"
            onClick={() => {
              setEditing(null)
              setShow(true)
            }}
            style={{
              background: '#ff6a00',
              color: '#ffffff',
              border: 0,
              borderRadius: 9,
              padding: '12px 20px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow:
                '0 6px 20px rgba(255,106,0,.15)'
            }}
          >
            + Nuevo producto
          </button>
        </div>
      </div>

      {/* IDENTIFICACIÓN DE ACCESO */}

      <div
        style={{
          background: esSuperadmin
            ? '#18181b'
            : '#111c14',
          border: esSuperadmin
            ? '1px solid #27272a'
            : '1px solid #1f5130',
          borderRadius: 10,
          padding: '12px 15px',
          marginBottom: 20,
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap'
        }}
      >
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 900,
              color: esSuperadmin
                ? '#ff6a00'
                : '#86efac',
              letterSpacing: 1
            }}
          >
            {esSuperadmin
              ? 'SUPERADMINISTRADOR'
              : 'EMPRESA ACTIVA'}
          </div>

          <div
            style={{
              marginTop: 4,
              fontSize: 13,
              fontWeight: 700
            }}
          >
            {esSuperadmin
              ? 'Acceso global Vinculab'
              : nombreEmpresa}
          </div>
        </div>

        <div
          style={{
            color: '#71717a',
            fontSize: 11
          }}
        >
          {esSuperadmin
            ? 'Puedes administrar productos de todas las empresas.'
            : 'Solo puedes administrar productos de tu empresa.'}
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div
          style={{
            background: '#450a0a',
            border:
              '1px solid #7f1d1d',
            color: '#fecaca',
            borderRadius: 9,
            padding: 12,
            fontSize: 12,
            marginBottom: 20
          }}
        >
          {error}
        </div>
      )}

      {/* TABLA */}

      <section>
        <ProductosTable
          productos={productos}

          onEdit={(producto) => {
            setEditing(producto)
            setShow(true)
          }}

          onDelete={handleDelete}
        />
      </section>

      {/* MODAL */}

      {show && (
        <ProductoForm
          initial={editing}

          esSuperadmin={
            esSuperadmin
          }

          empresaUsuario={
            empresaUsuario
          }

          empresas={
            empresas
          }

          onSave={
            handleSave
          }

          onClose={() => {
            setShow(false)
            setEditing(null)
          }}
        />
      )}

    </main>
  )
}
