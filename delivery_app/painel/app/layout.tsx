import { ReactNode } from 'react';
import { Roboto_Mono, Poppins } from 'next/font/google';
import './globals.css';
import Paragraph from "./components/paragraph";

const robotoMono = Roboto_Mono({
  variable: '--font-roboto-mono',
  subsets: ['latin'],
});

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap', // Melhora o carregamento da fonte
});

export const metadata = {
  title: 'Delivery App',
  description: 'App de Delivery',
};

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="pt-BR">
      <head>
        {/* CDN do Material UI */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/icon?family=Material+Icons+Round"
        />
      </head>
      <body className={`${robotoMono.variable} ${poppins.variable} antialiased`}>

        {/* Conteúdo Principal com margem à direita da navbar */}
        <main>{children}</main>
      </body>
    </html>
  );
};

export default RootLayout;
