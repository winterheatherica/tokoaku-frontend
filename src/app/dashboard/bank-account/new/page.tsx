'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import '../page.css'

interface Bank {
  id: number
  name: string
  full_name: string
  code: string
}

export default function NewBankAccountPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [bankList, setBankList] = useState<Bank[]>([])
  const [form, setForm] = useState({
    bank_id: '',
    account_number: '',
    account_name: '',
    is_active: true
  })

  useEffect(() => {
    const fetchBankList = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/visitor/bank-list`)
        const data = await res.json()

        if (!res.ok) throw new Error(data.message || 'Gagal memuat daftar bank')
        if (Array.isArray(data.data)) {
          setBankList(data.data)
        } else {
          throw new Error('Format data bank tidak valid')
        }
      } catch (err: any) {
        toast.error(err.message || 'Gagal memuat daftar bank')
      }
    }

    fetchBankList()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target
    const { name, value } = target

    if (target instanceof HTMLInputElement && target.type === 'checkbox') {
      setForm(prev => ({
        ...prev,
        [name]: target.checked
      }))
    } else {
      setForm(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error('User belum login')
      return
    }

    try {
      const token = await user.getIdToken()
      const payload = {
        ...form,
        bank_id: parseInt(form.bank_id),
        user_id: user.uid
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/seller/bank-account/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Gagal menambahkan rekening')

      toast.success('Rekening berhasil ditambahkan!')
      router.push('/dashboard/bank-account')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  return (
    <div className="bankAccountWrapper">
        <h2>Tambah Rekening Baru</h2>
        <form onSubmit={handleSubmit}>
        <div>
            <label htmlFor="bank_id">Nama Bank</label>
            <select
            id="bank_id"
            name="bank_id"
            value={form.bank_id}
            onChange={handleChange}
            required
            >
            <option value="">-- Pilih Bank --</option>
            {bankList.map(bank => (
                <option key={bank.id} value={bank.id}>
                {bank.name} - {bank.code}
                </option>
            ))}
            </select>
        </div>

        <div>
            <label htmlFor="account_number">Nomor Rekening</label>
            <input
            type="text"
            id="account_number"
            name="account_number"
            value={form.account_number}
            onChange={handleChange}
            required
            />
        </div>

        <div>
            <label htmlFor="account_name">Nama Pemilik Rekening</label>
            <input
            type="text"
            id="account_name"
            name="account_name"
            value={form.account_name}
            onChange={handleChange}
            required
            />
        </div>

        <div className="account-label">
            <input
            type="checkbox"
            id="is_active"
            name="is_active"
            checked={form.is_active}
            onChange={handleChange}
            />
            <label htmlFor="is_active">Jadikan sebagai rekening utama</label>
        </div>

        <button type="submit" className="Button">
            Simpan Rekening
        </button>
        </form>
    </div>
  )
}
