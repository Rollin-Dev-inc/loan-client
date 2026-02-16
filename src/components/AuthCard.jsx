function AuthCard({ title, subtitle, children }) {
  return (
    <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50 sm:p-8">
      <header className="mb-6 space-y-1">
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </header>
      {children}
    </section>
  )
}

export default AuthCard
