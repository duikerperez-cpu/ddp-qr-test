export default function Sidebar() {
  return (
    <div
      style={{
        width: "220px",
        minHeight: "100vh",
        background: "#08111f",
        color: "white",
        padding: "20px",
        borderRight: "1px solid #1b2330",
      }}
    >
      <h2>
        VINCULA
        <span style={{ color: "#ff6b1a" }}>B</span>
      </h2>

      <hr />

      <p>Dashboard</p>
      <p>Empresas</p>
      <p>Productos</p>
      <p>Modelos</p>
      <p>Lotes</p>

      <hr />

      <p>DPP</p>
      <p>NFC / QR</p>
      <p>Certificados</p>
      <p>Trazabilidad</p>
    </div>
  );
}