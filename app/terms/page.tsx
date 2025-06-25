"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Eye, Download, FileText, Calendar } from "lucide-react"
import Link from "next/link"
import { SidebarTrigger } from "@/components/ui/sidebar"

const mockTerms = [
  {
    id: "1",
    employee: "João Silva",
    type: "Termo de Responsabilidade",
    assets: ["Dell Latitude 5520", "Monitor Samsung 24'"],
    createdDate: "2024-01-15",
    status: "Ativo",
    deliveryDate: "2024-01-15",
    returnDate: null,
  },
  {
    id: "2",
    employee: "Maria Santos",
    type: "Termo de Requisição",
    assets: ["iPhone 13", "Carregador"],
    createdDate: "2024-01-10",
    status: "Devolvido",
    deliveryDate: "2024-01-10",
    returnDate: "2024-01-20",
  },
  {
    id: "3",
    employee: "Pedro Costa",
    type: "Termo de Responsabilidade",
    assets: ["MacBook Pro"],
    createdDate: "2024-01-08",
    status: "Ativo",
    deliveryDate: "2024-01-08",
    returnDate: null,
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "Ativo":
      return "bg-green-100 text-green-800"
    case "Devolvido":
      return "bg-blue-100 text-blue-800"
    case "Vencido":
      return "bg-red-100 text-red-800"
    case "Pendente":
      return "bg-orange-100 text-orange-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function TermsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  const filteredTerms = mockTerms.filter((term) => {
    const matchesSearch =
      term.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      term.assets.some((asset) => asset.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = filterType === "all" || term.type.includes(filterType)
    const matchesStatus = filterStatus === "all" || term.status === filterStatus

    return matchesSearch && matchesType && matchesStatus
  })

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
          <h2 className="text-3xl font-bold tracking-tight">Gestão de Termos</h2>
        </div>
        <Button asChild>
          <Link href="/employees">
            <Plus className="mr-2 h-4 w-4" />
            Novo Termo
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Termos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockTerms.length}</div>
            <p className="text-xs text-muted-foreground">Documentos gerados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Termos Ativos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockTerms.filter((t) => t.status === "Ativo").length}</div>
            <p className="text-xs text-muted-foreground">Em vigência</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Responsabilidade</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockTerms.filter((t) => t.type.includes("Responsabilidade")).length}
            </div>
            <p className="text-xs text-muted-foreground">Termos de responsabilidade</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requisições</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockTerms.filter((t) => t.type.includes("Requisição")).length}</div>
            <p className="text-xs text-muted-foreground">Termos de requisição</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtre os termos por tipo, status ou pesquise por funcionário</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar por funcionário ou ativo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tipo de termo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="Responsabilidade">Responsabilidade</SelectItem>
                <SelectItem value="Requisição">Requisição</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Devolvido">Devolvido</SelectItem>
                <SelectItem value="Vencido">Vencido</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Termos</CardTitle>
          <CardDescription>{filteredTerms.length} termo(s) encontrado(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Funcionário</TableHead>
                <TableHead>Tipo de Termo</TableHead>
                <TableHead>Ativos</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead>Data de Entrega</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTerms.map((term) => (
                <TableRow key={term.id}>
                  <TableCell className="font-medium">{term.employee}</TableCell>
                  <TableCell>{term.type}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {term.assets.map((asset, index) => (
                        <div key={index} className="text-sm">
                          {asset}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(term.createdDate).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>{new Date(term.deliveryDate).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getStatusColor(term.status)}>
                      {term.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
