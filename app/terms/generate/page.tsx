"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Download, Printer, Plus } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const accessoryTypes = [
  { id: "teclado", name: "Teclado" },
  { id: "mouse", name: "Mouse" },
  { id: "base de notebook", name: "Base para notebook" },
  { id: "fone", name: "Fone de Ouvido" },
  { id: "webcam", name: "Webcam" },
  { id: "mousepad", name: "Mousepad" },
  { id: "cabo_hdmi", name: "Cabo HDMI" },
  { id: "carregador", name: "Carregador" },
  { id: "outros", name: "Outros Acessórios" },
]

export default function GenerateTermsPage() {
  const router = useRouter()
  const [termType, setTermType] = useState<"responsibility" | "requisition" | "return">("responsibility")
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("")
  const [selectedEmployeeData, setSelectedEmployeeData] = useState<any>(null)
  const [selectedAssets, setSelectedAssets] = useState<any[]>([])
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([])
  const [deliveryDate, setDeliveryDate] = useState<Date>(new Date())
  const [returnDate, setReturnDate] = useState<Date>()
  const [showAssetSelection, setShowAssetSelection] = useState(false)
  const [employees, setEmployees] = useState<any[]>([])
  const [availableAssetsByType, setAvailableAssetsByType] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [today, setToday] = useState("")
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([])
  const [departmentName, setDepartmentName] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const { data: employeesData, error: employeesError } = await supabase
        .from("employees")
        .select("id, name, email, cpf, department, position, accessories")
      const { data: assetsData, error: assetsError } = await supabase
        .from("assets")
        .select("id, name, type, serial_number, status")
      const { data: departmentsData, error: departmentsError } = await supabase
        .from("departments")
        .select("id, name")

      if (employeesError) {
        console.error("Erro ao buscar funcionários:", employeesError)
        toast.error("Erro ao carregar funcionários.")
      } else {
        setEmployees(employeesData || [])
      }

      if (assetsError) {
        console.error("Erro ao buscar ativos:", assetsError)
        toast.error("Erro ao carregar ativos.")
      } else {
        const categorizedAssets: any = {
          notebook: [],
          desktop: [],
          monitor: [],
          mobile: [],
          teclado_mouse_kit: [],
        }
        assetsData?.forEach((asset) => {
          if (categorizedAssets[asset.type]) {
            categorizedAssets[asset.type].push(asset)
          } else if (
            asset.type === "teclado_mouse_kit" ||
            asset.type === "kit teclado | mouse" ||
            asset.type === "kit_teclado_mouse"
          ) {
            categorizedAssets["teclado_mouse_kit"].push(asset)
          }
        })
        setAvailableAssetsByType(categorizedAssets)
      }

      if (!departmentsError && departmentsData) setDepartments(departmentsData)

      setLoading(false)
    }
    fetchData()
  }, [])

  useEffect(() => {
    setToday(format(new Date(), "dd/MM/yyyy"))
  }, [])

  useEffect(() => {
    const employee = employees.find((emp) => emp.id === selectedEmployeeId)

    if (employee) {
      setSelectedEmployeeData(employee)
      const dep = departments.find((d) => d.id === employee.department)
      setDepartmentName(dep ? dep.name : "")

      // Pre-selecionar acessórios com base nos dados do funcionário
      const preSelectedAccs: string[] = []
      if (employee.accessories) {
        for (const accId in employee.accessories) {
          if (employee.accessories[accId] === true) {
            preSelectedAccs.push(accId)
          }
        }
      }
      setSelectedAccessories(preSelectedAccs)

      const fetchAssetsForTermType = async () => {
        if (termType === "responsibility") {
          // Fetch assigned assets for responsibility term
          const { data: assignedAssetsData, error } = await supabase
            .from("assets")
            .select("id, name, type, serial_number")
            .eq("assigned_to", employee.id)

          if (error) {
            console.error("Erro ao buscar ativos atribuídos:", error)
            toast.error("Erro ao carregar ativos atribuídos.")
            setSelectedAssets([])
          } else {
            setSelectedAssets(assignedAssetsData || [])
            setShowAssetSelection(assignedAssetsData?.length === 0) // Show selection if no assigned assets
          }
        } else if (termType === "requisition") {
          // For requisition term, always start with empty selection and show all available
          setSelectedAssets([])
          setShowAssetSelection(true)
        } else if (termType === "return") {
          // For return term, fetch assets currently assigned to the employee
          const { data: assignedAssetsData, error } = await supabase
            .from("assets")
            .select("id, name, type, serial_number")
            .eq("assigned_to", employee.id)

          if (error) {
            console.error("Erro ao buscar ativos atribuídos para devolução:", error)
            toast.error("Erro ao carregar ativos atribuídos para devolução.")
            setSelectedAssets([])
          } else {
            // Sempre seleciona todos os ativos atribuídos para devolução
            setSelectedAssets(assignedAssetsData || [])
            setShowAssetSelection(false) // No new selection for return, only show assigned
          }
        }
      }
      fetchAssetsForTermType()
    } else {
      setSelectedEmployeeData(null)
      setSelectedAssets([])
      setShowAssetSelection(false)
      setSelectedAccessories([]) // Clear accessories when no employee is selected
      setDepartmentName("")
    }
  }, [selectedEmployeeId, termType, employees, departments])

  const handleTermTypeChange = (value: "responsibility" | "requisition" | "return") => {
    setTermType(value)
    // Reset selected assets and accessories when term type changes
    setSelectedAssets([])
    setSelectedAccessories([])
    setShowAssetSelection(false) // Reset showAssetSelection
  }

  const handleAssetToggle = (asset: any) => {
    setSelectedAssets((prev) => {
      const exists = prev.find((a) => a.id === asset.id)
      if (exists) {
        return prev.filter((a) => a.id !== asset.id)
      } else {
        return [...prev, asset]
      }
    })
  }

  const handleAccessoryToggle = (accessoryId: string) => {
    setSelectedAccessories((prev) =>
      prev.includes(accessoryId) ? prev.filter((id) => id !== accessoryId) : [...prev, accessoryId],
    )
  }

  const handlePrint = () => {
    if (!selectedEmployeeId) {
      toast.error("Selecione um funcionário")
      return
    }
    if (selectedAssets.length === 0 && selectedAccessories.length === 0) {
      toast.error("Selecione pelo menos um ativo ou acessório")
      return
    }

    window.print()
  }

  const handleDownload = async () => {
    if (!selectedEmployeeId) {
      toast.error("Selecione um funcionário")
      return
    }
    if (selectedAssets.length === 0 && selectedAccessories.length === 0) {
      toast.error("Selecione pelo menos um ativo ou acessório")
      return
    }
    const input = document.getElementById('termo-impressao');
    if (input) {
      const canvas = await html2canvas(input);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('termo.pdf');
      toast.success('Download iniciado!');
    }
  }

  const allSelectedItems = [
    ...selectedAssets.map((asset) => `• ${asset.name} - ${asset.type} - Serial: ${asset.serial_number}`),
    ...selectedAccessories.map((accId) => {
      const acc = accessoryTypes.find((a) => a.id === accId)
      return `• ${acc?.name}`
    }),
  ]

  const responsibilityTermText = selectedEmployeeData
    ? `
TERMO DE RESPONSABILIDADE DE USO DE EQUIPAMENTOS DE INFORMÁTICA

Eu, ${selectedEmployeeData.name}, CPF ${selectedEmployeeData.cpf}, funcionário(a) do departamento ${departmentName}, 
ocupando o cargo de ${selectedEmployeeData.position}, declaro ter recebido os equipamentos de informática abaixo relacionados 
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
${allSelectedItems.join("\n")}

Data de Entrega: ${format(deliveryDate, "dd/MM/yyyy")}

Declaro estar ciente das responsabilidades assumidas e concordo com todos os termos acima.

_________________________________
Assinatura do Funcionário
${selectedEmployeeData.name}

_________________________________
Assinatura do Responsável TI
Data: ${today}
  `
    : ""

  const requisitionTermText = selectedEmployeeData
    ? `
TERMO DE REQUISIÇÃO DE ATIVOS E ACESSÓRIOS DE TI

DADOS DO SOLICITANTE:
Nome: ${selectedEmployeeData.name}
CPF: ${selectedEmployeeData.cpf}
Departamento: ${departmentName}
Cargo: ${selectedEmployeeData.position}
E-mail: ${selectedEmployeeData.email}

ITENS SOLICITADOS:
${allSelectedItems.join("\n")}

JUSTIFICATIVA DA SOLICITAÇÃO:
Necessidade para execução das atividades profissionais.

PERÍODO DE USO:
Data de Entrega: ${format(deliveryDate, "dd/MM/yyyy")}
${returnDate ? `Data de Devolução: ${format(returnDate, "dd/MM/yyyy")}` : "Data de Devolução: ___/___/____"}

TERMOS E CONDIÇÕES:
1. Os equipamentos devem ser utilizados exclusivamente para fins profissionais;
2. O solicitante é responsável pela guarda e conservação dos itens;
3. Qualquer dano ou perda deve ser comunicado imediatamente ao setor de TI;
4. Os equipamentos devem ser devolvidos na data estipulada;
5. O não cumprimento dos termos pode resultar em cobrança pelos danos.

APROVAÇÕES:
_________________________________        _________________________________
Solicitante                              Supervisor Imediato
${selectedEmployeeData.name}             Nome: ________________
Data: ${today}                       Data: ___/___/____

_________________________________        _________________________________
Responsável TI                           Gerente do Departamento
Nome: ________________                   Nome: ________________
Data: ___/___/____                       Data: ___/___/____
`
    : ""

  const returnTermText = selectedEmployeeData
    ? `
TERMO DE DEVOLUÇÃO DE EQUIPAMENTOS DE INFORMÁTICA

Eu, ${selectedEmployeeData.name}, CPF ${selectedEmployeeData.cpf}, funcionário(a) do departamento de ${departmentName}, 
ocupando o cargo de ${selectedEmployeeData.position}, declaro estar devolvendo os equipamentos de informática abaixo relacionados 
à empresa, em bom estado de conservação e funcionamento, salvo observações.

EQUIPAMENTOS DEVOLVIDOS:
${allSelectedItems.join("\n")}

Data de Devolução: ${today}

Declaro que os equipamentos foram inspecionados e aceitos pelo responsável de TI.

_________________________________
Assinatura do Funcionário
${selectedEmployeeData.name}

_________________________________
Assinatura do Responsável TI
Data: ${today}
`
    : ""

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `@media print { body * { visibility: hidden; } #termo-impressao, #termo-impressao * { visibility: visible; } #termo-impressao { position: absolute; left: 0; top: 0; width: 100vw; } }`;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
          <h2 className="text-3xl font-bold tracking-tight">Gerar Termos</h2>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-48">
            <p>Carregando dados para termos...</p>
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
          <h2 className="text-3xl font-bold tracking-tight">Gerar Termos</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => router.back()}>
            Voltar
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tipo de Termo</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={termType} onValueChange={handleTermTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="responsibility">Termo de Responsabilidade</SelectItem>
                  <SelectItem value="requisition">Termo de Requisição</SelectItem>
                  <SelectItem value="return">Termo de Devolução</SelectItem> {/* Nova opção */}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Funcionário</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o funcionário" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      <div>
                        <p className="font-medium">{employee.name}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(deliveryDate, "PPP", { locale: ptBR })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={deliveryDate}
                      onSelect={(date) => date && setDeliveryDate(date)}
                      initialFocus
                    />
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

          {selectedEmployeeData && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Ativos</CardTitle>
                  {termType !== "return" && ( // Esconde o botão de adicionar para o termo de devolução
                    <Button variant="ghost" size="sm" onClick={() => setShowAssetSelection(!showAssetSelection)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {termType === "responsibility" ? (
                  // Lógica para termo de responsabilidade (mostra ativos já atribuídos)
                  <>
                    {selectedAssets.length > 0 ? (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-green-600">Ativos já atribuídos:</Label>
                        {selectedAssets.map((asset) => (
                          <div key={asset.id} className="flex items-center space-x-2">
                            <Checkbox checked={true} disabled />
                            <Label className="text-sm">
                              {asset.name} - {asset.serial_number}
                            </Label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Nenhum ativo atribuído</p>
                    )}

                    {showAssetSelection && (
                      <div className="space-y-3 border-t pt-3">
                        <Label className="text-sm font-medium">Selecionar novos ativos:</Label>
                        {/* Seleção de ativos por categoria */}
                        {Object.entries(availableAssetsByType).map(([type, assets]) => {
                          const assetsArray = assets as any[];
                          return (
                            <div key={type} className="space-y-2">
                              <Label className="text-xs font-medium text-muted-foreground capitalize">
                                {type === "notebook"
                                  ? "Notebooks"
                                  : type === "desktop"
                                    ? "Desktops"
                                    : type === "monitor"
                                      ? "Monitores"
                                      : type === "mobile"
                                        ? "Celulares"
                                        : type === "teclado_mouse_kit"
                                          ? "Kit Teclado | Mouse"
                                          : type}
                              </Label>
                              {assetsArray
                                .filter((asset) => asset.status === "Disponível")
                                .map((asset) => (
                                  <div key={asset.id} className="flex items-center space-x-2 ml-2">
                                    <Checkbox
                                      id={asset.id}
                                      checked={selectedAssets.some((a) => a.id === asset.id)}
                                      onCheckedChange={() =>
                                        handleAssetToggle({
                                          ...asset,
                                          type,
                                          name: asset.name,
                                          serial_number: asset.serial_number,
                                        })
                                      }
                                    />
                                    <Label htmlFor={asset.id} className="text-xs cursor-pointer">
                                      {asset.name} - {asset.serial_number}
                                    </Label>
                                  </div>
                                ))}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : termType === "requisition" ? (
                  // Lógica para termo de requisição (seleção livre, sem mostrar ativos cadastrados)
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Selecionar ativos para requisição:</Label>
                    {Object.entries(availableAssetsByType).map(([type, assets]) => {
                      const assetsArray = assets as any[];
                      return (
                        <div key={type} className="space-y-2">
                          <Label className="text-xs font-medium text-muted-foreground capitalize">
                            {type === "notebook"
                              ? "Notebooks"
                              : type === "desktop"
                                ? "Desktops"
                                : type === "monitor"
                                  ? "Monitores"
                                  : "Celulares"}
                          </Label>
                          {assetsArray
                            .filter((asset) => asset.status === "Disponível")
                            .map((asset) => (
                              <div key={asset.id} className="flex items-center space-x-2 ml-2">
                                <Checkbox
                                  id={`req-${asset.id}`}
                                  checked={selectedAssets.some((a) => a.id === asset.id)}
                                  onCheckedChange={() =>
                                    handleAssetToggle({
                                      ...asset,
                                      type,
                                      name: asset.name,
                                      serial_number: asset.serial_number,
                                    })
                                  }
                                />
                                <Label htmlFor={`req-${asset.id}`} className="text-xs cursor-pointer">
                                  {asset.name} - {asset.serial_number}
                                </Label>
                              </div>
                            ))}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  // Lógica para termo de devolução (mostra ativos atribuídos e os torna somente leitura)
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-blue-600">Ativos a serem devolvidos:</Label>
                    {selectedAssets.length > 0 ? (
                      selectedAssets.map((asset) => (
                        <div key={asset.id} className="flex items-center space-x-2">
                          <Checkbox checked={true} disabled /> {/* Sempre marcado e desabilitado */}
                          <Label className="text-sm">
                            {asset.name} - {asset.serial_number}
                          </Label>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Nenhum ativo atribuído a este funcionário para devolução.
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Acessórios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {accessoryTypes.map((accessory) => (
                <div key={accessory.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={accessory.id}
                    checked={selectedAccessories.includes(accessory.id)}
                    onCheckedChange={() => handleAccessoryToggle(accessory.id)}
                  />
                  <Label htmlFor={accessory.id} className="text-sm cursor-pointer">
                    {accessory.name}
                  </Label>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Button onClick={handlePrint} className="w-full">
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
            <Button onClick={handleDownload} variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Baixar PDF
            </Button>
          </div>
        </div>

        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>
                {termType === "responsibility"
                  ? "Termo de Responsabilidade"
                  : termType === "requisition"
                    ? "Termo de Requisição"
                    : "Termo de Devolução"}
              </CardTitle>
              <CardDescription>
                Pré-visualização do documento
                {selectedEmployeeData && (
                  <span className="ml-2">• {allSelectedItems.length} item(s) selecionado(s)</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-white border rounded-lg p-6 min-h-[600px] print:shadow-none print:border-none">
                <div id="termo-impressao">
                  <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
                    {termType === "responsibility"
                      ? responsibilityTermText
                      : termType === "requisition"
                        ? requisitionTermText
                        : returnTermText}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:shadow-none,
          .print\\:shadow-none * {
            visibility: visible;
          }
          .print\\:shadow-none {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
