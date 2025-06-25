"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { User, Edit, Trash2, Mail, Phone, Calendar, Building, History, Computer, FileText } from "lucide-react"
import Link from "next/link"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

export default function EmployeeDetailPage() {
  const params = useParams()!
  const router = useRouter()
  const employeeId = params.id
  const [employee, setEmployee] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [accessories, setAccessories] = useState({
    teclado: false,
    mouse: false,
    fone: false,
  })
  const [departmentName, setDepartmentName] = useState<string>("")

  useEffect(() => {
    const fetchEmployee = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from("employees")
        .select(
          `
          *,
          assets:assets!assigned_to(id, name, type, serial_number, assigned_date)
        `,
        )
        .eq("id", employeeId)
        .single()

      if (error) {
        console.error("Erro ao buscar funcionário:", error)
        toast.error("Erro ao carregar detalhes do funcionário.")
        setEmployee(null)
      } else {
        setEmployee(data)
        setAccessories(data.accessories || { teclado: false, mouse: false, fone: false })
        if (data.department) {
          const { data: dep, error: depError } = await supabase
            .from("departments")
            .select("name")
            .eq("id", data.department)
            .single()
          if (!depError && dep) setDepartmentName(dep.name)
          else setDepartmentName("")
        } else {
          setDepartmentName("")
        }
      }
      setLoading(false)
    }
    fetchEmployee()
  }, [employeeId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo":
        return "bg-green-100 text-green-800"
      case "Férias":
        return "bg-blue-100 text-blue-800"
      case "Licença":
        return "bg-orange-100 text-orange-800"
      case "Inativo":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleAccessoryChange = async (accessory: string, checked: boolean) => {
    const updatedAccessories = {
      ...accessories,
      [accessory]: checked,
    }
    setAccessories(updatedAccessories)

    const { error } = await supabase.from("employees").update({ accessories: updatedAccessories }).eq("id", employeeId)

    if (error) {
      toast.error(`Erro ao atualizar acessório: ${error.message}`)
      console.error("Erro ao atualizar acessório:", error)
      // Reverter estado se houver erro
      setAccessories(employee.accessories)
    } else {
      toast.success(`${accessory} ${checked ? "adicionado" : "removido"} com sucesso!`)
    }
  }

  const handleAssignAsset = () => {
    router.push(`/assets/assign?employee=${employeeId}`)
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
          <h2 className="text-3xl font-bold tracking-tight">Detalhes do Funcionário</h2>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-48">
            <p>Carregando detalhes do funcionário...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
          <h2 className="text-3xl font-bold tracking-tight">Detalhes do Funcionário</h2>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-48">
            <p>Funcionário não encontrado.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
          <h2 className="text-3xl font-bold tracking-tight">Detalhes do Funcionário</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/employees/${employeeId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <Button variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Desativar
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={employee.avatar || "/placeholder.svg"} alt={employee.name} />
                    <AvatarFallback className="text-lg">
                      {employee.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl">{employee.name}</CardTitle>
                    <CardDescription className="text-lg">{employee.position}</CardDescription>
                    <p className="text-sm text-muted-foreground">{departmentName || employee.department}</p>
                  </div>
                </div>
                <Badge variant="secondary" className={getStatusColor(employee.status)}>
                  {employee.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>E-mail</span>
                  </div>
                  <p>{employee.email}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>Telefone</span>
                  </div>
                  <p>{employee.phone}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>CPF</span>
                  </div>
                  <p className="font-mono">{employee.cpf}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Data de Admissão</span>
                  </div>
                  <p>{employee.hire_date ? new Date(employee.hire_date).toLocaleDateString("pt-BR") : "-"}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-semibold">Acessórios</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="teclado"
                      checked={accessories.teclado}
                      onCheckedChange={(checked) => handleAccessoryChange("teclado", checked as boolean)}
                    />
                    <Label htmlFor="teclado" className="cursor-pointer text-sm">
                      🖮 Teclado
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="mouse"
                      checked={accessories.mouse}
                      onCheckedChange={(checked) => handleAccessoryChange("mouse", checked as boolean)}
                    />
                    <Label htmlFor="mouse" className="cursor-pointer text-sm">
                      🖱️ Mouse
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="fone"
                      checked={accessories.fone}
                      onCheckedChange={(checked) => handleAccessoryChange("fone", checked as boolean)}
                    />
                    <Label htmlFor="fone" className="cursor-pointer text-sm">
                      🎧 Fone
                    </Label>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-semibold">Observações</h4>
                <p className="text-sm text-muted-foreground">{employee.notes || "Nenhuma observação."}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ativos Atribuídos</CardTitle>
              <CardDescription>{employee.assets?.length || 0} ativo(s) em uso</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ativo</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Número Serial</TableHead>
                    <TableHead>Data de Atribuição</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employee.assets && employee.assets.length > 0 ? (
                    employee.assets.map((asset: any) => (
                      <TableRow key={asset.id}>
                        <TableCell className="font-medium">{asset.name}</TableCell>
                        <TableCell>{asset.type}</TableCell>
                        <TableCell className="font-mono text-sm">{asset.serial_number}</TableCell>
                        <TableCell>
                          {asset.assigned_date ? new Date(asset.assigned_date).toLocaleDateString("pt-BR") : "-"}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/assets/${asset.id}`}>Ver Detalhes</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Nenhum ativo atribuído.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Histórico de Atividades</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Histórico ainda mockado, precisa de tabela de histórico */}
              <div className="space-y-4">
                {employee.history && employee.history.length > 0 ? (
                  employee.history.map((item: any, index: number) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{item.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.date).toLocaleDateString("pt-BR")} • {item.user}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum histórico de atividade.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações Profissionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Building className="h-4 w-4" />
                  <span>Departamento</span>
                </div>
                <p className="font-medium">{departmentName || employee.department}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>Cargo</span>
                </div>
                <p>{employee.position}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline" asChild>
                <Link href={`/employees/${employeeId}/terms`}>
                  <FileText className="mr-2 h-4 w-4" />
                  Gerar Termos
                </Link>
              </Button>
              <Button className="w-full" variant="outline" onClick={handleAssignAsset}>
                <Computer className="mr-2 h-4 w-4" />
                Atribuir Ativo
              </Button>
              <Button className="w-full" variant="outline">
                <History className="mr-2 h-4 w-4" />
                Ver Histórico Completo
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
