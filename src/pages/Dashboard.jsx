import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { axiosInstance, useAuth } from '@/components/ProtectedRoute'
import { 
  Package, 
  Users, 
  Tags, 
  Truck, 
  LogOut, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle 
} from 'lucide-react'

export default function Dashboard() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: user } = useAuth()
  const [activeTab, setActiveTab] = useState('products')

  const isAdmin = user?.role === 'ADMIN'
  const isManager = user?.role === 'MANAGER' || isAdmin

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await axiosInstance.post('/auth/logout')
    },
    onSuccess: () => {
      queryClient.clear()
      navigate('/login')
    },
  })

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/products')
      return data.data
    },
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/categories')
      return data.data
    },
  })

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/suppliers')
      return data.data
    },
  })

  const { data: users, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        const { data } = await axiosInstance.get('/users')
        console.log('Users API Response:', data)
        return data.data
      } catch (error) {
        console.error('Users API Error:', error.response?.data || error.message)
        // If unauthorized, don't retry
        if (error.response?.status === 401 || error.response?.status === 403) {
          throw new Error(`Access denied: ${error.response?.data?.message || 'Not authorized'}`)
        }
        throw error
      }
    },
    enabled: !!user, // Only fetch users if user is authenticated (API handles admin check)
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error?.message?.includes('Access denied') || error?.response?.status === 401 || error?.response?.status === 403) {
        return false
      }
      return failureCount < 1
    },
  })

  console.log('Dashboard Debug:', { user, isAdmin, users, usersLoading, usersError })

  const deleteProductMutation = useMutation({
    mutationFn: async (id) => {
      await axiosInstance.delete(`/products/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  const deleteUserMutation = useMutation({
    mutationFn: async (id) => {
      await axiosInstance.delete(`/users/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  const lowStockProducts = products?.filter(p => p.quantity <= p.minStockLevel) || []

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold">Inventory System</h1>
              <span className="text-sm text-muted-foreground">
                Welcome, {user?.name} ({user?.role})
              </span>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => logoutMutation.mutate()}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <Tags className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Suppliers</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{suppliers?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{lowStockProducts.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              <strong>Low Stock Alert:</strong> {lowStockProducts.length} product(s) are below minimum stock level.
            </AlertDescription>
          </Alert>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={activeTab === 'products' ? 'default' : 'outline'}
            onClick={() => setActiveTab('products')}
            className="flex-1 sm:flex-none"
          >
            <Package className="w-4 h-4 mr-2" />
            Products
          </Button>
          <Button
            variant={activeTab === 'categories' ? 'default' : 'outline'}
            onClick={() => setActiveTab('categories')}
            className="flex-1 sm:flex-none"
          >
            <Tags className="w-4 h-4 mr-2" />
            Categories
          </Button>
          <Button
            variant={activeTab === 'suppliers' ? 'default' : 'outline'}
            onClick={() => setActiveTab('suppliers')}
            className="flex-1 sm:flex-none"
          >
            <Truck className="w-4 h-4 mr-2" />
            Suppliers
          </Button>
          {isAdmin && (
          <>
            <Button
              variant={activeTab === 'users' ? 'default' : 'outline'}
              onClick={() => setActiveTab('users')}
              className="flex-1 sm:flex-none"
            >
              <Users className="w-4 h-4 mr-2" />
              Users
            </Button>


          <Button
            variant={activeTab === 'debug' ? 'default' : 'outline'}
            onClick={() => setActiveTab('debug')}
            className="flex-1 sm:flex-none"
          >
            🔍 Debug
          </Button>
        
            </>
          )}

</div>
        {/* Content */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {activeTab === 'products' && 'Products'}
                  {activeTab === 'categories' && 'Categories'}
                  {activeTab === 'suppliers' && 'Suppliers'}
                  {activeTab === 'users' && 'Users'}
                  {activeTab === 'debug' && 'Debug Information'}
                </CardTitle>
                <CardDescription>
                  Manage your {activeTab} here
                </CardDescription>
              </div>
              {isManager && activeTab !== 'users' && (
                <Button asChild>
                  <Link to={`/${activeTab}/new`}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add New
                  </Link>
                </Button>
              )}
              {isAdmin && activeTab === 'users' && (
                <Button asChild>
                  <Link to="/users/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </Link>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {activeTab === 'products' && (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Name</th>
                        <th className="text-left py-2">SKU</th>
                        <th className="text-left py-2">Category</th>
                        <th className="text-left py-2">Quantity</th>
                        <th className="text-left py-2">Price</th>
                        <th className="text-left py-2">Status</th>
                        {isManager && <th className="text-left py-2">Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {products?.map((product) => (
                        <tr key={product._id} className="border-b">
                          <td className="py-2">{product.name}</td>
                          <td className="py-2">{product.sku}</td>
                          <td className="py-2">{product.category?.name}</td>
                          <td className="py-2">{product.quantity}</td>
                          <td className="py-2">${product.price}</td>
                          <td className="py-2">
                            {product.quantity <= product.minStockLevel ? (
                              <span className="text-destructive font-medium">Low Stock</span>
                            ) : (
                              <span className="text-green-600">In Stock</span>
                            )}
                          </td>
                          {isManager && (
                            <td className="py-2">
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm" asChild>
                                  <Link to={`/products/${product._id}/edit`}>
                                    <Edit className="w-4 h-4" />
                                  </Link>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteProductMutation.mutate(product._id)}
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {products?.map((product) => (
                    <Card key={product._id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold">{product.name}</h3>
                            <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                          </div>
                          {isManager && (
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" asChild>
                                <Link to={`/products/${product._id}/edit`}>
                                  <Edit className="w-4 h-4" />
                                </Link>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteProductMutation.mutate(product._id)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>Category: {product.category?.name}</div>
                          <div>Quantity: {product.quantity}</div>
                          <div>Price: ${product.price}</div>
                          <div>
                            Status: {product.quantity <= product.minStockLevel ? (
                              <span className="text-destructive font-medium">Low Stock</span>
                            ) : (
                              <span className="text-green-600">In Stock</span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}

            {activeTab === 'categories' && (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Name</th>
                        <th className="text-left py-2">Description</th>
                        {isManager && <th className="text-left py-2">Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {categories?.map((category) => (
                        <tr key={category._id} className="border-b">
                          <td className="py-2">{category.name}</td>
                          <td className="py-2">{category.description}</td>
                          {isManager && (
                            <td className="py-2">
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm" asChild>
                                  <Link to={`/categories/${category._id}/edit`}>
                                    <Edit className="w-4 h-4" />
                                  </Link>
                                </Button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {categories?.map((category) => (
                    <Card key={category._id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold">{category.name}</h3>
                            <p className="text-sm text-muted-foreground">{category.description}</p>
                          </div>
                          {isManager && (
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/categories/${category._id}/edit`}>
                                <Edit className="w-4 h-4" />
                              </Link>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}

            {activeTab === 'suppliers' && (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Name</th>
                        <th className="text-left py-2">Email</th>
                        <th className="text-left py-2">Phone</th>
                        {isManager && <th className="text-left py-2">Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {suppliers?.map((supplier) => (
                        <tr key={supplier._id} className="border-b">
                          <td className="py-2">{supplier.name}</td>
                          <td className="py-2">{supplier.contactEmail}</td>
                          <td className="py-2">{supplier.contactPhone}</td>
                          {isManager && (
                            <td className="py-2">
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm" asChild>
                                  <Link to={`/suppliers/${supplier._id}/edit`}>
                                    <Edit className="w-4 h-4" />
                                  </Link>
                                </Button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {suppliers?.map((supplier) => (
                    <Card key={supplier._id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold">{supplier.name}</h3>
                            <p className="text-sm text-muted-foreground">{supplier.contactEmail}</p>
                          </div>
                          {isManager && (
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/suppliers/${supplier._id}/edit`}>
                                <Edit className="w-4 h-4" />
                              </Link>
                            </Button>
                          )}
                        </div>
                        <div className="text-sm">
                          <div>Phone: {supplier.contactPhone}</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}

            {activeTab === 'users' && (
              <div className="space-y-4">
                {usersLoading && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading users...</p>
                  </div>
                )}

                {usersError && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      Error loading users: {usersError.message}
                    </AlertDescription>
                  </Alert>
                )}

                {!usersLoading && !usersError && users?.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No users found.</p>
                  </div>
                )}

                {!usersLoading && !usersError && users?.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Name</th>
                          <th className="text-left py-2">Email</th>
                          <th className="text-left py-2">Role</th>
                          <th className="text-left py-2">MFA</th>
                          <th className="text-left py-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user._id} className="border-b">
                            <td className="py-2">{user.name}</td>
                            <td className="py-2">{user.email}</td>
                            <td className="py-2">{user.role}</td>
                            <td className="py-2">
                              {user.mfaEnabled ? (
                                <span className="text-green-600">Enabled</span>
                              ) : (
                                <span className="text-muted-foreground">Disabled</span>
                              )}
                            </td>
                            <td className="py-2">
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm" asChild>
                                  <Link to={`/users/${user._id}/edit`}>
                                    <Edit className="w-4 h-4" />
                                  </Link>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteUserMutation.mutate(user._id)}
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'debug' && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                  <h3 className="font-bold text-blue-800 mb-4 text-lg">🔍 System Debug Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-blue-700">Authentication</h4>
                      <div className="text-sm space-y-1 font-mono bg-white p-3 rounded border">
                        <div><strong>User ID:</strong> {user?._id || '❌ None'}</div>
                        <div><strong>User Name:</strong> {user?.name || '❌ None'}</div>
                        <div><strong>User Email:</strong> {user?.email || '❌ None'}</div>
                        <div><strong>User Role:</strong> {user?.role || '❌ None'}</div>
                        <div><strong>Is Admin:</strong> {isAdmin ? '✅ Yes' : '❌ No'}</div>
                        <div><strong>Is Manager:</strong> {isManager ? '✅ Yes' : '❌ No'}</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-blue-700">API Status</h4>
                      <div className="text-sm space-y-1 font-mono bg-white p-3 rounded border">
                        <div><strong>Products Loading:</strong> {products?.isLoading ? '⏳ Yes' : '✅ No'}</div>
                        <div><strong>Products Count:</strong> {products?.length || 0}</div>
                        <div><strong>Categories Count:</strong> {categories?.length || 0}</div>
                        <div><strong>Suppliers Count:</strong> {suppliers?.length || 0}</div>
                        <div><strong>Users Loading:</strong> {usersLoading ? '⏳ Yes' : '✅ No'}</div>
                        <div><strong>Users Error:</strong> {usersError ? `❌ ${usersError.message}` : '✅ None'}</div>
                        <div><strong>Users Count:</strong> {users?.length || 0}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                  <h3 className="font-bold text-green-800 mb-4 text-lg">📊 Data Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-700">Products</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">{products?.length || 0}</div>
                        <p className="text-xs text-green-600 mt-1">
                          {products?.filter(p => p.quantity <= p.minStockLevel).length || 0} low stock
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-700">Categories</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">{categories?.length || 0}</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-700">Users</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">{users?.length || 0}</div>
                        <p className="text-xs text-green-600 mt-1">
                          {users?.filter(u => u.role === 'ADMIN').length || 0} admins
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                  <h3 className="font-bold text-yellow-800 mb-4 text-lg">⚠️ Issues & Alerts</h3>
                  <div className="space-y-3">
                    {usersError && (
                      <Alert variant="destructive">
                        <AlertDescription>
                          <strong>Users API Error:</strong> {usersError.message}
                        </AlertDescription>
                      </Alert>
                    )}

                    {products?.filter(p => p.quantity <= p.minStockLevel).length > 0 && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Low Stock Alert:</strong> {products.filter(p => p.quantity <= p.minStockLevel).length} products are below minimum stock level.
                        </AlertDescription>
                      </Alert>
                    )}

                    {!user && (
                      <Alert variant="destructive">
                        <AlertDescription>
                          <strong>Authentication Issue:</strong> No user data available. Please log in again.
                        </AlertDescription>
                      </Alert>
                    )}

                    {user && !isAdmin && (
                      <Alert>
                        <AlertDescription>
                          <strong>Access Level:</strong> You have {user.role} access. Some features may be restricted.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
