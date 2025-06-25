"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog" // Importar componentes do AlertDialog
import { Computer, Edit, Trash2, User, MapPin, Calendar, DollarSign, Shield, FileText, History } from "lucide-react"
import Link from "next/link"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Select as UiSelect, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { GoogleCalendarQuickAddButton } from "../../components/GoogleCalendarQuickAddButton"

export default function AssetDetailPage() {
  const params = useParams()!
  const router = useRouter()
  const assetId = params.id
  const [asset, setAsset] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [employees, setEmployees] = useState<any[]>([])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("")
  const [transferring, setTransferring] = useState(false)

  useEffect(() => {
    const fetchAsset = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from("assets")
        .select(
          `
          *,
          assigned_to (
            id,
            name
          )
        `,
        )
        .eq("id", assetId)
        .single()

      if (error) {
        console.error("Erro ao buscar ativo:", error.message || error)
        toast.error("Erro ao carregar detalhes do ativo.")
        setAsset(null)
      } else {
        setAsset(data)
      }
      setLoading(false)
    }
    fetchAsset()
  }, [assetId])

  useEffect(() => {
    // Buscar funcionários para transferência
    const fetchEmployees = async () => {
      const { data, error } = await supabase.from("employees").select("id, name")
      if (!error && data) setEmployees(data)
    }
    fetchEmployees()
  }, [])

  const handleDeleteAsset = async () => {
    setDeleting(true)
    try {
      const { error } = await supabase.from("assets").delete().eq("id", assetId)

      if (error) {
        throw error
      }

      toast.success("Ativo excluído com sucesso!")
      router.push("/assets") // Redireciona para a lista de ativos após a exclusão
    } catch (error: any) {
      toast.error(`Erro ao excluir ativo: ${error.message || error}`)
      console.error("Erro ao excluir ativo:", error)
    } finally {
      setDeleting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Em uso":
        return "bg-green-100 text-green-800"
      case "Disponível":
        return "bg-blue-100 text-blue-800"
      case "Em manutenção":
        return "bg-orange-100 text-orange-800"
      case "Inativo":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Handlers para ações rápidas
  const handleTransferirAtivo = () => {
    setShowTransferModal(true)
  }
  const handleConfirmTransfer = async () => {
    if (!selectedEmployeeId) {
      toast.error("Selecione um funcionário para transferir.")
      return
    }
    setTransferring(true)
    try {
      // Atualiza o ativo
      const { error } = await supabase.from("assets").update({
        assigned_to: selectedEmployeeId,
        assigned_date: new Date().toISOString().split("T")[0],
        // Adiciona histórico (simples, append no array)
        history: [
          ...(asset.history || []),
          {
            action: `Transferido para funcionário ID ${selectedEmployeeId}`,
            user: "Sistema",
            date: new Date().toISOString(),
          },
        ],
      }).eq("id", assetId)
      if (error) throw error
      toast.success("Ativo transferido com sucesso!")
      setShowTransferModal(false)
      router.refresh()
    } catch (e: any) {
      toast.error("Erro ao transferir ativo: " + (e.message || e))
    } finally {
      setTransferring(false)
    }
  }
  const handleGerarRelatorio = () => {
    setShowReportModal(true)
  }
  const handleAgendarManutencao = () => {
    toast.info("Ação de agendar manutenção acionada!")
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
          <h2 className="text-3xl font-bold tracking-tight">Detalhes do Ativo</h2>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-48">
            <p>Carregando detalhes do ativo...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!asset) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
          <h2 className="text-3xl font-bold tracking-tight">Detalhes do Ativo</h2>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-48">
            <p>Ativo não encontrado.</p>
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
          <h2 className="text-3xl font-bold tracking-tight">Detalhes do Ativo</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/assets/${assetId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={deleting}>
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Isso excluirá permanentemente o ativo{" "}
                  <span className="font-bold">{asset.name}</span> do seu banco de dados.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAsset}>Excluir</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Computer className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-2xl">{asset.name}</CardTitle>
                    <CardDescription>
                      {asset.brand} {asset.model}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="secondary" className={getStatusColor(asset.status)}>
                  {asset.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>Número Serial</span>
                  </div>
                  <p className="font-mono">{asset.serial_number}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Data de Compra</span>
                  </div>
                  <p>{asset.purchase_date ? new Date(asset.purchase_date).toLocaleDateString("pt-BR") : "-"}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>Processador</span>
                  </div>
                  <p>{asset.specifications?.cpu || "-"}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>Memória RAM</span>
                  </div>
                  <p>{asset.specifications?.ram || "-"}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>SSD</span>
                  </div>
                  <p>{asset.specifications?.ssd || "-"}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-semibold">Descrição</h4>
                <p className="text-sm text-muted-foreground">{asset.description || "Nenhuma descrição."}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Especificações Técnicas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {asset.specifications && Object.keys(asset.specifications).length > 0 ? (
                  Object.entries(asset.specifications).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <p className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, " $1")}</p>
                      <p className="text-sm text-muted-foreground">{value as string}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhuma especificação disponível.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Histórico de Movimentações</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Histórico ainda mockado, precisa de tabela de histórico */}
              <div className="space-y-4">
                {asset.history && asset.history.length > 0 ? (
                  asset.history.map((item: any, index: number) => (
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
                  <p className="text-sm text-muted-foreground">Nenhum histórico de movimentação.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações de Uso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>Responsável</span>
                </div>
                <p className="font-medium">{asset.assigned_to?.name || "-"}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Data de Atribuição</span>
                </div>
                <p>{asset.assigned_date ? new Date(asset.assigned_date).toLocaleDateString("pt-BR") : "-"}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>Localização</span>
                </div>
                <p>{asset.location || "-"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações Financeiras</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span>Valor de Compra</span>
                </div>
                <p className="font-medium">
                  {asset.purchase_value
                    ? `R$ ${Number.parseFloat(asset.purchase_value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                    : "-"}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Garantia</span>
                </div>
                <p>{asset.warranty_months ? `${asset.warranty_months} meses` : "-"}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Fornecedor</span>
                </div>
                <p>{asset.supplier || "-"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline" onClick={handleTransferirAtivo}>
                <History className="mr-2 h-4 w-4" />
                Transferir Ativo
              </Button>
              <Button className="w-full" variant="outline" onClick={handleGerarRelatorio}>
                <FileText className="mr-2 h-4 w-4" />
                Gerar Relatório
              </Button>
              <GoogleCalendarQuickAddButton />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Transferência */}
      <Dialog open={showTransferModal} onOpenChange={setShowTransferModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transferir Ativo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <UiSelect value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o funcionário" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp: any) => (
                  <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                ))}
              </SelectContent>
            </UiSelect>
          </div>
          <DialogFooter>
            <Button onClick={handleConfirmTransfer} disabled={transferring}>
              {transferring ? "Transferindo..." : "Transferir"}
            </Button>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Modal de Relatório */}
      <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Relatório de Uso do Ativo</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {asset.history && asset.history.length > 0 ? (
              <div className="space-y-2">
                {asset.history.map((item: any, idx: number) => (
                  <div key={idx} className="border rounded p-2">
                    <div className="font-medium">{item.action}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.user} • {new Date(item.date).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum histórico disponível.</p>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Fechar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
