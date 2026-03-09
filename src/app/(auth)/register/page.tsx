"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Anchor, Lock, User, Eye, EyeOff } from "lucide-react";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/providers/AuthProvider";
// ============================================================================
// Validation Schema
// ============================================================================

const registerSchema = z
  .object({
    username: z
      .string()
      .min(1, "Nome de usuário é obrigatório")
      .min(3, "Nome de usuário deve ter pelo menos 3 caracteres")
      .max(20, "Nome de usuário deve ter no máximo 20 caracteres")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Nome de usuário deve conter apenas letras, números e underscores",
      ),
    /*email: z
      .string()
      .min(1, 'Email é obrigatório')
      .email('Digite um email válido'), */
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

// ============================================================================
// Register Page Component
// ============================================================================

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: authRegister } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    try {
      await authRegister({
        username: data.username,
        password: data.password,
      });
    } catch (err: any) {
      const errorMessage =
        err?.message || "Erro ao criar conta. Tente novamente.";
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-md">
        <div className="relative backdrop-blur-xl bg-slate-900/40 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-5 sm:p-8 space-y-5 sm:space-y-6">
            <div className="text-center space-y-3 sm:space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full"></div>
                  <div className="relative bg-slate-800/50 p-3 sm:p-4 rounded-2xl border border-cyan-400/30">
                    <Anchor className="h-10 w-10 sm:h-12 sm:w-12 text-cyan-400" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-lg">
                  Batalha Naval
                </h1>
                <p className="text-slate-400 text-sm">
                  Crie sua conta para entrar no jogo
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div
                  className="flex items-center justify-between px-4 py-3 rounded-md border bg-red-500/10 border-red-500 text-red-400"
                  role="alert"
                >
                  <span className="text-sm">{error}</span>
                  <button
                    type="button"
                    onClick={() => setError(null)}
                    className="ml-4 text-current hover:opacity-70 transition-opacity"
                    aria-label="Fechar alerta"
                  >
                    <svg
                      className="w-4 h-4"
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
                  </button>
                </div>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="username"
                  className="block text-slate-300 text-sm font-medium"
                >
                  Nome de usuário
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="jogador123"
                    autoComplete="username"
                    error={!!errors.username}
                    className="pl-10 bg-slate-800/50 border-slate-700 placeholder:text-slate-500 focus:border-cyan-400 focus:ring-cyan-400/30"
                    {...register("username")}
                  />
                </div>
                {errors.username && (
                  <p className="text-sm text-red-400">
                    {errors.username.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-slate-300 text-sm font-medium"
                >
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    error={!!errors.password}
                    className="pl-10 pr-10 bg-slate-800/50 border-slate-700 placeholder:text-slate-500 focus:border-cyan-400 focus:ring-cyan-400/30"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition-colors"
                    aria-label={
                      showPassword ? "Ocultar senha" : "Mostrar senha"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-400">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="block text-slate-300 text-sm font-medium"
                >
                  Confirmar senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    error={!!errors.confirmPassword}
                    className="pl-10 pr-10 bg-slate-800/50 border-slate-700 placeholder:text-slate-500 focus:border-cyan-400 focus:ring-cyan-400/30"
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition-colors"
                    aria-label={
                      showConfirmPassword ? "Ocultar senha" : "Mostrar senha"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-400">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                isLoading={isSubmitting}
                className="w-full h-11 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white font-semibold shadow-lg shadow-cyan-500/30 border-0 transition-all duration-200 hover:shadow-cyan-500/40 hover:shadow-xl"
              >
                {isSubmitting ? "Criando conta..." : "Criar conta"}
              </Button>
            </form>

            <div className="text-center pt-4 border-t border-slate-800">
              <p className="text-sm text-slate-400">
                Já tem uma conta?{" "}
                <Link
                  href="/login"
                  className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                >
                  Faça login
                </Link>
              </p>
            </div>
          </div>

          <div className="h-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
        </div>

        <div className="mt-6 text-center"></div>
      </div>
    </div>
  );
}
