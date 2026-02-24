import '../styles/globals.css';
import '../index.css';

import ClientProviders from '../providers/ClientProviders';

export const metadata = {
  title: 'Cómprale a Córdoba',
  description: 'Conectando compradores con negocios locales del departamento de Córdoba, Colombia.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}