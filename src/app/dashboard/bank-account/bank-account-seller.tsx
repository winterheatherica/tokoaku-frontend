'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import './page.css'

interface BankAccount {
  id: string
  account_number: string
  account_name: string
  is_active: boolean
  bank: {
    id: number
    name: string
    code: string
  }
}

export default function BankAccountSeller() {
  const { user, loading } = useAuth()
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [editMode, setEditMode] = useState(false)
  const [selectedActiveId, setSelectedActiveId] = useState<string | null>(null)

  const fetchAccounts = async () => {
    if (!user) return
    try {
      const token = await user.getIdToken()
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/seller/bank-account/all`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Gagal mengambil akun bank')

      setAccounts(data.accounts)
      const activeAcc = data.accounts.find((a: BankAccount) => a.is_active)
      setSelectedActiveId(activeAcc?.id || null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    fetchAccounts()
  }, [user])

  const handleSetActive = async () => {
    if (!user || !selectedActiveId) return
    try {
      const token = await user.getIdToken()
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/seller/bank-account/set-active/${selectedActiveId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Gagal mengatur akun utama')
      }

      setEditMode(false)
      fetchAccounts()
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <div className="bankAccountWrapper">
      <h2>Akun Bank Saya</h2>

      <div className="bankAccountHeaderAction">
        <Link href="/dashboard/bank-account/new">
          <button className="Button">Tambah Akun Bank Baru</button>
        </Link>
        {accounts.length > 0 && (
          <button className="Button" onClick={() => setEditMode(!editMode)}>
            {editMode ? 'Batal' : 'Edit Akun Utama'}
          </button>
        )}
      </div>

      {loading || fetching ? <p>Memuat data akun...</p> : null}
      {error && <p className="errorText">{error}</p>}

      {accounts.length > 0 ? (
        <form onSubmit={(e) => {
          e.preventDefault()
          handleSetActive()
        }}>
          <ul className="bankAccountList">
            {accounts.map((acc) => (
              <li
                key={acc.id}
                className={`bankAccountItem ${acc.is_active ? 'active' : ''}`}
              >
                <strong>{acc.account_name}</strong><br />
                <span>{acc.account_number}</span><br />
                <span>Bank: {acc.bank.name} ({acc.bank.code})</span><br />
                {editMode ? (
                  <label className="radioSet">
                    <input
                      type="radio"
                      name="activeBankAccount"
                      value={acc.id}
                      checked={selectedActiveId === acc.id}
                      onChange={() => setSelectedActiveId(acc.id)}
                    />
                    Jadikan akun utama
                  </label>
                ) : (
                  acc.is_active && <span className="activeLabel">Akun Utama</span>
                )}
              </li>
            ))}
          </ul>

          {editMode && (
            <button type="submit" className="Button submitBtn">
              Simpan Perubahan
            </button>
          )}
        </form>
      ) : (!fetching && !error) && (
        <p>Belum ada akun bank tersimpan.</p>
      )}
    </div>
  )
}
