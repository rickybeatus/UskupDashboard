"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Users, 
  ExternalLink, 
  Search, 
  Church, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  UserCheck,
  BookOpen,
  Heart
} from "lucide-react"

interface Imam {
  id: string
  nama: string
  paroki: string
  jabatan: string
  status: string
  tanggalTahbisan: string
  nomorTelepon: string
  email: string
  alamat: string
}

const sampleImam: Imam[] = [
  {
    id: "1",
    nama: "RD. Antonius Sutrisno",
    paroki: "Paroki Santo Paulus",
    jabatan: "Pastor Paroki",
    status: "Aktif",
    tanggalTahbisan: "2010-06-15",
    nomorTelepon: "0812-3456-7890",
    email: "antonius.sutrisno@stpaulus.sby",
    alamat: "Jl. Santo Paulus No. 10, Surabaya"
  },
  {
    id: "2",
    nama: "RD. Michael Wijaya",
    paroki: "Paroki Santa Maria",
    jabatan: "Vikaris",
    status: "Aktif",
    tanggalTahbisan: "2015-12-20",
    nomorTelepon: "0813-2345-6789",
    email: "michael.wijaya@santa.maria.sby",
    alamat: "Jl. Santa Maria No. 25, Surabaya"
  },
  {
    id: "3",
    nama: "RD. Franciscus Xaverius",
    paroki: "Paroki Santo Petrus",
    jabatan: "Pastor Paroki",
    status: "Aktif",
    tanggalTahbisan: "2008-03-10",
    nomorTelepon: "0811-3456-7890",
    email: "franciscus.x@stpetrus.sby",
    alamat: "Jl. Santo Petrus No. 5, Surabaya"
  },
  {
    id: "4",
    nama: "RD. Yohanes Baptista",
    paroki: "Paroki Santo Yoseph",
    jabatan: "Pastor Rekan",
    status: "Cuti",
    tanggalTahbisan: "2012-09-05",
    nomorTelepon: "0814-5678-9012",
    email: "yohanes.b@stjoseph.sby",
    alamat: "Jl. Santo Yoseph No. 15, Surabaya"
  }
]

export default function DatabaseImamPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("semua")

  const filteredImam = sampleImam.filter(item => {
    const matchesSearch = item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.paroki.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.jabatan.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "semua" || item.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Aktif":
        return <Badge className="bg-green-100 text-green-800">Aktif</Badge>
      case "Cuti":
        return <Badge className="bg-yellow-100 text-yellow-800">Cuti</Badge>
      case "Pensiun":
        return <Badge className="bg-gray-100 text-gray-800">Pensiun</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const stats = {
    total: sampleImam.length,
    aktif: sampleImam.filter(i => i.status === "Aktif").length,
    cuti: sampleImam.filter(i => i.status === "Cuti").length,
    pensiun: sampleImam.filter(i => i.status === "Pensiun").length
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Database Imam</h1>
            <p className="text-muted-foreground">
              Akses database para imam Keuskupan Surabaya
            </p>
          </div>
          <Button 
            onClick={() => window.open("https://pororomo.komunio.org/admin/login", "_blank")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Buka Database Pororomo
          </Button>
        </div>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900">Database Pororomo</h3>
                <p className="text-blue-700 mt-1">
                  Database lengkap para imam Keuskupan Surabaya tersedia dalam sistem Pororomo. 
                  Klik tombol di atas untuk mengakses database resmi dengan data yang lebih lengkap dan terupdate.
                </p>
                <div className="mt-4 flex items-center gap-4 text-sm text-blue-600">
                  <div className="flex items-center gap-1">
                    <ExternalLink className="h-4 w-4" />
                    <span>https://pororomo.komunio.org/admin/login</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Imam</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktif</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.aktif}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cuti</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.cuti}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pensiun</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.pensiun}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Pencarian dan Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama imam, paroki, atau jabatan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="semua">Semua Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Cuti">Cuti</option>
                <option value="Pensiun">Pensiun</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Imam Table */}
        <Card>
          <CardHeader>
            <CardTitle>Data Imam (Preview)</CardTitle>
            <CardDescription>
              Data preview. Untuk data lengkap, akses database Pororomo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Paroki</TableHead>
                  <TableHead>Jabatan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal Tahbisan</TableHead>
                  <TableHead>Kontak</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredImam.map((imam) => (
                  <TableRow key={imam.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {imam.nama}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Church className="h-4 w-4 text-muted-foreground" />
                        {imam.paroki}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{imam.jabatan}</Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(imam.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(imam.tanggalTahbisan).toLocaleDateString('id-ID')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {imam.nomorTelepon}
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          {imam.email}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Quick Access */}
        <Card>
          <CardHeader>
            <CardTitle>Akses Cepat</CardTitle>
            <CardDescription>
              Link penting terkait database imam
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-center space-x-4 rounded-md border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                   onClick={() => window.open("https://pororomo.komunio.org/admin/login", "_blank")}>
                <Users className="h-8 w-8 text-blue-600" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Database Pororomo
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Akses database resli imam
                  </p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex items-center space-x-4 rounded-md border p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                <Heart className="h-8 w-8 text-red-600" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Data Vokasi
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Informasi calon imam
                  </p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex items-center space-x-4 rounded-md border p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                <BookOpen className="h-8 w-8 text-green-600" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Formasi
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Program formasi imam
                  </p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}