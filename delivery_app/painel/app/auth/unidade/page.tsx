'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { getCookie } from '@/app/utils/cookies';
import { protectRoute } from '@/app/utils/protect_route';
import Image from 'next/image';
import { Utensils } from 'lucide-react';

interface Tenant {
    id: number;
    slug: string;
    estabelecimento_nome: string;
    logo_path: string | null; // ✅ Adicionado
}

interface TenantResponse {
    tenants: Tenant[];
}

const EscolherTenant = () => {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectingTenant, setSelectingTenant] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const init = async () => {
            try {
                await protectRoute(router);

                const response = await axios.get<TenantResponse>(
                    `${process.env.NEXT_PUBLIC_API_URL}/auth/get_tenant`,
                    { withCredentials: true }
                );

                const tenantsList = response.data.tenants;

                if (!tenantsList || tenantsList.length === 0) {
                    setError('Nenhuma unidade disponível.');
                } else {
                    setTenants(tenantsList);
                }
            } catch (err) {
                console.error(err);
                setError('Erro ao acessar a página.');
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [router]);

    const handleTenantSelect = async (tenantId: number) => {
        setSelectingTenant(true);
        const csrfToken = getCookie('csrf_access_token');

        try {
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/set_tenant/${tenantId}`,
                {},
                {
                    withCredentials: true,
                    headers: { 'X-CSRF-Token': csrfToken || '' },
                }
            );

            await new Promise(res => setTimeout(res, 1200));
            router.push('/admin/delivery/');
        } catch (err) {
            console.error(err);
            setError('Erro ao associar a unidade.');
            setSelectingTenant(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
        </div>
    );

    if (selectingTenant) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
            <style jsx>{`
              @keyframes breathe {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.2); }
              }
              .animate-breathe { animation: breathe 1.2s ease-in-out infinite; }
            `}</style>
            <div className="w-24 h-24 bg-gradient-to-r from-red-400 to-orange-400 rounded-xl flex items-center justify-center animate-breathe shadow-lg">
                <Utensils className="w-10 h-10 text-white" />
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
            <h1 className="text-2xl font-semibold text-red-600">Erro</h1>
            <p className="text-lg mt-2">{error}</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">Quem está acessando?</h1>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 max-w-4xl">
                {tenants.map((tenant) => {
                    console.log("Tenant:", tenant.logo_path); // ⬅️ aqui você vê cada tenant
                    return (
                        <div
                            key={tenant.id}
                            onClick={() => handleTenantSelect(tenant.id)}
                            className="flex flex-col items-center cursor-pointer group"
                        >
                            <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 bg-gray-700 rounded-md overflow-hidden group-hover:border-4 group-hover:border-white transition">
                                <Image
                                    src={
                                        tenant.logo_path
                                            ? `${process.env.NEXT_PUBLIC_API_URL}/${tenant.logo_path}`
                                            : '/default.jpg'
                                    }
                                    alt={`Unidade ${tenant.slug}`}
                                    width={144}
                                    height={144}
                                    className="object-cover w-full h-full"
                                    unoptimized // ⬅️ importante para imagens externas
                                />

                            </div>
                            <p className="mt-2 text-lg font-medium text-center group-hover:text-white transition">
                                {tenant.slug}
                            </p>
                        </div>
                    );
                })}

            </div>

            <button
                onClick={() => router.push('/logout')}
                className="mt-10 text-sm text-gray-400 hover:text-white"
            >
                Sair
            </button>
        </div>
    );
};

export default EscolherTenant;
