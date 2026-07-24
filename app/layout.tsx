import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { PostHogProvider } from "@/components/analytics/PostHogProvider";
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

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans text-ink">
        {/* ClerkProvider no protege ni redirige nada por sí solo: solo publica
            el estado de sesión por contexto. Sin la prop `dynamic` no llama a
            auth() en el servidor, así que las lecciones se siguen
            prerenderizando estáticas — eso es lo que hay que verificar en la
            tabla de rutas del build, no dar por sentado. */}
        {/* Sin prop `appearance`: los componentes de Clerk quedan con su estilo
            por defecto. El rediseño visual es una fase aparte, y media paleta
            aplicada a mano se ve peor que ninguna. Varios nombres de variables
            cambiaron en v7, así que tampoco conviene copiarlos de memoria. */}
        <ClerkProvider
          signInUrl="/ingresar"
          signUpUrl="/registrarse"
          localization={localizacion}
        >
          <PostHogProvider>{children}</PostHogProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
