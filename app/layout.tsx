export const metadata = {
  title: 'VINCULAB - Plataforma de Identidad Digital',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: 'Inter, system-ui, sans-serif', background: '#090a0f' }}>
        {children}
      </body>
    </html>
  )
}
