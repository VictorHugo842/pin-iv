"use client"

import { useForm, Controller } from "react-hook-form"
import axios from "axios"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, ArrowRight, Utensils, AlertCircle, Loader2 } from "lucide-react"

const PaginaLogin = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onSubmit",
    defaultValues: {
      email: "",
      senha: "",
      lembrarSenha: false,
    },
  })

  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showSuccessLoading, setShowSuccessLoading] = useState(false)

  const onSubmit = async (data: any) => {
    const { email, senha, lembrarSenha } = data
    setLoading(true)
    setErrorMessage(null)

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/painel/login`,
        { email, senha, lembrar_senha: lembrarSenha },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        },
      )

      if (response.status === 200 || response.status === 201) {
        setLoading(false)
        setShowSuccessLoading(true)
        setTimeout(() => {
          router.push("/auth/unidade")
        }, 2000)
      }
    } catch (error: unknown) {
      const axiosError = error as {
        response?: {
          status?: number
          data?: { msg?: string }
        }
        message?: string
      }

      if (axiosError.response?.status === 401) {
        setErrorMessage("Email ou senha incorretos. Verifique suas credenciais.")
      } else if (axiosError.response?.status === 404) {
        setErrorMessage("Usuário não encontrado. Verifique seu email ou cadastre-se.")
      } else if (axiosError.response?.status === 429) {
        setErrorMessage("Muitas tentativas de login. Tente novamente em alguns minutos.")
      } else if (axiosError.response?.data?.msg) {
        setErrorMessage(axiosError.response.data.msg)
      } else if (axiosError.message) {
        setErrorMessage("Erro de conexão. Verifique sua internet e tente novamente.")
      } else {
        setErrorMessage("Ocorreu um erro inesperado. Tente novamente.")
      }
      setLoading(false)
    }
  }

  if (showSuccessLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 flex items-center justify-center">
        <style jsx>{`
                    @keyframes breathe {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.2); } /* Aumenta a escala para ficar mais visível */
                    }
                    .animate-breathe {
                        animation: breathe 1.2s ease-in-out infinite; /* Aumenta duração */
                    }
                `}</style>
        <div className="w-24 h-24 bg-gradient-to-r from-red-400 to-orange-400 rounded-xl flex items-center justify-center animate-breathe shadow-lg">
          <Utensils className="w-10 h-10 text-white" />
        </div>
      </div>
    )
  }


  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3"> {/* padding y menor */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2"> {/* espaço entre itens menor */}
              <div className="w-8 h-8 bg-gradient-to-r from-red-400 to-orange-400 rounded-xl flex items-center justify-center">
                <Utensils className="w-5 h-5 text-white" /> {/* ícone menor */}
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Pratto</h1> {/* texto menor */}
                <p className="text-xs text-gray-500">Plataforma de Delivery</p>
              </div>
            </div>
            <div className="text-xs text-gray-600"> {/* texto menor */}
              Não tem conta?
              <a href="/auth/registro" className="ml-1 text-gray-600 hover:text-gray-800 font-medium">
                Cadastre-se
              </a>
            </div>
          </div>
        </div>
      </header>


      <main className="flex-1 flex items-center justify-center px-3 py-6">
        <div className="w-full max-w-xs">

          {/* Login Card */}
          <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-red-400 to-orange-400 px-4 py-3 text-center">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-bold text-white mb-0.5">Bem-vindo!</h2>
              <p className="text-red-50 text-xs">Acesse sua conta</p>
            </div>

            {/* Card Body */}
            <div className="px-4 py-4 space-y-3">
              {/* Error Message */}
              {errorMessage && (
                <div className="p-2 bg-red-50 border border-red-200 rounded flex items-center space-x-1 text-xs">
                  <AlertCircle className="w-3 h-3 text-red-600 flex-shrink-0" />
                  <p className="text-red-800">{errorMessage}</p>
                </div>
              )}

              <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
                {/* E-mail */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">E-mail</label>
                  <Controller
                    name="email"
                    control={control}
                    rules={{
                      required: "E-mail é obrigatório",
                      pattern: {
                        value: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
                        message: "E-mail inválido",
                      },
                    }}
                    render={({ field }) => (
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                        <input
                          {...field}
                          type="email"
                          disabled={loading}
                          placeholder="Digite seu e-mail"
                          className={`w-full pl-8 pr-2 py-1.5 border rounded text-gray-900 text-sm placeholder-gray-400
                      focus:outline-none focus:ring-1 focus:ring-orange-400
                      disabled:bg-gray-50 disabled:text-gray-500
                      ${errors.email ? "border-red-300 bg-red-50" : "border-gray-300"}
                    `}
                        />
                        {errors.email && (
                          <p className="mt-1 text-xs text-red-600 flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {errors.email.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                </div>

                {/* Senha */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Senha</label>
                  <Controller
                    name="senha"
                    control={control}
                    rules={{ required: "Senha é obrigatória" }}
                    render={({ field }) => (
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none">
                          <Lock className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                        <input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          disabled={loading}
                          placeholder="Digite sua senha"
                          className={`w-full pl-8 pr-8 py-1.5 border rounded text-gray-900 text-sm placeholder-gray-400
                      focus:outline-none focus:ring-1 focus:ring-orange-400
                      disabled:bg-gray-50 disabled:text-gray-500
                      ${errors.senha ? "border-red-300 bg-red-50" : "border-gray-300"}
                    `}
                        />
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-1 flex items-center disabled:cursor-not-allowed"
                        >
                          {showPassword ? (
                            <EyeOff className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
                          ) : (
                            <Eye className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
                          )}
                        </button>
                        {errors.senha && (
                          <p className="mt-1 text-xs text-red-600 flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {errors.senha.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                </div>

                {/* Lembrar Senha */}
                <div className="flex items-center">
                  <Controller
                    name="lembrarSenha"
                    control={control}
                    render={({ field: { onChange, value, ...field } }) => (
                      <div className="flex items-center">
                        <input
                          {...field}
                          type="checkbox"
                          checked={value}
                          onChange={onChange}
                          disabled={loading}
                          className="h-3 w-3 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
                        />
                        <label className="ml-1 text-xs text-gray-700">Lembrar-me</label>
                      </div>
                    )}
                  />
                </div>

                {/* Botão de Login */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex items-center justify-center px-4 py-1.5 border border-transparent text-sm font-bold rounded text-white
                  transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99]
                  ${loading ? "cursor-not-allowed bg-gray-400 opacity-50" : "bg-gradient-to-r from-red-400 to-orange-400 hover:from-red-450 hover:to-orange-450"}
                `}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
                  ) : (
                    <>
                      Entrar
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </>
                  )}
                </button>


                {/* Links */}
                <div className="text-center space-y-1">
                  <a href="#" className="text-gray-600 hover:text-gray-800 text-xs font-medium">
                    Esqueceu sua senha?
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>


      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-3"> {/* padding y menor */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1"> {/* menos espaçamento */}
              <div className="w-5 h-5 bg-gradient-to-r from-red-400 to-orange-400 rounded-md flex items-center justify-center">
                <Utensils className="w-3 h-3 text-white" />
              </div>
              <span className="text-gray-600 font-medium text-xs">Pratto</span> {/* texto menor */}
            </div>
            <div className="flex items-center justify-center space-x-3 text-xs text-gray-500 mb-1">
              <a href="#" className="hover:text-gray-700">Termos de Uso</a>
              <a href="#" className="hover:text-gray-700">Política de Privacidade</a>
              <a href="#" className="hover:text-gray-700">Suporte</a>
            </div>
            <p className="text-gray-500 text-[10px]">© 2024 Pratto. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default PaginaLogin
