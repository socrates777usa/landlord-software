// Shared form building blocks — import in any form page
export function Field({ label, hint, full, children }) {
  return (
    <div className={`form-field${full ? ' form-full' : ''}`}>
      <label className="form-label">{label}{hint && <span className="form-hint"> — {hint}</span>}</label>
      {children}
    </div>
  )
}

export function Input({ value, onChange, type = 'text', placeholder = '', min, max, step, disabled }) {
  return (
    <input
      className="form-input" type={type} value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder} min={min} max={max} step={step} disabled={disabled}
    />
  )
}

export function Select({ value, onChange, options, disabled }) {
  return (
    <select className="form-select" value={value ?? ''} onChange={e => onChange(e.target.value)} disabled={disabled}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

export function Textarea({ value, onChange, rows = 4, placeholder = '' }) {
  return (
    <textarea
      className="form-textarea" rows={rows} value={value ?? ''}
      onChange={e => onChange(e.target.value)} placeholder={placeholder}
    />
  )
}

export function Section({ title, children }) {
  return (
    <div className="form-section">
      <div className="form-section-title">{title}</div>
      <div className="form-grid">{children}</div>
    </div>
  )
}

export function fmt$(n) {
  if (n == null || n === '' || isNaN(n)) return '—'
  const abs = Math.abs(n); const sign = n < 0 ? '-' : ''
  if (abs >= 1000000) return `${sign}$${(abs/1000000).toFixed(2)}M`
  if (abs >= 1000)    return `${sign}$${(abs/1000).toFixed(1)}K`
  return `${sign}$${Number(abs).toFixed(0)}`
}

export function fmtDate(d) {
  if (!d) return '—'
  try { return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) }
  catch { return d }
}
