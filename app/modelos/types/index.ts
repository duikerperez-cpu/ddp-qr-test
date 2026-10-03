export type Modelo = {
  id: string
  nombre: string
  descripcion?: string | null
  empresa_id: string
  producto_id?: string | null
  categoria?: string | null
  created_at?: string
}

export type Empresa = {
  id: string
  razon_social: string
}

export type Producto = {
  id: string
  nombre: string
  empresa_id: string
}
