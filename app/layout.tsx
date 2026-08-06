import type { Metadata } from "next";
import type { ClerkAppearanceTheme } from "@clerk/shared/types";
import { Inter, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { PostHogProvider } from "@/components/analytics/PostHogProvider";
import { Navegacion } from "@/components/navegacion/Navegacion";
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
 */
const apariencia: ClerkAppearanceTheme = {
  variables: {
    colorPrimary: "#1e4fd8", // --color-accent
    colorPrimaryForeground: "#ffffff", // texto sobre accent (Boton: text-white)
    colorForeground: "#16213a", // --color-ink
    colorMutedForeground: "#4b5c78", // --color-ink-suave
    colorBackground: "#ffffff", // --color-surface
    colorInput: "#ffffff", // --color-surface
    colorInputForeground: "#16213a", // --color-ink
    colorBorder: "#dce3ee", // --color-border
    colorNeutral: "#16213a", // --color-ink: base de bordes/sombras/estados neutros
    colorDanger: "#b3261e", // --color-error
    colorSuccess: "#146c43", // --color-success
    colorRing: "#1e4fd8", // --color-accent: anillo de foco, igual que Boton (outline-accent)
    fontFamily: "var(--font-inter)", // --font-sans
    fontFamilyButtons: "var(--font-inter)", // --font-sans
    fontSize: "1rem", // text-base, la escala de texto de la plataforma (Boton, labels)
    borderRadius: "0.75rem", // --radius-tarjeta (0.75rem); literal para que Clerk derive sm/lg/xl
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
      // --shadow-nivel-1: el CTA de la plataforma apoya, no es plano. Va en
      // literal por lo mismo que los colores: Clerk no parsea var().
      boxShadow:
        "0 1px 2px rgb(22 33 58 / 0.06), 0 1px 3px rgb(22 33 58 / 0.04)",
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

/* Inter para la lectura, Geist Mono para la notación matemática. El porqué del
   cambio de Geist a Inter está escrito en app/globals.css, junto al token
   --font-sans: en resumen, Geist no tiene cursiva y el contenido de las
   lecciones usa énfasis en cada paso. */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  /* `style` hay que pedirlo: next/font trae solo la redonda si no se declara,
     y sin esta línea el navegador seguiría fabricando la cursiva inclinando la
     redonda —justo el defecto que motivó dejar Geist—. Verificado en el
     navegador: sin ella `document.fonts` no lista ninguna cara `italic`. */
  style: ["normal", "italic"],
  /* Igual que `style`: next/font recorta la fuente variable al eje de peso y
     tira el resto si no se nombran. Sin esta línea el eje óptico viaja en los
     metadatos pero no en el archivo, y `font-optical-sizing: auto` no tiene
     sobre qué actuar. Verificado midiendo el ancho de una misma cadena con
     `opsz` en sus dos extremos: sin `axes` daba idéntico. */
  axes: ["opsz"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    <html
      lang="es-CL"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans text-ink pb-14 sm:pb-0">
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
          {/* Navegacion se oculta a sí misma (retorna null) dentro de
              /leccion/[id] — modo foco. pb-14 en <body> reserva el alto de la
              barra fija inferior en móvil para que no tape contenido; en
              /leccion/ ese padding queda sin uso (Navegacion no se monta ahí),
              costo cosmético menor y aceptado frente a taparlo. */}
          <Navegacion />
          <PostHogProvider>{children}</PostHogProvider>
        </ClerkProvider>
        <footer className="border-t border-border px-4 py-6 text-center text-xs text-ink-tenue">
          Plataforma independiente, sin vínculo con DEMRE, la Universidad de
          Chile ni ningún preuniversitario. &quot;PAES&quot; se usa solo para
          describir el formato de los ítems.
        </footer>
      </body>
    </html>
  );
}
