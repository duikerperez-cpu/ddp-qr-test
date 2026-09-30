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
          fontSize: "30px",
          fontWeight: 800,
        }}
      >
        VINCULA
        <span style={{ color: "#ff6b1a" }}>B</span>
      </h2>

      <hr style={{ borderColor: "#1b2330" }} />

      <p
        style={{
          color: "#6f7c91",
          fontSize: "10px",
          textTransform: "uppercase",
          marginTop: "20px",
        }}
      >
        Principal
      </p>

      <MenuLink href="/"  style={{
          marginTop: "20px",
          color: "#6f7c91",
          fontSize: "10px",
          textTransform: "uppercase",
        }}
      >
        Gestión
      </p>

      <MenuLink href="/empresas href="/productos" text"/modelos"href="/
        style={{
          borderColor: "#1b2330",
          margin: "20px 0",
        }}
      />

      <p
        style={{
          color: "#6f7c91",
          fontSize: "10px",
          textTransform: "uppercase",
        }}
      >
        Identidad Digital
      </p>

      /dpp
      <MenuLink href="/nfc" text="📱 NFC / QRs" text="✅ Certilidad" text="tion MenuLink({
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
     
