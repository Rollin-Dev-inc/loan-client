import Sidebar from './Sidebar'

function Layout({ activeMenu, onMenuChange, onLogout, children }) {
  return (
    <main className="min-h-screen bg-slate-100 p-4 sm:p-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 lg:h-[calc(100vh-3rem)] lg:flex-row">
        <Sidebar activeMenu={activeMenu} onMenuChange={onMenuChange} onLogout={onLogout} />
        <section className="flex-1 overflow-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          {children}
        </section>
      </div>
    </main>
  )
}

export default Layout
