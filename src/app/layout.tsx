import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { defaultMetadata, generateAllSchemas } from "@/lib/seo-config";
import Analytics from "@/components/Analytics";

// Display + body pair chosen with the user from four directions (the "poster"
// direction): Big Shoulders Display is a tall condensed grotesque that holds up at
// 100px+ and gives the hero an actual voice; Chivo is a neutral, slightly warm
// workhorse for body copy. Two families on a real contrast axis beat one neutral
// sans doing both jobs.
const bigShoulders = localFont({
  src: "./fonts/big-shoulders.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--font-display",
});

const chivo = localFont({
  src: "./fonts/chivo.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--font-sans",
});

const jetbrainsMono = localFont({
  src: "./fonts/jetbrains-mono.woff2",
  weight: "100 800",
  display: "swap",
  variable: "--font-mono",
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
    <html lang="en" className={`${chivo.variable} ${bigShoulders.variable} ${jetbrainsMono.variable}`}>
      <head>
        {/* JSON-LD Structured Data for SEO */}
        <JsonLdSchema />

        {/* Additional SEO meta tags */}
        <meta name="author" content="Rohit Raj" />
        <meta name="geo.region" content="IN" />
        <meta name="geo.placename" content="India" />

      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
