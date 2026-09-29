export default function Sidebar() {
  return (
    <div
      style={{
        width: "250px",
        minHeight: "100vh",
        background: "#08111f",
        color: "white",
        padding: "20px"
      }}
    >
      <h2>VINCULAB</h2>

      <hr />

      <p>📊 Dashboard</p>
      <p>🏢 Empresas</p>
      <p>📦 Productos</p>
      <p>🧩 Modelos</p>
      <p>🏷️ Lotes</p>

      <hr />

      <p>🔍 DPP</p>
      <p>📱 NFC / QR</p>
      <p>✅ Certificados</p>
      <p>🔗 Trazabilidad</p>
    </div>
  );
}