"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function LojaPage() {
  const { slug } = useParams();
  const [data, setData] = useState<{ loja: string; menu: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLojaData() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cardapio/${slug}`);
        if (!res.ok) {
          throw new Error("Loja não encontrada");
        }
        const result = await res.json();
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchLojaData();
    }
  }, [slug]);

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-bold mb-4">{data?.loja}</h1>
      <ul className="text-lg">
        {data?.menu.map((item, i) => (
          <li key={i}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}
