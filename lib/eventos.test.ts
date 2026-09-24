import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Evento } from "./eventos.ts";

/* Chequeo de tipos: lo hace fallar `tsc`, no `node --test`, que borra los tipos antes de correr. */
type ClavesProhibidas =
  | "email"
  | "correo"
  | "nombre"
  | "apellido"
  | "rut"
  | "colegio"
  | "curso"
  | "telefono"
  | "direccion"
  | "fecha_nacimiento"
  | "usuario_id";

type PropsDe<E> = E extends { props: infer P } ? P : never;
type Props = PropsDe<Evento>;
/* Solo claves con nombre: un índice `string` en la unión se tragaría a "email" y el chequeo pasaría igual. */
type ClavesConNombre<P> = keyof {
  [K in keyof P as string extends K ? never : number extends K ? never : K]: P[K];
};
type ClavesDe<P> = P extends unknown ? ClavesConNombre<P> : never;
/* Un índice `string` con valores posibles aceptaría cualquier clave, incluida `email`. */
type IndiceAbierto<P> = P extends unknown
  ? string extends keyof P
    ? [P[string]] extends [never]
      ? never
      : P
    : never
  : never;

type Fugas = Extract<ClavesDe<Props>, ClavesProhibidas>;
type Abiertos = IndiceAbierto<Props>;

const sinFugas: [Fugas] extends [never] ? true : Fugas = true;
const sinIndicesAbiertos: [Abiertos] extends [never] ? true : Abiertos = true;

describe("eventos de analítica", () => {
  it("ninguna prop acepta datos personales ni claves libres (lo verifica tsc)", () => {
    assert.equal(sinFugas, true);
    assert.equal(sinIndicesAbiertos, true);
  });
});
