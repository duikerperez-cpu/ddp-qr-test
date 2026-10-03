'use client'

import { useEffect, useState } from 'react'
import { ProductosTable } from './components/ProductosTable'
import { ProductoForm } from './components/ProductoForm'
import {
  getProductos,
  createProducto,
  updateProducto,
  deleteProducto
} from './lib/queries'
import { Producto } from './types'

export default function ProductosPage() {

  const [productos, setProductos] = useState<Producto[]>([])
  const [show, setShow] = useState(false)
  const [editing, setEditing] = useState<Producto | null>(null)

  const cargar = async () => {
    const { data, error } = await getProductos()

    if (error) {
      console.error('Error cargando productos:', error)
      return
    }

    if (data) {
      setProductos(data as Producto[])
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  const handleSave = async (form: any) => {

    if (editing) {
      await updateProducto(editing.id, form)
    } else {
      await createProducto(form)
    }

    setShow(false)
    setEditing(null)

    await cargar()
  }

  const handleDelete = async (id: string) => {

    const confirmar = confirm(
      '¿Estás seguro de que deseas borrar este producto?'
    )

    if (!confirmar) return

    await deleteProducto(id)

    await cargar()
  }

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
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 20,
          marginBottom: 28
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
            VINCULAB
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
            Administra los productos registrados en tu empresa.
          </div>

        </div>

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
            boxShadow: '0 6px 20px rgba(255,106,0,.15)'
          }}
        >
          + Nuevo producto
        </button>

      </div>


      {/* CONTENEDOR */}

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

          onSave={handleSave}

          onClose={() => {
            setShow(false)
            setEditing(null)
          }}

        />

      )}

    </main>
  )
}
