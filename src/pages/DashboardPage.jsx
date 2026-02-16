import { useEffect, useMemo, useState } from 'react'

import Layout from '../components/Layout'
import Modal from '../components/modal'
import { fetchDashboardSummary } from '../services/dashboard'
import ListItemPage from './ListItemPage'
import ListLoanPage from './ListLoanPage'

const periodOptions = [
  { value: '1m', label: '1 Bulan' },
  { value: '3m', label: '3 Bulan' },
  { value: '6m', label: '6 Bulan' },
  { value: '1y', label: '1 Tahun' },
  { value: '3y', label: '3 Tahun' },
  { value: '5y', label: '5 Tahun' },
]

function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value ?? 0)
}

function formatDate(value) {
  if (!value) {
    return '-'
  }
  return new Date(value).toLocaleDateString('id-ID')
}

function toCsvValue(value) {
  const raw = String(value ?? '')
  return `"${raw.replace(/"/g, '""')}"`
}

function DashboardPlaceholder({ title }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">Halaman ini akan dibuat berikutnya.</p>
    </div>
  )
}

function DashboardContent({ token }) {
  const [period, setPeriod] = useState('1m')
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [isChartOpen, setIsChartOpen] = useState(false)

  useEffect(() => {
    let isActive = true

    const loadDashboard = async () => {
      setIsLoading(true)
      setErrorMessage('')
      try {
        const result = await fetchDashboardSummary({ period, token })
        if (isActive) {
          setData(result)
        }
      } catch (error) {
        if (isActive) {
          setErrorMessage(error.message)
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    loadDashboard()

    return () => {
      isActive = false
    }
  }, [period, token])

  const cards = useMemo(
    () => [
      { label: 'Pendapatan', value: formatCurrency(data?.total_revenue) },
      { label: 'Total Pinjaman', value: data?.total_loans ?? 0 },
      { label: 'Item Unik Dipinjam', value: data?.unique_items_borrowed ?? 0 },
      { label: 'Item Pernah Dipinjam', value: data?.items_ever_borrowed ?? 0 },
    ],
    [data]
  )

  const borrowedItems = data?.borrowed_items ?? []
  const maxLoanCount = Math.max(...borrowedItems.map((item) => item.total_loans), 1)

  const handleExportExcel = () => {
    if (!data) {
      return
    }

    const rows = [
      ['Dashboard Rental Mobil'],
      ['Periode', period],
      ['Tanggal Mulai', data.period_start],
      ['Tanggal Akhir', data.period_end],
      [],
      ['Ringkasan'],
      ['Pendapatan', data.total_revenue],
      ['Total Pinjaman', data.total_loans],
      ['Item Unik Dipinjam', data.unique_items_borrowed],
      ['Item Pernah Dipinjam', data.items_ever_borrowed],
      [],
      ['Item yang Pernah Dipinjam'],
      ['Kode', 'Nama Item', 'Total Pinjaman', 'Pendapatan', 'Terakhir Dipinjam'],
      ...borrowedItems.map((item) => [
        item.item_code,
        item.item_name,
        item.total_loans,
        item.total_revenue,
        item.last_borrowed_at,
      ]),
    ]

    const csv = `\uFEFF${rows
      .map((row) => row.map(toCsvValue).join(','))
      .join('\n')}`
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `dashboard-${period}-${new Date().toISOString().slice(0, 10)}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">
            Ringkasan pendapatan dan item berdasarkan periode.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-end">
          <div className="w-full sm:w-52">
            <label htmlFor="period" className="mb-1 block text-xs font-semibold text-slate-600">
              Filter Periode
            </label>
            <select
              id="period"
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-300"
            >
              {periodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={isLoading || !data}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Export to Excel
          </button>
          <button
            type="button"
            onClick={() => setIsChartOpen(true)}
            disabled={isLoading || borrowedItems.length === 0}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Chart Item Dipinjam
          </button>
        </div>
      </header>

      {errorMessage ? (
        <p className="rounded-lg bg-rose-100 px-3 py-2 text-sm text-rose-700">{errorMessage}</p>
      ) : null}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {isLoading ? '...' : card.value}
            </p>
          </article>
        ))}
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-800">Item yang Pernah Dipinjam</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-left text-slate-600">
              <tr>
                <th className="px-4 py-2">Kode</th>
                <th className="px-4 py-2">Nama Item</th>
                <th className="px-4 py-2">Total Pinjaman</th>
                <th className="px-4 py-2">Pendapatan</th>
                <th className="px-4 py-2">Terakhir Dipinjam</th>
              </tr>
            </thead>
            <tbody>
              {(data?.borrowed_items ?? []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                    {isLoading ? 'Memuat data...' : 'Belum ada data pinjaman pada periode ini.'}
                  </td>
                </tr>
              ) : (
                data.borrowed_items.map((item) => (
                  <tr key={item.item_id} className="border-t border-slate-100">
                    <td className="px-4 py-2 font-semibold text-slate-800">{item.item_code}</td>
                    <td className="px-4 py-2 text-slate-700">{item.item_name}</td>
                    <td className="px-4 py-2 text-slate-700">{item.total_loans}</td>
                    <td className="px-4 py-2 text-slate-700">{formatCurrency(item.total_revenue)}</td>
                    <td className="px-4 py-2 text-slate-700">{formatDate(item.last_borrowed_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Modal
        isOpen={isChartOpen}
        title="Chart Item Dipinjam"
        onClose={() => setIsChartOpen(false)}
      >
        {borrowedItems.length === 0 ? (
          <p className="text-sm text-slate-500">Belum ada data untuk ditampilkan.</p>
        ) : (
          <div className="space-y-3">
            {borrowedItems.map((item) => {
              const width = `${(item.total_loans / maxLoanCount) * 100}%`
              return (
                <div key={item.item_id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="font-semibold">{item.item_code} - {item.item_name}</span>
                    <span>{item.total_loans} pinjaman</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-200">
                    <div
                      className="h-2.5 rounded-full bg-slate-800"
                      style={{ width }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Modal>
    </div>
  )
}

function DashboardPage({ token, onLogout }) {
  const [activeMenu, setActiveMenu] = useState('dashboard')

  return (
    <Layout activeMenu={activeMenu} onMenuChange={setActiveMenu} onLogout={onLogout}>
      {activeMenu === 'dashboard' ? <DashboardContent token={token} /> : null}
      {activeMenu === 'loans' ? <ListLoanPage token={token} /> : null}
      {activeMenu === 'items' ? <ListItemPage token={token} /> : null}
      {activeMenu !== 'dashboard' && activeMenu !== 'loans' && activeMenu !== 'items' ? (
        <DashboardPlaceholder title={activeMenu} />
      ) : null}
    </Layout>
  )
}

export default DashboardPage
