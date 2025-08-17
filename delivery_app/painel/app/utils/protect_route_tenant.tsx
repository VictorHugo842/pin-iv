import axios from 'axios';
import { getCookie } from './cookies';

export const protectRouteTenant = async (router: any) => {
    try {
        const csrfToken = getCookie('csrf_access_token');

        await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/check_auth_tenant`,
            {},
            {
                withCredentials: true,
                headers: {
                    'X-CSRF-Token': csrfToken || '',
                },
            }
        );
    } catch (err: any) {
        const errorMessage = 'Você não tem permissão para acessar esta página.';
        const statusCode = err?.response?.status || 500; // Pega o status ou assume 500
        const errorDetails = err?.response?.data?.msg || err.message;

        // Envia o log, mas não espera por ele
        axios
            .post(`${process.env.NEXT_PUBLIC_API_URL}/logs/log_error`, {
                message: 'Erro de autenticação JWT e Tenant_ID (Rota Protegida)',
                details: errorDetails,
            })
            .catch((logErr) => {
                console.error('Erro ao enviar log para Flask:', logErr);
            });

        // Comenta o redirecionamento para página de erro e redireciona para a tela de login
        // router.push(
        //     `/error?message=${encodeURIComponent(errorMessage)}&details=${encodeURIComponent(`{"error": "Erro de autenticação", "status": ${statusCode}}`)}`
        // );

        // Redireciona para tela de login
        router.push('/auth/login');

        throw new Error(errorDetails);
    }
};
