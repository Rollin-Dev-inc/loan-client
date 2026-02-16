const menuItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'loans', label: 'Daftar Pinjaman' },
  { id: 'items', label: 'Daftar Item' },
  { id: 'prices', label: 'Daftar Harga' },
]

function Sidebar({ activeMenu, onMenuChange, onLogout }) {
  return (
    <aside className="flex w-full flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:h-full lg:w-72">
      <div className="mb-6 border-b border-slate-200 pb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Rental Mobil</p>
        <h2 className="text-xl font-bold text-slate-900">Admin Panel</h2>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = activeMenu === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onMenuChange(item.id)}
              className={`w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          )
        })}
      </nav>

      <button
        type="button"
        onClick={onLogout}
        className="mt-6 rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
      >
        Logout
      </button>
    </aside>
  )
}

export default Sidebar
