'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { getCookie } from '../utils/cookies';

interface SetupStatusResponse {
    setup_completo: boolean;
}

const withTenantSetup = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
    const TenantSetupComponent: React.FC<P> = (props) => {
        const router = useRouter();
        const [showModal, setShowModal] = useState(false);
        const [isLoading, setIsLoading] = useState(true);

        useEffect(() => {
            const checkTenantSetup = async () => {
                try {
                    const csrfToken = getCookie('csrf_access_token');

                    if (!csrfToken) {
                        console.error('CSRF token não encontrado');
                        return;
                    }

                    const response = await axios.get<SetupStatusResponse>(
                        `${process.env.NEXT_PUBLIC_API_URL}/auth/check_setup_status`,
                        {
                            withCredentials: true,
                            headers: { 'X-CSRF-Token': csrfToken || '' },
                        }
                    );

                    if (!response.data.setup_completo) {
                        setShowModal(true);
                    }
                } catch (error) {
                    console.error('Erro ao verificar o status do setup:', error);
                } finally {
                    setIsLoading(false);
                }
            };

            checkTenantSetup();
        }, [router]);

        const handleClose = () => setShowModal(false);

        const handleCompleteSetup = async () => {
            try {
                const csrfToken = getCookie('csrf_access_token');
                if (!csrfToken) {
                    console.error('CSRF token não encontrado');
                    return;
                }

                await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/tenant/setup`,
                    {},
                    {
                        withCredentials: true,
                        headers: { 'X-CSRF-Token': csrfToken || '' },
                    }
                );
                setShowModal(false);
            } catch (error) {
                console.error('Erro ao completar o setup:', error);
            }
        };

        if (isLoading) return <div>Loading...</div>;

        return (
            <>
                <WrappedComponent {...props} />

                {showModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-white p-8 rounded-lg shadow-lg w-96">
                            <h2 className="text-2xl font-semibold text-center mb-4">Configuração Inicial</h2>
                            <p className="text-center mb-4">Complete o setup inicial para continuar utilizando o sistema.</p>
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={handleCompleteSetup}
                                    className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition"
                                >
                                    Completar Setup
                                </button>
                                <button
                                    onClick={handleClose}
                                    className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition"
                                >
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    };

    return TenantSetupComponent;
};

export default withTenantSetup;
