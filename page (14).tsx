'use client'
import { useEffect, useState } from 'react'
import { ProductosTable } from './components/ProductosTable'
import { ProductoForm } from './components/ProductoForm'
import { getProductos, createProducto, updateProducto, deleteProducto } from './lib/queries'
import { Producto } from './types'

export default function ProductosPage(){
  const [productos, setProductos] = useState<Producto[]>([])
  const [show, setShow] = useState(false)
  const [editing, setEditing] = useState<Producto|null>(null)
  const cargar = async()=>{ const {data}=await getProductos(); if(data) setProductos(data as any) }
  useEffect(()=>{ cargar() }, [])
  const handleSave = async (f:any)=>{ if(editing) await updateProducto(editing.id, f); else await createProducto(f); setShow(false); setEditing(null); cargar() }
  const handleDelete = async (id:string)=>{ if(!confirm('Borrar?')) return; await deleteProducto(id); cargar() }
  return (
    <div style={{padding:10}}>
      <div style={{display:'flex', justifyContent:'space-between'}}><h1 style={{fontSize:22, fontWeight:800}}>Productos</h1><button onClick={()=>{setEditing(null); setShow(true)}} style={{background:'#ff6a00', color:'white', border:0, borderRadius:8, padding:'10px 18px', fontWeight:700}}>+ Nuevo</button></div>
      <div style={{marginTop:20}}><ProductosTable productos={productos} onEdit={(p)=>{setEditing(p); setShow(true)}} onDelete={handleDelete} /></div>
      {show && <ProductoForm initial={editing} onSave={handleSave} onClose={()=>{setShow(false); setEditing(null)}} />}
    </div>
  )
}
