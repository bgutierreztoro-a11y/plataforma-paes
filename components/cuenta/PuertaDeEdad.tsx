"use client";

import { useState } from "react";
import Link from "next/link";
import { SignUp } from "@clerk/nextjs";

/**
 * Declaración de edad antes del formulario de registro.
 *
 * ESTO ES AUTODECLARACIÓN, NO VERIFICACIÓN. No comprobamos la edad de nadie y
 * no lo intentamos: marcar la casilla no prueba nada y cualquiera puede
 * marcarla. Es una decisión ya tomada y aceptada para esta fase, no un
 * problema pendiente de resolver mejor. El aviso de /privacidad lo dice con
 * las mismas palabras, porque hacer pasar esta casilla por una verificación
 * sería peor que no tenerla.
 *
 * El estado vive en React, no en storage. Por eso <SignUp> usa routing="hash":
 * con el routing por defecto Clerk navegaría a una sub-ruta real durante la
 * verificación del código, Next remontaría la página, `declarado` volvería a
 * false y el formulario desaparecería a mitad del registro.
 */
export function PuertaDeEdad() {
  const [declarado, setDeclarado] = useState(false);

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <div className="w-full rounded-tarjeta border border-border bg-surface p-5 shadow-tarjeta">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={declarado}
            onChange={(e) => setDeclarado(e.target.checked)}
            className="mt-1 size-5 shrink-0 accent-accent"
          />
          <span className="text-base leading-7 text-ink">
            Confirmo que tengo 16 años o más.
          </span>
        </label>

        <p className="mt-4 text-sm leading-6 text-ink-suave">
          Si tienes menos de 16, pídele a un adulto que te acompañe antes de crear una
          cuenta. Puedes seguir usando las lecciones sin cuenta, sin límite.
        </p>

        <p className="mt-3 text-sm leading-6 text-ink-suave">
          Antes de continuar, lee{" "}
          <Link
            href="/privacidad"
            className="font-medium text-accent underline underline-offset-4 hover:text-accent-fuerte"
          >
            qué guardamos y qué no
          </Link>
          .
        </p>
      </div>

      {declarado ? (
        <SignUp routing="hash" signInUrl="/ingresar" />
      ) : (
        <p className="text-center text-sm leading-6 text-ink-tenue">
          Marca la casilla para continuar.
        </p>
      )}
    </div>
  );
}
