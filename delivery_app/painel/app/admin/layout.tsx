'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { protectRoute } from '../utils/protect_route';
import Paragraph from "../components/paragraph";
import Link from 'next/link';
import Image from 'next/image'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const activePage = pathname?.split('/')[2];

  // Estado para saber se a autenticação já foi validada
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {

    // Protege a rota antes de fazer qualquer requisição
    // Isso garante que o usuário esteja autenticado antes de acessar a página
    const checkAuth = async () => {
      try {
        await protectRoute(router);
      } catch (err) {
        // O protectRoute já redireciona
        return;
      }
      setIsAuthChecked(true); // Se passou na autenticação, libera o layout
    };

    checkAuth();
  }, []);

  // Enquanto não autentica, retorna null
  if (!isAuthChecked) {
    return null;
  }
  return (
    <>
      {/* Navbar Vertical */}
      <header className="text-black p-4 fixed top-0 left-0 h-full w-14 bg-white drop-shadow-[4px_0_6px_rgba(0,0,0,0.1)] flex flex-col items-center">
        <div className="mt-4 mb-8">
          {/* Logo */}
          <div className="w-10 h-10 relative mx-auto">
            <Image
              src="/logo3.svg"
              alt="Logo"
              fill
              className="object-contain rounded-lg"
              priority
            />
          </div>
        </div>


        <nav className="flex flex-col items-center space-y-6">
          {/* DELIVERY */}
          <Link href="/admin/delivery" className="flex flex-col items-center text-sm space-y-1 text-gray-500 group">
            <span className={`material-icons-round group-hover:text-[#ea1d2c] group-hover:scale-110 transition-transform duration-300 ${activePage === 'delivery' ? 'text-[#ea1d2c]' : ''}`}>
              sports_motorsports
            </span>
            <Paragraph
              text="Delivery"
              className={`font-bold text-[10px] group-hover:text-[#ea1d2c] ${activePage === 'delivery' ? 'text-[#ea1d2c]' : ''}`}
            />
          </Link>

          {/* HISTÓRICO */}
          <Link href="/admin/historico" className="flex flex-col items-center text-sm space-y-1 text-gray-500 group">
            <span className={`material-icons-round group-hover:text-[#ea1d2c] group-hover:scale-110 transition-transform duration-300 ${activePage === 'historico' ? 'text-[#ea1d2c]' : ''}`}>
              history
            </span>
            <Paragraph
              text="Histórico"
              className={`font-bold text-[10px] group-hover:text-[#ea1d2c] ${activePage === 'historico' ? 'text-[#ea1d2c]' : ''}`}
            />
          </Link>

          {/* AJUSTES */}
          <Link href="/admin/ajustes" className="flex flex-col items-center text-sm space-y-1 text-gray-500 group">
            <span className={`material-icons-round group-hover:text-[#ea1d2c] group-hover:scale-110 transition-transform duration-300 ${activePage === 'ajustes' ? 'text-[#ea1d2c]' : ''}`}>
              settings
            </span>
            <Paragraph
              text="Ajustes"
              className={`font-bold text-[10px] group-hover:text-[#ea1d2c] ${activePage === 'ajustes' ? 'text-[#ea1d2c]' : ''}`}
            />
          </Link>
        </nav>

      </header>

      {/* Conteúdo Principal */}
      <main className="pl-16 pt-4">{children}</main>
    </>
  );

}
