import './globals.css'
export const metadata = { title: 'VINCULAB - Pasaporte Digital', description: 'Identidad Digital de Productos' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{margin:0, fontFamily:'Inter, system-ui, -apple-system, sans-serif', background:'#09090b'}}>
        {children}
      </body>
    </html>
  )
}
