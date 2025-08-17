'use client';

import { useEffect, useState } from "react";
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { getCookie } from '@/app/utils/cookies';
import Paragraph from "@/app/components/paragraph";
import Title from "@/app/components/title";
import LoadingLine from '@/app/components/loading_line';
import { protectRoute } from '@/app/utils/protect_route';

const Delivery = () => {
  const [data, setData] = useState<{
    message: string;
    store: string;
    store_type: string;
    client_name: string;
    client_email: string;
    tenant_id: string;
  } | null>(null);

  const [novaTabela, setNovaTabela] = useState<string | null>(null)

  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/painel/delivery`,
          { withCredentials: true }
        );

        setData(response.data);
      } catch (err: any) {
        const errorMessage = err.response?.data?.msg || err.message;
        setError(errorMessage);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = async () => {
    try {
      const csrfToken = getCookie('csrf_access_token');

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/painel/logout`,
        {},
        {
          withCredentials: true,
          headers: {
            'X-CSRF-Token': csrfToken || '',
          },
        }
      );

      setData(null);
      router.push("/auth/login");
    } catch (err: any) {
      const errorMessage = 'Ocorreu um erro ao tentar fazer logout.';
      const statusCode = err?.response?.status || 500;
      const errorDetails = err?.response?.data?.msg || err.message;

      // Envia log de erro
      axios
        .post(`${process.env.NEXT_PUBLIC_API_URL}/log/log_error`, {
          message: 'Erro ao tentar fazer logout',
          details: errorDetails,
        })
        .catch((logErr) => {
          console.error('Erro ao enviar log para Flask:', logErr);
        });

      // Redireciona para página de erro
      router.push(
        `/error?message=${encodeURIComponent(errorMessage)}&details=${encodeURIComponent(
          JSON.stringify({ error: "Erro de logout", status: statusCode })
        )}`
      );
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <Title className="text-[#ea1d2c] font-semibold" text="Erro ao carregar dados" />
        <Paragraph text={error} className="text-lg" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <LoadingLine />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-bold mb-4">Estabelecimento: {data.store}</h1>
      <p className="text-lg">Tipo de Estabelecimento: {data.store_type}</p>
      <h2 className="text-xl font-semibold mt-4">Informações do Cliente</h2>
      <p>Nome: {data.client_name}</p>
      <p>Email: {data.client_email}</p>
      <p>Unidade: {data.tenant_id}</p>

      <button
        onClick={handleLogout}
        className="mt-8 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
      >
        Logout
      </button>
    </div>
  );
};

export default Delivery;
