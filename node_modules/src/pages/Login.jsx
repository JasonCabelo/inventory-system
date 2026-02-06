import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { axiosInstance } from '@/components/ProtectedRoute'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mfaCode, setMfaCode] = useState('')
  const [requiresMFA, setRequiresMFA] = useState(false)
  const [tempToken, setTempToken] = useState('')
  const [error, setError] = useState('')

  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const { data } = await axiosInstance.post('/auth/login', credentials)
      return data
    },
    onSuccess: (data) => {
      if (data.requiresMFA) {
        setRequiresMFA(true)
        setTempToken(data.tempToken)
      } else {
        navigate('/dashboard')
      }
    },
    onError: (error) => {
      setError(error.response?.data?.message || 'Login failed')
    },
  })

  const verifyMFAMutation = useMutation({
    mutationFn: async ({ tempToken, mfaCode }) => {
      const { data } = await axiosInstance.post('/auth/verify-mfa', { tempToken, mfaCode })
      return data
    },
    onSuccess: () => {
      navigate('/dashboard')
    },
    onError: (error) => {
      setError(error.response?.data?.message || 'MFA verification failed')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    loginMutation.mutate({ email, password })
  }

  const handleMFASubmit = (e) => {
    e.preventDefault()
    setError('')
    verifyMFAMutation.mutate({ tempToken, mfaCode })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            {requiresMFA ? 'Verify MFA' : 'Enterprise Inventory System'}
          </CardTitle>
          <CardDescription>
            {requiresMFA 
              ? 'Enter your 6-digit MFA code from your authenticator app'
              : 'Enter your credentials to access the system'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!requiresMFA ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleMFASubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="mfaCode" className="text-sm font-medium">
                  MFA Code
                </label>
                <Input
                  id="mfaCode"
                  type="text"
                  placeholder="000000"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={verifyMFAMutation.isPending}
              >
                {verifyMFAMutation.isPending ? 'Verifying...' : 'Verify'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full mt-2"
                onClick={() => {
                  setRequiresMFA(false)
                  setTempToken('')
                  setMfaCode('')
                }}
              >
                Back to Login
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
