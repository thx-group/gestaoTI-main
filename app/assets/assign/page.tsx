"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, ArrowLeft } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"

export default function AssignAssetPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preSelectedEmployeeId = searchParams.get("employee")

  const [employees, setEmployees] = useState<any[]>([])
  const [availableAssets, setAvailableAssets] = useState<any[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState(preSelectedEmployeeId || "")
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])
  const [assignmentDate, setAssignmentDate] = useState<Date>(new Date())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const { data: employeesData, error: employeesError } = await supabase
        .from("employees")
        .select("id, name, department")
      const { data: assetsData, error: assetsError } = await supabase
        .from("assets")
        .select("*")
        .eq("status", "Disponível")

      if (employeesError) {
        console.error("Erro ao buscar funcionários:", employeesError)
        toast.error("Erro ao carregar funcionários para atribuição.")
      } else {
        setEmployees(employeesData || [])
      }

      if (assetsError) {
        console.error("Erro ao buscar ativos disponíveis:", assetsError)
        toast.error("Erro ao carregar ativos disponíveis.")
      } else {
        setAvailableAssets(assetsData || [])
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const handleAssetToggle = (assetId: string) => {
    setSelectedAssets((prev) => (prev.includes(assetId) ? prev.filter((id) => id !== assetId) : [...prev, assetId]))
  }

  const handleAssign = async () => {
    if (!selectedEmployee) {
      toast.error("Selecione um funcionário")
      return
    }
    if (selectedAssets.length === 0) {
      toast.error("Selecione pelo menos um ativo")
      return
    }

    setLoading(true)
    try {
      const updates = selectedAssets.map((assetId) => ({
        id: assetId,
        assigned_to: selectedEmployee,
        assigned_date: assignmentDate.toISOString().split("T")[0],
        status: "Em uso",
      }))

      const { error } = await supabase.from("assets").upsert(updates)

      if (error) {
        throw error
      }

      const employeeName = employees.find((emp) => emp.id === selectedEmployee)?.name || "funcionário"
      toast.success(`${selectedAssets.length} ativo(s) atribuído(s) para ${employeeName}`)
      router.push(`/employees/${selectedEmployee}`)
    } catch (error: any) {
      toast.error(`Erro ao atribuir ativos: ${error.message || error}`)
      console.error("Erro ao atribuir ativos:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
          <h2 className="text-3xl font-bold tracking-tight">Atribuir Ativos</h2>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-48">
            <p>Carregando dados para atribuição...</p>
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
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Atribuir Ativos</h2>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Funcionário</CardTitle>
              <CardDescription>Selecione o funcionário que receberá os ativos</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o funcionário" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-sm text-muted-foreground">{employee.department}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data de Atribuição</CardTitle>
            </CardHeader>
            <CardContent>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(assignmentDate, "PPP", { locale: ptBR })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={assignmentDate}
                    onSelect={(date) => date && setAssignmentDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Button
              onClick={handleAssign}
              className="w-full"
              disabled={!selectedEmployee || selectedAssets.length === 0 || loading}
            >
              {loading ? "Atribuindo..." : `Atribuir ${selectedAssets.length > 0 ? `(${selectedAssets.length})` : ""}`}
            </Button>
            <Button variant="outline" onClick={() => router.back()} className="w-full" disabled={loading}>
              Cancelar
            </Button>
          </div>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Ativos Disponíveis</CardTitle>
              <CardDescription>Selecione os ativos que serão atribuídos ao funcionário</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {availableAssets.length > 0 ? (
                  availableAssets.map((asset) => (
                    <div
                      key={asset.id}
                      className={cn(
                        "flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50",
                        selectedAssets.includes(asset.id) && "bg-muted border-primary",
                      )}
                      onClick={() => handleAssetToggle(asset.id)}
                    >
                      <Checkbox
                        checked={selectedAssets.includes(asset.id)}
                        onCheckedChange={() => handleAssetToggle(asset.id)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{asset.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {asset.type} • Serial: {asset.serial_number}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {asset.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground">Nenhum ativo disponível para atribuição.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
