import Link from "next/link";
import { Button } from "@/components/ui/Button"; // Supondo que você já tenha esse componente

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white gap-6 sm:gap-8 px-4">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-blue-400 text-center">
        Batalha Naval
      </h1>
      <p className="text-slate-400 text-base sm:text-lg text-center">
        Bem-vindo ao jogo!
      </p>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
        <Link href="/login">
          <Button variant="default" className="w-full sm:w-32">
            Entrar
          </Button>
        </Link>
        <Link href="/register">
          <Button
            variant="ghost"
            className="w-full sm:w-32 border border-slate-700"
          >
            Criar conta
          </Button>
        </Link>
      </div>
    </div>
  );
}
