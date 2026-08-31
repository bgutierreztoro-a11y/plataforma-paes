import type { Metadata } from "next";
import type { ClerkAppearanceTheme } from "@clerk/shared/types";
import { Archivo } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { PostHogProvider } from "@/components/analytics/PostHogProvider";
import { PieLegal } from "@/components/ui/PieLegal";
import "./globals.css";

/**
 * Traducción parcial de los componentes de Clerk al español de Chile.
 *
 * Se escribe a mano en vez de importar @clerk/localizations: esa sería una
 * dependencia más, la fase autoriza solo dos, y de todos modos los paquetes de
 * Clerk vienen en es-ES/es-MX. Acá solo se sobrescriben las cadenas que un
 * estudiante llega a ver en el flujo de correo + código; el resto cae al
 * inglés por defecto y se irá completando cuando aparezca en pantalla.
 */
const localizacion = {
  formButtonPrimary: "Continuar",
  formFieldLabel__emailAddress: "Correo electrónico",
  formFieldInputPlaceholder__emailAddress: "tu@correo.cl",
  formResendCodeLink: "Reenviar el código",
  footerActionLink__useAnotherMethod: "Probar de otra forma",
  backButton: "Volver",
  badge__primary: "Principal",
  userButton: {
    action__manageAccount: "Gestionar cuenta",
    action__signOut: "Cerrar sesión",
  },
  userProfile: {
    navbar: {
      title: "Cuenta",
      description: "Gestiona la información de tu cuenta.",
      account: "Perfil",
      security: "Seguridad",
    },
    start: {
      headerTitle__account: "Detalles del perfil",
      profileSection: {
        title: "Perfil",
        primaryButton: "Actualizar perfil",
      },
      emailAddressesSection: {
        title: "Correo electrónico",
        // El botón real queda oculto vía appearance.elements
        // (profileSectionPrimaryButton__emailAddresses, ver más abajo):
        // el flujo solo permite un correo por cuenta. Se traduce igual
        // por si el CSS no llega a aplicar antes del primer render.
        primaryButton: "Agregar correo electrónico",
        detailsAction__primary: "Completar verificación",
      },
    },
  },
  signIn: {
    start: {
      title: "Entra a tu cuenta",
      subtitle: "Te mandamos un código a tu correo. No hay contraseña que recordar.",
      actionText: "¿Todavía no tienes cuenta?",
      actionLink: "Crea una",
    },
    emailCode: {
      title: "Revisa tu correo",
      subtitle: "Escribe el código de 6 dígitos que te acabamos de enviar.",
      formTitle: "Código de acceso",
      resendButton: "No me llegó, mándalo de nuevo",
    },
  },
  signUp: {
    start: {
      title: "Crea tu cuenta",
      subtitle: "Solo necesitas un correo. Sirve para no perder tu avance.",
      actionText: "¿Ya tienes cuenta?",
      actionLink: "Entra acá",
    },
    emailCode: {
      title: "Revisa tu correo",
      subtitle: "Escribe el código de 6 dígitos que te acabamos de enviar.",
      formTitle: "Código de acceso",
      resendButton: "No me llegó, mándalo de nuevo",
    },
  },
};

/**
 * Apariencia de los componentes de Clerk, alineada con la identidad visual de
 * la plataforma. Es puramente cosmética: no toca auth, roles ni entitlements.
 *
 * Cada valor es un token ya existente en app/globals.css (@theme) o en
 * components/ui/Boton.tsx; el comentario al lado nombra su origen. NO hay
 * colores nuevos. Se pasan en hex literal, no como `var(--color-…)`, a
 * propósito: Clerk deriva las escalas de hover/activo/foco calculando sobre el
 * color base (colorPrimary, colorDanger, colorSuccess, colorNeutral), y un
 * var() no es parseable por esa aritmética de color — rompería los estados.
 * Los nombres de variable son los de Clerk v7 (varios cambiaron respecto a v6),
 * verificados contra @clerk/shared/types.
 *
 * De la fase visual de "Línea" acá solo cambian las dos entradas de tipografía:
 * `var(--font-inter)` dejó de existir y sin ese cambio /ingresar y /registrarse
 * caerían a la fuente por defecto de Clerk. Los colores siguen siendo los de
 * Antigravity a propósito — cambiarlos es rediseñar esas dos pantallas, que es
 * trabajo de la fase de migración y no de esta.
 */
const apariencia: ClerkAppearanceTheme = {
  variables: {
    colorPrimary: "#4a4fe0", // --color-accent (indigo-600)
    colorPrimaryForeground: "#ffffff", // texto sobre accent (Boton: text-white)
    colorForeground: "#16142b", // --color-ink (ink-900)
    colorMutedForeground: "#45435c", // --color-ink-suave (ink-600)
    colorBackground: "#ffffff", // --color-surface
    colorInput: "#ffffff", // --color-surface
    colorInputForeground: "#16142b", // --color-ink (ink-900)
    colorBorder: "#e4e3ed", // --color-border (ink-200)
    colorNeutral: "#16142b", // --color-ink: base de bordes/sombras/estados neutros
    colorDanger: "#b3261e", // --color-error
    colorSuccess: "#0e7c57", // --color-success
    colorRing: "#4a4fe0", // --color-accent: anillo de foco, igual que Boton (outline-accent)
    fontFamily: "var(--font-archivo)", // --font-sans
    fontFamilyButtons: "var(--font-archivo)", // --font-sans
    fontSize: "1rem", // text-base, la escala de texto de la plataforma (Boton, labels)
    borderRadius: "0.625rem", // --radius-tarjeta → --radius-sm; literal para que Clerk derive sm/lg/xl
  },
  elements: {
    // El botón primario del formulario ("Continuar") debe leerse como un CTA
    // real de la plataforma, no como el botón chico por defecto de Clerk:
    // mismo alto, peso y prominencia que Boton variante "primario".
    // colorPrimary + borderRadius ya vienen de variables; acá solo se igualan
    // tamaño y tipografía. El hover/activo los sigue derivando Clerk desde
    // colorPrimary, que ya es nuestro accent-fuerte aproximado.
    formButtonPrimary: {
      minHeight: "2.75rem", // min-h-11
      fontSize: "1rem", // text-base
      fontWeight: 600, // font-semibold
      textTransform: "none", // Boton no usa mayúsculas ni versalitas
      letterSpacing: "0",
      // --shadow-e1: el CTA de la plataforma apoya, no es plano. Va en
      // literal por lo mismo que los colores: Clerk no parsea var().
      boxShadow:
        "0 1px 2px rgb(22 20 43 / 0.04), 0 3px 12px rgb(22 20 43 / 0.05)",
    },
    // Oculta "Agregar correo electrónico" en UserProfile: el flujo de la
    // plataforma solo admite un correo por cuenta (es el identificador único
    // de entitlements), agregar uno segundo no tiene a dónde ir. Clave
    // verificada por inspección directa del DOM en dev (clase real que
    // renderiza Clerk: cl-profileSectionPrimaryButton__emailAddresses), no
    // asumida.
    profileSectionPrimaryButton__emailAddresses: {
      display: "none",
    },
  },
};

/* Archivo: la única familia del producto (dirección "Línea"). Reemplaza a
   Instrument Sans y a Inter, que eran las dos voces de Antigravity. La escala
   tipográfica que consume estos pesos está en app/globals.css.

   Los cuatro pesos van declarados porque son exactamente los que usa el
   sistema: 400 cuerpo, 500 disponible, 600 títulos y etiquetas, 700 displays.
   Declarar `weight` hace que next/font sirva instancias estáticas en vez de la
   variable — acá es lo correcto: son cuatro cortes conocidos y fijos, y ninguno
   de los dos ejes variables de Archivo (`wdth`, `wght`) entra en el sistema.

   `style` hay que pedirlo explícito: next/font trae solo la redonda si no se
   declara, y sin esta línea el navegador fabricaría la cursiva inclinando la
   redonda. El contenido de las lecciones usa <em> constantemente
   (lib/markdownSimple.tsx), así que la cursiva sintética se vería en cada
   lección. */
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "Plataforma M1 — Piloto privado",
    template: "%s — Plataforma M1",
  },
  description:
    "Módulo interactivo de funciones lineales y afines para la PAES M1: diagnóstico, lecciones paso a paso y cierre con preguntas formato PAES.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-CL" className={`${archivo.variable} h-full antialiased`}>
      {/* Sin `pb-14`: mientras la navegación se montaba acá y era `fixed`, el
          <body> tenía que reservarle su alto en móvil para que no tapara el
          contenido. Ya no se monta acá —cada pantalla de navegación cuelga su
          propia `NavInferior`, que ocupa espacio en el flujo— así que ese
          padding no reserva nada y solo dejaba una banda muerta al pie de las
          18 rutas. */}
      <body className="min-h-full flex flex-col font-sans text-ink">
        {/* ClerkProvider no protege ni redirige nada por sí solo: solo publica
            el estado de sesión por contexto. Sin la prop `dynamic` no llama a
            auth() en el servidor, así que las lecciones se siguen
            prerenderizando estáticas — eso es lo que hay que verificar en la
            tabla de rutas del build, no dar por sentado. */}
        {/* `appearance` alinea los componentes de Clerk con la paleta y la
            tipografía de la plataforma (ver const `apariencia`). Es solo
            cosmética: no cambia auth, roles ni entitlements. */}
        {/* Los dos *FallbackRedirectUrl son solo el destino por defecto cuando
            no hay uno explícito en la URL: mandan a la portada, que es el punto
            de partida, en vez de dejar al estudiante en la página de auth. No
            introducen ninguna redirección de entrada — nadie es empujado a
            /ingresar, y / sigue siendo pública.

            Apuntan a `/` y no a `/inicio` para no pasar por una redirección
            justo al terminar el registro. `/inicio` sigue existiendo igual, por
            los enlaces ya guardados. */}
        <ClerkProvider
          signInUrl="/ingresar"
          signUpUrl="/registrarse"
          signInFallbackRedirectUrl="/"
          signUpFallbackRedirectUrl="/"
          localization={localizacion}
          appearance={apariencia}
        >
          {/* Acá no va ninguna navegación. La barra de la dirección "Línea"
              (components/ui/linea/NavInferior) la monta explícitamente cada
              pantalla que la lleva —/camino, /errores y /tu— porque en el HTML
              de referencia solo las pantallas 02, 10 y 11 la traen. Montarla
              global obligaba a la barra a saber de rutas para esconderse, que
              es lo que hacía la Navegacion anterior con su `startsWith`.

              Consecuencia aceptada: las rutas que no son ninguna de esas tres
              quedan sin navegación hasta que migren. Están listadas en
              docs/deuda-navegacion.md. */}
          <PostHogProvider>{children}</PostHogProvider>
        </ClerkProvider>
        {/* Se oculta a sí mismo dentro de /leccion/[id] — modo foco, el mismo
            criterio que aplicaba la Navegacion que vivía acá. El texto vive en
            un solo archivo: ver components/ui/PieLegal.tsx. */}
        <PieLegal />
      </body>
    </html>
  );
}
