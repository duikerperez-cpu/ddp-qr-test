"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Empresas() {
  const [empresas, setEmpresas] = useState<any[]>([]);

  useEffect(() => {
    cargarEmpresas();
  }, []);

  async function cargarEmpresas() {
    const { data, error } = await supabase
      .from("empresas")
      .select("*")
      .order("razon_social");

    if (error) {
      console.error(error);
      return;
    }

    setEmpresas(data || []);
  }

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
        Empresas registradas en la plataforma.
      </p>

      <div
        style={{
          background: "#08111d",
          border: "1px solid #1b2330",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr
              style={{
                background: "#111827",
              }}
            >
              <th style={{ padding: "12px", textAlign: "left" }}>
                Empresa
              </th>

              <th style={{ padding: "12px", textAlign: "left" }}>
                País
              </th>

              <th style={{ padding: "12px", textAlign: "left" }}>
                Sector
              </th>

              <th style={{ padding: "12px", textAlign: "left" }}>
                Estado
              </th>
            </tr>
          </thead>

          <tbody>
            {empresas.map((empresa) => (
              <tr
                key={empresa.id}
                style={{
                  borderTop: "1px solid #1b2330",
                }}
              >
                <td style={{ padding: "12px" }}>
                  {empresa.razon_social}
                </td>

                <td style={{ padding: "12px" }}>
                  {empresa.pais}
                </td>

                <td style={{ padding: "12px" }}>
                  {empresa.sector}
                </td>

                <td style={{ padding: "12px" }}>
                  {empresa.estado}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
