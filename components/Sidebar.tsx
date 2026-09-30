import Link from "next/link";

type MenuLinkProps = {
  href: string;
  text: string;
};

function MenuLink({ href, text }: MenuLinkProps) {
  return (
    <Link
      href={href}
      style={{
        display: "block",
        color: "white",
        textDecoration: "none",
      220px",
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

      <p
        style={{
          color: "#6f7c91",
          fontSize: "10px",
          textTransform: "uppercase",
        }}
      >
        Principal
      </p>

      <

      <hr />

      <p
        style={{
          color: "#6f7c91",
          fontSize: "10px",
          textTransform: "uppercase",
        }}
      >
        Gestión
      </p>

      <MenuLink
      <MenuLink href="/productos"href="/modelos" text"/lotes" text<p
        style={{
          color: "#6f7c91",
          fontSize: "10px",
          textTransform: "uppercase",
        }}
      >
        Identidad Digital
      </p>

      /dpp
      <MenuLink href="/ficados
      <Menuabilidad
    </div>
  );
}