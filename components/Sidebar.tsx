import Link from "next/link";

export default function Sidebar() {
  return (
    <aside
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
          fontSize: "32px",
          fontWeight: 800,
        }}
      >
        VINCULA
        <span style={{ color: "#ff6b1a" }}>B</span>
      </h2>

      <hr style={{ borderColor: "#1b2330" }} />

      <div
        style={{
          marginTop: "20px",
          marginBottom: "10px",
          color: "#6f7c91",
          fontSize: "10px",
          textTransform: "uppercase",
        }}
      >
        Principal
      </div>

      <MenuLink href="/" texttyle={{
          marginTop: "25px",
          marginBottom: "10px",
          color: "#6f7c91",
          fontSize: "10px",
          textTransform: "uppercase",
        }}
      >
        Gestión
      </div>

      <MenuLink href  <MenuLink href="/productos" text=/modelos" text="
        style={{
          borderColor: "#1b2330",
          marginTop: "20px",
          marginBottom: "20px",
        }}
      />

      <div
        style={{
          marginBottom: "10px",
          color: "#6f7c91",
          fontSize: "10px",
          textTransform: "uppercase",
        }}
      >
        Identidad Digital
      </div>

      <MenuLink href="/dpp" text="nfc" text="📱 NFC / QRk href="/trazside>
  );
}

function MenuLink({
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
        fontSize: "14px"
