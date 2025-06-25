"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Computer, Laptop, Monitor, Smartphone, Search, Plus, Eye, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

const getAssetIcon = (type: string) => {
  switch (type) {
    case "notebook":
      return Laptop
    case "desktop":
      return Computer
    case "monitor":
      return Monitor
    case "mobile":
      return Smartphone
    default:
      return Computer
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

export default function AssetsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [assets, setAssets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingAssetId, setDeletingAssetId] = useState<string | null>(null) // Estado para controlar qual ativo está sendo excluído

  useEffect(() => {
    const fetchAssets = async () => {
      setLoading(true)
      const { data, error } = await supabase.from("assets").select(
        `
        *,
        assigned_to (
          id,
          name
        )
      `,
      )
      if (error) {
        console.error("Erro ao buscar ativos:", error.message || error)
        toast.error("Erro ao carregar ativos.")
      } else {
        setAssets(data || [])
      }
      setLoading(false)
    }
    fetchAssets()
  }, [])

  const handleDeleteAsset = async (assetId: string) => {
    setDeletingAssetId(assetId) // Define o ativo que está sendo excluído
    try {
      const { error } = await supabase.from("assets").delete().eq("id", assetId)

      if (error) {
        throw error
      }

      setAssets((prevAssets) => prevAssets.filter((asset) => asset.id !== assetId))
      toast.success("Ativo excluído com sucesso!")
    } catch (error: any) {
      toast.error(`Erro ao excluir ativo: ${error.message || error}`)
      console.error("Erro ao excluir ativo:", error)
    } finally {
      setDeletingAssetId(null) // Limpa o estado de exclusão
    }
  }

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.assigned_to?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || asset.type === filterType
    const matchesStatus = filterStatus === "all" || asset.status === filterStatus

    return matchesSearch && matchesType && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
          <h2 className="text-3xl font-bold tracking-tight">Gestão de Ativos</h2>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-48">
            <p>Carregando ativos...</p>
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
          <h2 className="text-3xl font-bold tracking-tight">Gestão de Ativos</h2>
        </div>
        <Button asChild>
          <Link href="/assets/new">
            <Plus className="mr-2 h-4 w-4" />
            Cadastrar Ativo
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtre os ativos por tipo, status ou pesquise por nome</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar por nome, serial ou responsável..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo de ativo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="notebook">Notebooks</SelectItem>
                <SelectItem value="desktop">Desktops</SelectItem>
                <SelectItem value="monitor">Monitores</SelectItem>
                <SelectItem value="mobile">Celulares</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="Disponível">Disponível</SelectItem>
                <SelectItem value="Em uso">Em uso</SelectItem>
                <SelectItem value="Em manutenção">Em manutenção</SelectItem>
                <SelectItem value="Inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Ativos</CardTitle>
          <CardDescription>{filteredAssets.length} ativo(s) encontrado(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ativo</TableHead>
                <TableHead>Número Serial</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Data de Compra</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssets.map((asset) => {
                const IconComponent = getAssetIcon(asset.type)
                return (
                  <TableRow key={asset.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <IconComponent className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{asset.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{asset.serial_number}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getStatusColor(asset.status)}>
                        {asset.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{asset.assigned_to?.name || "-"}</TableCell>
                    <TableCell>{asset.location}</TableCell>
                    <TableCell>
                      {asset.purchase_date ? new Date(asset.purchase_date).toLocaleDateString("pt-BR") : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/assets/${asset.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/assets/${asset.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" disabled={deletingAssetId === asset.id}>
                              <Trash2 className="h-4 w-4" />
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
                              <AlertDialogAction onClick={() => handleDeleteAsset(asset.id)}>Excluir</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
