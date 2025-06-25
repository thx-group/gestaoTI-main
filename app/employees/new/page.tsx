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
import { Checkbox } from "@/components/ui/checkbox"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"

export default function NewEmployeePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    department: "",
    position: "",
    hireDate: undefined as Date | undefined,
    status: "Ativo",
    notes: "",
    accessories: {
      teclado: false,
      mouse: false,
      fone: false,
    },
  })

  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([])
  const [departmentsLoading, setDepartmentsLoading] = useState(true)

  useEffect(() => {
    async function fetchDepartments() {
      setDepartmentsLoading(true)
      const { data, error } = await supabase.from("departments").select("id, name").order("name")
      if (!error && data) setDepartments(data)
      setDepartmentsLoading(false)
    }
    fetchDepartments()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.phone || !formData.department || !formData.position) {
      toast.error("Por favor, preencha todos os campos obrigatórios")
      return
    }

    try {
      const { data, error } = await supabase
        .from("employees")
        .insert([
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            cpf: formData.cpf,
            department: formData.department,
            position: formData.position,
            hire_date: formData.hireDate?.toISOString().split("T")[0],
            status: formData.status,
            notes: formData.notes,
            accessories: formData.accessories,
          },
        ])
        .select()

      if (error) {
        throw error
      }

      console.log("Funcionário cadastrado:", data)
      toast.success("Funcionário cadastrado com sucesso!")
      router.push("/employees")
    } catch (error: any) {
      toast.error(`Erro ao cadastrar funcionário: ${error.message || error}`)
      console.error("Erro ao cadastrar funcionário:", error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAccessoryChange = (accessory: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      accessories: {
        ...prev.accessories,
        [accessory]: checked,
      },
    }))
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center space-x-2">
        <SidebarTrigger />
        <h2 className="text-3xl font-bold tracking-tight">Cadastrar Novo Funcionário</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>Dados pessoais do funcionário</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Caroline Cleni Dias Novalski Lopes"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={(e) => handleInputChange("cpf", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="caroline@thxgroup.com.br"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  placeholder="(11) 99999-9999"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações Profissionais</CardTitle>
            <CardDescription>Dados relacionados ao trabalho</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Departamento *</Label>
                <Select value={formData.department} onValueChange={(value) => handleInputChange("department", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {departmentsLoading ? (
                      <SelectItem value="__loading__" disabled>Carregando...</SelectItem>
                    ) : departments.length === 0 ? (
                      <SelectItem value="__empty__" disabled>Nenhum departamento cadastrado</SelectItem>
                    ) : (
                      departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Cargo *</Label>
                <Input
                  id="position"
                  placeholder="Ex: Commercial Hunter"
                  value={formData.position}
                  onChange={(e) => handleInputChange("position", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Data de Admissão *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.hireDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.hireDate ? (
                      format(formData.hireDate, "PPP", { locale: ptBR })
                    ) : (
                      <span>Selecione a data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.hireDate}
                    onSelect={(date) => setFormData((prev) => ({ ...prev, hireDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Férias">Férias</SelectItem>
                  <SelectItem value="Licença">Licença</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acessórios</CardTitle>
            <CardDescription>Acessórios que o funcionário possui ou necessita</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="teclado"
                  checked={formData.accessories.teclado}
                  onCheckedChange={(checked) => handleAccessoryChange("teclado", checked as boolean)}
                />
                <Label htmlFor="teclado" className="cursor-pointer">
                  🖮 Teclado
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="mouse"
                  checked={formData.accessories.mouse}
                  onCheckedChange={(checked) => handleAccessoryChange("mouse", checked as boolean)}
                />
                <Label htmlFor="mouse" className="cursor-pointer">
                  🖱️ Mouse
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="fone"
                  checked={formData.accessories.fone}
                  onCheckedChange={(checked) => handleAccessoryChange("fone", checked as boolean)}
                />
                <Label htmlFor="fone" className="cursor-pointer">
                  🎧 Fone
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
            <CardDescription>Informações adicionais</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                placeholder="Informações adicionais sobre o funcionário..."
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit">Cadastrar Funcionário</Button>
        </div>
      </form>
    </div>
  )
}
