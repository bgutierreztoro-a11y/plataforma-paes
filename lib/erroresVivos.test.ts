import test from "node:test";
import assert from "node:assert/strict";
import { erroresVivosDeSesion } from "./erroresVivos.ts";

const OLVIDA_MITAD = "Olvida el factor 1/2 en una fórmula de área que lo incluye.";
const INVIERTE_SIGNO = "Invierte el signo de la desigualdad al dividir por un negativo.";
const BORDE_INTERIOR = "Cuenta el borde interior al sumar el perímetro de una figura compuesta.";

test("cada ocurrencia se convierte en una fila con su conteo", () => {
  assert.deepEqual(erroresVivosDeSesion([{ descripcion: OLVIDA_MITAD, veces: 1 }]), [
    { titulo: OLVIDA_MITAD, veces: 1 },
  ]);
});

test("las filas salen de más a menos repetidas", () => {
  const filas = erroresVivosDeSesion([
    { descripcion: BORDE_INTERIOR, veces: 1 },
    { descripcion: OLVIDA_MITAD, veces: 3 },
    { descripcion: INVIERTE_SIGNO, veces: 2 },
  ]);

  assert.deepEqual(
    filas.map((f) => f.titulo),
    [OLVIDA_MITAD, INVIERTE_SIGNO, BORDE_INTERIOR],
  );
});

/* La propiedad que importa cuando dos errores empatan: se muestran en el orden
   en que el estudiante cayó en ellos por primera vez, que es el orden en que el
   getter de sesión los entrega. */
test("a igualdad de veces se conserva el orden de entrada", () => {
  const filas = erroresVivosDeSesion([
    { descripcion: INVIERTE_SIGNO, veces: 2 },
    { descripcion: OLVIDA_MITAD, veces: 2 },
  ]);

  assert.deepEqual(
    filas.map((f) => f.titulo),
    [INVIERTE_SIGNO, OLVIDA_MITAD],
  );
});

test("sin ocurrencias no hay filas", () => {
  assert.deepEqual(erroresVivosDeSesion([]), []);
});

test("una entrada sin texto no produce fila", () => {
  assert.deepEqual(erroresVivosDeSesion([{ descripcion: "   ", veces: 4 }]), []);
});
