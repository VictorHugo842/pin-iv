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
            50% { transform: scale(1.1); }
          }
          .animate-breathe {
            animation: breathe 2s ease-in-out infinite;
          }
        `}</style>
        <div className="w-24 h-24 bg-gradient-to-r from-red-400 to-orange-400 rounded-full flex items-center justify-center animate-breathe shadow-lg">
          <Utensils className="w-12 h-12 text-white" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-red-400 to-orange-400 rounded-xl flex items-center justify-center">
                <Utensils className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">FoodPartner</h1>
                <p className="text-xs text-gray-500">Plataforma de Delivery</p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Não tem conta?
              <a href="/auth/registro" className="ml-1 text-gray-600 hover:text-gray-800 font-medium">
                Cadastre-se
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-red-400 to-orange-400 px-8 py-6 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Bem-vindo de volta!</h2>
              <p className="text-red-50">Acesse sua conta para continuar</p>
            </div>

            {/* Card Body */}
            <div className="px-8 py-8">
              {/* Error Message */}
              {errorMessage && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-800 text-sm font-medium">{errorMessage}</p>
                </div>
              )}

              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                {/* Campo de E-mail */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
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
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          {...field}
                          type="email"
                          disabled={loading}
                          placeholder="Digite seu e-mail"
                          className={`
                            w-full pl-10 pr-4 py-3 border rounded-lg text-gray-900 placeholder-gray-500
                            focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent
                            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
                            ${errors.email ? "border-red-300 bg-red-50" : "border-gray-300"}
                          `}
                        />
                        {errors.email && (
                          <p className="mt-2 text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.email.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                </div>

                {/* Campo de Senha */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
                  <Controller
                    name="senha"
                    control={control}
                    rules={{ required: "Senha é obrigatória" }}
                    render={({ field }) => (
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          disabled={loading}
                          placeholder="Digite sua senha"
                          className={`
                            w-full pl-10 pr-12 py-3 border rounded-lg text-gray-900 placeholder-gray-500
                            focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent
                            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
                            ${errors.senha ? "border-red-300 bg-red-50" : "border-gray-300"}
                          `}
                        />
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center disabled:cursor-not-allowed"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                          )}
                        </button>
                        {errors.senha && (
                          <p className="mt-2 text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.senha.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                </div>

                {/* Checkbox Lembrar Senha */}
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
                          className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded disabled:cursor-not-allowed"
                        />
                        <label className="ml-2 block text-sm text-gray-700">Lembrar-me</label>
                      </div>
                    )}
                  />
                </div>

                {/* Botão de Login */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`
                    w-full flex items-center justify-center px-8 py-3 h-12 border border-transparent 
                    text-base font-bold rounded-lg text-white transition-all duration-200
                    transform hover:scale-[1.01] active:scale-[0.99] shadow-md
                    focus:outline-none focus:ring-0 focus:border-transparent
                    ${loading
                      ? "bg-gray-400 cursor-not-allowed opacity-50 transform-none"
                      : "bg-gradient-to-r from-red-400 to-orange-400 hover:from-red-450 hover:to-orange-450 hover:shadow-md hover:shadow-orange-100/50"
                    }
                  `}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    <>
                      Entrar
                      <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-150 group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>

                {/* Links Adicionais */}
                <div className="text-center space-y-2">
                  <a href="#" className="text-sm text-gray-500 hover:text-gray-700 font-medium">
                    Esqueceu sua senha?
                  </a>
                  <div className="text-sm text-gray-600">
                    Não tem uma conta?{" "}
                    <a href="/auth/registro" className="text-gray-600 hover:text-gray-800 font-medium">
                      Cadastre-se gratuitamente
                    </a>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-red-400 to-orange-400 rounded-lg flex items-center justify-center">
                <Utensils className="w-4 h-4 text-white" />
              </div>
              <span className="text-gray-600 font-medium">FoodPartner</span>
            </div>
            <p className="text-gray-600 text-sm font-medium mb-2">Plataforma completa para delivery de alimentos</p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 mb-2">
              <a href="#" className="hover:text-gray-700">
                Termos de Uso
              </a>
              <a href="#" className="hover:text-gray-700">
                Política de Privacidade
              </a>
              <a href="#" className="hover:text-gray-700">
                Suporte
              </a>
            </div>
            <p className="text-gray-500 text-xs">© 2024 FoodPartner. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default PaginaLogin
