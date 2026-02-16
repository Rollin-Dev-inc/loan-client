import { useCallback, useEffect, useMemo, useState } from 'react'

import Button from '../components/Button'
import {
  createLoan,
  confirmLoanReturned,
  fetchLoanItems,
  fetchLoanNotifications,
  fetchLoans,
} from '../services/loans'

function formatDate(value) {
  if (!value) {
    return '-'
  }
  return new Date(value).toLocaleDateString('id-ID')
}

function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value ?? 0)
}

function parseDateInput(value) {
  if (!value) {
    return null
  }
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) {
    return null
  }
  return new Date(year, month - 1, day)
}

function getTodayDateString() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

function isOverdue(loan) {
  if (loan.is_returned) {
    return false
  }
  const dueDate = new Date(loan.due_at)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  dueDate.setHours(0, 0, 0, 0)
  return dueDate <= now
}

function getStatusBadgeClass(loan) {
  if (loan.is_returned) {
    return 'bg-emerald-100 text-emerald-700'
  }
  if (isOverdue(loan)) {
    return 'bg-rose-100 text-rose-700'
  }
  return 'bg-amber-100 text-amber-700'
}

function getStatusLabel(loan) {
  if (loan.is_returned) {
    return 'Sudah Kembali'
  }
  if (isOverdue(loan)) {
    return 'Belum Kembali (Terlambat)'
  }
  return 'Belum Kembali'
}

function ListLoanPage({ token }) {
  const [loans, setLoans] = useState([])
  const [items, setItems] = useState([])
  const [notifications, setNotifications] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [loadingLoanId, setLoadingLoanId] = useState(null)
  const [createForm, setCreateForm] = useState({
    borrower_name: '',
    item_id: '',
    duration_days: 1,
    borrowed_at: getTodayDateString(),
    price_to_pay: '',
  })

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage('')
    try {
      const [loanData, notificationData, itemData] = await Promise.all([
        fetchLoans(token),
        fetchLoanNotifications(token),
        fetchLoanItems(token),
      ])
      setLoans(loanData)
      setNotifications(notificationData)
      setItems(itemData)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredLoans = useMemo(() => {
    if (statusFilter === 'all') {
      return loans
    }
    if (statusFilter === 'returned') {
      return loans.filter((loan) => loan.is_returned)
    }
    if (statusFilter === 'overdue') {
      return loans.filter((loan) => isOverdue(loan))
    }
    return loans.filter((loan) => !loan.is_returned)
  }, [loans, statusFilter])

  const unavailableItemIds = useMemo(
    () => new Set(loans.filter((loan) => !loan.is_returned).map((loan) => loan.item_id)),
    [loans]
  )

  const availableItems = useMemo(
    () => items.filter((item) => !unavailableItemIds.has(item.id)),
    [items, unavailableItemIds]
  )

  const createDurationDays = Number(createForm.duration_days)
  const createPriceToPay = Number(createForm.price_to_pay)
  const isCreateFormValid = useMemo(() => {
    const hasBorrower = createForm.borrower_name.trim().length > 0
    const selectedItemId = Number(createForm.item_id)
    const hasItem = selectedItemId > 0
    const isSelectedItemAvailable = availableItems.some((item) => item.id === selectedItemId)
    const hasValidDuration =
      Number.isFinite(createDurationDays) && createDurationDays >= 1
    const hasBorrowedAt = parseDateInput(createForm.borrowed_at) !== null
    const hasValidPrice =
      createForm.price_to_pay !== '' &&
      Number.isFinite(createPriceToPay) &&
      createPriceToPay >= 0

    return (
      hasBorrower &&
      hasItem &&
      isSelectedItemAvailable &&
      hasValidDuration &&
      hasBorrowedAt &&
      hasValidPrice
    )
  }, [
    availableItems,
    createDurationDays,
    createForm.borrowed_at,
    createForm.borrower_name,
    createForm.item_id,
    createForm.price_to_pay,
    createPriceToPay,
  ])

  const returnDatePreview = useMemo(() => {
    const borrowedDate = parseDateInput(createForm.borrowed_at)
    if (!borrowedDate) {
      return '-'
    }
    if (!Number.isFinite(createDurationDays) || createDurationDays < 1) {
      return '-'
    }

    const returnDate = new Date(borrowedDate)
    returnDate.setDate(returnDate.getDate() + createDurationDays)
    return returnDate.toLocaleDateString('id-ID')
  }, [createDurationDays, createForm.borrowed_at])

  useEffect(() => {
    if (!createForm.item_id) {
      return
    }
    const selectedItemId = Number(createForm.item_id)
    const isStillAvailable = availableItems.some((item) => item.id === selectedItemId)
    if (!isStillAvailable) {
      setCreateForm((prev) => ({ ...prev, item_id: '' }))
    }
  }, [availableItems, createForm.item_id])

  const handleConfirmReturned = async (loanId) => {
    setActionMessage('')
    setLoadingLoanId(loanId)
    try {
      await confirmLoanReturned({ loanId, token })
      setActionMessage('Status pengembalian berhasil diperbarui.')
      await loadData()
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setLoadingLoanId(null)
    }
  }

  const handleCreateChange = (event) => {
    const { name, value } = event.target
    setCreateForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreateBorrower = async (event) => {
    event.preventDefault()
    if (!isCreateFormValid) {
      return
    }
    setErrorMessage('')
    setActionMessage('')
    setIsSubmittingCreate(true)

    try {
      await createLoan({
        token,
        payload: {
          borrower_name: createForm.borrower_name.trim(),
          item_id: Number(createForm.item_id),
          duration_days: Number(createForm.duration_days),
          borrowed_at: createForm.borrowed_at,
          price_to_pay: Number(createForm.price_to_pay),
          is_returned: false,
        },
      })
      setActionMessage('Peminjam berhasil ditambahkan.')
      setShowCreateForm(false)
      setCreateForm({
        borrower_name: '',
        item_id: '',
        duration_days: 1,
        borrowed_at: getTodayDateString(),
        price_to_pay: '',
      })
      await loadData()
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSubmittingCreate(false)
    }
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Daftar Pinjaman</h1>
          <p className="text-sm text-slate-500">
            Kelola pinjaman dan konfirmasi pengembalian barang.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-end">
          <button
            type="button"
            onClick={() => setShowCreateForm((prev) => !prev)}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            {showCreateForm ? 'Tutup Form' : 'Tambah Peminjam'}
          </button>
          <div className="w-full sm:w-52">
          <label htmlFor="status-filter" className="mb-1 block text-xs font-semibold text-slate-600">
            Filter Status
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-300"
          >
            <option value="all">Semua</option>
            <option value="active">Belum Kembali</option>
            <option value="overdue">Terlambat</option>
            <option value="returned">Sudah Kembali</option>
          </select>
          </div>
        </div>
      </header>

      {showCreateForm ? (
        <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">Tambah Peminjam</h2>
          <form className="grid grid-cols-1 gap-3 sm:grid-cols-2" onSubmit={handleCreateBorrower}>
            <div className="space-y-1">
              <label htmlFor="borrower_name" className="text-xs font-semibold text-slate-600">
                Nama Peminjam
              </label>
              <input
                id="borrower_name"
                name="borrower_name"
                value={createForm.borrower_name}
                onChange={handleCreateChange}
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-300"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="item_id" className="text-xs font-semibold text-slate-600">
                Item
              </label>
              <select
                id="item_id"
                name="item_id"
                value={createForm.item_id}
                onChange={handleCreateChange}
                required
                disabled={availableItems.length === 0}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-300"
              >
                <option value="">
                  {availableItems.length === 0 ? 'Tidak ada item tersedia' : 'Pilih item'}
                </option>
                {availableItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.item_code} - {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="duration_days" className="text-xs font-semibold text-slate-600">
                Lama Pinjam (hari)
              </label>
              <input
                id="duration_days"
                name="duration_days"
                type="number"
                min={1}
                value={createForm.duration_days}
                onChange={handleCreateChange}
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-300"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="borrowed_at" className="text-xs font-semibold text-slate-600">
                Tanggal Pinjam
              </label>
              <input
                id="borrowed_at"
                name="borrowed_at"
                type="date"
                value={createForm.borrowed_at}
                onChange={handleCreateChange}
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-300"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="price_to_pay" className="text-xs font-semibold text-slate-600">
                Harga Dibayar
              </label>
              <input
                id="price_to_pay"
                name="price_to_pay"
                type="number"
                min={0}
                value={createForm.price_to_pay}
                onChange={handleCreateChange}
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-300"
              />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-600">Preview Tanggal Kembali</p>
              <div className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">
                {returnDatePreview}
              </div>
            </div>

            <div className="sm:col-span-2 sm:max-w-[220px]">
              <Button type="submit" isLoading={isSubmittingCreate} disabled={!isCreateFormValid}>
                Simpan Peminjam
              </Button>
            </div>
          </form>
        </section>
      ) : null}

      {errorMessage ? (
        <p className="rounded-lg bg-rose-100 px-3 py-2 text-sm text-rose-700">{errorMessage}</p>
      ) : null}

      {actionMessage ? (
        <p className="rounded-lg bg-emerald-100 px-3 py-2 text-sm text-emerald-700">{actionMessage}</p>
      ) : null}

      <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-amber-800">Notifikasi Jatuh Tempo</h2>
          <span className="rounded-full bg-amber-200 px-2 py-0.5 text-xs font-semibold text-amber-800">
            {notifications.length}
          </span>
        </div>
        {notifications.length === 0 ? (
          <p className="text-sm text-amber-700">Tidak ada notifikasi jatuh tempo.</p>
        ) : (
          <ul className="space-y-2">
            {notifications.map((notification) => (
              <li
                key={notification.loan_id}
                className="rounded-lg border border-amber-200 bg-white p-3"
              >
                <p className="text-sm text-slate-700">{notification.message}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>Kode: {notification.item_code}</span>
                  <span>|</span>
                  <span>Peminjam: {notification.borrower_name}</span>
                  <span>|</span>
                  <span>Terlambat: {notification.days_overdue} hari</span>
                </div>
                <div className="mt-3 max-w-[220px]">
                  <Button
                    type="button"
                    isLoading={loadingLoanId === notification.loan_id}
                    onClick={() => handleConfirmReturned(notification.loan_id)}
                  >
                    Konfirmasi Sudah Kembali
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-800">Data Pinjaman</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-left text-slate-600">
              <tr>
                <th className="px-4 py-2">Peminjam</th>
                <th className="px-4 py-2">Kode Item</th>
                <th className="px-4 py-2">Tanggal Pinjam</th>
                <th className="px-4 py-2">Jatuh Tempo</th>
                <th className="px-4 py-2">Lama (Hari)</th>
                <th className="px-4 py-2">Harga</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-slate-500">
                    {isLoading ? 'Memuat data pinjaman...' : 'Data pinjaman tidak ditemukan.'}
                  </td>
                </tr>
              ) : (
                filteredLoans.map((loan) => (
                  <tr key={loan.id} className="border-t border-slate-100">
                    <td className="px-4 py-2 text-slate-700">{loan.borrower_name}</td>
                    <td className="px-4 py-2 font-semibold text-slate-800">{loan.item_code}</td>
                    <td className="px-4 py-2 text-slate-700">{formatDate(loan.borrowed_at)}</td>
                    <td className="px-4 py-2 text-slate-700">{formatDate(loan.due_at)}</td>
                    <td className="px-4 py-2 text-slate-700">{loan.duration_days}</td>
                    <td className="px-4 py-2 text-slate-700">{formatCurrency(loan.price_to_pay)}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(
                          loan
                        )}`}
                      >
                        {getStatusLabel(loan)}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {loan.is_returned ? (
                        <span className="text-xs font-medium text-slate-500">Selesai</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleConfirmReturned(loan.id)}
                          className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                          disabled={loadingLoanId === loan.id}
                        >
                          {loadingLoanId === loan.id ? 'Memproses...' : 'Tandai Kembali'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default ListLoanPage
