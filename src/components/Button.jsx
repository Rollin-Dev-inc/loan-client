function Button({
  type = 'button',
  disabled = false,
  isLoading = false,
  className = '',
  children,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400 ${className}`}
      {...props}
    >
      {isLoading ? 'Memproses...' : children}
    </button>
  )
}

export default Button
