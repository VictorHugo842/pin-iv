'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';  // Importa o hook de navegação do Next.js
import LoadingLine from './components/loading_line';


function Home() {
  const router = useRouter();  // Hook para navegação

  useEffect(() => {
    // Redireciona automaticamente para a página 'delivery' após o componente ser montado
    router.push('/auth/login');
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <LoadingLine />
    </div>
  );
}

export default Home;
