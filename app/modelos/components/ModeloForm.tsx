'use client'

import {
  useEffect,
  useMemo,
  useState
} from 'react'

import {
  Empresa,
  Modelo,
  Producto
} from '../types'

type Props = {
  initial?: Modelo | null
  empresas: Empresa[]
  productos: Producto[]

  esSuperadmin: boolean

  empresaUsuario?: Empresa | null

  onSave: (
    data: any
  ) => Promise<any> | void

  onClose: () => void
}

export function ModeloForm({
  initial,
  empresas,
  productos,
  esSuperadmin,
  empresaUsuario = null,
  onSave,
  onClose
}: Props) {

  const [form, setForm] =
    useState({
      nombre: '',
      descripcion: '',
      categoria: '',
      empresa_id: '',
      producto_id: ''
    })

  const [
    guardando,
    setGuardando
  ] = useState(false)

  const [
    error,
    setError
  ] = useState('')

  /* =========================================================
     INICIALIZAR FORMULARIO
  ========================================================= */

  useEffect(() => {

    if (initial) {

      setForm({
        nombre:
          initial.nombre || '',

        descripcion:
          initial.descripcion || '',

        categoria:
          initial.categoria || '',

        empresa_id:
          initial.empresa_id || '',

        producto_id:
          initial.producto_id || ''
      })

      return
    }

    /*
      NUEVO MODELO

      Superadmin:
      empresa vacía para que seleccione.

      Admin empresa:
      empresa automáticamente asignada.
    */

    setForm({
      nombre: '',
      descripcion: '',
      categoria: '',

      empresa_id:
        !esSuperadmin &&
        empresaUsuario?.id
          ? empresaUsuario.id
          : '',

      producto_id: ''
    })

  }, [
    initial,
    esSuperadmin,
    empresaUsuario?.id
  ])

  /* =========================================================
     PRODUCTOS DE LA EMPRESA SELECCIONADA
  ========================================================= */

  const productosFiltrados =
    useMemo(() => {

      if (!form.empresa_id) {
        return []
      }

      return productos.filter(
        producto =>
          producto.empresa_id ===
          form.empresa_id
      )

    }, [
      productos,
      form.empresa_id
    ])

  /* =========================================================
     EMPRESA ACTUAL
  ========================================================= */

  const empresaModelo =
    empresas.find(
      empresa =>
        empresa.id ===
        form.empresa_id
    )

  const nombreEmpresa =
    empresaModelo?.razon_social ||
    empresaUsuario?.razon_social ||
    form.empresa_id ||
    'Empresa'

  /* =========================================================
     ESTILOS
  ========================================================= */

  const inputStyle:
    React.CSSProperties = {

    width: '100%',
    boxSizing: 'border-box',
    marginTop: 8,
    background: '#09090b',
    border:
      '1px solid #3f3f46',
    borderRadius: 8,
    padding: '11px 12px',
    color: '#f4f4f5',
    fontSize: 14,
    outline: 'none'
  }

  const labelStyle:
    React.CSSProperties = {

    display: 'block',
    marginTop: 16,
    color: '#a1a1aa',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.5
  }

  /* =========================================================
     GUARDAR
  ========================================================= */

  const guardar = async () => {

    setError('')

    if (!form.empresa_id) {
      setError(
        'Debes seleccionar una empresa.'
      )
      return
    }

    if (!form.producto_id) {
      setError(
        'Debes seleccionar un producto.'
      )
      return
    }

    if (!form.nombre.trim()) {
      setError(
        'Debes ingresar el nombre del modelo.'
      )
      return
    }

    setGuardando(true)

    try {

      const resultado =
        await onSave({
          nombre:
            form.nombre.trim(),

          descripcion:
            form.descripcion.trim(),

          categoria:
            form.categoria.trim(),

          empresa_id:
            form.empresa_id,

          producto_id:
            form.producto_id
        })

      if (resultado?.error) {
        setError(
          resultado.error.message ||
          'No fue posible guardar el modelo.'
        )
      }

    } catch (err: any) {

      console.error(err)

      setError(
        err?.message ||
        'No fue posible guardar el modelo.'
      )

    } finally {

      setGuardando(false)

    }
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background:
          'rgba(0,0,0,0.78)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: 20
      }}
    >
      <div
        style={{
          background: '#18181b',
          padding: 26,
          borderRadius: 14,
          border:
            '1px solid #27272a',
          width: '100%',
          maxWidth: 460,
          boxShadow:
            '0 25px 70px rgba(0,0,0,.5)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        {/* CABECERA */}

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

        <h3
          style={{
            margin: 0,
            color: '#ffffff',
            fontSize: 22,
            fontWeight: 700
          }}
        >
          {initial
            ? 'Editar modelo'
            : 'Nuevo modelo'}
        </h3>

        <div
          style={{
            color: '#a1a1aa',
            fontSize: 12,
            lineHeight: 1.5,
            marginTop: 8
          }}
        >
          {esSuperadmin
            ? initial
              ? 'Editando modelo como Superadministrador de Vinculab.'
              : 'Selecciona la empresa y el producto asociado.'
            : `El modelo quedará asociado a ${nombreEmpresa}.`}
        </div>

        {/* =================================================
            EMPRESA
        ================================================= */}

        <label style={labelStyle}>
          EMPRESA
        </label>

        {esSuperadmin &&
        !initial ? (

          <select
            value={
              form.empresa_id
            }

            disabled={
              guardando
            }

            onChange={e =>
              setForm({
                ...form,
                empresa_id:
                  e.target.value,

                /*
                  Al cambiar empresa eliminamos
                  cualquier producto seleccionado.
                */

                producto_id: ''
              })
            }

            style={inputStyle}
          >
            <option value="">
              Seleccionar empresa...
            </option>

            {empresas.map(
              empresa => (
                <option
                  key={
                    empresa.id
                  }
                  value={
                    empresa.id
                  }
                >
                  {
                    empresa.razon_social
                  }
                </option>
              )
            )}
          </select>

        ) : (

          /*
            ADMIN EMPRESA:
            empresa fija.

            SUPERADMIN EDITANDO:
            empresa también fija.
          */

          <div
            style={{
              ...inputStyle,
              background:
                '#111113',
              color:
                '#a1a1aa',
              cursor:
                'not-allowed'
            }}
          >
            {nombreEmpresa}
          </div>

        )}

        {!esSuperadmin && (
          <div
            style={{
              color: '#71717a',
              fontSize: 10,
              marginTop: 6
            }}
          >
            La empresa se determina
            automáticamente según tu cuenta.
          </div>
        )}

        {/* =================================================
            PRODUCTO
        ================================================= */}

        <label style={labelStyle}>
          PRODUCTO
        </label>

        <select
          value={
            form.producto_id
          }

          disabled={
            !form.empresa_id ||
            guardando
          }

          onChange={e =>
            setForm({
              ...form,
              producto_id:
                e.target.value
            })
          }

          style={{
            ...inputStyle,

            opacity:
              form.empresa_id
                ? 1
                : 0.5,

            cursor:
              form.empresa_id
                ? 'pointer'
                : 'not-allowed'
          }}
        >
          <option value="">
            {!form.empresa_id
              ? 'Primero selecciona una empresa...'
              : productosFiltrados.length === 0
                ? 'No existen productos para esta empresa'
                : 'Seleccionar producto...'}
          </option>

          {productosFiltrados.map(
            producto => (
              <option
                key={
                  producto.id
                }
                value={
                  producto.id
                }
              >
                {producto.nombre}
              </option>
            )
          )}
        </select>

        {/* =================================================
            NOMBRE
        ================================================= */}

        <label style={labelStyle}>
          NOMBRE DEL MODELO
        </label>

        <input
          value={
            form.nombre
          }

          disabled={
            guardando
          }

          onChange={e =>
            setForm({
              ...form,
              nombre:
                e.target.value
            })
          }

          placeholder="Ej: Escalera Industrial 3M"

          style={inputStyle}
        />

        {/* =================================================
            CATEGORÍA
        ================================================= */}

        <label style={labelStyle}>
          CATEGORÍA
        </label>

        <input
          value={
            form.categoria
          }

          disabled={
            guardando
          }

          onChange={e =>
            setForm({
              ...form,
              categoria:
                e.target.value
            })
          }

          placeholder="Ej: Estructuras metálicas"

          style={inputStyle}
        />

        {/* =================================================
            DESCRIPCIÓN
        ================================================= */}

        <label style={labelStyle}>
          DESCRIPCIÓN
        </label>

        <textarea
          value={
            form.descripcion
          }

          disabled={
            guardando
          }

          onChange={e =>
            setForm({
              ...form,
              descripcion:
                e.target.value
            })
          }

          placeholder="Descripción del modelo"

          rows={4}

          style={{
            ...inputStyle,
            resize: 'vertical',
            fontFamily: 'inherit'
          }}
        />

        {/* ERROR */}

        {error && (
          <div
            style={{
              marginTop: 16,
              padding: 11,
              borderRadius: 8,
              background:
                '#450a0a',
              border:
                '1px solid #7f1d1d',
              color:
                '#fecaca',
              fontSize: 12,
              lineHeight: 1.5
            }}
          >
            {error}
          </div>
        )}

        {/* BOTONES */}

        <div
          style={{
            display: 'flex',
            gap: 8,
            marginTop: 22,
            justifyContent:
              'flex-end'
          }}
        >
          <button
            type="button"

            onClick={
              onClose
            }

            disabled={
              guardando
            }

            style={{
              background:
                '#27272a',
              border:
                '1px solid #3f3f46',
              borderRadius: 8,
              padding:
                '9px 16px',
              color:
                '#e4e4e7',
              cursor:
                guardando
                  ? 'not-allowed'
                  : 'pointer'
            }}
          >
            Cancelar
          </button>

          <button
            type="button"

            onClick={
              guardar
            }

            disabled={
              guardando
            }

            style={{
              background:
                guardando
                  ? '#78350f'
                  : '#ff6a00',

              border: 0,
              borderRadius: 8,
              padding:
                '9px 18px',
              color: 'white',
              fontWeight: 700,

              cursor:
                guardando
                  ? 'wait'
                  : 'pointer'
            }}
          >
            {guardando
              ? 'Guardando...'
              : initial
                ? 'Guardar cambios'
                : 'Crear modelo'}
          </button>
        </div>
      </div>
    </div>
  )
}
