export default function Empresas() {
  return (
    <div>
      <h1
        style={{
          fontSize: "28px",
          fontWeight: 700,
          marginBottom: "8px",
        }}
      >
        Empresas
      </h1>

      <p
        style={{
          color: "#7b8798",
          marginBottom: "20px",
        }}
      >
        Administración de empresas registradas.
      </p>

      <button
        style={{
          background: "#ff6b1a",
          color: "white",
          border: "none",
          padding: "10px 14px",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        + Nueva Empresa
      </button>
    </div>
  );
}
