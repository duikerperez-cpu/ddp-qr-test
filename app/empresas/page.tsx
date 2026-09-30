"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Empresas() {
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [nuevaEmpresa, setNuevaEmpresa] = useState("");
  const [pais, setPais] = useState("Chile");
  const [sector, setSector] = useState("");

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

  async function crearEmpresa() {
    if (!nuevaEmpresa) return;

    const { error } = await supabase
      .from("empresas")
      .insert({
        razon_social: nuevaEmpresa,
        pais,
        sector,
        estado: "activa",
      });

    if (error) {
      console.error(error);
      return;
    }

    setNuevaEmpresa("");
    setPais("Chile");
    setSector("");

    cargarEmpresas();
  }

  async function eliminarEmpresa(id: string) {
    const confirmar = window.confirm(
      "¿Eliminar esta empresa?"
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("empresas")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    cargarEmpresas();
  }

  async function editarEmpresa(
    id: string,
    razonSocial: string
  ) {
    const nuevoNombre = prompt(
      "Nuevo nombre",
      razonSocial
    );

    if (!nuevoNombre) return;

    const { error } = await supabase
      .from("empresas")
      .update({
        razon_social: nuevoNombre,
      })
      .eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    cargarEmpresas();
  }

  return (
  <div>
    <h1)
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
          padding: "16px",
          borderRadius: "8px",
          marginBottom: "20px",
          border: "1px solid #1b2330",
        }}
      >
        <h3>Nueva Empresa</h3>

        <input
          value={nuevaEmpresa}
          onChange={(e) =>
            setNuevaEmpresa(e.target.value)
          }
          placeholder="Razón social"
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "10px",
            background: "#111827",
            border: "1px solid #1b2330",
            color: "white",
          }}
        />

        <input
          value={pais}
          onChange={(e) => setPais(e.target.value)}
          placeholder="País"
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "10px",
            background: "#111827",
            border: "1px solid #1b2330",
            color: "white",
          }}
        />

        <input
          value={sector}
          onChange={(e) =>
            setSector(e.target.value)
          }
          placeholder="Sector"
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "10px",
            background: "#111827",
            border: "1px solid #1b2330",
            color: "white",
          }}
        />

        <button
          onClick={crearEmpresa}
          style={{
            marginTop: "12px",
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
              <th style={{ padding: "12px" }}>
                Empresa
              </th>

              <th style={{ padding: "12px" }}>
                País
              </th>

              <th style={{ padding: "12px" }}>
                Sector
              </th>

              <th style={{ padding: "12px" }}>
                Estado
              </th>

              <th style={{ padding: "12px" }}>
                Acciones
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

      <td style={{ padding: "12px" }}>
        <button
          onClick={() =>
            editarEmpresa(
              empresa.id,
              empresa.razon_social
            )
          }
          style={{
            background: "#2563eb",
            color: "white",
            border: "none",
            padding: "6px 10px",
            marginRight: "8px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Editar
        </button>

        <button
          onClick={() =>
            eliminarEmpresa(empresa.id)
          }
          style={{
            background: "#dc2626",
            color: "white",
            border: "none",
            padding: "6px 10px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Eliminar
        </button>
      </td>
    </tr>
  ))}
</tbody>
