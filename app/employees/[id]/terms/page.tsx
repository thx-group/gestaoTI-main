"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, FileText, Download, Printer } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"

// Mock data - em um app real, isso viria de uma API
const mockEmployee = {
  id: "1",
  name: "João Silva",
  email: "joao.silva@empresa.com",
  cpf: "123.456.789-00",
  department: "TI",
  position: "Desenvolvedor Senior",
}

const availableAssets = [
  { id: "1", name: "Dell Latitude 5520", type: "Notebook", serialNumber: "DL5520001" },
  { id: "2", name: "Monitor Samsung 24'", type: "Monitor", serialNumber: "SM24002" },
  { id: "3", name: "iPhone 13", type: "Celular", serialNumber: "IP13003" },
  { id: "4", name: "Mouse Logitech", type: "Acessório", serialNumber: "LG001" },
  { id: "5", name: "Teclado Mecânico", type: "Acessório", serialNumber: "KB001" },
]

export default function EmployeeTermsPage() {
  const params = useParams()
  const router = useRouter()
  const employeeId = params.id

  const [termType, setTermType] = useState<"responsibility" | "requisition">("responsibility")
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])
  const [deliveryDate, setDeliveryDate] = useState<Date>()
  const [returnDate, setReturnDate] = useState<Date>()
  const [observations, setObservations] = useState("")
  const [agreed, setAgreed] = useState(false)

  const handleAssetToggle = (assetId: string) => {
    setSelectedAssets((prev) => (prev.includes(assetId) ? prev.filter((id) => id !== assetId) : [...prev, assetId]))
  }

  const handleGenerateTerm = () => {
    if (selectedAssets.length === 0) {
      toast.error("Selecione pelo menos um ativo")
      return
    }

    if (!agreed) {
      toast.error("É necessário concordar com os termos")
      return
    }

    // Aqui você implementaria a lógica para gerar o termo
    console.log("Gerando termo:", {
      type: termType,
      employee: mockEmployee,
      assets: selectedAssets,
      deliveryDate,
      returnDate,
      observations,
    })

    toast.success("Termo gerado com sucesso!")
  }

  const responsibilityTermText = `
TERMO DE RESPONSABILIDADE DE USO DE EQUIPAMENTOS DE INFORMÁTICA

Eu, ${mockEmployee.name}, CPF ${mockEmployee.cpf}, funcionário(a) do departamento de ${mockEmployee.department}, 
ocupando o cargo de ${mockEmployee.position}, declaro ter recebido os equipamentos de informática abaixo relacionados 
para uso exclusivo nas atividades profissionais.

COMPROMETO-ME A:

1. Utilizar os equipamentos exclusivamente para fins profissionais;
2. Zelar pela conservação e bom funcionamento dos equipamentos;
3. Não instalar softwares não autorizados pela empresa;
4. Não permitir o uso dos equipamentos por terceiros;
5. Comunicar imediatamente qualquer problema técnico ou dano;
6. Devolver os equipamentos em perfeito estado quando solicitado;
7. Ressarcir a empresa em caso de danos causados por mau uso ou negligência.

EQUIPAMENTOS RECEBIDOS:
${selectedAssets
  .map((id) => {
    const asset = availableAssets.find((a) => a.id === id)
    return `• ${asset?.name} - ${asset?.type} - Serial: ${asset?.serialNumber}`
  })
  .join("\n")}

Data de Entrega: ${deliveryDate ? format(deliveryDate, "dd/MM/yyyy") : "___/___/____"}
${observations ? `\nObservações: ${observations}` : ""}

Declaro estar ciente das responsabilidades assumidas e concordo com todos os termos acima.

_________________________________
Assinatura do Funcionário
${mockEmployee.name}

_________________________________
Assinatura do Responsável TI
Data: ___/___/____
  `

  const requisitionTermText = `
TERMO DE REQUISIÇÃO DE ATIVOS E ACESSÓRIOS DE TI

DADOS DO SOLICITANTE:
Nome: ${mockEmployee.name}
CPF: ${mockEmployee.cpf}
Departamento: ${mockEmployee.department}
Cargo: ${mockEmployee.position}
E-mail: ${mockEmployee.email}

ITENS SOLICITADOS:
${selectedAssets
  .map((id) => {
    const asset = availableAssets.find((a) => a.id === id)
    return `• ${asset?.name} - ${asset?.type} - Serial: ${asset?.serialNumber}`
  })
  .join("\n")}

JUSTIFICATIVA DA SOLICITAÇÃO:
${observations || "Necessidade para execução das atividades profissionais."}

PERÍODO DE USO:
Data de Entrega: ${deliveryDate ? format(deliveryDate, "dd/MM/yyyy") : "___/___/____"}
Data de Devolução: ${returnDate ? format(returnDate, "dd/MM/yyyy") : "___/___/____"}

TERMOS E CONDIÇÕES:
1. Os equipamentos devem ser utilizados exclusivamente para fins profissionais;
2. O solicitante é responsável pela guarda e conservação dos itens;
3. Qualquer dano ou perda deve ser comunicado imediatamente ao setor de TI;
4. Os equipamentos devem ser devolvidos na data estipulada;
5. O não cumprimento dos termos pode resultar em cobrança pelos danos.

APROVAÇÕES:
_________________________________        _________________________________
Solicitante                              Supervisor Imediato
${mockEmployee.name}                     Nome: ________________
Data: ___/___/____                       Data: ___/___/____

_________________________________        _________________________________
Responsável TI                           Gerente do Departamento
Nome: ________________                   Nome: ________________
Data: ___/___/____                       Data: ___/___/____
  `

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
          <h2 className="text-3xl font-bold tracking-tight">Termos de Responsabilidade</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => router.back()}>
            Voltar
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tipo de Termo</CardTitle>
              <CardDescription>Selecione o tipo de documento</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={termType} onValueChange={(value: "responsibility" | "requisition") => setTermType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="responsibility">Termo de Responsabilidade</SelectItem>
                  <SelectItem value="requisition">Termo de Requisição</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dados do Funcionário</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <Label className="text-sm font-medium">Nome</Label>
                <p className="text-sm">{mockEmployee.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">CPF</Label>
                <p className="text-sm">{mockEmployee.cpf}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Departamento</Label>
                <p className="text-sm">{mockEmployee.department}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Cargo</Label>
                <p className="text-sm">{mockEmployee.position}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Datas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Data de Entrega</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !deliveryDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {deliveryDate ? format(deliveryDate, "PPP", { locale: ptBR }) : "Selecione a data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={deliveryDate} onSelect={setDeliveryDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              {termType === "requisition" && (
                <div className="space-y-2">
                  <Label>Data de Devolução</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !returnDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {returnDate ? format(returnDate, "PPP", { locale: ptBR }) : "Selecione a data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={returnDate} onSelect={setReturnDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ativos Disponíveis</CardTitle>
              <CardDescription>Selecione os equipamentos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {availableAssets.map((asset) => (
                <div key={asset.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={asset.id}
                    checked={selectedAssets.includes(asset.id)}
                    onCheckedChange={() => handleAssetToggle(asset.id)}
                  />
                  <Label htmlFor={asset.id} className="text-sm cursor-pointer">
                    <div>
                      <p className="font-medium">{asset.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {asset.type} - {asset.serialNumber}
                      </p>
                    </div>
                  </Label>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Observações adicionais..."
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Checkbox id="agree" checked={agreed} onCheckedChange={(checked) => setAgreed(checked as boolean)} />
                <Label htmlFor="agree" className="text-sm cursor-pointer">
                  Concordo com os termos e condições
                </Label>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Button onClick={handleGenerateTerm} className="w-full">
              <FileText className="mr-2 h-4 w-4" />
              Gerar Termo
            </Button>
            <Button variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Baixar PDF
            </Button>
            <Button variant="outline" className="w-full">
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
          </div>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {termType === "responsibility" ? "Termo de Responsabilidade" : "Termo de Requisição"}
              </CardTitle>
              <CardDescription>Pré-visualização do documento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-white border rounded-lg p-6 min-h-[600px]">
                <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
                  {termType === "responsibility" ? responsibilityTermText : requisitionTermText}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
