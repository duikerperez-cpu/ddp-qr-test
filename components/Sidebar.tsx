import Link from "next/link";

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
   : "220px",
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

      <p>PRINCIPAL</p>

      <MenuLink href>

      <p>GESTION</p>

      <MenuLink href="/empuLink href="/productos      <p>IDENTIDAD DIGITAL</p>

      <p>DPP</p>
      <p>NFC / QR</p>
      <p>Certificados</p>
      <p>Trazabilidad</p>
    </div>
  );
}