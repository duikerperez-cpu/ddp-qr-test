import Topbar from "../components/Topbar";

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
            flexDirection: "column",
            minHeight: "100vh",
          }}
        >
          <Topbar />

          <main
            style={{
              flex: 1,
              padding: "0",
            }}
          >
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
