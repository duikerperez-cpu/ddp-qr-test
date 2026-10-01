import { supabase } from './supabase'
export async function getLotes(){
  const { data } = await supabase.from('lotes').select('*, modelos(nombre, productos(nombre, empresas(nombre)))')
  return data || []
}
export async function getEmpresas(){ const {data}=await supabase.from('empresas').select('*'); return data||[] }
export async function getProductos(){ const {data}=await supabase.from('productos').select('*'); return data||[] }
export async function getModelos(){ const {data}=await supabase.from('modelos').select('*'); return data||[] }
