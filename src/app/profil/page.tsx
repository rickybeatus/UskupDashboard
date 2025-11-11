"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Church,
  BookOpen,
  Heart,
  Users,
  Award,
  Globe
} from "lucide-react"

export default function ProfilPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profil Uskup</h1>
          <p className="text-muted-foreground">
            Informasi lengkap Mgr. Agustinus Tri Budi Utomo
          </p>
        </div>

        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src="/bishop-avatar.jpg" alt="Uskup" />
                <AvatarFallback className="text-2xl">USK</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">Mgr. Agustinus Tri Budi Utomo</h2>
                  <Badge className="bg-green-100 text-green-800">Aktif</Badge>
                </div>
                <p className="text-lg text-muted-foreground">Uskup Keuskupan Surabaya</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Ditahbiskan: 2007</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>Surabaya, Jawa Timur</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">Edit Profil</Button>
                <Button>Unduh CV</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Kontak</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">uskup@keuskupansurabaya.org</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Telepon</p>
                  <p className="text-sm text-muted-foreground">+62 31 531 1234</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Alamat</p>
                  <p className="text-sm text-muted-foreground">Jl. Johar No. 33, Surabaya 60241</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Website</p>
                  <p className="text-sm text-muted-foreground">www.keuskupansurabaya.org</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informasi Keuskupan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Church className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Keuskupan</p>
                  <p className="text-sm text-muted-foreground">Keuskupan Surabaya</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Tanggal Penahbisan Uskup</p>
                  <p className="text-sm text-muted-foreground">10 Juli 2007</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Jumlah Paroki</p>
                  <p className="text-sm text-muted-foreground">42 Paroki</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Heart className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Jumlah Umat</p>
                  <p className="text-sm text-muted-foreground">± 150,000 jiwa</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Education and Experience */}
        <Card>
          <CardHeader>
            <CardTitle>Pendidikan dan Pengalaman</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Pendidikan
                </h4>
                <div className="space-y-3">
                  <div className="border-l-2 border-primary pl-4">
                    <p className="font-medium">S2 Teologi</p>
                    <p className="text-sm text-muted-foreground">Universitas Katolik Indonesia Atma Jaya</p>
                    <p className="text-xs text-muted-foreground">1995 - 1998</p>
                  </div>
                  <div className="border-l-2 border-primary pl-4">
                    <p className="font-medium">S1 Teologi</p>
                    <p className="text-sm text-muted-foreground">STFD Antonius Surabaya</p>
                    <p className="text-xs text-muted-foreground">1990 - 1995</p>
                  </div>
                  <div className="border-l-2 border-primary pl-4">
                    <p className="font-medium">SMA</p>
                    <p className="text-sm text-muted-foreground">SMA Katolik Surabaya</p>
                    <p className="text-xs text-muted-foreground">1987 - 1990</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Pengalaman
                </h4>
                <div className="space-y-3">
                  <div className="border-l-2 border-primary pl-4">
                    <p className="font-medium">Uskup Keuskupan Surabaya</p>
                    <p className="text-sm text-muted-foreground">Keuskupan Surabaya</p>
                    <p className="text-xs text-muted-foreground">2007 - Sekarang</p>
                  </div>
                  <div className="border-l-2 border-primary pl-4">
                    <p className="font-medium">Pastor Paroki Santo Paulus</p>
                    <p className="text-sm text-muted-foreground">Paroki Santo Paulus Surabaya</p>
                    <p className="text-xs text-muted-foreground">2000 - 2007</p>
                  </div>
                  <div className="border-l-2 border-primary pl-4">
                    <p className="font-medium">Vikaris Episkopal</p>
                    <p className="text-sm text-muted-foreground">Keuskupan Surabaya</p>
                    <p className="text-xs text-muted-foreground">1998 - 2000</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Statistik Kegiatan</CardTitle>
            <CardDescription>
              Ringkasan kegiatan uskup dalam 6 bulan terakhir
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">24</div>
                <p className="text-sm text-muted-foreground">Pertemuan Kuria</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">18</div>
                <p className="text-sm text-muted-foreground">Pastoral Visitasi</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">12</div>
                <p className="text-sm text-muted-foreground">Surat Edaran</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">8</div>
                <p className="text-sm text-muted-foreground">Keputusan Penting</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}