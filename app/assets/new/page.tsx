"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
// Remover Keyboard e Mouse dos imports
import { CalendarIcon, Computer, Laptop, Monitor, Smartphone, Keyboard, MousePointer } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"

export default function NewAssetPage() {
  const router = useRouter()
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
  })
  const [loading, setLoading] = useState(false)

  // Atualizar a lista assetTypes - Remover Teclado e Mouse
  const assetTypes = [
    { value: "notebook", label: "Notebook", icon: Laptop },
    { value: "desktop", label: "Desktop", icon: Computer },
    { value: "monitor", label: "Monitor", icon: Monitor },
    { value: "mobile", label: "Celular", icon: Smartphone },
    { value: "teclado_mouse_kit", label: "Kit Teclado | Mouse", icon: null },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!formData.name || !formData.type || !formData.serialNumber) {
      toast.error("Por favor, preencha todos os campos obrigatórios")
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from("assets")
        .insert([
          {
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
            specifications: {}, // Adicione especificações se houver um campo para isso
          },
        ])
        .select()

      if (error) {
        throw error
      }

      console.log("Ativo cadastrado:", data)
      toast.success("Ativo cadastrado com sucesso!")
      router.push("/assets")
    } catch (error: any) {
      toast.error(`Erro ao cadastrar ativo: ${error.message || error}`)
      console.error("Erro ao cadastrar ativo:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center space-x-2">
        <SidebarTrigger />
        <h2 className="text-3xl font-bold tracking-tight">Cadastrar Novo Ativo</h2>
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
                          {type.value === "teclado_mouse_kit" ? (
                            <span className="flex items-center space-x-1">
                              <Keyboard className="h-4 w-4" />
                              <MousePointer className="h-4 w-4" />
                            </span>
                          ) : type.icon ? (
                            <type.icon className="h-4 w-4" />
                          ) : null}
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

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Cadastrando..." : "Cadastrar Ativo"}
          </Button>
        </div>
      </form>
    </div>
  )
}
