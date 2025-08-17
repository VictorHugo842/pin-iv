'use client';

import { useEffect, useState } from 'react';
import Button from '../components/button'; // Importando o componente Button
import LinkText from '../components/link_text'; // Importando o componente LinkText
import Title from '../components/title'; // Importando o componente Title
import Paragraph from '../components/paragraph'; // Importando o componente Paragraph
import ContainerForm from '../components/container_form'; // Importando o ContainerForm

const ErrorPage = () => {
    const [errorData, setErrorData] = useState<{ message: string; details: string } | null>(null);
    const [showDetails, setShowDetails] = useState(false); // Estado para controlar a exibição dos detalhes

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const message = urlParams.get('message');
        const details = urlParams.get('details');

        // Se houver dados de erro na URL, definimos o estado
        if (message && details) {
            setErrorData({ message, details });
        } else {
            // Se não houver erro, exibe uma mensagem padrão
            setErrorData({ message: 'Nenhum erro específico', details: 'Ocorreu um erro inesperado.' });
        }
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
            <ContainerForm>
                <Title text="Ocorreu um erro." className="text-2xl font-bold mb-4" />

                {/* Exibe a mensagem de erro */}
                <Paragraph
                    text={`${errorData?.message || 'Nenhuma mensagem de erro disponível'}`}
                    className="text-lg text-gray-800 mb-4"
                />

                {/* Link para mostrar detalhes do erro */}
                <div>
                    <LinkText
                        href="#"
                        text="Ver detalhes"
                        onClick={() => setShowDetails(!showDetails)} // Alterna a exibição dos detalhes
                        className=' text-[#ea1d2c] font-bold text-xs hover:underline'
                    />
                </div>

                {/* Exibe os detalhes do erro se 'showDetails' for verdadeiro */}
                {showDetails && (
                    <Paragraph
                        text={`${errorData?.details || 'Não há detalhes disponíveis'}`}
                        className="text-sm text-gray-600"

                    />
                )}

                {/* Link para voltar ao login */}
                {/* <div className="mt-1 text-right">
                    <LinkText
                        href="/auth/login"
                        text="Acesse sua conta"
                        className=' text-blue-400 text-xs hover:underline'
                    />
                </div> */}
            </ContainerForm>
        </div>
    );
};

export default ErrorPage;
