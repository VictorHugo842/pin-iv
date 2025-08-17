"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import axios from "axios"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import React from "react"
import { Utensils } from "lucide-react"

export default function PaginaRegistro() {
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState(1)
    const [error, setError] = useState("")
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [showSuccessLoading, setShowSuccessLoading] = useState(false)
    const router = useRouter()

    const [unidades, setUnidades] = useState<string[]>([])
    const [unidadeInput, setUnidadeInput] = useState("")
    const [arquivosUnidades, setArquivosUnidades] = React.useState<{ file: File | null; preview: string | null }[]>([])

    useEffect(() => {
        setLoading(false)
    }, [router])

    const {
        control,
        handleSubmit,
        watch,
        getValues,
        setValue,
        trigger,
        formState: { errors },
    } = useForm({
        defaultValues: {
            nomeUsuario: "",
            email: "",
            documento: "",
            integrarWhatsapp: false,
            telefoneWhatsappBusiness: "",
            telefone: "",
            nomeEstabelecimento: "",
            tipoEstabelecimento: "",
            senha: "",
            confirmarSenha: "",
            unidades: [] as string[],
        },
    })

    const integrarWhatsapp = watch("integrarWhatsapp")

    const addUnidade = () => {
        if (unidadeInput.trim() === "") return
        const novasUnidades = [...unidades, unidadeInput.trim()]
        setUnidades(novasUnidades)
        setValue("unidades", novasUnidades)
        setUnidadeInput("")
    }

    const removeUnidade = (index: number) => {
        const novasUnidades = unidades.filter((_, i) => i !== index)
        setUnidades(novasUnidades)
        setValue("unidades", novasUnidades)
    }

    const camposValidos = [
        "nomeUsuario",
        "email",
        "documento",
        "telefone",
        "telefoneWhatsappBusiness",
        "nomeEstabelecimento",
        "integrarWhatsapp",
        "tipoEstabelecimento",
        "senha",
        "confirmarSenha",
        "unidades",
    ] as const

    type CamposValidos = (typeof camposValidos)[number]

    const handleProximo = async () => {
        let camposParaValidar: any[] = []
        if (step === 1) {
            camposParaValidar = ["nomeUsuario", "email", "telefone", "documento"]
        } else if (step === 2) {
            camposParaValidar = ["nomeEstabelecimento", "tipoEstabelecimento", "unidades"]
        }

        const valido = await trigger(camposParaValidar)
        if (valido) {
            setStep(step + 1)
        }
    }

    const handleVoltar = () => {
        if (step > 1) {
            setError("")
            setStep(step - 1)
        }
    }

    const handleFinalizar = async () => {
        const valido = await trigger(["senha", "confirmarSenha"])
        if (valido) {
            onSubmit(getValues())
        }
    }

    const onSubmit = async (data: any) => {
        setError("")
        setErrorMessage(null)
        setLoading(true)

        try {
            const formData = new FormData()
            formData.append("nome_estabelecimento", data.nomeEstabelecimento)
            formData.append("telefone", data.telefone)
            formData.append("telefoneWhatsappBusiness", data.telefoneWhatsappBusiness)
            formData.append("nome_usuario", data.nomeUsuario)
            formData.append("documento", data.documento)
            formData.append("email", data.email)
            formData.append("integrarWhatsapp", data.integrarWhatsapp)
            formData.append("tipo_estabelecimento", data.tipoEstabelecimento)
            formData.append("senha", data.senha)
            formData.append("confirmar_senha", data.confirmarSenha)

            if (Array.isArray(data.unidades)) {
                data.unidades.forEach((unidadeNome: string, index: number) => {
                    formData.append(`unidades[${index}][nome]`, unidadeNome)
                    const logoFile = arquivosUnidades[index]?.file
                    if (logoFile) {
                        formData.append(`unidades[${index}][logo]`, logoFile)
                    }
                })
            }

            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/painel/registrar`, formData, {
                withCredentials: true,
            })

            if (response.status === 200 || response.status === 201) {
                setLoading(false)
                setShowSuccessLoading(true)
                setTimeout(() => {
                    router.push("/auth/unidade")
                }, 2000)
            }
        } catch (error: unknown) {
            const axiosError = error as { response?: { status?: number; data?: { msg?: string } }; message?: string }

            if (axiosError.response?.status === 409) {
                const errorMsg = axiosError.response.data?.msg || "Dados já cadastrados no sistema"
                if (errorMsg.toLowerCase().includes("email")) {
                    setError("❌ Este e-mail já está cadastrado. Tente fazer login ou use outro e-mail.")
                } else if (
                    errorMsg.toLowerCase().includes("cnpj") ||
                    errorMsg.toLowerCase().includes("cpf") ||
                    errorMsg.toLowerCase().includes("documento")
                ) {
                    setError("❌ Este CPF/CNPJ já está cadastrado. Verifique os dados ou tente fazer login.")
                } else {
                    setError(`❌ ${errorMsg}`)
                }
            } else if (axiosError.response?.status === 400) {
                setError("❌ Dados inválidos. Verifique as informações e tente novamente.")
            } else if (axiosError.response?.status === 500) {
                setError("❌ Erro interno do servidor. Tente novamente em alguns minutos.")
            } else if (axiosError.response?.data?.msg) {
                setError(`❌ ${axiosError.response.data.msg}`)
            } else if (axiosError.message) {
                setError(`❌ Erro de conexão: ${axiosError.message}`)
            } else {
                setError("❌ Ocorreu um erro inesperado. Tente novamente.")
            }
            setLoading(false)
        }
    }

    if (showSuccessLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
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

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
            <div className="absolute top-10 left-10 w-16 h-16 bg-red-100/30 rounded-full animate-pulse">
                <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
            </div>
            <div
                className="absolute top-32 right-16 w-14 h-14 bg-orange-100/30 rounded-full animate-bounce"
                style={{ animationDelay: "1s" }}
            >
                <div className="w-full h-full flex items-center justify-center text-xl">🚚</div>
            </div>
            <div
                className="absolute bottom-20 left-20 w-12 h-12 bg-green-100/30 rounded-full animate-pulse"
                style={{ animationDelay: "2s" }}
            >
                <div className="w-full h-full flex items-center justify-center text-lg">📱</div>
            </div>
            <div
                className="absolute top-1/2 right-8 w-14 h-14 bg-blue-100/30 rounded-full animate-bounce"
                style={{ animationDelay: "3s" }}
            >
                <div className="w-full h-full flex items-center justify-center text-lg">⭐</div>
            </div>

            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-red-400 to-orange-400 rounded-2xl flex items-center justify-center shadow-lg">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                        </div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent font-sans">
                            FoodPartner
                        </h1>
                    </div>
                    <p className="text-gray-700 text-lg font-medium">Cadastre seu restaurante e comece a vender</p>
                    <p className="text-gray-600 text-sm mt-1">Plataforma completa para delivery de alimentos</p>
                </div>

                <div className="w-full max-w-md mb-8">
                    <div className="flex items-center justify-between mb-2">
                        {[1, 2, 3].map((stepNumber) => (
                            <div key={stepNumber} className="flex items-center">
                                <div
                                    className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 shadow-md ${step >= stepNumber
                                            ? // Suavizando gradiente dos steps e reduzindo escala
                                            "bg-gradient-to-br from-red-400 to-orange-400 text-white transform scale-105"
                                            : "bg-white text-gray-400 border-2 border-gray-200"
                                        }`}
                                >
                                    {step > stepNumber ? "✓" : stepNumber}
                                </div>
                                {stepNumber < 3 && (
                                    <div
                                        className={`w-16 h-2 mx-2 rounded-full transition-all duration-300 ${step > stepNumber
                                                ? // Suavizando gradiente da barra de progresso
                                                "bg-gradient-to-r from-red-300 to-orange-300"
                                                : "bg-gray-200"
                                            }`}
                                    ></div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between text-xs font-medium text-gray-600">
                        <span>Dados Pessoais</span>
                        <span>Estabelecimento</span>
                        <span>Segurança</span>
                    </div>
                </div>

                <Card className="w-full max-w-lg bg-white shadow-2xl border-0 rounded-2xl overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 to-orange-400"></div>

                    <CardHeader className="text-center pb-6 pt-8 bg-gray-50/50">
                        <CardTitle className="text-3xl font-bold text-gray-800 font-sans">Cadastre seu restaurante</CardTitle>
                        <p className="text-gray-600 mt-3 font-medium">
                            {step === 1
                                ? "📋 Informações pessoais"
                                : step === 2
                                    ? "🏪 Dados do estabelecimento"
                                    : "🔐 Defina sua senha"}
                        </p>
                    </CardHeader>

                    <CardContent className="p-8">
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-6 py-4 rounded-r-lg mb-6 flex items-center gap-3 shadow-sm">
                                <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <span className="font-medium">{error}</span>
                            </div>
                        )}

                        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                            {step === 1 && (
                                <div className="space-y-6">
                                    <Controller
                                        name="nomeUsuario"
                                        control={control}
                                        rules={{ required: "Nome é obrigatório", minLength: { value: 3, message: "Nome muito curto" } }}
                                        render={({ field }) => (
                                            <div className="space-y-2">
                                                <Label htmlFor="nomeUsuario" className="text-gray-700 font-semibold flex items-center gap-2">
                                                    <span className="text-red-500">👤</span>
                                                    Nome Completo
                                                </Label>
                                                <Input
                                                    id="nomeUsuario"
                                                    type="text"
                                                    placeholder="Digite seu nome completo"
                                                    {...field}
                                                    disabled={loading}
                                                    className="h-12 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:ring-red-100 transition-all duration-300 disabled:opacity-50"
                                                />
                                                {errors.nomeUsuario && (
                                                    <p className="text-red-500 text-sm font-medium">{errors.nomeUsuario.message}</p>
                                                )}
                                            </div>
                                        )}
                                    />

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
                                            <div className="space-y-2">
                                                <Label htmlFor="email" className="text-gray-700 font-semibold flex items-center gap-2">
                                                    <span className="text-orange-500">📧</span>
                                                    E-mail
                                                </Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="seu@email.com"
                                                    {...field}
                                                    disabled={loading}
                                                    className="h-12 border-2 border-gray-200 rounded-lg focus:border-orange-300 focus:ring-orange-100 transition-all duration-300 disabled:opacity-50"
                                                />
                                                {errors.email && <p className="text-red-500 text-sm font-medium">{errors.email.message}</p>}
                                            </div>
                                        )}
                                    />

                                    <Controller
                                        name="telefone"
                                        control={control}
                                        rules={{ required: "Telefone é obrigatório" }}
                                        render={({ field }) => (
                                            <div className="space-y-2">
                                                <Label htmlFor="telefone" className="text-gray-700 font-semibold flex items-center gap-2">
                                                    <span className="text-green-500">📱</span>
                                                    Telefone
                                                </Label>
                                                <Input
                                                    id="telefone"
                                                    type="tel"
                                                    placeholder="(11) 99999-9999"
                                                    {...field}
                                                    disabled={loading}
                                                    className="h-12 border-2 border-gray-200 rounded-lg focus:border-green-300 focus:ring-green-100 transition-all duration-300 disabled:opacity-50"
                                                />
                                                {errors.telefone && (
                                                    <p className="text-red-500 text-sm font-medium">{errors.telefone.message}</p>
                                                )}
                                            </div>
                                        )}
                                    />

                                    <Controller
                                        name="documento"
                                        control={control}
                                        rules={{ required: "CPF ou CNPJ é obrigatório" }}
                                        render={({ field }) => (
                                            <div className="space-y-2">
                                                <Label htmlFor="documento" className="text-gray-700 font-semibold flex items-center gap-2">
                                                    <span className="text-blue-500">📄</span>
                                                    CPF/CNPJ
                                                </Label>
                                                <Input
                                                    id="documento"
                                                    type="text"
                                                    placeholder="000.000.000-00 ou 00.000.000/0001-00"
                                                    {...field}
                                                    disabled={loading}
                                                    className="h-12 border-2 border-gray-200 rounded-lg focus:border-blue-300 focus:ring-blue-100 transition-all duration-300 disabled:opacity-50"
                                                />
                                                {errors.documento && (
                                                    <p className="text-red-500 text-sm font-medium">{errors.documento.message}</p>
                                                )}
                                            </div>
                                        )}
                                    />
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-6">
                                    <Controller
                                        name="nomeEstabelecimento"
                                        control={control}
                                        rules={{ required: "Nome do Estabelecimento é obrigatório" }}
                                        render={({ field }) => (
                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="nomeEstabelecimento"
                                                    className="text-gray-700 font-semibold flex items-center gap-2"
                                                >
                                                    <span className="text-red-500">🏪</span>
                                                    Nome do Estabelecimento
                                                </Label>
                                                <Input
                                                    id="nomeEstabelecimento"
                                                    type="text"
                                                    placeholder="Ex: Restaurante do João"
                                                    {...field}
                                                    disabled={loading}
                                                    className="h-12 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:ring-red-100 transition-all duration-300 disabled:opacity-50"
                                                />
                                                {errors.nomeEstabelecimento && (
                                                    <p className="text-red-500 text-sm font-medium">{errors.nomeEstabelecimento.message}</p>
                                                )}
                                            </div>
                                        )}
                                    />

                                    <Controller
                                        name="tipoEstabelecimento"
                                        control={control}
                                        rules={{ required: "Tipo de estabelecimento é obrigatório" }}
                                        render={({ field }) => (
                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="tipoEstabelecimento"
                                                    className="text-gray-700 font-semibold flex items-center gap-2"
                                                >
                                                    <span className="text-orange-500">🍽️</span>
                                                    Tipo de Estabelecimento
                                                </Label>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger className="h-12 border-2 border-gray-200 rounded-lg focus:border-orange-300 transition-all duration-300">
                                                        <SelectValue placeholder="Selecione o tipo" />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-lg border-2">
                                                        <SelectItem value="restaurante">🍽️ Restaurante</SelectItem>
                                                        <SelectItem value="lanchonete">🍔 Lanchonete</SelectItem>
                                                        <SelectItem value="pizzaria">🍕 Pizzaria</SelectItem>
                                                        <SelectItem value="hamburgueria">🍔 Hamburgueria</SelectItem>
                                                        <SelectItem value="sorveteria">🍦 Sorveteria</SelectItem>
                                                        <SelectItem value="padaria">🥖 Padaria</SelectItem>
                                                        <SelectItem value="acai">🍇 Açaíteria</SelectItem>
                                                        <SelectItem value="sucos">🥤 Bar de Sucos</SelectItem>
                                                        <SelectItem value="outro">🏪 Outro</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {errors.tipoEstabelecimento && (
                                                    <p className="text-red-500 text-sm font-medium">{errors.tipoEstabelecimento.message}</p>
                                                )}
                                            </div>
                                        )}
                                    />

                                    <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6">
                                        <Label className="text-gray-700 font-bold text-lg mb-4 flex items-center gap-2">
                                            <span className="text-green-500">🏢</span>
                                            Unidades do Estabelecimento
                                        </Label>

                                        <div className="flex gap-3 mb-6">
                                            <div className="flex-1">
                                                <Input
                                                    type="text"
                                                    placeholder="Nome da unidade (ex: Centro, Jardins)"
                                                    value={unidadeInput}
                                                    onChange={(e) => setUnidadeInput(e.target.value)}
                                                    disabled={loading}
                                                    className="h-12 border-2 border-gray-200 rounded-lg focus:border-green-300 focus:ring-green-100 transition-all duration-300 disabled:opacity-50"
                                                    onKeyPress={(e) => {
                                                        if (e.key === "Enter") {
                                                            e.preventDefault()
                                                            if (unidadeInput.trim()) {
                                                                addUnidade()
                                                                setArquivosUnidades((prev) => [...prev, { file: null, preview: null }])
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                onClick={() => {
                                                    if (unidadeInput.trim()) {
                                                        addUnidade()
                                                        setArquivosUnidades((prev) => [...prev, { file: null, preview: null }])
                                                    }
                                                }}
                                                disabled={loading}
                                                className="h-12 px-6 bg-gradient-to-r from-red-400 to-orange-400 hover:from-red-450 hover:to-orange-450 rounded-lg font-semibold shadow-md transform hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 hover:shadow-md hover:shadow-orange-100/50 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
                                            >
                                                <svg
                                                    className="w-5 h-5 mr-2 transition-transform duration-150 group-hover:rotate-45"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                                Adicionar
                                            </Button>
                                        </div>

                                        {unidades.length > 0 && (
                                            <div className="space-y-4">
                                                {unidades.map((unidade, index) => (
                                                    <div
                                                        key={index}
                                                        className="bg-white/80 backdrop-blur-sm border-2 border-white/50 rounded-xl p-5 shadow-sm"
                                                    >
                                                        <div className="flex items-center justify-between mb-4">
                                                            <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                                                <span className="text-purple-500">📍</span>
                                                                {unidade}
                                                            </h4>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    removeUnidade(index)
                                                                    setArquivosUnidades((prev) => {
                                                                        const newArr = [...prev]
                                                                        newArr.splice(index, 1)
                                                                        return newArr
                                                                    })
                                                                }}
                                                                disabled={loading}
                                                                className="text-red-500 hover:text-red-600 hover:bg-red-50 h-10 w-10 p-0 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
                                                            >
                                                                <svg
                                                                    className="w-5 h-5 transition-transform duration-150 hover:rotate-45"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={2}
                                                                        d="M6 18L18 6M6 6l12 12"
                                                                    />
                                                                </svg>
                                                            </Button>
                                                        </div>

                                                        <div className="flex items-center gap-4">
                                                            {!arquivosUnidades[index]?.preview ? (
                                                                <div className="flex-1">
                                                                    <Label className="text-gray-600 font-medium mb-3 block flex items-center gap-2">
                                                                        <span className="text-pink-500">🖼️</span>
                                                                        Logo da unidade (opcional)
                                                                    </Label>
                                                                    <Input
                                                                        type="file"
                                                                        accept="image/*"
                                                                        onChange={(e) => {
                                                                            const file = e.target.files?.[0] || null
                                                                            if (file) {
                                                                                const reader = new FileReader()
                                                                                reader.onloadend = () => {
                                                                                    setArquivosUnidades((prev) => {
                                                                                        const newArr = [...prev]
                                                                                        newArr[index] = { file, preview: reader.result as string }
                                                                                        return newArr
                                                                                    })
                                                                                }
                                                                                reader.readAsDataURL(file)
                                                                            }
                                                                        }}
                                                                        disabled={loading}
                                                                        className="h-12 border-2 border-gray-200 rounded-xl disabled:opacity-50"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-4">
                                                                    <img
                                                                        src={arquivosUnidades[index].preview! || "/placeholder.svg"}
                                                                        alt={`Logo ${unidade}`}
                                                                        className="w-20 h-20 object-cover rounded-xl border-2 border-purple-200 shadow-sm"
                                                                    />
                                                                    <div>
                                                                        <p className="font-medium text-gray-800">{arquivosUnidades[index]?.file?.name}</p>
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => {
                                                                                setArquivosUnidades((prev) => {
                                                                                    const newArr = [...prev]
                                                                                    newArr[index] = { file: null, preview: null }
                                                                                    return newArr
                                                                                })
                                                                            }}
                                                                            disabled={loading}
                                                                            className="text-red-500 hover:text-red-600 h-auto p-0 font-medium mt-1 transition-all duration-150 hover:underline disabled:opacity-50 disabled:transform-none"
                                                                        >
                                                                            Remover imagem
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {errors.unidades && (
                                            <p className="text-red-500 text-sm font-medium mt-3">
                                                É necessário adicionar pelo menos uma unidade
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-6">
                                    <div className="text-center mb-8">
                                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                                            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                                />
                                            </svg>
                                        </div>
                                        <p className="text-gray-600 font-medium">Crie uma senha segura para sua conta</p>
                                    </div>

                                    <Controller
                                        name="senha"
                                        control={control}
                                        rules={{
                                            required: "Senha é obrigatória",
                                            minLength: { value: 6, message: "A senha precisa ter pelo menos 6 caracteres" },
                                        }}
                                        render={({ field }) => (
                                            <div className="space-y-2">
                                                <Label htmlFor="senha" className="text-gray-700 font-semibold flex items-center gap-2">
                                                    <span className="text-red-500">🔐</span>
                                                    Senha
                                                </Label>
                                                <Input
                                                    id="senha"
                                                    type="password"
                                                    placeholder="Mínimo 6 caracteres"
                                                    {...field}
                                                    disabled={loading}
                                                    className="h-12 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:ring-red-100 transition-all duration-300 disabled:opacity-50"
                                                />
                                                {errors.senha && <p className="text-red-500 text-sm font-medium">{errors.senha.message}</p>}
                                            </div>
                                        )}
                                    />

                                    <Controller
                                        name="confirmarSenha"
                                        control={control}
                                        rules={{
                                            required: "Confirme sua senha",
                                            validate: (value) => value === watch("senha") || "As senhas não coincidem",
                                        }}
                                        render={({ field }) => (
                                            <div className="space-y-2">
                                                <Label htmlFor="confirmarSenha" className="text-gray-700 font-semibold flex items-center gap-2">
                                                    <span className="text-orange-500">🔒</span>
                                                    Confirmar Senha
                                                </Label>
                                                <Input
                                                    id="confirmarSenha"
                                                    type="password"
                                                    placeholder="Digite a senha novamente"
                                                    {...field}
                                                    disabled={loading}
                                                    className="h-12 border-2 border-gray-200 rounded-lg focus:border-orange-300 focus:ring-orange-100 transition-all duration-300 disabled:opacity-50"
                                                />
                                                {errors.confirmarSenha && (
                                                    <p className="text-red-500 text-sm font-medium">{errors.confirmarSenha.message}</p>
                                                )}
                                            </div>
                                        )}
                                    />
                                </div>
                            )}

                            <div className="flex justify-between items-center pt-8">
                                {step > 1 ? (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={handleVoltar}
                                        disabled={loading}
                                        className="flex items-center gap-2 text-gray-600 hover:text-red-600 hover:bg-red-50 px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:transform-none"
                                    >
                                        <svg
                                            className="w-5 h-5 transition-transform duration-150 group-hover:-translate-x-0.5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                        Voltar
                                    </Button>
                                ) : (
                                    <div></div>
                                )}

                                {step < 3 ? (
                                    <Button
                                        type="button"
                                        onClick={handleProximo}
                                        disabled={loading}
                                        className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-red-400 to-orange-400 hover:from-red-450 hover:to-orange-450 h-12 rounded-lg font-bold shadow-md transform hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 hover:shadow-md hover:shadow-orange-100/50 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
                                    >
                                        Próximo
                                        <svg
                                            className="w-5 h-5 transition-transform duration-150 group-hover:translate-x-0.5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        onClick={handleFinalizar}
                                        disabled={loading}
                                        className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-red-400 to-orange-400 hover:from-red-450 hover:to-orange-450 h-12 rounded-lg font-bold shadow-md transform hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 hover:shadow-md hover:shadow-orange-100/50 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                Criando Conta...
                                            </>
                                        ) : (
                                            <>
                                                <svg
                                                    className="w-5 h-5 transition-transform duration-150 group-hover:scale-105"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Criar Conta
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </form>

                        <div className="text-center mt-8 pt-6 border-t border-gray-200">
                            <p className="text-gray-600 font-medium">
                                Já tem uma conta?{" "}
                                <Link
                                    href="/auth/login"
                                    className="text-red-600 hover:text-orange-600 font-bold hover:underline transition-all duration-150 hover:scale-[1.01] inline-block"
                                >
                                    Faça login
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <footer className="mt-12 text-center">
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl px-8 py-6 shadow-lg border border-gray-200 transition-all duration-200 hover:shadow-xl">
                        <div className="flex items-center justify-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-orange-400 rounded-lg flex items-center justify-center transition-transform duration-150 hover:scale-105">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                                FoodPartner
                            </span>
                        </div>
                        <p className="text-gray-600 text-sm font-medium text-center">
                            Plataforma completa para delivery de alimentos
                        </p>
                        <p className="text-gray-500 text-xs mt-2 text-center">© 2024 FoodPartner. Todos os direitos reservados.</p>
                    </div>
                </footer>
            </div>
        </div>
    )
}
