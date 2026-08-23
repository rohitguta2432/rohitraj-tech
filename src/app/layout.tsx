import type { Metadata } from "next";
import { Archivo, JetBrains_Mono, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { defaultMetadata, generateAllSchemas } from "@/lib/seo-config";

// Archivo over Inter: Inter is the default every generated portfolio ships, and its
// even, low-contrast forms give a display headline nothing to hold on to. Archivo is a
// grotesque with actual tension in the caps and a variable weight axis, so one family
// can carry the whole scale through weight contrast instead of a timid display pairing.
const archivo = Archivo({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  axes: ["wdth"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  preload: false,
});

const notoArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-arabic",
  preload: false,
});

// Export centralized SEO metadata
export const metadata: Metadata = defaultMetadata;

// JSON-LD Schema Component (invisible to users, readable by Google)
function JsonLdSchema() {
  const schemas = generateAllSchemas();

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema),
          }}
        />
      ))}
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${archivo.variable} ${jetbrainsMono.variable} ${notoArabic.variable}`}>
      <head>
        {/* JSON-LD Structured Data for SEO */}
        <JsonLdSchema />

        {/* Additional SEO meta tags */}
        <meta name="author" content="Rohit Raj" />
        <meta name="geo.region" content="IN" />
        <meta name="geo.placename" content="India" />

        {/* Preconnect to external resources for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
