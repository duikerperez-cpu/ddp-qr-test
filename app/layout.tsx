export const metadata = {
  title: 'VINCULAB - Pasaporte Digital',
  description: 'Plataforma de Identidad Digital',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: 'Inter, system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
