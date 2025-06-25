import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Download, FileText, TrendingUp, Users, Computer } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"

export default function ReportsPage() {
  const reports = [
    {
      title: "Relatório de Ativos por Departamento",
      description: "Distribuição de equipamentos por departamento",
      type: "assets",
      lastGenerated: "2024-01-15",
      status: "Atualizado",
    },
    {
      title: "Relatório de Custos de TI",
      description: "Análise de custos e investimentos em tecnologia",
      type: "financial",
      lastGenerated: "2024-01-10",
      status: "Pendente",
    },
    {
      title: "Relatório de Funcionários por Status",
      description: "Status atual dos funcionários da empresa",
      type: "employees",
      lastGenerated: "2024-01-12",
      status: "Atualizado",
    },
    {
      title: "Relatório de Manutenções",
      description: "Histórico e agendamento de manutenções",
      type: "maintenance",
      lastGenerated: "2024-01-08",
      status: "Desatualizado",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Atualizado":
        return "bg-green-100 text-green-800"
      case "Pendente":
        return "bg-orange-100 text-orange-800"
      case "Desatualizado":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "assets":
        return Computer
      case "employees":
        return Users
      case "financial":
        return TrendingUp
      case "maintenance":
        return FileText
      default:
        return BarChart3
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
          <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
        </div>
        <Button>
          <BarChart3 className="mr-2 h-4 w-4" />
          Gerar Novo Relatório
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Relatórios</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 desde o mês passado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Relatórios Atualizados</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">66% do total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Downloads Este Mês</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">+12% desde o mês passado</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Relatórios Disponíveis</CardTitle>
          <CardDescription>Gerencie e baixe relatórios do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {reports.map((report, index) => {
              const IconComponent = getTypeIcon(report.type)
              return (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <IconComponent className="h-5 w-5 text-muted-foreground" />
                        <CardTitle className="text-lg">{report.title}</CardTitle>
                      </div>
                      <Badge variant="secondary" className={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
                    </div>
                    <CardDescription>{report.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Última atualização: {new Date(report.lastGenerated).toLocaleDateString("pt-BR")}
                      </p>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Download className="mr-2 h-4 w-4" />
                          Baixar
                        </Button>
                        <Button size="sm">Gerar</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
