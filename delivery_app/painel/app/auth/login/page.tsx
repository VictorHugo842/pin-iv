'use client';

import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import Input from '../../components/input';
import Button from '../../components/button';
import Title from '../../components/title';
import Paragraph from '../../components/paragraph';
import LinkText from '../../components/link_text';
import ContainerForm from '../../components/container_form';
import LoadingLine from '../../components/loading_line';
import { checkLogin } from '../../utils/check_login'; // Importando a função utilitária

const PaginaLogin = () => {
  const { control, handleSubmit, formState: { errors } } = useForm({
    mode: 'onSubmit',
    defaultValues: {
      email: '',
      senha: '',
      lembrarSenha: false,
    },
  });

  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Verifica se o usuário está logado no início
  useEffect(() => {
    const verifyAuth = async () => {
      await checkLogin(router, setLoading); // Chama a função de utilitário
    };

    verifyAuth();
  }, [router]);

  const onSubmit = async (data: any) => {
    const { email, senha, lembrarSenha } = data;

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/painel/login`,
        { email, senha, lembrar_senha: lembrarSenha },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );

      console.log('Login bem-sucedido:', response.data);
      alert('Login realizado com sucesso!');
      router.push('/auth/unidade');
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.msg || 'Erro ao fazer login');
      } else {
        alert('Erro inesperado: ' + error.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <LoadingLine />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <ContainerForm>
        <Title className="font-semibold" text="Seja bem-vindo!" />
        <Paragraph text="Entre com seu E-mail e Senha" className="mb-6" />

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {/* Campo de E-mail */}
          <Controller
            name="email"
            control={control}
            rules={{
              required: 'E-mail é obrigatório',
              pattern: {
                value: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
                message: 'E-mail inválido',
              },
            }}
            render={({ field }) => (
              <Input
                label="E-mail"
                type="email"
                placeholder="Digite seu e-mail"
                {...field}
                error={errors.email}
              />
            )}
          />

          {/* Campo de Senha */}
          <Controller
            name="senha"
            control={control}
            rules={{ required: 'Senha é obrigatória' }}
            render={({ field }) => (
              <Input
                label="Senha"
                type="password"
                placeholder="Digite sua senha"
                {...field}
                error={errors.senha}
              />
            )}
          />

          <Button type="submit" text="Entrar" />

          <div className="text-center text-xs text-slate-700 mt-4">
            <Paragraph text="Não tem uma conta?" className="text-xs inline mb-6 mr-1" />
            <LinkText href="/auth/registro" text="Registrar" className='text-blue-400 text-xs hover:underline' />
          </div>
        </form>
      </ContainerForm>
    </div>
  );
}

export default PaginaLogin;
