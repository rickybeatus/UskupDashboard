"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Calendar as CalendarIcon, Clock, MapPin, Users, RefreshCw, ExternalLink, Edit, Trash2, Eye } from "lucide-react"
import { formatDate, DateRanges } from "@/lib/dateUtils"
import { showSuccess, showError, confirmDelete } from "@/lib/alerts"
import { useAgenda, useCrud } from "@/hooks/useApi"

interface Agenda {
  id: string
  judul: string
  tanggal: string
  waktu: string
  lokasi: string
  jenis: string
  peserta: string
  deskripsi: string
  status: string
  googleCalendarId?: string
}

export default function AgendaPage() {
  const { data: agendaList, loading, refetch } = useAgenda()
  const { create, update, remove, loading: crudLoading } = useCrud('/api/agenda')
  
  const [searchTerm, setSearchTerm] = useState("")
  const [filterJenis, setFilterJenis] = useState("semua")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedAgenda, setSelectedAgenda] = useState<Agenda | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [formData, setFormData] = useState({
    judul: "",
    tanggal: "",
    waktu: "",
    lokasi: "",
    jenis: "",
    peserta: "",
    deskripsi: ""
  })

  const filteredAgenda = agendaList.filter(item => {
    const matchesSearch = item.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.lokasi.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterJenis === "semua" || item.jenis === filterJenis
    return matchesSearch && matchesFilter
  })

  const handleSyncGoogleCalendar = async () => {
    setIsSyncing(true)
    // Simulate Google Calendar sync
    setTimeout(() => {
      setIsSyncing(false)
      showSuccess("Google Calendar berhasil disinkronkan")
    }, 2000)
  }

  const handleCreate = async () => {
    if (!formData.judul || !formData.tanggal || !formData.waktu || !formData.lokasi || !formData.jenis || !formData.peserta) {
      showError("Mohon lengkapi semua field yang wajib diisi")
      return
    }

    const result = await create(formData)
    if (result.success) {
      showSuccess("Agenda berhasil ditambahkan")
      setIsCreateDialogOpen(false)
      resetForm()
      refetch()
    }
  }

  const handleEdit = (agenda: Agenda) => {
    setSelectedAgenda(agenda)
    setFormData({
      judul: agenda.judul,
      tanggal: agenda.tanggal,
      waktu: agenda.waktu,
      lokasi: agenda.lokasi,
      jenis: agenda.jenis,
      peserta: agenda.peserta,
      deskripsi: agenda.deskripsi
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdate = async () => {
    if (!selectedAgenda || !formData.judul || !formData.tanggal || !formData.waktu || !formData.lokasi || !formData.jenis || !formData.peserta) {
      showError("Mohon lengkapi semua field yang wajib diisi")
      return
    }

    const result = await update(selectedAgenda.id, formData)
    if (result.success) {
      showSuccess("Agenda berhasil diperbarui")
      setIsEditDialogOpen(false)
      setSelectedAgenda(null)
      resetForm()
      refetch()
    }
  }

  const handleDelete = async (id: string, judul: string) => {
    const confirmed = await confirmDelete(`agenda "${judul}"`)
    if (confirmed) {
      const result = await remove(id)
      if (result.success) {
        showSuccess("Agenda berhasil dihapus")
        refetch()
      }
    }
  }

  const resetForm = () => {
    setFormData({
      judul: "",
      tanggal: "",
      waktu: "",
      lokasi: "",
      jenis: "",
      peserta: "",
      deskripsi: ""
    })
  }

  const getJenisBadge = (jenis: string) => {
    switch (jenis) {
      case "Kuria":
        return <Badge className="bg-blue-100 text-blue-800">Kuria</Badge>
      case "Pastoral":
        return <Badge className="bg-green-100 text-green-800">Pastoral</Badge>
      case "Komisi":
        return <Badge className="bg-purple-100 text-purple-800">Komisi</Badge>
      default:
        return <Badge variant="outline">{jenis}</Badge>
    }
  }

  const getAgendaForDate = (date: Date) => {
    return agendaList.filter(item => {
      const itemDate = new Date(item.tanggal)
      return itemDate.toDateString() === date.toDateString()
    })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Agenda Pertemuan</h1>
            <p className="text-muted-foreground">
              Kelola agenda pertemuan dan sinkronisasi dengan Google Calendar
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleSyncGoogleCalendar}
              disabled={isSyncing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Sinkronisasi...' : 'Sync Google Calendar'}
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Agenda Baru
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Tambah Agenda Baru</DialogTitle>
                  <DialogDescription>
                    Tambahkan agenda pertemuan baru
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="judul">Judul Agenda *</Label>
                    <Input 
                      id="judul" 
                      placeholder="Masukkan judul agenda"
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
                      <Label htmlFor="waktu">Waktu *</Label>
                      <Input 
                        id="waktu" 
                        type="time"
                        value={formData.waktu}
                        onChange={(e) => setFormData({...formData, waktu: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="lokasi">Lokasi *</Label>
                    <Input 
                      id="lokasi" 
                      placeholder="Masukkan lokasi pertemuan"
                      value={formData.lokasi}
                      onChange={(e) => setFormData({...formData, lokasi: e.target.value})}
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
                    <Label htmlFor="deskripsi">Deskripsi</Label>
                    <Textarea 
                      id="deskripsi" 
                      placeholder="Tuliskan deskripsi agenda..."
                      className="min-h-[100px]"
                      value={formData.deskripsi}
                      onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="sync-google" className="rounded" />
                    <Label htmlFor="sync-google">Sinkronkan dengan Google Calendar</Label>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {
                    setIsCreateDialogOpen(false)
                    resetForm()
                  }}>
                    Batal
                  </Button>
                  <Button onClick={handleCreate}>
                    Simpan Agenda
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="list" className="space-y-4">
          <TabsList>
            <TabsTrigger value="list">Daftar Agenda</TabsTrigger>
            <TabsTrigger value="calendar">Kalender</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
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
                      placeholder="Cari agenda..."
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

            {/* Agenda List */}
            <div className="grid gap-4">
              {filteredAgenda.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">{item.judul}</h3>
                          {getJenisBadge(item.jenis)}
                          {item.googleCalendarId && (
                            <Badge variant="outline" className="text-xs">
                              <CalendarIcon className="w-3 h-3 mr-1" />
                              Google Calendar
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" />
                            {new Date(item.tanggal).toLocaleDateString('id-ID')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {item.waktu}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {item.lokasi}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {item.peserta}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {item.deskripsi}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        {item.googleCalendarId && (
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(item.id, item.judul)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Kalender</CardTitle>
                  <CardDescription>
                    Pilih tanggal untuk melihat agenda
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>
                    Agenda {selectedDate?.toLocaleDateString('id-ID')}
                  </CardTitle>
                  <CardDescription>
                    {getAgendaForDate(selectedDate || new Date()).length} agenda
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getAgendaForDate(selectedDate || new Date()).map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 rounded-md border p-3">
                        <div className="flex-shrink-0">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium leading-none">
                            {item.judul}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.waktu} • {item.lokasi}
                          </p>
                        </div>
                        {getJenisBadge(item.jenis)}
                      </div>
                    ))}
                    {getAgendaForDate(selectedDate || new Date()).length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Tidak ada agenda pada tanggal ini
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Agenda</DialogTitle>
              <DialogDescription>
                Perbarui agenda pertemuan
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-judul">Judul Agenda *</Label>
                <Input 
                  id="edit-judul" 
                  placeholder="Masukkan judul agenda"
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
                  <Label htmlFor="edit-waktu">Waktu *</Label>
                  <Input 
                    id="edit-waktu" 
                    type="time"
                    value={formData.waktu}
                    onChange={(e) => setFormData({...formData, waktu: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-lokasi">Lokasi *</Label>
                <Input 
                  id="edit-lokasi" 
                  placeholder="Masukkan lokasi pertemuan"
                  value={formData.lokasi}
                  onChange={(e) => setFormData({...formData, lokasi: e.target.value})}
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
                <Label htmlFor="edit-deskripsi">Deskripsi</Label>
                <Textarea 
                  id="edit-deskripsi" 
                  placeholder="Tuliskan deskripsi agenda..."
                  className="min-h-[100px]"
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setIsEditDialogOpen(false)
                setSelectedAgenda(null)
                resetForm()
              }}>
                Batal
              </Button>
              <Button onClick={handleUpdate}>
                Update Agenda
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}