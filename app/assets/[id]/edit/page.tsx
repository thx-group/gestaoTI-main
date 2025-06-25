"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Computer, Laptop, Monitor, Smartphone, User } from "lucide-react" // Adicionado User icon
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"

export default function EditAssetPage() {
  const router = useRouter()
  const params = useParams()!
  const assetId = params.id as string

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    brand: "",
    model: "",
    serialNumber: "",
    purchaseDate: undefined as Date | undefined,
    purchaseValue: "",
    supplier: "",
    warranty: "",
    location: "",
    status: "Disponível",
    description: "",
    assignedTo: "" as string | null, // Novo campo para o funcionário atribuído
    assignedDate: undefined as Date | undefined, // Novo campo para a data de atribuição
    specifications: { cpu: "", ram: "", ssd: "" },
  })
  const [employees, setEmployees] = useState<any[]>([]) // Estado para listar funcionários
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const assetTypes = [
    { value: "notebook", label: "Notebook", icon: Laptop },
    { value: "desktop", label: "Desktop", icon: Computer },
    { value: "monitor", label: "Monitor", icon: Monitor },
    { value: "mobile", label: "Celular", icon: Smartphone },
  ]

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      // Fetch asset data
      const { data: assetData, error: assetError } = await supabase
        .from("assets")
        .select("*")
        .eq("id", assetId)
        .single()

      if (assetError) {
        console.error("Erro ao buscar ativo para edição:", assetError.message || assetError)
        toast.error("Erro ao carregar dados do ativo para edição.")
        router.push("/assets")
        setLoading(false)
        return
      }

      // Fetch employees for the dropdown
      const { data: employeesData, error: employeesError } = await supabase
        .from("employees")
        .select("id, name, department")

      if (employeesError) {
        console.error("Erro ao buscar funcionários:", employeesError.message || employeesError)
        toast.error("Erro ao carregar lista de funcionários.")
      } else {
        setEmployees(employeesData || [])
      }

      if (assetData) {
        setFormData({
          name: assetData.name || "",
          type: assetData.type || "",
          brand: assetData.brand || "",
          model: assetData.model || "",
          serialNumber: assetData.serial_number || "",
          purchaseDate: assetData.purchase_date ? new Date(assetData.purchase_date) : undefined,
          purchaseValue: assetData.purchase_value ? assetData.purchase_value.toString() : "",
          supplier: assetData.supplier || "",
          warranty: assetData.warranty_months ? assetData.warranty_months.toString() : "",
          location: assetData.location || "",
          status: assetData.status || "Disponível",
          description: assetData.description || "",
          assignedTo: assetData.assigned_to || null,
          assignedDate: assetData.assigned_date ? new Date(assetData.assigned_date) : undefined,
          specifications: assetData.specifications || { cpu: "", ram: "", ssd: "" },
        })
      }
      setLoading(false)
    }
    if (assetId) {
      fetchData()
    }
  }, [assetId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!formData.name || !formData.type || !formData.serialNumber) {
      toast.error("Por favor, preencha todos os campos obrigatórios")
      setIsSubmitting(false)
      return
    }

    try {
      const { error } = await supabase
        .from("assets")
        .update({
          name: formData.name,
          type: formData.type,
          brand: formData.brand,
          model: formData.model,
          serial_number: formData.serialNumber,
          purchase_date: formData.purchaseDate?.toISOString().split("T")[0],
          purchase_value: formData.purchaseValue ? Number.parseFloat(formData.purchaseValue) : null,
          supplier: formData.supplier,
          warranty_months: formData.warranty ? Number.parseInt(formData.warranty) : null,
          location: formData.location,
          status: formData.status,
          description: formData.description,
          assigned_to: formData.assignedTo, // Salva o ID do funcionário
          assigned_date: formData.assignedTo ? formData.assignedDate?.toISOString().split("T")[0] : null, // Salva a data se houver funcionário
          specifications: formData.specifications,
        })
        .eq("id", assetId)

      if (error) {
        throw error
      }

      toast.success("Ativo atualizado com sucesso!")
      router.push(`/assets/${assetId}`)
    } catch (error: any) {
      toast.error(`Erro ao atualizar ativo: ${error.message || error}`)
      console.error("Erro ao atualizar ativo:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith("specifications.")) {
      const specField = field.split(".")[1]
      setFormData((prev) => ({
        ...prev,
        specifications: { ...prev.specifications, [specField]: value },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }))
    }
  }

  const handleAssignedToChange = (employeeId: string) => {
    setFormData((prev) => ({
      ...prev,
      assignedTo: employeeId === "null" ? null : employeeId, // Permite desvincular
      assignedDate: employeeId === "null" ? undefined : prev.assignedDate || new Date(), // Define a data se for atribuído, ou limpa se desvinculado
    }))
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
          <h2 className="text-3xl font-bold tracking-tight">Editar Ativo</h2>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-48">
            <p>Carregando dados do ativo...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center space-x-2">
        <SidebarTrigger />
        <h2 className="text-3xl font-bold tracking-tight">Editar Ativo</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>Dados principais do ativo de TI</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Ativo *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Dell Latitude 5520"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Ativo *</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {assetTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center space-x-2">
                          <type.icon className="h-4 w-4" />
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Marca</Label>
                <Input
                  id="brand"
                  placeholder="Ex: Dell, HP, Samsung"
                  value={formData.brand}
                  onChange={(e) => handleInputChange("brand", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Modelo</Label>
                <Input
                  id="model"
                  placeholder="Ex: Latitude 5520"
                  value={formData.model}
                  onChange={(e) => handleInputChange("model", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="serialNumber">Número Serial *</Label>
              <Input
                id="serialNumber"
                placeholder="Número serial do equipamento"
                value={formData.serialNumber}
                onChange={(e) => handleInputChange("serialNumber", e.target.value)}
                required
                disabled // Serial number should generally not be editable after creation
              />
            </div>

            {/* Campos de hardware */}
            <div className="space-y-2">
              <Label htmlFor="cpu">Processador</Label>
              <Input
                id="cpu"
                placeholder="Ex: Intel Core i5"
                value={formData.specifications.cpu}
                onChange={(e) => handleInputChange("specifications.cpu", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ram">Memória RAM</Label>
              <Input
                id="ram"
                placeholder="Ex: 16GB DDR4"
                value={formData.specifications.ram}
                onChange={(e) => handleInputChange("specifications.ram", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ssd">SSD</Label>
              <Input
                id="ssd"
                placeholder="Ex: 512GB NVMe"
                value={formData.specifications.ssd}
                onChange={(e) => handleInputChange("specifications.ssd", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações de Compra</CardTitle>
            <CardDescription>Dados relacionados à aquisição do ativo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data de Compra</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.purchaseDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.purchaseDate ? (
                        format(formData.purchaseDate, "PPP", { locale: ptBR })
                      ) : (
                        <span>Selecione a data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.purchaseDate}
                      onSelect={(date) => setFormData((prev) => ({ ...prev, purchaseDate: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchaseValue">Valor de Compra (R$)</Label>
                <Input
                  id="purchaseValue"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.purchaseValue}
                  onChange={(e) => handleInputChange("purchaseValue", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplier">Fornecedor</Label>
                <Input
                  id="supplier"
                  placeholder="Nome do fornecedor"
                  value={formData.supplier}
                  onChange={(e) => handleInputChange("supplier", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="warranty">Garantia (meses)</Label>
                <Input
                  id="warranty"
                  type="number"
                  placeholder="12"
                  value={formData.warranty}
                  onChange={(e) => handleInputChange("warranty", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Localização e Status</CardTitle>
            <CardDescription>Informações sobre localização e status atual</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Localização</Label>
                <Input
                  id="location"
                  placeholder="Ex: TI - Sala 101"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Disponível">Disponível</SelectItem>
                    <SelectItem value="Em uso">Em uso</SelectItem>
                    <SelectItem value="Em manutenção">Em manutenção</SelectItem>
                    <SelectItem value="Inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição/Observações</Label>
              <Textarea
                id="description"
                placeholder="Informações adicionais sobre o ativo..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atribuição de Funcionário</CardTitle>
            <CardDescription>Vincule este ativo a um funcionário</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="assignedTo">Funcionário Atribuído</Label>
              <Select
                value={formData.assignedTo || "null"} // Use "null" para representar nenhum funcionário
                onValueChange={handleAssignedToChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um funcionário" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Nenhum (Desvincular)</span>
                    </div>
                  </SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>
                          {employee.name} ({employee.department})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {formData.assignedTo && (
              <div className="space-y-2">
                <Label>Data de Atribuição</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.assignedDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.assignedDate ? (
                        format(formData.assignedDate, "PPP", { locale: ptBR })
                      ) : (
                        <span>Selecione a data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.assignedDate}
                      onSelect={(date) => setFormData((prev) => ({ ...prev, assignedDate: date || undefined }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Atualizando..." : "Atualizar Ativo"}
          </Button>
        </div>
      </form>
    </div>
  )
}
