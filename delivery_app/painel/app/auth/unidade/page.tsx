'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { getCookie } from '@/app/utils/cookies';
import { protectRoute } from '@/app/utils/protect_route';
import LoadingLine from '@/app/components/loading_line';
import Image from 'next/image';

interface Tenant {
    id: number;
    slug: string;
    estabelecimento_nome: string;
}

const EscolherTenant = () => {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const fetchTenants = async () => {
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/get_tenant`,
                { withCredentials: true }
            );

            const tenantsList = response.data.tenants;
            if (tenantsList && tenantsList.length > 0) {
                setTenants(tenantsList);
            } else {
                setError('Nenhuma unidade disponível.');
            }
        } catch (err) {
            setError('Erro ao carregar as unidades.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleTenantSelect = async (tenantId: number) => {
        const csrfToken = getCookie('csrf_access_token');
        try {
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/set_tenant/${tenantId}`,
                {},
                {
                    withCredentials: true,
                    headers: {
                        'X-CSRF-Token': csrfToken || '',
                    },
                }
            );
            router.push(`/admin/delivery/`);
        } catch (err) {
            setError('Erro ao associar a unidade.');
            console.error(err);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                await protectRoute(router);
                await fetchTenants();
            } catch (err) {
                console.error('Erro de autenticação:', err);
            }
        };
        fetchData();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingLine />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
                <h1 className="text-2xl font-semibold text-red-600">Erro</h1>
                <p className="text-lg mt-2">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">Quem está acessando?</h1>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 max-w-4xl">
                {tenants.map((tenant) => (
                    <div
                        key={tenant.id}
                        onClick={() => handleTenantSelect(tenant.id)}
                        className="flex flex-col items-center cursor-pointer group"
                    >
                        <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 bg-gray-700 rounded-md overflow-hidden group-hover:border-4 group-hover:border-white transition">
                            <Image
                                src={`/ests/${tenant.estabelecimento_nome}/${tenant.slug}.jpg`}
                                alt={`Unidade ${tenant.slug}`}
                                width={144}
                                height={144}
                                className="object-cover w-full h-full"
                            />
                        </div>
                        <p className="mt-2 text-lg font-medium text-center group-hover:text-white transition">
                            {tenant.slug}
                        </p>
                    </div>
                ))}
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
