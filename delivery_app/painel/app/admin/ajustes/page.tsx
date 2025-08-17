'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Title from '../../components/title';
import Image from 'next/image';
import LinkText from '../../components/link_text';
import Paragraph from '../../components/paragraph';
import withAuthTenant from '../../hoc/with_auth_tenant'; // Importa o HOC

const Ajustes = () => {
    const [data, setData] = useState<{
        message: string;
        store: string;
        store_type: string;
        client_name: string;
        client_email: string;
    } | null>(null);

    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Busca os dados do Estabelecimento
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
    }, []);

    // Trava o scroll do body quando o modal abre
    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isModalOpen]);

    // Função para abrir e buscar os dados
    const openModal = async () => {
        setIsModalOpen(true);
        setTimeout(() => setIsVisible(true), 10);
    };

    const closeModal = () => {
        setIsVisible(false);
        setTimeout(() => setIsModalOpen(false), 300);
    };

    return (
        <div className="min-h-screen p-5">
            {/* Título */}
            <div className="mb-4">
                <Title className="text-xl font-bold text-gray-800" text="Ajustes" />
            </div>

            {/* Perfil */}
            <Title className="text-lg font-semibold text-gray-800" text="Perfil" />

            <div className="flex items-center gap-4 mb-6">
                <div className="w-22 h-22 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Image
                        src="/logo.png"
                        width={500}
                        height={500}
                        alt="Logo"
                        className="rounded-lg"
                        priority
                    />
                </div>

                <div className="flex flex-col">
                    <p className="text-sm font-bold text-gray-800 mb-1">
                        {data?.store_type ? data.store_type : 'Carregando...'}
                    </p>
                    <LinkText
                        href="#"
                        onClick={openModal}
                        className="inline-flex items-center text-base text-blue-500 hover:text-blue-700 transition-colors"
                    >
                        <Paragraph
                            text="Mostrar perfil"
                            className="font-bold text-[#eb445f]"
                        />
                        <span className="material-icons-round text-[#eb445f] ml-2">
                            arrow_forward
                        </span>
                    </LinkText>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div
                    className={`fixed inset-0 bg-black/30 flex justify-end z-50 transition-opacity duration-300 ease-in-out
              ${isVisible ? 'opacity-100' : 'opacity-0'} 
              overscroll-contain touch-none`}
                    onClick={closeModal}
                >
                    <div
                        className={`bg-white w-150 max-h-full p-6 shadow-lg rounded-l-lg transform transition-transform duration-300 ease-in-out
                ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-2">
                            <Title
                                className="text-lg font-semibold text-gray-800"
                                text="Perfil do Estabelecimento"
                            />
                            <button
                                onClick={closeModal}
                                className="text-gray-500 hover:text-gray-700 text-3xl leading-none flex items-center"
                            >
                                <span className="material-icons-round">close</span>
                            </button>
                        </div>

                        <div className="w-16 h-1 bg-gray-200 rounded-full mx-auto mb-6"></div>

                        {/* Conteúdo */}
                        <div className="overflow-y-auto max-h-[calc(100vh-150px)] pr-1 scroll-smooth">
                            {error ? (
                                <p className="text-red-500">{error}</p>
                            ) : !data ? (
                                <p>Carregando...</p>
                            ) : (
                                <>
                                    <p>Nome: {data.client_name}</p>
                                    <p>Nome do Estabelecimento: {data.store}</p>
                                    <p>Email: {data.client_email}</p>
                                    <p>Tipo de Estabelecimento: {data.store_type}</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Protege a página usando o HOC
export default withAuthTenant(Ajustes);
