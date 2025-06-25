"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
// import Link from "next/link" // Removido conforme solicitado

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log("Supabase login data:", data)
      console.log("Supabase login error:", error)

      if (error) {
        toast.error(`Erro ao fazer login: ${error.message}`)
      } else if (data.user) {
        toast.success("Login realizado com sucesso!")
        router.push("/") // Redireciona para o dashboard
      } else {
        // Este caso significa que não houve erro, mas também não houve dados de usuário (ex: e-mail não confirmado)
        toast.warning("Login falhou. Verifique suas credenciais ou confirme seu e-mail.")
      }
    } catch (catchError: any) {
      console.error("Erro inesperado durante o login:", catchError)
      toast.error(`Ocorreu um erro inesperado: ${catchError.message || catchError}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Entrar</CardTitle>
          <CardDescription>Insira suas credenciais para acessar sua conta</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
          {/* Removido o link "Não tem uma conta? Cadastre-se" conforme solicitado */}
        </CardContent>
      </Card>
    </div>
  )
}
