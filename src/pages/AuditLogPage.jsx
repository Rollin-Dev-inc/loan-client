import { useCallback, useEffect, useState } from 'react'

import { fetchAudits } from '../services/audits'

function formatDateLong(value) {
    if (!value) return '-'
    const d = new Date(value)
    return new Intl.DateTimeFormat('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).format(d)
}

function getActionBadgeColor(action) {
    switch (action) {
        case 'CREATE':
            return 'bg-emerald-100 text-emerald-700 font-semibold'
        case 'UPDATE':
        case 'PATCH':
            return 'bg-blue-100 text-blue-700 font-semibold'
        case 'DELETE':
            return 'bg-rose-100 text-rose-700 font-semibold'
        case 'RETURN':
            return 'bg-amber-100 text-amber-700 font-semibold'
        default:
            return 'bg-slate-100 text-slate-700'
    }
}

function AuditLogPage({ token }) {
    const [audits, setAudits] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState('')

    const loadData = useCallback(async () => {
        setIsLoading(true)
        setErrorMessage('')
        try {
            const data = await fetchAudits(token)
            setAudits(data)
        } catch (error) {
            setErrorMessage(error.message)
        } finally {
            setIsLoading(false)
        }
    }, [token])

    useEffect(() => {
        loadData()
    }, [loadData])

    return (
        <div className="space-y-5">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Audit Logs</h1>
                    <p className="text-sm text-slate-500">
                        Riwayat aktivitas manajemen oleh Admin dan Staff.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={loadData}
                    disabled={isLoading}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
                >
                    {isLoading ? 'Memuat...' : 'Muat Ulang'}
                </button>
            </header>

            {errorMessage ? (
                <p className="rounded-lg bg-rose-100 px-3 py-2 text-sm text-rose-700">{errorMessage}</p>
            ) : null}

            <section className="overflow-hidden rounded-xl border border-slate-200">
                <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                    <h2 className="text-sm font-semibold text-slate-800">Daftar Aktivitas</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-100 text-left text-slate-600">
                            <tr>
                                <th className="px-4 py-2">Waktu</th>
                                <th className="px-4 py-2">Pengguna</th>
                                <th className="px-4 py-2">Tipe Aksi</th>
                                <th className="px-4 py-2">Target</th>
                                <th className="px-4 py-2">Detail Identitas</th>
                            </tr>
                        </thead>
                        <tbody>
                            {audits.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                                        {isLoading ? 'Menarik data dari server...' : 'Belum ada riwayat aktivitas yang tercatat.'}
                                    </td>
                                </tr>
                            ) : (
                                audits.map((log) => (
                                    <tr key={log.id} className="border-t border-slate-100">
                                        <td className="px-4 py-2 whitespace-nowrap text-slate-700">{formatDateLong(log.timestamp)}</td>
                                        <td className="px-4 py-2 font-medium text-slate-900">{log.username}</td>
                                        <td className="px-4 py-2">
                                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${getActionBadgeColor(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2">
                                            <span className="font-semibold text-slate-800">{log.target_type}</span> <span className="text-slate-500 text-xs">#{log.target_id}</span>
                                        </td>
                                        <td className="px-4 py-2 text-slate-700 max-w-xs truncate" title={log.details || '-'}>
                                            {log.details || '-'}
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

export default AuditLogPage
