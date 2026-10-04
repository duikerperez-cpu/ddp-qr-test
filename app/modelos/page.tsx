'use client'

import {
  useEffect,
  useState
} from 'react'

import {
  useRouter
} from 'next/navigation'

import {
  ModelosTable
} from './components/ModelosTable'

import {
  ModeloForm
} from './components/ModeloForm'

import {
  AtributosModelo
} from './components/AtributosModelo'

import {
  getModelos,
  getEmpresas,
  getProductos,
  getPerfilActual,
  createModelo,
  updateModelo,
  deleteModelo,
  supabase,
  PerfilActual
} from './lib/queries'

import {
  Modelo,
  Empresa,
  Producto
} from './types'

export default function ModelosPage() {

  const router =
    useRouter()

  const [
    modelos,
    setModelos
  ] = useState<Modelo[]>([])

  const [
    empresas,
    setEmpresas
  ] = useState<Empresa[]>([])

  const [
    productos,
    setProductos
  ] = useState<Producto[]>([])

  const [
    perfil,
    setPerfil
  ] = useState<PerfilActual | null>(
    null
  )

  const [
    empresaUsuario,
    setEmpresaUsuario
  ] = useState<Empresa | null>(
    null
  )

  const [
    showForm,
    setShowForm
  ] = useState(false)

  const [
    editing,
    setEditing
  ] = useState<Modelo | null>(
    null
  )

  const [
    modeloAtributos,
    setModeloAtributos
  ] = useState<Modelo | null>(
    null
  )

  const [
    loading,
    setLoading
  ] = useState(true)

  const [
    error,
    setError
  ] = useState('')

  /* =========================================================
     ACCESO
  ========================================================= */

  const esSuperadmin =
    perfil?.rol ===
    'superadmin'

  const esAdminEmpresa =
    perfil?.rol ===
    'admin_empresa'

  const nombreEmpresa =
    empresaUsuario?.razon_social ||
    'Mi empresa'

  /* =========================================================
     INICIAR
  ========================================================= */

  useEffect(() => {
    iniciar()
  }, [])

  const iniciar =
    async () => {

      setLoading(true)
      setError('')

      try {

        /* ---------------------------------------------------
           PERFIL
        --------------------------------------------------- */

        const {
          data: perfilData,
          error: perfilError
        } =
          await getPerfilActual()

        if (
          perfilError ||
          !perfilData ||
          perfilData.activo ===
            false
        ) {

          console.error(
            'Perfil no autorizado:',
            perfilError
          )

          await supabase.auth.signOut()

          router.replace(
            '/login'
          )

          return
        }

        const superadmin =
          perfilData.rol ===
          'superadmin'

        const adminEmpresa =
          perfilData.rol ===
          'admin_empresa'

        if (
          !superadmin &&
          !adminEmpresa
        ) {

          await supabase.auth.signOut()

          router.replace(
            '/login'
          )

          return
        }

        if (
          adminEmpresa &&
          !perfilData.empresa_id
        ) {

          setError(
            'Tu usuario no tiene una empresa asociada.'
          )

          return
        }

        setPerfil(
          perfilData
        )

        /* ---------------------------------------------------
           CARGAR INFORMACIÓN

           RLS ya filtra:
           - empresas
           - productos
           - modelos
        --------------------------------------------------- */

        const [
          modelosRes,
          empresasRes,
          productosRes
        ] =
          await Promise.all([
            getModelos(),
            getEmpresas(),
            getProductos()
          ])

        /* ---------------------------------------------------
           MODELOS
        --------------------------------------------------- */

        if (
          modelosRes.error
        ) {

          console.error(
            modelosRes.error
          )

          setError(
            'No fue posible cargar los modelos.'
          )

        } else {

          setModelos(
            (modelosRes.data ||
              []) as Modelo[]
          )

        }

        /* ---------------------------------------------------
           EMPRESAS
        --------------------------------------------------- */

        let listaEmpresas:
          Empresa[] = []

        if (
          empresasRes.error
        ) {

          console.error(
            'Error cargando empresas:',
            empresasRes.error
          )

        } else {

          listaEmpresas =
            (empresasRes.data ||
              []) as Empresa[]

          setEmpresas(
            listaEmpresas
          )

        }

        /* ---------------------------------------------------
           PRODUCTOS
        --------------------------------------------------- */

        if (
          productosRes.error
        ) {

          console.error(
            'Error cargando productos:',
            productosRes.error
          )

        } else {

          setProductos(
            (productosRes.data ||
              []) as Producto[]
          )

        }

        /* ---------------------------------------------------
           EMPRESA DEL ADMINISTRADOR
        --------------------------------------------------- */

        if (
          adminEmpresa &&
          perfilData.empresa_id
        ) {

          let encontrada =
            listaEmpresas.find(
              empresa =>
                empresa.id ===
                perfilData.empresa_id
            )

          /*
            Si por alguna razón no vino en
            getEmpresas, intentamos consultar
            específicamente su empresa.
          */

          if (!encontrada) {

            const {
              data: empresaData,
              error: empresaError
            } =
              await supabase
                .from('empresas')
                .select(
                  'id, razon_social'
                )
                .eq(
                  'id',
                  perfilData.empresa_id
                )
                .maybeSingle()

            if (
              empresaError
            ) {

              console.error(
                'Error obteniendo empresa:',
                empresaError
              )

            }

            if (
              empresaData
            ) {

              encontrada =
                empresaData as Empresa

            }

          }

          if (encontrada) {

            setEmpresaUsuario(
              encontrada
            )

          }

        }

      } catch (err) {

        console.error(
          err
        )

        setError(
          'Error cargando información.'
        )

      } finally {

        setLoading(false)

      }
    }

  /* =========================================================
     RECARGAR DATOS DEL MÓDULO
  ========================================================= */

  const cargar =
    async () => {

      const [
        modelosRes,
        empresasRes,
        productosRes
      ] =
        await Promise.all([
          getModelos(),
          getEmpresas(),
          getProductos()
        ])

      if (
        modelosRes.error
      ) {

        console.error(
          modelosRes.error
        )

        setError(
          'No fue posible cargar los modelos.'
        )

      } else {

        setModelos(
          (modelosRes.data ||
            []) as Modelo[]
        )

      }

      if (
        !empresasRes.error
      ) {

        setEmpresas(
          (empresasRes.data ||
            []) as Empresa[]
        )

      }

      if (
        !productosRes.error
      ) {

        setProductos(
          (productosRes.data ||
            []) as Producto[]
        )

      }
    }

  /* =========================================================
     GUARDAR
  ========================================================= */

  const handleSave =
    async (
      formData: any
    ) => {

      setError('')

      const resultado =
        editing
          ? await updateModelo(
              editing.id,
              formData
            )
          : await createModelo(
              formData
            )

      if (
        resultado.error
      ) {

        console.error(
          'Error guardando modelo:',
          resultado.error
        )

        /*
          Importante:
          lanzamos el error para que
          ModeloForm mantenga abierto
          el modal y muestre el mensaje.
        */

        throw resultado.error

      }

      setShowForm(false)

      setEditing(null)

      await cargar()

      return resultado
    }

  /* =========================================================
     ELIMINAR
  ========================================================= */

  const handleDelete =
    async (
      id: string
    ) => {

      const confirmar =
        window.confirm(
          '¿Seguro que deseas borrar este modelo?'
        )

      if (!confirmar) {
        return
      }

      setError('')

      const resultado =
        await deleteModelo(
          id
        )

      if (
        resultado.error
      ) {

        console.error(
          'Error eliminando modelo:',
          resultado.error
        )

        setError(
          resultado.error.message ||
          'No fue posible eliminar el modelo.'
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
      <div
        style={{
          minHeight:
            '100vh',
          background:
            '#09090b',
          color:
            '#f4f4f5',
          display:
            'flex',
          alignItems:
            'center',
          justifyContent:
            'center',
          fontFamily:
            'system-ui'
        }}
      >
        <div
          style={{
            textAlign:
              'center'
          }}
        >
          <div
            style={{
              color:
                '#ff6a00',
              fontWeight:
                900,
              letterSpacing:
                2
            }}
          >
            VINCULAB
          </div>

          <div
            style={{
              color:
                '#71717a',
              marginTop:
                10,
              fontSize:
                13
            }}
          >
            Cargando modelos...
          </div>
        </div>
      </div>
    )
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div
      style={{
        minHeight:
          '100vh',
        background:
          '#09090b',
        color:
          '#f4f4f5',
        padding:
          '36px 40px',
        fontFamily:
          'system-ui'
      }}
    >
      {/* CABECERA */}

      <div
        style={{
          display:
            'flex',
          justifyContent:
            'space-between',
          alignItems:
            'flex-start',
          gap: 20,
          flexWrap:
            'wrap'
        }}
      >
        <div>
          <div
            style={{
              color:
                '#ff6a00',
              fontSize:
                11,
              fontWeight:
                800,
              letterSpacing:
                1.5
            }}
          >
            {esSuperadmin
              ? 'VINCULAB · ADMINISTRACIÓN GLOBAL'
              : `VINCULAB · ${nombreEmpresa.toUpperCase()}`}
          </div>

          <h1
            style={{
              fontSize:
                30,
              fontWeight:
                700,
              margin:
                '7px 0 0'
            }}
          >
            Modelos
          </h1>

          <p
            style={{
              color:
                '#a1a1aa',
              fontSize:
                13,
              marginTop:
                8
            }}
          >
            {esSuperadmin
              ? 'Administra modelos y especificaciones técnicas de todas las empresas.'
              : `Administra modelos y especificaciones técnicas de ${nombreEmpresa}.`}
          </p>
        </div>

        <div
          style={{
            display:
              'flex',
            gap: 10
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
              background:
                '#18181b',
              border:
                '1px solid #27272a',
              borderRadius:
                9,
              padding:
                '12px 16px',
              color:
                '#d4d4d8',
              fontWeight:
                700,
              cursor:
                'pointer'
            }}
          >
            ← Dashboard
          </button>

          <button
            type="button"

            onClick={() => {
              setEditing(
                null
              )

              setShowForm(
                true
              )
            }}

            style={{
              background:
                '#ff6a00',
              border: 0,
              borderRadius:
                9,
              padding:
                '12px 20px',
              color:
                'white',
              fontWeight:
                700,
              cursor:
                'pointer'
            }}
          >
            + Nuevo modelo
          </button>
        </div>
      </div>

      {/* ACCESO */}

      <div
        style={{
          marginTop:
            22,
          background:
            esSuperadmin
              ? '#18181b'
              : '#111c14',
          border:
            esSuperadmin
              ? '1px solid #27272a'
              : '1px solid #1f5130',
          borderRadius:
            10,
          padding:
            '12px 15px',
          display:
            'flex',
          justifyContent:
            'space-between',
          alignItems:
            'center',
          gap: 12,
          flexWrap:
            'wrap'
        }}
      >
        <div>
          <div
            style={{
              fontSize:
                10,
              fontWeight:
                900,
              letterSpacing:
                1,
              color:
                esSuperadmin
                  ? '#ff6a00'
                  : '#86efac'
            }}
          >
            {esSuperadmin
              ? 'SUPERADMINISTRADOR'
              : 'EMPRESA ACTIVA'}
          </div>

          <div
            style={{
              marginTop:
                4,
              fontSize:
                13,
              fontWeight:
                700
            }}
          >
            {esSuperadmin
              ? 'Acceso global Vinculab'
              : nombreEmpresa}
          </div>
        </div>

        <div
          style={{
            color:
              '#71717a',
            fontSize:
              11
          }}
        >
          {esSuperadmin
            ? 'Puedes administrar modelos de todas las empresas.'
            : 'Solo puedes administrar modelos y productos de tu empresa.'}
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div
          style={{
            marginTop:
              20,
            color:
              '#fecaca',
            background:
              '#450a0a',
            border:
              '1px solid #7f1d1d',
            borderRadius:
              9,
            padding:
              12,
            fontSize:
              12
          }}
        >
          {error}
        </div>
      )}

      {/* TABLA */}

      <div
        style={{
          marginTop:
            30
        }}
      >
        <ModelosTable
          modelos={
            modelos
          }

          onEdit={
            modelo => {
              setEditing(
                modelo
              )

              setShowForm(
                true
              )
            }
          }

          onAtributos={
            modelo =>
              setModeloAtributos(
                modelo
              )
          }

          onDelete={
            handleDelete
          }
        />
      </div>

      {/* FORMULARIO */}

      {showForm && (
        <ModeloForm
          initial={
            editing
          }

          empresas={
            empresas
          }

          productos={
            productos
          }

          esSuperadmin={
            esSuperadmin
          }

          empresaUsuario={
            empresaUsuario
          }

          onSave={
            handleSave
          }

          onClose={() => {
            setShowForm(
              false
            )

            setEditing(
              null
            )
          }}
        />
      )}

      {/* ATRIBUTOS */}

      {modeloAtributos && (
        <AtributosModelo
          modelo={
            modeloAtributos
          }

          onClose={() =>
            setModeloAtributos(
              null
            )
          }
        />
      )}
    </div>
  )
}
