import Link from "next/link";

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
      <h2
        style={{
          marginBottom: "20px",
          fontSize: "28px",
          fontWeight: 800,
        }}
      >
        VINCULA
        <span style={{ color: "#ff6b1a" }}>B</span>
      </h2>

      <hr
        style={{
          border: "none",
          borderTop: "1px solid #1b2330",
          marginBottom: "20px",
        }}
      />

      <div
        style={{
          fontSize: "10px",
          color: "#6f7c91",
          marginBottom: "10px",
          textTransform: "uppercase",
        }}
      >
        Principal
      </div>

      <MenuLink href="/" text="📊 Dashboard" />

ntSize: "10px",
          color: "#6f7c91",
          marginTop: "20px",
          marginBottom: "10px",
          textTransform: "uppercase",
        }}
      >
        Gestión
      </div>

      <empresas
      <MenuLink href="/productos" text="📦 elos" text="🧩tes" text="e={{
          border: "none",
          borderTop: "1px solid #1b2330",
          margin: "20px 0",
        }}
      />

      <div
        style={{
          fontSize: "10px",
          color: "#6f7c91",
          marginBottom: "10px",
          textTransform: "uppercase",
        }}
      >
        Identidad Digital
      </div>

      /dpp
      <MenuLink href="/nfc" text="📱 NFC / QR" />
xt="✅ Certificados"ext="🔗on MenuLink({
  href,
  text,
}: {
  href: string;
  text: string;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "block",
        color: "white",
        textDecoration: "none",
        padding: "10px 0",
        fontSize
