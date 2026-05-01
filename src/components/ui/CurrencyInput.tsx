import { useState, useEffect } from 'react'

interface CurrencyInputProps {
  name?: string
  value: string | number
  onChange: (rawValue: string) => void
  placeholder?: string
  className?: string
  required?: boolean
  id?: string
}

/** Formats a raw number string with thousand separators (dots) for display */
function formatDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  return new Intl.NumberFormat('es-CO').format(Number(digits))
}

/**
 * CurrencyInput — renders a text input that shows formatted numbers (e.g. 200.000)
 * but calls onChange with the raw numeric string (e.g. "200000").
 */
export default function CurrencyInput({
  name,
  value,
  onChange,
  placeholder = '0',
  className = '',
  required = false,
  id
}: CurrencyInputProps) {
  const [display, setDisplay] = useState('')

  // Sync external value → display
  useEffect(() => {
    const raw = String(value ?? '').replace(/\D/g, '')
    setDisplay(raw ? formatDisplay(raw) : '')
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '')
    setDisplay(raw ? formatDisplay(raw) : '')
    onChange(raw) // emit clean number string
  }

  return (
    <input
      id={id}
      name={name}
      type="text"
      inputMode="numeric"
      value={display}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
      required={required}
      autoComplete="off"
    />
  )
}
