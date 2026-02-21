import Sidebar from './Sidebar'

function Layout({ children, activeMenu, onMenuChange, onLogout, userRole }) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:flex-row lg:items-start lg:p-8">
      <Sidebar
        activeMenu={activeMenu}
        onMenuChange={onMenuChange}
        onLogout={onLogout}
        userRole={userRole}
      />
      <section className="flex-1 overflow-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        {children}
      </section>
    </div>
  )
}

export default Layout
