import Sidebar from "../components/Sidebar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          background: "#0e0e10",
          color: "white",
        }}
      >
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
          }}
        >
          <Sidebar />

          <main
            style={{
              flex: 1,
              padding: "20px",
            }}
          >
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
