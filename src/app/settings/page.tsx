"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Mail, 
  Lock,
  Smartphone,
  Monitor,
  Volume2,
  Eye,
  Download
} from "lucide-react"

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    taskReminders: true,
    meetingReminders: true,
    deadlineAlerts: true,
    systemUpdates: false
  })

  const [preferences, setPreferences] = useState({
    language: "id",
    timezone: "Asia/Jakarta",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24",
    defaultView: "dashboard",
    autoSave: true,
    compactMode: false
  })

  const [security, setSecurity] = useState({
    twoFactor: false,
    sessionTimeout: "30",
    loginAlerts: true,
    passwordExpiry: "90"
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pengaturan</h1>
          <p className="text-muted-foreground">
            Kelola preferensi dan pengaturan akun Anda
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="notifications">Notifikasi</TabsTrigger>
            <TabsTrigger value="preferences">Preferensi</TabsTrigger>
            <TabsTrigger value="security">Keamanan</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Profil</CardTitle>
                <CardDescription>
                  Perbarui informasi profil Anda
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nama">Nama Lengkap</Label>
                    <Input id="nama" defaultValue="Mgr. Yohanes Harun Yuwono" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gelar">Gelar</Label>
                    <Input id="gelar" defaultValue="Uskup Surabaya" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="uskup@keuskupansurabaya.org" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telepon">Telepon</Label>
                    <Input id="telepon" defaultValue="+62 31 531 1234" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alamat">Alamat</Label>
                  <Input id="alamat" defaultValue="Jl. Johar No. 33, Surabaya 60241" />
                </div>
                <div className="flex justify-end">
                  <Button>Simpan Perubahan</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ubah Password</CardTitle>
                <CardDescription>
                  Perbarui password akun Anda
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Password Saat Ini</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Password Baru</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Konfirmasi Password Baru</Label>
                  <Input id="confirm-password" type="password" />
                </div>
                <div className="flex justify-end">
                  <Button>Ubah Password</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pengaturan Notifikasi</CardTitle>
                <CardDescription>
                  Kelola bagaimana Anda menerima notifikasi
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Notifikasi Email</Label>
                      <p className="text-sm text-muted-foreground">
                        Terima notifikasi penting melalui email
                      </p>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) => 
                        setNotifications({...notifications, email: checked})
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Notifikasi Push</Label>
                      <p className="text-sm text-muted-foreground">
                        Terima notifikasi real-time di browser
                      </p>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(checked) => 
                        setNotifications({...notifications, push: checked})
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Notifikasi SMS</Label>
                      <p className="text-sm text-muted-foreground">
                        Terima notifikasi penting melalui SMS
                      </p>
                    </div>
                    <Switch
                      checked={notifications.sms}
                      onCheckedChange={(checked) => 
                        setNotifications({...notifications, sms: checked})
                      }
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="text-lg font-semibold mb-4">Jenis Notifikasi</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Reminder Tugas</Label>
                        <p className="text-sm text-muted-foreground">
                          Notifikasi untuk tugas yang akan datang
                        </p>
                      </div>
                      <Switch
                        checked={notifications.taskReminders}
                        onCheckedChange={(checked) => 
                          setNotifications({...notifications, taskReminders: checked})
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Reminder Pertemuan</Label>
                        <p className="text-sm text-muted-foreground">
                          Notifikasi untuk agenda pertemuan
                        </p>
                      </div>
                      <Switch
                        checked={notifications.meetingReminders}
                        onCheckedChange={(checked) => 
                          setNotifications({...notifications, meetingReminders: checked})
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Alert Deadline</Label>
                        <p className="text-sm text-muted-foreground">
                          Notifikasi untuk deadline yang akan tiba
                        </p>
                      </div>
                      <Switch
                        checked={notifications.deadlineAlerts}
                        onCheckedChange={(checked) => 
                          setNotifications({...notifications, deadlineAlerts: checked})
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Update Sistem</Label>
                        <p className="text-sm text-muted-foreground">
                          Notifikasi untuk pembaruan sistem
                        </p>
                      </div>
                      <Switch
                        checked={notifications.systemUpdates}
                        onCheckedChange={(checked) => 
                          setNotifications({...notifications, systemUpdates: checked})
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>Simpan Pengaturan</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Preferensi Umum</CardTitle>
                <CardDescription>
                  Sesuaikan pengalaman pengguna Anda
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Bahasa</Label>
                    <Select value={preferences.language} onValueChange={(value) => 
                      setPreferences({...preferences, language: value})
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="id">Bahasa Indonesia</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Zona Waktu</Label>
                    <Select value={preferences.timezone} onValueChange={(value) => 
                      setPreferences({...preferences, timezone: value})
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Jakarta">WIB (GMT+7)</SelectItem>
                        <SelectItem value="Asia/Makassar">WITA (GMT+8)</SelectItem>
                        <SelectItem value="Asia/Jayapura">WIT (GMT+9)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date-format">Format Tanggal</Label>
                    <Select value={preferences.dateFormat} onValueChange={(value) => 
                      setPreferences({...preferences, dateFormat: value})
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time-format">Format Waktu</Label>
                    <Select value={preferences.timeFormat} onValueChange={(value) => 
                      setPreferences({...preferences, timeFormat: value})
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24">24 Jam</SelectItem>
                        <SelectItem value="12">12 Jam (AM/PM)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="default-view">Tampilan Default</Label>
                  <Select value={preferences.defaultView} onValueChange={(value) => 
                    setPreferences({...preferences, defaultView: value})
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dashboard">Dashboard</SelectItem>
                      <SelectItem value="agenda">Agenda</SelectItem>
                      <SelectItem value="tasks">Tugas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto Save</Label>
                      <p className="text-sm text-muted-foreground">
                        Simpan perubahan secara otomatis
                      </p>
                    </div>
                    <Switch
                      checked={preferences.autoSave}
                      onCheckedChange={(checked) => 
                        setPreferences({...preferences, autoSave: checked})
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Mode Compact</Label>
                      <p className="text-sm text-muted-foreground">
                        Tampilkan tampilan yang lebih ringkas
                      </p>
                    </div>
                    <Switch
                      checked={preferences.compactMode}
                      onCheckedChange={(checked) => 
                        setPreferences({...preferences, compactMode: checked})
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>Simpan Preferensi</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Keamanan Akun</CardTitle>
                <CardDescription>
                  Kelola pengaturan keamanan akun Anda
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Tambahkan lapisan keamanan ekstra
                      </p>
                    </div>
                    <Switch
                      checked={security.twoFactor}
                      onCheckedChange={(checked) => 
                        setSecurity({...security, twoFactor: checked})
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Login Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Terima notifikasi saat ada login baru
                      </p>
                    </div>
                    <Switch
                      checked={security.loginAlerts}
                      onCheckedChange={(checked) => 
                        setSecurity({...security, loginAlerts: checked})
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">Session Timeout (menit)</Label>
                    <Select value={security.sessionTimeout} onValueChange={(value) => 
                      setSecurity({...security, sessionTimeout: value})
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 menit</SelectItem>
                        <SelectItem value="30">30 menit</SelectItem>
                        <SelectItem value="60">1 jam</SelectItem>
                        <SelectItem value="120">2 jam</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-expiry">Password Expiry (hari)</Label>
                    <Select value={security.passwordExpiry} onValueChange={(value) => 
                      setSecurity({...security, passwordExpiry: value})
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 hari</SelectItem>
                        <SelectItem value="60">60 hari</SelectItem>
                        <SelectItem value="90">90 hari</SelectItem>
                        <SelectItem value="180">180 hari</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="text-lg font-semibold mb-4">Aktivitas Login Terakhir</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Monitor className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Chrome - Windows</p>
                          <p className="text-sm text-muted-foreground">192.168.1.100 • Surabaya</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">Hari ini, 09:15</p>
                        <Badge variant="outline">Aktif</Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Safari - iPhone</p>
                          <p className="text-sm text-muted-foreground">192.168.1.101 • Surabaya</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">Kemarin, 14:30</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>Simpan Pengaturan Keamanan</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}