export default function Topbar() {
  return (
    <header
      style={{
        height: "38px",
        background: "#050c16",
        borderBottom: "1px solid #182230",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 14px",
      }}
    >
      <div
        style={{
          fontSize: "10px",
          color: "#7b8798",
          letterSpacing: "1.2px",
          textTransform: "uppercase",
        }}
      >
        Plataforma de Identidad Digital de Productos
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: "8px",
              color: "#667085",
              textTransform: "uppercase",
            }}
          >
            Usuario
          </div>

          <div
            style={{
              fontSize: "11px",
              color: "white",
              fontWeight: 600,
            }}
          >
            Administrador
          </div>
        </div>

        <div
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "999px",
            background: "#ff6b1a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "11px",
            fontWeight: 700,
          }}
        >
          A
        </div>
      </div>
    </header>
  );
}