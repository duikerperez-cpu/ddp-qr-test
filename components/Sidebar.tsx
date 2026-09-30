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
        padding: "    minHeight: "100vh",
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

      <Menu    <hr />

      <p>GESTIÓN</p>

      <MenuLink href  <MenuLink href="/productos href="/modelos"href="/lotes" text="Lotes" />

DIGITAL</p>

      <MenuLink href="/dpp" text"/nfc" text"/certificados href="/traziv>
  );
}