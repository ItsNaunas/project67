import { useState, useEffect } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import Modal from './ui/Modal'
import Input from './ui/Input'
import Button from './ui/Button'
import toast from 'react-hot-toast'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  initialMode?: 'signin' | 'signup'
}

export default function AuthModal({ isOpen, onClose, onSuccess, initialMode = 'signup' }: AuthModalProps) {
  const supabase = useSupabaseClient()
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Update mode when initialMode changes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode)
      setError('')
    }
  }, [isOpen, initialMode])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Get the correct redirect URL based on environment
      const redirectUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/generate`
        : undefined

      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: fullName,
            },
          },
        })
        
        if (error) {
          console.error('Signup error:', error)
          throw error
        }
        
        // Check if email confirmation is required
        if (data?.user && !data.session) {
          toast.success('Check your email for the confirmation link!', { duration: 6000 })
          onClose()
        } else {
          // Auto-confirmed, proceed
          toast.success('Account created successfully!')
          onSuccess()
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) {
          console.error('Login error:', error)
          throw error
        }
        onSuccess()
      }
    } catch (err: any) {
      console.error('Auth error:', err)
      
      // Better error messages
      let errorMessage = err.message
      
      if (err.message?.includes('Email not confirmed')) {
        errorMessage = 'Please check your email and click the confirmation link first.'
      } else if (err.message?.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please try again.'
      } else if (err.message?.includes('User already registered')) {
        errorMessage = 'This email is already registered. Try logging in instead.'
      } else if (err.message?.includes('Email rate limit exceeded')) {
        errorMessage = 'Too many attempts. Please wait a few minutes and try again.'
      }
      
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }


  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === 'signin' ? 'Welcome Back' : 'Get Started'}>
      <form onSubmit={handleAuth} className="space-y-4">
        {mode === 'signup' && (
          <Input
            label="Full Name"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        )}
        
        <Input
          type="email"
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <Input
          type="password"
          label="Password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && (
          <div className="text-red-500 text-sm p-3 bg-red-500/10 rounded-lg border border-red-500/20">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" loading={loading}>
          {mode === 'signin' ? 'Sign In' : 'Create Account'}
        </Button>

        <p className="text-center text-sm text-gray-400">
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            className="text-mint-400 hover:underline"
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </form>
    </Modal>
  )
}

