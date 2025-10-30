import { ChangeEvent } from 'react'

interface InputProps {
  type?: string
  placeholder?: string
  value: string
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  label?: string
  multiline?: boolean
  rows?: number
  className?: string
  required?: boolean
  autoFocus?: boolean
}

export default function Input({
  type = 'text',
  placeholder,
  value,
  onChange,
  label,
  multiline = false,
  rows = 3,
  className = '',
  required = false,
  autoFocus = false,
}: InputProps) {
  const baseStyles = 'w-full bg-charcoal-900/40 border border-mint-500/20 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:border-mint-500 focus:ring-2 focus:ring-mint-500/20 transition-all'

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium mb-2 text-secondary">
          {label}
          {required && <span className="text-accent ml-1">*</span>}
        </label>
      )}
      
      {multiline ? (
        <textarea
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          rows={rows}
          required={required}
          autoFocus={autoFocus}
          className={`${baseStyles} resize-none`}
        />
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          autoFocus={autoFocus}
          className={baseStyles}
        />
      )}
    </div>
  )
}

