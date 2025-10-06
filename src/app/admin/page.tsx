'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Settings, 
  Shield,
  Activity,
  Calendar,
  FileText,
  Bell,
  LogOut,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  BarChart3,
  PieChart,
  UserPlus,
  Wallet,
  Play,
  Pause,
  Power,
  Lock,
  Unlock
} from 'lucide-react'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [systemStatus, setSystemStatus] = useState({
    bettingOpen: true,
    maintenanceMode: false,
    totalUsers: 1250,
    activeUsers: 342,
    totalBets: 15680,
    totalRevenue: 245000000,
    pendingWithdrawals: 12,
    systemHealth: 'good'
  })

  const handleLogout = () => {
    // Clear cookie
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    
    // Clear localStorage
    localStorage.removeItem('user')
    
    // Redirect to admin login
    window.location.href = '/admin-login'
  }

  const [stats, setStats] = useState({
    todayRevenue: 12500000,
    todayBets: 234,
    todayUsers: 18,
    todayDraws: 8,
    weeklyRevenue: 87500000,
    weeklyBets: 1638,
    weeklyUsers: 126,
    monthlyRevenue: 350000000,
    monthlyBets: 6552,
    monthlyUsers: 504
  })

  const [recentActivities, setRecentActivities] = useState([
    { id: 1, type: 'user_register', user: 'john_doe', time: '2 menit yang lalu', status: 'success' },
    { id: 2, type: 'bet_placed', user: 'player123', amount: 50000, time: '5 menit yang lalu', status: 'success' },
    { id: 3, type: 'withdrawal', user: 'winner456', amount: 2500000, time: '12 menit yang lalu', status: 'pending' },
    { id: 4, type: 'system_alert', message: 'High traffic detected', time: '15 menit yang lalu', status: 'warning' },
    { id: 5, type: 'draw_completed', draw: '#1245', time: '30 menit yang lalu', status: 'success' }
  ])

  const [users, setUsers] = useState([
    { id: 1, username: 'john_doe', email: 'john@example.com', balance: 1500000, status: 'active', joinDate: '2025-09-15', totalBets: 156, totalWinnings: 890000 },
    { id: 2, username: 'player123', email: 'player@example.com', balance: 500000, status: 'active', joinDate: '2025-09-20', totalBets: 89, totalWinnings: 1200000 },
    { id: 3, username: 'winner456', email: 'winner@example.com', balance: 5000000, status: 'active', joinDate: '2025-10-01', totalBets: 234, totalWinnings: 8500000 },
    { id: 4, username: 'blocked_user', email: 'blocked@example.com', balance: 100000, status: 'blocked', joinDate: '2025-09-10', totalBets: 45, totalWinnings: 0 }
  ])

  const [bets, setBets] = useState([
    { id: 1, user: 'john_doe', type: '4D', numbers: '8249', amount: 50000, status: 'pending', time: '14:32:15' },
    { id: 2, user: 'player123', type: '2D', numbers: '82', amount: 25000, status: 'won', time: '14:28:30', winning: 1750000 },
    { id: 3, user: 'winner456', type: '3D', numbers: '249', amount: 100000, status: 'lost', time: '14:25:45' },
    { id: 4, user: 'new_user', type: '4D', numbers: '1234', amount: 75000, status: 'pending', time: '14:22:10' }
  ])

  const [withdrawals, setWithdrawals] = useState([
    { id: 1, user: 'winner456', amount: 2500000, bank: 'BCA', account: '1234567890', status: 'pending', time: '13:45:20' },
    { id: 2, user: 'player123', amount: 1500000, bank: 'Mandiri', account: '0987654321', status: 'approved', time: '12:30:15' },
    { id: 3, user: 'john_doe', amount: 500000, bank: 'BNI', account: '1122334455', status: 'rejected', time: '11:20:30', reason: 'Invalid account' }
  ])

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`
  }

  const getActivityIcon = (type: string) => {
    switch(type) {
      case 'user_register': return <UserPlus className="w-4 h-4 text-green-400" />
      case 'bet_placed': return <TrendingUp className="w-4 h-4 text-blue-400" />
      case 'withdrawal': return <Wallet className="w-4 h-4 text-yellow-400" />
      case 'system_alert': return <AlertTriangle className="w-4 h-4 text-orange-400" />
      case 'draw_completed': return <CheckCircle className="w-4 h-4 text-purple-400" />
      default: return <Activity className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; text: string }> = {
      active: { color: 'bg-green-500/20 text-green-400 border-green-500/40', text: 'Active' },
      blocked: { color: 'bg-red-500/20 text-red-400 border-red-500/40', text: 'Blocked' },
      pending: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40', text: 'Pending' },
      won: { color: 'bg-green-500/20 text-green-400 border-green-500/40', text: 'Won' },
      lost: { color: 'bg-red-500/20 text-red-400 border-red-500/40', text: 'Lost' },
      approved: { color: 'bg-green-500/20 text-green-400 border-green-500/40', text: 'Approved' },
      rejected: { color: 'bg-red-500/20 text-red-400 border-red-500/40', text: 'Rejected' }
    }
    
    const variant = variants[status] || variants.pending
    return <Badge variant="outline" className={variant.color}>{variant.text}</Badge>
  }

  const handleSystemToggle = (action: string) => {
    setIsLoading(true)
    setTimeout(() => {
      if (action === 'betting') {
        setSystemStatus(prev => ({ ...prev, bettingOpen: !prev.bettingOpen }))
      } else if (action === 'maintenance') {
        setSystemStatus(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }))
      }
      setIsLoading(false)
    }, 1000)
  }

  const handleUserAction = (userId: number, action: string) => {
    if (action === 'block') {
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, status: 'blocked' } : user
      ))
    } else if (action === 'unblock') {
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, status: 'active' } : user
      ))
    }
  }

  const handleWithdrawalAction = (withdrawalId: number, action: string) => {
    if (action === 'approve') {
      setWithdrawals(prev => prev.map(w => 
        w.id === withdrawalId ? { ...w, status: 'approved' } : w
      ))
    } else if (action === 'reject') {
      setWithdrawals(prev => prev.map(w => 
        w.id === withdrawalId ? { ...w, status: 'rejected', reason: 'Admin decision' } : w
      ))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-x-hidden">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="w-full max-w-screen-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between overflow-x-hidden">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
              <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/40">
                <Shield className="w-4 h-4 mr-1" />
                Administrator
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${systemStatus.systemHealth === 'good' ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
                <span className="text-white/80 text-sm">System {systemStatus.systemHealth}</span>
              </div>
              
              <Button variant="ghost" size="sm" className="text-white/80 hover:text-white" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-sm border-b border-white/5">
        <div className="w-full max-w-screen-2xl mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'bets', label: 'Betting', icon: TrendingUp },
              { id: 'draws', label: 'Draws', icon: Play },
              { id: 'financial', label: 'Financial', icon: DollarSign },
              { id: 'settings', label: 'Settings', icon: Settings },
              { id: 'reports', label: 'Reports', icon: FileText },
              { id: 'audit', label: 'Audit Logs', icon: Activity },
              { id: 'announcements', label: 'Announcements', icon: Bell }
            ].map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? 'default' : 'ghost'}
                className={`flex items-center space-x-2 px-4 py-3 rounded-none border-b-2 whitespace-nowrap ${
                  activeTab === item.id 
                    ? 'bg-white/10 text-white border-white' 
                    : 'text-white/60 hover:text-white border-transparent'
                }`}
                onClick={() => setActiveTab(item.id)}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="w-full max-w-screen-2xl mx-auto px-4 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* System Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">Total Users</p>
                      <p className="text-2xl font-bold text-white mt-1">{systemStatus.totalUsers.toLocaleString()}</p>
                      <p className="text-green-400 text-sm mt-1">+{stats.todayUsers} today</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">Active Users</p>
                      <p className="text-2xl font-bold text-white mt-1">{systemStatus.activeUsers}</p>
                      <p className="text-green-400 text-sm mt-1">Online now</p>
                    </div>
                    <Activity className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">Today Revenue</p>
                      <p className="text-2xl font-bold text-white mt-1">{formatCurrency(stats.todayRevenue)}</p>
                      <p className="text-green-400 text-sm mt-1">+12.5%</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">Pending WD</p>
                      <p className="text-2xl font-bold text-white mt-1">{systemStatus.pendingWithdrawals}</p>
                      <p className="text-orange-400 text-sm mt-1">Need action</p>
                    </div>
                    <Wallet className="w-8 h-8 text-orange-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Controls */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-yellow-400" />
                  <span>System Controls</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-semibold">Betting Status</h4>
                      <p className="text-white/60 text-sm">Allow users to place bets</p>
                    </div>
                    <Button
                      onClick={() => handleSystemToggle('betting')}
                      disabled={isLoading}
                      className={`${systemStatus.bettingOpen ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                    >
                      {systemStatus.bettingOpen ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
                      {systemStatus.bettingOpen ? 'Open' : 'Closed'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-semibold">Maintenance Mode</h4>
                      <p className="text-white/60 text-sm">Temporarily disable system</p>
                    </div>
                    <Button
                      onClick={() => handleSystemToggle('maintenance')}
                      disabled={isLoading}
                      className={`${systemStatus.maintenanceMode ? 'bg-orange-600 hover:bg-orange-700' : 'bg-gray-600 hover:bg-gray-700'}`}
                    >
                      <Power className="w-4 h-4 mr-2" />
                      {systemStatus.maintenanceMode ? 'On' : 'Off'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-yellow-400" />
                  <span>Recent Activities</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getActivityIcon(activity.type)}
                        <div>
                          <p className="text-white text-sm">
                            {activity.type === 'user_register' && `User ${activity.user} registered`}
                            {activity.type === 'bet_placed' && `${activity.user} placed bet ${formatCurrency(activity.amount || 0)}`}
                            {activity.type === 'withdrawal' && `${activity.user} requested withdrawal ${formatCurrency(activity.amount || 0)}`}
                            {activity.type === 'system_alert' && `System: ${activity.message}`}
                            {activity.type === 'draw_completed' && `Draw ${activity.draw} completed`}
                          </p>
                          <p className="text-white/60 text-xs">{activity.time}</p>
                        </div>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${
                        activity.status === 'success' ? 'bg-green-400' : 
                        activity.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                      }`} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-yellow-400" />
                    <span>User Management</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="w-4 h-4 text-white/60 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <Input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/40"
                      />
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add User
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/20">
                        <th className="text-left py-3 px-4 text-white/80">User</th>
                        <th className="text-left py-3 px-4 text-white/80">Balance</th>
                        <th className="text-left py-3 px-4 text-white/80">Total Bets</th>
                        <th className="text-left py-3 px-4 text-white/80">Winnings</th>
                        <th className="text-left py-3 px-4 text-white/80">Status</th>
                        <th className="text-left py-3 px-4 text-white/80">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.filter(user => 
                        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        user.email.toLowerCase().includes(searchTerm.toLowerCase())
                      ).map((user) => (
                        <tr key={user.id} className="border-b border-white/10">
                          <td className="py-3 px-4">
                            <div>
                              <p className="text-white font-medium">{user.username}</p>
                              <p className="text-white/60 text-sm">{user.email}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-white">{formatCurrency(user.balance)}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-white">{user.totalBets}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-green-400">{formatCurrency(user.totalWinnings)}</span>
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadge(user.status)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm" className="text-white/80 hover:text-white">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-white/80 hover:text-white"
                                onClick={() => handleUserAction(user.id, user.status === 'active' ? 'block' : 'unblock')}
                              >
                                {user.status === 'active' ? <Ban className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Betting Tab */}
        {activeTab === 'bets' && (
          <div className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-yellow-400" />
                    <span>Betting Management</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/20">
                        <th className="text-left py-3 px-4 text-white/80">User</th>
                        <th className="text-left py-3 px-4 text-white/80">Type</th>
                        <th className="text-left py-3 px-4 text-white/80">Numbers</th>
                        <th className="text-left py-3 px-4 text-white/80">Amount</th>
                        <th className="text-left py-3 px-4 text-white/80">Winning</th>
                        <th className="text-left py-3 px-4 text-white/80">Status</th>
                        <th className="text-left py-3 px-4 text-white/80">Time</th>
                        <th className="text-left py-3 px-4 text-white/80">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bets.map((bet) => (
                        <tr key={bet.id} className="border-b border-white/10">
                          <td className="py-3 px-4">
                            <span className="text-white">{bet.user}</span>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                              {bet.type}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-white font-mono">{bet.numbers}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-white">{formatCurrency(bet.amount)}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={bet.status === 'won' ? 'text-green-400' : 'text-white'}>
                              {bet.winning ? formatCurrency(bet.winning) : '-'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadge(bet.status)}
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-white/80">{bet.time}</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm" className="text-white/80 hover:text-white">
                                <Eye className="w-4 h-4" />
                              </Button>
                              {bet.status === 'pending' && (
                                <Button variant="ghost" size="sm" className="text-white/80 hover:text-white">
                                  <RefreshCw className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Financial Tab */}
        {activeTab === 'financial' && (
          <div className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-yellow-400" />
                    <span>Withdrawal Requests</span>
                  </div>
                  <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-orange-500/40">
                    {systemStatus.pendingWithdrawals} Pending
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/20">
                        <th className="text-left py-3 px-4 text-white/80">User</th>
                        <th className="text-left py-3 px-4 text-white/80">Amount</th>
                        <th className="text-left py-3 px-4 text-white/80">Bank</th>
                        <th className="text-left py-3 px-4 text-white/80">Account</th>
                        <th className="text-left py-3 px-4 text-white/80">Status</th>
                        <th className="text-left py-3 px-4 text-white/80">Time</th>
                        <th className="text-left py-3 px-4 text-white/80">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {withdrawals.map((withdrawal) => (
                        <tr key={withdrawal.id} className="border-b border-white/10">
                          <td className="py-3 px-4">
                            <span className="text-white">{withdrawal.user}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-white font-semibold">{formatCurrency(withdrawal.amount)}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-white">{withdrawal.bank}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-white/80 font-mono">{withdrawal.account}</span>
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadge(withdrawal.status)}
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-white/80">{withdrawal.time}</span>
                          </td>
                          <td className="py-3 px-4">
                            {withdrawal.status === 'pending' && (
                              <div className="flex items-center space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-green-400 hover:text-green-300"
                                  onClick={() => handleWithdrawalAction(withdrawal.id, 'approve')}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-red-400 hover:text-red-300"
                                  onClick={() => handleWithdrawalAction(withdrawal.id, 'reject')}
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                            {withdrawal.status === 'rejected' && withdrawal.reason && (
                              <span className="text-red-400 text-sm">{withdrawal.reason}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-yellow-400" />
                  <span>System Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  <div className="space-y-4">
                    <h4 className="text-white font-semibold">Betting Configuration</h4>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-white/80">Minimum Bet Amount</Label>
                        <Input type="number" defaultValue="1000" className="bg-white/10 border-white/20 text-white" />
                      </div>
                      <div>
                        <Label className="text-white/80">Maximum Bet Amount</Label>
                        <Input type="number" defaultValue="10000000" className="bg-white/10 border-white/20 text-white" />
                      </div>
                      <div>
                        <Label className="text-white/80">2D Prize Multiplier</Label>
                        <Input type="number" defaultValue="70" className="bg-white/10 border-white/20 text-white" />
                      </div>
                      <div>
                        <Label className="text-white/80">3D Prize Multiplier</Label>
                        <Input type="number" defaultValue="400" className="bg-white/10 border-white/20 text-white" />
                      </div>
                      <div>
                        <Label className="text-white/80">4D Prize Multiplier</Label>
                        <Input type="number" defaultValue="3000" className="bg-white/10 border-white/20 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-white font-semibold">Draw Schedule</h4>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-white/80">Draw Interval (minutes)</Label>
                        <Input type="number" defaultValue="30" className="bg-white/10 border-white/20 text-white" />
                      </div>
                      <div>
                        <Label className="text-white/80">Start Time</Label>
                        <Input type="time" defaultValue="08:00" className="bg-white/10 border-white/20 text-white" />
                      </div>
                      <div>
                        <Label className="text-white/80">End Time</Label>
                        <Input type="time" defaultValue="20:00" className="bg-white/10 border-white/20 text-white" />
                      </div>
                      <div>
                        <Label className="text-white/80">Days Off</Label>
                        <select className="w-full bg-white/10 border-white/20 text-white rounded p-2">
                          <option>Sunday</option>
                          <option>None</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="bg-white/20" />

                <div className="flex justify-end space-x-4">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    Cancel
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700">
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Other tabs placeholder */}
        {['draws', 'reports', 'audit', 'announcements'].includes(activeTab) && (
          <div className="text-center py-20">
            <div className="max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-8 h-8 text-white/60" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module
              </h2>
              <p className="text-white/60 mb-8">
                This module is under development. More features coming soon.
              </p>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Coming Soon
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}