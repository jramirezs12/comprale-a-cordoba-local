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
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}