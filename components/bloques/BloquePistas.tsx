"use client";

import { useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { registrarEvento } from "@/lib/eventos";
import type { BloquePistas as BloquePistasTipo } from "@/lib/tipos";

export function BloquePistas({ bloque, paso }: { bloque: BloquePistasTipo; paso: number }) {
  const [nivelRevelado, setNivelRevelado] = useState(0);
  const niveles = [...bloque.niveles].sort((a, b) => a.nivel - b.nivel);
  const hayMas = nivelRevelado < niveles.length;

  function revelarSiguiente() {
    setNivelRevelado((n) => n + 1);
    registrarEvento({ nombre: "pista_usada", props: { paso } });
  }

  return (
    <div className="space-y-3">
      {niveles.slice(0, nivelRevelado).map((n) => (
        <div key={n.nivel} className="rounded-tarjeta bg-accent-suave px-4 py-3 text-sm text-ink">
          <span className="font-mono text-ink-suave">Pista {n.nivel}</span>
          <p className="mt-1">{n.texto}</p>
        </div>
      ))}
      {hayMas && (
        <Boton variante="secundario" onClick={revelarSiguiente}>
          {nivelRevelado === 0 ? "Ver una pista" : "Ver otra pista"}
        </Boton>
      )}
    </div>
  );
}
