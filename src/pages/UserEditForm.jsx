import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectItem } from '@/components/ui/select'
import { axiosInstance } from '@/components/ProtectedRoute'
import { ArrowLeft, Loader2 } from 'lucide-react'

export default function UserEditForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'VIEWER',
  })
  const [error, setError] = useState('')

  // Fetch user data
  const { data: user, isLoading, error: fetchError } = useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/users/${id}`)
      return data.data
    },
  })

  // Update user mutation
  const mutation = useMutation({
    mutationFn: async (data) => {
      const { data: response } = await axiosInstance.put(`/users/${id}`, data)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      // Add delay before navigation to prevent Chrome extension errors
      setTimeout(() => navigate('/dashboard'), 500)
    },
    onError: (error) => {
      setError(error.response?.data?.message || 'Failed to update user')
    },
  })

  // Populate form when user data is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'VIEWER',
      })
    }
  }, [user])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    mutation.mutate(formData)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading user data...</span>
        </div>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto max-w-2xl">
          <Alert variant="destructive">
            <AlertDescription>
              Error loading user: {fetchError.response?.data?.message || fetchError.message}
            </AlertDescription>
          </Alert>
          <Button onClick={() => navigate('/dashboard')} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Edit User</CardTitle>
            <CardDescription>
              Update user information and permissions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-medium">Role</label>
                <Select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <SelectItem value="VIEWER">Viewer (Read Only)</SelectItem>
                  <SelectItem value="MANAGER">Manager (Edit Stock/Products)</SelectItem>
                  <SelectItem value="ADMIN">Admin (Full Control)</SelectItem>
                </Select>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? 'Updating...' : 'Update User'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
