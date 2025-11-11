"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useApiData, useCrud } from "@/hooks/useApi"
import { useCurrentUser } from "@/hooks/useAuth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Download, Eye, Edit, Trash2, FileText, Calendar, Users } from "lucide-react"
import { showSuccess, showError, confirmDelete, confirmAction } from "@/lib/alerts"

interface Notulensi {
  id: string
  judul: string
  tanggal: string
  jenis: string
  peserta: string
  status: string
  createdAt: string
  isi?: string
  kesimpulan?: string
}


export default function NotulensiPage() {
  const { data: notulensiList = [], loading, error, refetch } = useApiData<Notulensi>('/api/notulensi')
  const { create } = useCrud<Notulensi>('/api/notulensi')
  const { user, isAuthenticated, isLoading: authLoading } = useCurrentUser()
    const [searchTerm, setSearchTerm] = useState("")
  const [filterJenis, setFilterJenis] = useState("semua")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedNotulensi, setSelectedNotulensi] = useState<Notulensi | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])
  const [formData, setFormData] = useState({
    judul: "",
    tanggal: "",
    jenis: "",
    peserta: "",
    isi: "",
    kesimpulan: ""
  })

  const filteredNotulensi = notulensiList.filter(item => {
    const matchesSearch = item.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.jenis.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterJenis === "semua" || item.jenis === filterJenis
    return matchesSearch && matchesFilter
  })

  const handleCreate = async () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      showError("Anda harus login untuk membuat notulensi")
      return
    }

    if (!formData.judul || !formData.tanggal || !formData.jenis || !formData.peserta) {
      showError("Mohon lengkapi semua field yang wajib diisi")
      return
    }

    try {
      const result = await create({
        judul: formData.judul,
        tanggal: formData.tanggal,
        jenis: formData.jenis,
        peserta: formData.peserta,
        isi: formData.isi,
        kesimpulan: formData.kesimpulan
      })

      if (result.success) {
        showSuccess("Notulensi berhasil dibuat")
        setIsCreateDialogOpen(false)
        resetForm()
        refetch() // Refresh the data from API
      } else {
        showError(result.error || "Gagal membuat notulensi")
      }
    } catch (error) {
      showError("Terjadi kesalahan saat membuat notulensi")
    }
  }

  const handleEdit = (notulensi: Notulensi) => {
    setSelectedNotulensi(notulensi)
    setFormData({
      judul: notulensi.judul,
      tanggal: notulensi.tanggal,
      jenis: notulensi.jenis,
      peserta: notulensi.peserta,
      isi: notulensi.isi || "",
      kesimpulan: notulensi.kesimpulan || ""
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdate = async () => {
    if (!selectedNotulensi || !formData.judul || !formData.tanggal || !formData.jenis || !formData.peserta) {
      showError("Mohon lengkapi semua field yang wajib diisi")
      return
    }

    try {
      const response = await fetch(`/api/notulensi/${selectedNotulensi.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          judul: formData.judul,
          tanggal: formData.tanggal,
          jenis: formData.jenis,
          peserta: formData.peserta,
          isi: formData.isi,
          kesimpulan: formData.kesimpulan
        }),
      })

      const result = await response.json()

      if (result.success) {
        showSuccess("Notulensi berhasil diperbarui")
        setIsEditDialogOpen(false)
        setSelectedNotulensi(null)
        resetForm()
        refetch()
      } else {
        showError(result.error || "Gagal memperbarui notulensi")
      }
    } catch (error) {
      console.error('Error updating notulensi:', error)
      showError("Terjadi kesalahan saat memperbarui notulensi")
    }
  }

  const handleDelete = async (id: string, judul: string) => {
    const confirmed = await confirmDelete(`notulensi "${judul}"`)
    if (confirmed) {
      try {
        const response = await fetch(`/api/notulensi/${id}`, {
          method: 'DELETE',
          credentials: 'include', // Include cookies for authentication
        })

        const result = await response.json()

        if (result.success) {
          showSuccess("Notulensi berhasil dihapus")
          refetch()
        } else {
          showError(result.error || "Gagal menghapus notulensi")
        }
      } catch (error) {
        console.error('Error deleting notulensi:', error)
        showError("Terjadi kesalahan saat menghapus notulensi")
      }
    }
  }

  const handleApprove = async (id: string) => {
    const confirmed = await confirmAction("Apakah Anda yakin ingin menyetujui notulensi ini?")
    if (confirmed) {
      try {
        const response = await fetch(`/api/notulensi/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies for authentication
          body: JSON.stringify({
            status: "Disetujui"
          }),
        })

        const result = await response.json()

        if (result.success) {
          showSuccess("Notulensi berhasil disetujui")
          refetch()
        } else {
          showError(result.error || "Gagal menyetujui notulensi")
        }
      } catch (error) {
        console.error('Error approving notulensi:', error)
        showError("Terjadi kesalahan saat menyetujui notulensi")
      }
    }
  }

  const resetForm = () => {
    setFormData({
      judul: "",
      tanggal: "",
      jenis: "",
      peserta: "",
      isi: "",
      kesimpulan: ""
    })
  }

  const handleExport = (format: 'pdf' | 'word' | 'excel') => {
    showSuccess(`Notulensi berhasil diexport ke format ${format.toUpperCase()}`)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Disetujui":
        return <Badge className="bg-green-100 text-green-800">Disetujui</Badge>
      case "Draft":
        return <Badge variant="secondary">Draft</Badge>
      case "Menunggu":
        return <Badge variant="outline">Menunggu</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* User Info Display - Only render after mount to prevent hydration errors */}
        {mounted && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-blue-900">Informasi Pengguna</h3>
                    <p className="text-sm text-blue-700">
                      {authLoading ? 'Memuat...' : isAuthenticated
                        ? `User ID: ${user?.id || 'Tidak tersedia'} | ${user?.name || 'Nama tidak tersedia'}`
                        : 'Belum login - Silakan login untuk mengakses fitur notulensi'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isAuthenticated ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className={`text-sm font-medium ${isAuthenticated ? 'text-green-700' : 'text-red-700'}`}>
                    {authLoading ? 'Memuat...' : isAuthenticated ? 'Terautentikasi' : 'Tidak Terautentikasi'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notulensi Pertemuan</h1>
            <p className="text-muted-foreground">
              Kelola notulensi pertemuan kuria dan pertemuan lainnya
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Notulensi Baru
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Buat Notulensi Baru</DialogTitle>
                <DialogDescription>
                  Tambahkan notulensi pertemuan baru
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="judul">Judul Pertemuan *</Label>
                  <Input 
                    id="judul" 
                    placeholder="Masukkan judul pertemuan"
                    value={formData.judul}
                    onChange={(e) => setFormData({...formData, judul: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="tanggal">Tanggal *</Label>
                    <Input 
                      id="tanggal" 
                      type="date"
                      value={formData.tanggal}
                      onChange={(e) => setFormData({...formData, tanggal: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="jenis">Jenis Pertemuan *</Label>
                    <Select value={formData.jenis} onValueChange={(value) => setFormData({...formData, jenis: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jenis" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Kuria">Kuria</SelectItem>
                        <SelectItem value="Pastoral">Pastoral</SelectItem>
                        <SelectItem value="Komisi">Komisi</SelectItem>
                        <SelectItem value="Lainnya">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="peserta">Peserta *</Label>
                  <Input 
                    id="peserta" 
                    placeholder="Jumlah peserta atau nama peserta"
                    value={formData.peserta}
                    onChange={(e) => setFormData({...formData, peserta: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="isi">Isi Notulensi</Label>
                  <Textarea 
                    id="isi" 
                    placeholder="Tuliskan isi notulensi pertemuan..."
                    className="min-h-[200px]"
                    value={formData.isi}
                    onChange={(e) => setFormData({...formData, isi: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="kesimpulan">Kesimpulan dan Keputusan</Label>
                  <Textarea 
                    id="kesimpulan" 
                    placeholder="Tuliskan kesimpulan dan keputusan pertemuan..."
                    className="min-h-[100px]"
                    value={formData.kesimpulan}
                    onChange={(e) => setFormData({...formData, kesimpulan: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setIsCreateDialogOpen(false)
                  resetForm()
                }}>
                  Batal
                </Button>
                <Button variant="secondary" onClick={handleCreate}>
                  Simpan Draft
                </Button>
                <Button onClick={handleCreate}>
                  Simpan & Ajukan
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter dan Pencarian</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari notulensi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={filterJenis} onValueChange={setFilterJenis}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Jenis</SelectItem>
                  <SelectItem value="Kuria">Kuria</SelectItem>
                  <SelectItem value="Pastoral">Pastoral</SelectItem>
                  <SelectItem value="Komisi">Komisi</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notulensi Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Notulensi</CardTitle>
            <CardDescription>
              {loading ? "Memuat data..." : `Total ${filteredNotulensi.length} notulensi`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="text-muted-foreground">Memuat data notulensi...</div>
              </div>
            ) : error ? (
              <div className="flex justify-center py-8">
                <div className="text-red-600">Terjadi kesalahan: {error}</div>
              </div>
            ) : filteredNotulensi.length === 0 ? (
              <div className="flex justify-center py-8">
                <div className="text-muted-foreground">Belum ada notulensi</div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Judul Pertemuan</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Peserta</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNotulensi.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {item.judul}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(item.tanggal).toLocaleDateString('id-ID')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.jenis}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {item.peserta}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(item.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedNotulensi(item)
                              setIsViewDialogOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleExport('pdf')}>
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item.id, item.judul)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedNotulensi?.judul}</DialogTitle>
              <DialogDescription>
                {selectedNotulensi?.tanggal} • {selectedNotulensi?.jenis} • {selectedNotulensi?.peserta}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Isi Notulensi</h4>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Kesimpulan dan Keputusan</h4>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm leading-relaxed">
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  {getStatusBadge(selectedNotulensi?.status || "")}
                  {selectedNotulensi?.status === "Draft" && (
                    <Button 
                      onClick={() => selectedNotulensi && handleApprove(selectedNotulensi.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Setujui
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleExport('pdf')}>
                    <Download className="mr-2 h-4 w-4" />
                    Export PDF
                  </Button>
                  <Button variant="outline" onClick={() => handleExport('word')}>
                    <Download className="mr-2 h-4 w-4" />
                    Export Word
                  </Button>
                  <Button onClick={() => handleExport('excel')}>
                    <Download className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Notulensi</DialogTitle>
              <DialogDescription>
                Perbarui notulensi pertemuan
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-judul">Judul Pertemuan *</Label>
                <Input 
                  id="edit-judul" 
                  placeholder="Masukkan judul pertemuan"
                  value={formData.judul}
                  onChange={(e) => setFormData({...formData, judul: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-tanggal">Tanggal *</Label>
                  <Input 
                    id="edit-tanggal" 
                    type="date"
                    value={formData.tanggal}
                    onChange={(e) => setFormData({...formData, tanggal: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-jenis">Jenis Pertemuan *</Label>
                  <Select value={formData.jenis} onValueChange={(value) => setFormData({...formData, jenis: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kuria">Kuria</SelectItem>
                      <SelectItem value="Pastoral">Pastoral</SelectItem>
                      <SelectItem value="Komisi">Komisi</SelectItem>
                      <SelectItem value="Lainnya">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-peserta">Peserta *</Label>
                <Input 
                  id="edit-peserta" 
                  placeholder="Jumlah peserta atau nama peserta"
                  value={formData.peserta}
                  onChange={(e) => setFormData({...formData, peserta: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-isi">Isi Notulensi</Label>
                <Textarea 
                  id="edit-isi" 
                  placeholder="Tuliskan isi notulensi pertemuan..."
                  className="min-h-[200px]"
                  value={formData.isi}
                  onChange={(e) => setFormData({...formData, isi: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-kesimpulan">Kesimpulan dan Keputusan</Label>
                <Textarea 
                  id="edit-kesimpulan" 
                  placeholder="Tuliskan kesimpulan dan keputusan pertemuan..."
                  className="min-h-[100px]"
                  value={formData.kesimpulan}
                  onChange={(e) => setFormData({...formData, kesimpulan: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setIsEditDialogOpen(false)
                setSelectedNotulensi(null)
                resetForm()
              }}>
                Batal
              </Button>
              <Button onClick={handleUpdate}>
                Update Notulensi
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}