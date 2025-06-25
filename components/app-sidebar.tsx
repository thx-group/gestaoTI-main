"use client"

import { BarChart3, Computer, Users, Home, Plus, Settings, FileText, LogIn, UserPlus, LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton, // Importar o Skeleton
} from "@/components/ui/sidebar"

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
    authRequired: true,
  },
  {
    title: "Ativos",
    url: "/assets",
    icon: Computer,
    authRequired: true,
  },
  {
    title: "Cadastrar Ativo",
    url: "/assets/new",
    icon: Plus,
    authRequired: true,
  },
  {
    title: "Funcionários",
    url: "/employees",
    icon: Users,
    authRequired: true,
  },
  {
    title: "Cadastrar Funcionário",
    url: "/employees/new",
    icon: Plus,
    authRequired: true,
  },
  {
    title: "Gerar Termos",
    url: "/terms/generate",
    icon: FileText,
    authRequired: true,
  },
  {
    title: "Termos",
    url: "/terms",
    icon: FileText,
    authRequired: true,
  },
  {
    title: "Relatórios",
    url: "/reports",
    icon: BarChart3,
    authRequired: true,
  },
]

const authItems = [
  {
    title: "Login",
    url: "/auth/login",
    icon: LogIn,
    authRequired: false,
  },
  {
    title: "Cadastre-se",
    url: "/auth/signup",
    icon: UserPlus,
    authRequired: false,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true) // Renomeado para clareza

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
      setIsLoadingUser(false) // Define o carregamento como falso após o estado de autenticação ser conhecido
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
      setIsLoadingUser(false) // Define o carregamento como falso após a verificação inicial da sessão
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    setIsLoadingUser(true) // Define o carregamento durante o logout
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error(`Erro ao fazer logout: ${error.message}`)
    } else {
      toast.success("Logout realizado com sucesso!")
      router.push("/auth/login")
    }
    setIsLoadingUser(false) // Redefine o carregamento após a tentativa de logout
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <Computer className="h-6 w-6" />
          <span className="font-semibold">Gestão de Ativos TI</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {isLoadingUser ? (
          // Renderiza um esqueleto ou estado de carregamento para os itens do menu
          <SidebarGroup>
            <SidebarGroupLabel>Carregando...</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuSkeleton showIcon />
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuSkeleton showIcon />
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : user ? (
          // Renderiza os itens de menu autenticados
          <>
            <SidebarGroup>
              <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={pathname === item.url}>
                        <Link href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        ) : (
          // Renderiza os itens de menu para usuários não autenticados
          <SidebarGroup>
            <SidebarGroupLabel>Acesso</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {authItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {isLoadingUser ? (
            <SidebarMenuItem>
              <SidebarMenuSkeleton showIcon />
            </SidebarMenuItem>
          ) : user ? (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/settings">
                    <Settings />
                    <span>Configurações</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} disabled={isLoadingUser}>
                  <LogOut />
                  <span>Sair</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          ) : (
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/auth/login">
                  <LogIn />
                  <span>Entrar</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
