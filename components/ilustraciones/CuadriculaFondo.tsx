/* Cuadrícula tenue de apoyo compartida por todas las ilustraciones:
   celdas de 20px dentro del viewBox 240x160, mismo lenguaje que el
   papel milimetrado del fondo del sitio. */
export function CuadriculaFondo() {
  const lineas: string[] = [];
  for (let x = 20; x <= 220; x += 20) {
    lineas.push(`M ${x} 0 V 160`);
  }
  for (let y = 20; y <= 140; y += 20) {
    lineas.push(`M 0 ${y} H 240`);
  }
  return (
    <path d={lineas.join(" ")} stroke="var(--color-grid-fina)" strokeWidth="1" fill="none" />
  );
}
