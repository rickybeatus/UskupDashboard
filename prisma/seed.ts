import { PrismaClient } from '@prisma/client'
import { hashPassword, generateSecurePassword } from '../src/lib/password'

const db = new PrismaClient()

async function seed() {
  console.log('🌱 Seeding database...')

  // Create default user with secure password
  const defaultPassword = 'UskupSBY2025!'
  const hashedPassword = await hashPassword(defaultPassword)
  
  const user = await db.user.upsert({
    where: { email: 'uskup@keuskupan-sby.or.id' },
    update: {},
    create: {
      email: 'uskup@keuskupan-sby.or.id',
      name: 'Mgr. Agustinus Tri Budi Utomo',
      role: 'bishop',
      password: hashedPassword,
      passwordSet: true
    }
  })

  console.log('✅ Default user created:')
  console.log('   Email:', user.email)
  console.log('   Password:', defaultPassword)
  console.log('   🔒 Please change this password after first login!')

  // Seed Imam data
  const imamData = [
    {
      nama: 'RD. Antonius Sutrisno',
      paroki: 'Paroki Santo Paulus',
      jabatan: 'Pastor Paroki',
      status: 'Aktif',
      tanggalTahbisan: '2010-06-15',
      nomorTelepon: '0812-3456-7890',
      email: 'antonius.sutrisno@stpaulus.sby',
      alamat: 'Jl. Santo Paulus No. 10, Surabaya'
    },
    {
      nama: 'RD. Michael Wijaya',
      paroki: 'Paroki Santa Maria',
      jabatan: 'Vikaris',
      status: 'Aktif',
      tanggalTahbisan: '2015-12-20',
      nomorTelepon: '0813-2345-6789',
      email: 'michael.wijaya@santa.maria.sby',
      alamat: 'Jl. Santa Maria No. 25, Surabaya'
    },
    {
      nama: 'RD. Franciscus Xaverius',
      paroki: 'Paroki Santo Petrus',
      jabatan: 'Pastor Paroki',
      status: 'Aktif',
      tanggalTahbisan: '2008-03-10',
      nomorTelepon: '0811-3456-7890',
      email: 'franciscus.x@stpetrus.sby',
      alamat: 'Jl. Santo Petrus No. 5, Surabaya'
    },
    {
      nama: 'RD. Yohanes Baptista',
      paroki: 'Paroki Santo Yoseph',
      jabatan: 'Pastor Rekan',
      status: 'Cuti',
      tanggalTahbisan: '2012-09-05',
      nomorTelepon: '0814-5678-9012',
      email: 'yohanes.b@stjoseph.sby',
      alamat: 'Jl. Santo Yoseph No. 15, Surabaya'
    }
  ]

  for (const imam of imamData) {
    // Use create with try-catch to handle duplicates
    try {
      await db.imam.create({
        data: imam
      })
    } catch (error) {
      // Skip if imam already exists
      console.log(`Skipping existing imam: ${imam.nama}`)
    }
  }

  // Seed Agenda data
  const agendaData = [
    {
      judul: 'Rapat Kuria Bulanan',
      tanggal: '2025-01-15',
      waktu: '09:00',
      lokasi: 'Ruang Rapat Uskup',
      jenis: 'Kuria',
      peserta: '12 orang',
      deskripsi: 'Pembahasan program kerja bulanan dan evaluasi kegiatan',
      status: 'Dijadwalkan',
      createdBy: user.id
    },
    {
      judul: 'Audiensi dengan Pastor Paroki',
      tanggal: '2025-01-15',
      waktu: '13:00',
      lokasi: 'Ruang Tamu Uskup',
      jenis: 'Pastoral',
      peserta: '8 orang',
      deskripsi: 'Diskusi mengenai persiapan Natal',
      status: 'Dijadwalkan',
      createdBy: user.id
    }
  ]

  for (const agenda of agendaData) {
    await db.agenda.create({
      data: agenda
    })
  }

  // Seed Tasks data
  const tasksData = [
    {
      judul: 'Review proposal gereja baru',
      deskripsi: 'Review dan memberikan persetujuan proposal pembangunan gereja baru di wilayah Surabaya Timur',
      prioritas: 'Tinggi',
      status: 'Dalam Proses',
      progress: 80,
      deadline: '2025-01-20',
      kategori: 'Pembangunan',
      penanggungJawab: 'Mgr. Agustinus Tri Budi Utomo',
      createdBy: user.id
    },
    {
      judul: 'Pastoral visitasi Paroki X',
      deskripsi: 'Melakukan kunjungan pastoral ke Paroki Santo Petrus untuk evaluasi kegiatan pastoral',
      prioritas: 'Tinggi',
      status: 'Dalam Proses',
      progress: 45,
      deadline: '2025-01-25',
      kategori: 'Pastoral',
      penanggungJawab: 'Mgr. Agustinus Tri Budi Utomo',
      createdBy: user.id
    },
    {
      judul: 'Surat edaran Adven',
      deskripsi: 'Menyusun dan menandatangani surat edaran persiapan Adven 2025',
      prioritas: 'Sedang',
      status: 'Dalam Proses',
      progress: 90,
      deadline: '2025-01-18',
      kategori: 'Komunikasi',
      penanggungJawab: 'Mgr. Agustinus Tri Budi Utomo',
      createdBy: user.id
    }
  ]

  for (const task of tasksData) {
    await db.task.create({
      data: task
    })
  }

  // Seed Notulensi data
  const notulensiData = [
    {
      judul: 'Rapat Kuria Bulanan Januari 2025',
      tanggal: '2025-01-10',
      jenis: 'Kuria',
      peserta: '12 orang',
      status: 'Disetujui',
      isi: 'Diskusi tentang program kerja bulan Januari...',
      kesimpulan: 'Disetujui untuk dilaksanakan sesuai rencana',
      createdBy: user.id
    },
    {
      judul: 'Pertemuan Komisi Pendidikan',
      tanggal: '2025-01-08',
      jenis: 'Komisi',
      peserta: '8 orang',
      status: 'Draft',
      isi: 'Pembahasan kurikulum pendidikan agama...',
      createdBy: user.id
    }
  ]

  for (const notulensi of notulensiData) {
    await db.notulensi.create({
      data: notulensi
    })
  }

  // Seed Decisions data
  const decisionsData = [
    {
      judul: 'Pembangunan Gereja Baru',
      deskripsi: 'Pembangunan gereja baru di wilayah Surabaya Timur untuk melayani umat yang semakin meningkat',
      status: 'Dalam Proses',
      progress: 65,
      targetDate: '2025-06-01',
      kategori: 'Pembangunan',
      penanggungJawab: 'Komisi Pembangunan',
      createdBy: user.id
    },
    {
      judul: 'Program Digital Pastoral',
      deskripsi: 'Implementasi teknologi digital untuk mendukung kegiatan pastoral dan administrasi',
      status: 'Dalam Proses',
      progress: 80,
      targetDate: '2025-03-01',
      kategori: 'Pastoral',
      penanggungJawab: 'Komisi Pastoral',
      createdBy: user.id
    }
  ]

  for (const decision of decisionsData) {
    await db.decision.create({
      data: decision
    })
  }

  console.log('✅ Database seeded successfully!')
}

seed()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
