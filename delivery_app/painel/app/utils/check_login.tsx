'use client';

import axios from 'axios';

export const checkLogin = async (router: any, setLoading: (loading: boolean) => void) => {
    try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/check_auth`, {
            withCredentials: true, // precisa para enviar o cookie JWT
        });

        if (response.status === 200) {
            // Se está logado, redireciona para /auth/unidade
            router.push("/auth/unidade");
        }
    } catch (err: any) {
        const errorMessage = 'Erro ao verificar autenticação.';
        const statusCode = err?.response?.status || 500; // Pega o status ou assume 500
        const errorDetails = err?.response?.data?.msg || err.message;

        // Envia o log, mas não espera por ele
        axios
            .post(`${process.env.NEXT_PUBLIC_API_URL}/logs/log_error`, {
                message: 'Erro de autenticação JWT (Check Login)',
                details: errorDetails,
            })
            .catch((logErr) => {
                console.error('Erro ao enviar log para Flask:', logErr);
            });

        if (statusCode === 401) {
            // Não autenticado, pode continuar na página de login
            setLoading(false);
            return;
        } else {
            console.error(errorMessage, errorDetails);
            setLoading(false);
        }
    }
};
