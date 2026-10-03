'use client'

import {
  useEffect,
  useState
} from 'react'

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
  createModelo,
  updateModelo,
  deleteModelo
} from './lib/queries'

import {
  Modelo,
  Empresa,
  Producto
} from './types'

export default function ModelosPage() {
  const [modelos, setModelos] =
    useState<Modelo[]>([])

  const [empresas, setEmpresas] =
    useState<Empresa[]>([])

  const [productos, setProductos] =
    useState<Producto[]>([])

  const [showForm, setShowForm] =
    useState(false)

  const [editing, setEditing] =
    useState<Modelo | null>(null)

  const [
    modeloAtributos,
    setModeloAtributos
  ] = useState<Modelo | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const cargar = async () => {
    setLoading(true)
    setError('')

    try {
      const [
        modelosRes,
        empresasRes,
        productosRes
      ] = await Promise.all([
        getModelos(),
        getEmpresas(),
        getProductos()
      ])

      if (modelosRes.error) {
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

      if (!empresasRes.error) {
        setEmpresas(
          (empresasRes.data ||
            []) as Empresa[]
        )
      }

      if (!productosRes.error) {
        setProductos(
          (productosRes.data ||
            []) as Producto[]
        )
      }
    } catch (err) {
      console.error(err)

      setError(
        'Error cargando información.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  const handleSave = async (
    formData: any
  ) => {
    let resultado

    if (editing) {
      resultado =
        await updateModelo(
          editing.id,
          formData
        )
    } else {
      resultado =
        await createModelo(
          formData
        )
    }

    if (resultado.error) {
      alert(
        'Error: ' +
          resultado.error.message
      )
      return
    }

    setShowForm(false)
    setEditing(null)

    await cargar()
  }

  const handleDelete = async (
    id: string
  ) => {
    const confirmar =
      window.confirm(
        '¿Seguro que deseas borrar este modelo?'
      )

    if (!confirmar) return

    const resultado =
      await deleteModelo(id)

    if (resultado.error) {
      alert(
        'Error al borrar: ' +
          resultado.error.message
      )
      return
    }

    await cargar()
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#09090b',
        color: '#f4f4f5',
        padding: '36px 40px',
        fontFamily: 'system-ui'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems: 'flex-start',
          gap: 20
        }}
      >
        <div>
          <div
            style={{
              color: '#ff6a00',
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 1.5
            }}
          >
            VINCULAB
          </div>

          <h1
            style={{
              fontSize: 30,
              fontWeight: 700,
              margin: '7px 0 0'
            }}
          >
            Modelos
          </h1>

          <p
            style={{
              color: '#a1a1aa',
              fontSize: 13,
              marginTop: 8
            }}
          >
            Administra modelos y
            especificaciones técnicas.
          </p>
        </div>

        <button
          onClick={() => {
            setEditing(null)
            setShowForm(true)
          }}
          style={{
            background: '#ff6a00',
            border: 0,
            borderRadius: 9,
            padding: '12px 20px',
            color: 'white',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          + Nuevo modelo
        </button>
      </div>

      <div style={{ marginTop: 30 }}>
        {loading ? (
          <div
            style={{
              color: '#71717a'
            }}
          >
            Cargando modelos...
          </div>
        ) : error ? (
          <div
            style={{
              color: '#fecaca'
            }}
          >
            {error}
          </div>
        ) : (
          <ModelosTable
            modelos={modelos}
            onEdit={modelo => {
              setEditing(modelo)
              setShowForm(true)
            }}
            onAtributos={modelo =>
              setModeloAtributos(
                modelo
              )
            }
            onDelete={
              handleDelete
            }
          />
        )}
      </div>

      {showForm && (
        <ModeloForm
          initial={editing}
          empresas={empresas}
          productos={productos}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false)
            setEditing(null)
          }}
        />
      )}

      {modeloAtributos && (
        <AtributosModelo
          modelo={modeloAtributos}
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
