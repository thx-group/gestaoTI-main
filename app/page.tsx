"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Computer, Laptop, Monitor, Smartphone, Users, AlertTriangle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { formatDistanceToNowStrict, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function Dashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState([
    {
      title: "Total de Ativos",
      value: "0",
      description: "Equipamentos cadastrados",
      icon: Computer,
      color: "text-blue-600",
    },
    {
      title: "Funcionários",
      value: "0",
      description: "Usuários ativos",
      icon: Users,
      color: "text-green-600",
    },
    {
      title: "Ativos Disponíveis",
      value: "0",
      description: "Prontos para uso",
      icon: CheckCircle,
      color: "text-emerald-600",
    },
    {
      title: "Em Manutenção",
      value: "0",
      description: "Necessitam reparo",
      icon: AlertTriangle,
      color: "text-orange-600",
    },
  ])
  const [assetsByType, setAssetsByType] = useState<any[]>([])
  const [recentActivities, setRecentActivities] = useState<any[]>([])

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        router.push("/auth/login")
        return
      }

      // Fetch dashboard data
      const { data: employeesData, error: employeesError } = await supabase
        .from("employees")
        .select("id, name, status, created_at")
      const { data: assetsData, error: assetsError } = await supabase
        .from("assets")
        .select("id, name, type, status, assigned_to, assigned_date, created_at")
        .order("created_at", { ascending: false }) // Order by creation date for recent activities

      if (employeesError)
        console.error("Error fetching employees for dashboard:", employeesError.message || employeesError)
      if (assetsError) console.error("Error fetching assets for dashboard:", assetsError.message || assetsError)

      const totalEmployees = employeesData?.length || 0
      const totalAssets = assetsData?.length || 0
      const availableAssets = assetsData?.filter((asset) => asset.status === "Disponível").length || 0
      const maintenanceAssets = assetsData?.filter((asset) => asset.status === "Em manutenção").length || 0

      setStats([
        {
          title: "Total de Ativos",
          value: totalAssets.toString(),
          description: "Equipamentos cadastrados",
          icon: Computer,
          color: "text-blue-600",
        },
        {
          title: "Funcionários",
          value: totalEmployees.toString(),
          description: "Usuários ativos",
          icon: Users,
          color: "text-green-600",
        },
        {
          title: "Ativos Disponíveis",
          value: availableAssets.toString(),
          description: "Prontos para uso",
          icon: CheckCircle,
          color: "text-emerald-600",
        },
        {
          title: "Em Manutenção",
          value: maintenanceAssets.toString(),
          description: "Necessitam reparo",
          icon: AlertTriangle,
          color: "text-orange-600",
        },
      ])

      const assetsByTypeMap = assetsData?.reduce((acc: any, asset) => {
        acc[asset.type] = (acc[asset.type] || 0) + 1
        return acc
      }, {})

      const mappedAssetsByType = Object.entries(assetsByTypeMap || {}).map(([type, count]) => {
        let icon, color
        switch (type) {
          case "notebook":
            icon = Laptop
            color = "bg-blue-100 text-blue-800"
            break
          case "desktop":
            icon = Computer
            color = "bg-green-100 text-green-800"
            break
          case "monitor":
            icon = Monitor
            color = "bg-purple-100 text-purple-800"
            break
          case "mobile":
            icon = Smartphone
            color = "bg-orange-100 text-orange-800"
            break
          default:
            icon = Computer
            color = "bg-gray-100 text-gray-800"
        }
        return { type, count, icon, color }
      })
      setAssetsByType(mappedAssetsByType)

      // Generate recent activities from real data
      const activities: any[] = []

      // New assets
      assetsData?.slice(0, 5).forEach((asset) => {
        // Get top 5 most recent assets
        activities.push({
          action: `Ativo ${asset.name} (${asset.serial_number}) cadastrado`,
          user: "Sistema", // Or fetch user who created it if available
          time: parseISO(asset.created_at),
          status: "info",
        })
      })

      // New employees
      employeesData?.slice(0, 5).forEach((employee) => {
        // Get top 5 most recent employees
        activities.push({
          action: `Funcionário ${employee.name} cadastrado`,
          user: "Sistema", // Or fetch user who created it
          time: parseISO(employee.created_at),
          status: "success",
        })
      })

      // Asset assignments (if assigned_to and assigned_date exist)
      assetsData
        ?.filter((asset) => asset.assigned_to && asset.assigned_date)
        .sort((a, b) => new Date(b.assigned_date).getTime() - new Date(a.assigned_date).getTime()) // Sort by assigned_date
        .slice(0, 5) // Get top 5 most recent assignments
        .forEach((asset) => {
          const assignedEmployee = employeesData?.find((emp) => emp.id === asset.assigned_to)
          if (assignedEmployee) {
            activities.push({
              action: `Ativo ${asset.name} atribuído a ${assignedEmployee.name}`,
              user: "Sistema", // Or fetch user who performed assignment
              time: parseISO(asset.assigned_date),
              status: "success",
            })
          }
        })

      // Sort all activities by time and limit to 10
      const sortedActivities = activities
        .sort((a, b) => b.time.getTime() - a.time.getTime())
        .slice(0, 10)
        .map((activity) => ({
          ...activity,
          time: formatDistanceToNowStrict(activity.time, { addSuffix: true, locale: ptBR }),
        }))

      setRecentActivities(sortedActivities)

      setLoading(false)
    }

    checkAuthAndFetchData()
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Carregando dashboard...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href="/assets/new">Cadastrar Ativo</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/employees/new">Cadastrar Funcionário</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Ativos por Categoria</CardTitle>
            <CardDescription>Distribuição dos equipamentos por tipo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {assetsByType.length > 0 ? (
              assetsByType.map((asset) => (
                <div key={asset.type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <asset.icon className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{asset.type}</span>
                  </div>
                  <Badge variant="secondary" className={asset.color}>
                    {asset.count}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum ativo cadastrado.</p>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>Últimas movimentações do sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      activity.status === "success"
                        ? "bg-green-500"
                        : activity.status === "warning"
                          ? "bg-orange-500"
                          : "bg-blue-500"
                    }`}
                  />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.user} • {activity.time}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma atividade recente.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
