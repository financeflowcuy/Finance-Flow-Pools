'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Wallet, 
  History, 
  TrendingUp, 
  Clock, 
  Trophy,
  Settings,
  LogOut,
  Eye,
  EyeOff,
  Play,
  Pause,
  Target,
  Zap,
  Star,
  Gift,
  AlertTriangle
} from 'lucide-react'
import { io, Socket } from 'socket.io-client'

export default function DashboardUser() {
  const [balance, setBalance] = useState(10000)
  const [showBalance, setShowBalance] = useState(true)
  const [betType, setBetType] = useState('2D')
  const [betNumber, setBetNumber] = useState('')
  const [betAmount, setBetAmount] = useState('')
  const [activeTab, setActiveTab] = useState('betting')
  const [isBettingOpen, setIsBettingOpen] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [betHistory, setBetHistory] = useState<any[]>([])
  const [recentDraws, setRecentDraws] = useState<any[]>([])
  const [countdown, setCountdown] = useState('02:45:00')
  const [drawNumber, setDrawNumber] = useState(1)
  const [socket, setSocket] = useState<Socket | null>(null)
  
  // Maintenance state
  const [isMaintenance, setIsMaintenance] = useState(false)
  const [maintenanceMessage, setMaintenanceMessage] = useState('')
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    // Initialize Socket.IO connection
    const newSocket = io()
    setSocket(newSocket)

    // Listen for timer updates
    newSocket.on('timer_update', (data: any) => {
      const seconds = Math.floor(data.remaining / 1000)
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = seconds % 60
      setCountdown(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`)
      setDrawNumber(data.drawNumber)
      setIsMaintenance(data.isMaintenance)
      setMaintenanceMessage(data.maintenanceMessage)
      setIsPaused(data.isPaused)
      setIsBettingOpen(!data.isPaused && !data.isMaintenance)
    })

    // Listen for maintenance events
    newSocket.on('maintenance_started', (data: any) => {
      console.log('Maintenance started:', data)
      setIsMaintenance(true)
      setMaintenanceMessage(data.message)
      setIsBettingOpen(false)
    })

    newSocket.on('maintenance_ended', (data: any) => {
      console.log('Maintenance ended:', data)
      setIsMaintenance(false)
      setMaintenanceMessage('')
      setIsBettingOpen(true)
    })

    // Listen for new round events
    newSocket.on('new_round', (data: any) => {
      console.log('New round started:', data.drawNumber)
      // Refresh data when new round starts
      fetchRecentDraws()
    })

    // Cleanup on unmount
    return () => {
      newSocket.close()
    }
  }, [])

  useEffect(() => {
    // Load data
    const loadData = () => {
      fetchUserData()
      fetchBetHistory()
      fetchRecentDraws()
    }

    loadData()
  }, [])

  const handleLogout = () => {
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    localStorage.removeItem('user')
    window.location.href = '/'
  }

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user')
      const data = await response.json()
      if (data.success) {
        setUserData(data.user)
        setBalance(data.user.balance)
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    }
  }

  const fetchBetHistory = async () => {
    try {
      const response = await fetch('/api/bet')
      const data = await response.json()
      if (data.success) {
        setBetHistory(data.bets)
      }
    } catch (error) {
      console.error('Failed to fetch bet history:', error)
    }
  }

  const fetchRecentDraws = async () => {
    try {
      const response = await fetch('/api/draw')
      const data = await response.json()
      if (data.success) {
        setRecentDraws(data.draws)
      }
    } catch (error) {
      console.error('Failed to fetch recent draws:', error)
    }
  }

  // Calculate user-specific statistics
  const userStats = {
    totalBets: betHistory.length,
    totalWinnings: betHistory.filter((bet: any) => bet.status === 'win').reduce((sum: number, bet: any) => sum + (bet.winnings || 0), 0),
    winRate: betHistory.length > 0 ? Math.round((betHistory.filter((bet: any) => bet.status === 'win').length / betHistory.length) * 100) : 0,
    lastWin: betHistory.filter((bet: any) => bet.status === 'win').slice(-1)[0]?.winnings || 0
  }

  const handleBet = async () => {
    if (!betNumber || !betAmount) {
      alert('Silakan lengkapi nomor dan jumlah taruhan')
      return
    }
    
    const amount = parseInt(betAmount)
    if (amount > balance) {
      alert('Saldo tidak mencukupi')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/bet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          betType,
          betNumber,
          betAmount: amount,
          userId: userData?.id || 'USER123456'
        })
      })

      const data = await response.json()
      if (data.success) {
        setBalance(prev => prev - amount)
        alert(`Taruhan ${betType} - ${betNumber} sebesar Rp ${amount.toLocaleString()} berhasil ditempatkan!`)
        setBetNumber('')
        setBetAmount('')
        fetchBetHistory()
      } else {
        alert(data.error || 'Terjadi kesalahan saat memasang taruhan')
      }
    } catch (error) {
      console.error('Bet error:', error)
      alert('Terjadi kesalahan saat memasang taruhan')
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-x-hidden">
      {/* Header */}
      <header className="bg-black/40 backdrop-blur-lg border-b border-yellow-500/20 sticky top-0 z-50">
        <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 overflow-x-hidden">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                  Batik Pools
                </h1>
              </div>
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold border-none text-xs sm:text-sm">
                Lottery System
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4 w-full sm:w-auto">
              {/* Balance Display */}
              <div className="flex items-center space-x-2 sm:space-x-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 px-3 sm:px-4 py-2 rounded-xl border border-yellow-500/30 flex-1 sm:flex-initial">
                <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                <div className="flex items-center space-x-2">
                  <span className="text-white font-bold text-sm sm:text-base">
                    {showBalance ? formatCurrency(balance) : 'Rp ••••••'}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBalance(!showBalance)}
                    className="text-yellow-400 hover:text-yellow-300 p-1 h-auto"
                  >
                    {showBalance ? <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" /> : <Eye className="w-3 h-3 sm:w-4 sm:h-4" />}
                  </Button>
                </div>
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Button variant="ghost" size="sm" className="text-white/80 hover:text-yellow-400 p-2">
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
                <Button variant="ghost" size="sm" className="text-white/80 hover:text-red-400 p-2" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-black/30 backdrop-blur-md border-b border-yellow-500/10 sticky top-16 z-40">
        <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
            {[
              { id: 'betting', label: 'Betting', icon: Target },
              { id: 'history', label: 'My History', icon: History },
              { id: 'live', label: 'Live Draw', icon: Play },
              { id: 'stats', label: 'My Stats', icon: Trophy },
              { id: 'profile', label: 'Profile', icon: Settings }
            ].map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? 'default' : 'ghost'}
                className={`flex items-center space-x-2 px-3 sm:px-4 lg:px-6 py-3 rounded-none border-b-2 transition-all whitespace-nowrap flex-shrink-0 ${
                  activeTab === item.id 
                    ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border-yellow-400' 
                    : 'text-white/60 hover:text-yellow-400 hover:bg-white/5 border-transparent'
                }`}
                onClick={() => setActiveTab(item.id)}
              >
                <item.icon className="w-4 h-4" />
                <span className="font-semibold text-sm sm:text-base">{item.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </nav>

      {/* Maintenance Banner */}
      {isMaintenance && (
        <div className="bg-red-600 border-b border-red-700">
          <div className="w-full max-w-screen-2xl mx-auto px-4 py-3">
            <div className="flex items-center justify-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-white animate-pulse" />
              <div className="text-center">
                <h3 className="text-white font-bold">Sedang Dalam Perbaikan</h3>
                <p className="text-white/90 text-sm">{maintenanceMessage || 'Sistem sedang dalam perbaikan. Mohon tunggu beberapa saat.'}</p>
              </div>
              <AlertTriangle className="w-5 h-5 text-white animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Status Bar */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 sm:gap-6">
            <Badge variant={isBettingOpen ? "default" : "secondary"} className={`px-3 sm:px-4 py-2 text-sm font-bold whitespace-nowrap ${
              isBettingOpen 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
            }`}>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${isBettingOpen ? 'bg-white' : 'bg-white'} animate-pulse`} />
                <span className="text-xs sm:text-sm">Betting {isBettingOpen ? 'OPEN' : 'CLOSED'}</span>
              </div>
            </Badge>
            <div className="flex items-center space-x-2 bg-black/40 px-3 sm:px-4 py-2 rounded-lg border border-yellow-500/20">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
              <span className="text-yellow-400/80 text-xs sm:text-sm">Next:</span>
              <span className="text-yellow-400 font-bold text-sm sm:text-base lg:text-lg font-mono">{countdown}</span>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsBettingOpen(!isBettingOpen)}
            className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 whitespace-nowrap"
          >
            {isBettingOpen ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            <span className="hidden sm:inline">{isBettingOpen ? 'Pause' : 'Resume'}</span>
            <span className="sm:hidden">{isBettingOpen ? '⏸' : '▶'}</span>
          </Button>
        </div>

        {/* Tab Content */}
        {activeTab === 'betting' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8 w-full">
            {/* Betting Form */}
            <div className="xl:col-span-2 w-full min-w-0">
              <Card className="bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-lg border border-yellow-500/20">
                <CardHeader className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-b border-yellow-500/20">
                  <CardTitle className="text-white flex items-center space-x-3">
                    <Target className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                    <span className="text-lg sm:text-xl">Place Your Bet</span>
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-6 sm:space-y-8">
                  {/* Bet Type Selection */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full">
                    {['2D', '3D', '4D'].map((type) => (
                      <Button
                        key={type}
                        variant={betType === type ? 'default' : 'outline'}
                        onClick={() => setBetType(type)}
                        className={`py-3 sm:py-4 font-bold text-sm sm:text-lg transition-all w-full min-w-0 ${
                          betType === type 
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:from-yellow-400 hover:to-orange-400 shadow-lg shadow-yellow-500/30' 
                            : 'border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10'
                        }`}
                      >
                        {type}
                      </Button>
                    ))}
                  </div>

                  {/* Number Input */}
                  <div className="space-y-3">
                    <Label className="text-yellow-400 font-semibold text-base sm:text-lg">Nomor {betType}</Label>
                    <Input
                      type="text"
                      placeholder={`Masukkan ${betType.length} digit angka`}
                      value={betNumber}
                      onChange={(e) => setBetNumber(e.target.value)}
                      maxLength={parseInt(betType)}
                      className="bg-black/40 border-yellow-500/30 text-white placeholder-yellow-400/30 text-base sm:text-lg py-3 text-center font-mono"
                      disabled={!isBettingOpen}
                    />
                    <p className="text-yellow-400/60 text-xs sm:text-sm text-center">
                      Contoh: {betType === '2D' ? '82' : betType === '3D' ? '824' : '8249'}
                    </p>
                  </div>

                  {/* Amount Input */}
                  <div className="space-y-3">
                    <Label className="text-yellow-400 font-semibold text-base sm:text-lg">Jumlah Taruhan</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-3 w-full">
                      {[1000, 5000, 10000, 50000].map((amount) => (
                        <Button
                          key={amount}
                          variant="outline"
                          size="sm"
                          onClick={() => setBetAmount(amount.toString())}
                          className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 font-semibold text-xs sm:text-sm w-full min-w-0"
                          disabled={!isBettingOpen}
                        >
                          {formatCurrency(amount)}
                        </Button>
                      ))}
                    </div>
                    <Input
                      type="number"
                      placeholder="Masukkan jumlah taruhan"
                      value={betAmount}
                      onChange={(e) => setBetAmount(e.target.value)}
                      className="bg-black/40 border-yellow-500/30 text-white placeholder-yellow-400/30 text-base sm:text-lg py-3"
                      disabled={!isBettingOpen}
                    />
                  </div>

                  {/* Prize Information */}
                  <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl p-4 sm:p-6 border border-yellow-500/20">
                    <h4 className="text-yellow-400 font-bold text-base sm:text-lg mb-3 sm:mb-4 flex items-center space-x-2">
                      <Gift className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Hadiah</span>
                    </h4>
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full">
                      <div className="text-center">
                        <div className="text-lg sm:text-2xl font-bold text-yellow-400">x70</div>
                        <div className="text-yellow-400/60 text-xs sm:text-sm">2D</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg sm:text-2xl font-bold text-yellow-400">x400</div>
                        <div className="text-yellow-400/60 text-xs sm:text-sm">3D</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg sm:text-2xl font-bold text-yellow-400">x3000</div>
                        <div className="text-yellow-400/60 text-xs sm:text-sm">4D</div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button 
                    onClick={handleBet}
                    disabled={!isBettingOpen || !betNumber || !betAmount || isLoading}
                    className="w-full py-3 sm:py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold text-base sm:text-lg hover:from-yellow-400 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-yellow-500/30"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>{isBettingOpen ? 'Place Bet Now' : 'Betting Closed'}</span>
                      </div>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* User Stats & Recent Draws */}
            <div className="space-y-4 sm:space-y-6">
              {/* My Statistics */}
              <Card className="bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-lg border border-yellow-500/20">
                <CardHeader className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-b border-yellow-500/20">
                  <CardTitle className="text-yellow-400 flex items-center space-x-2">
                    <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base">My Statistics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-yellow-400/60 text-xs sm:text-sm">Total Bets</span>
                    <span className="text-white font-bold text-sm sm:text-base">{userStats.totalBets}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-yellow-400/60 text-xs sm:text-sm">Total Winnings</span>
                    <span className="text-green-400 font-bold text-xs sm:text-sm">{formatCurrency(userStats.totalWinnings)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-yellow-400/60 text-xs sm:text-sm">Win Rate</span>
                    <span className="text-yellow-400 font-bold text-sm sm:text-base">{userStats.winRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-yellow-400/60 text-xs sm:text-sm">Last Win</span>
                    <span className="text-orange-400 font-bold text-xs sm:text-sm">{formatCurrency(userStats.lastWin)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Draws */}
              <Card className="bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-lg border border-yellow-500/20">
                <CardHeader className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-b border-yellow-500/20">
                  <CardTitle className="text-yellow-400 flex items-center space-x-2">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base">Recent Results</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 space-y-3">
                  {recentDraws.slice(0, 5).map((draw: any, index: number) => (
                    <div key={index} className="bg-black/40 rounded-lg p-3 border border-yellow-500/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-yellow-400/60 text-xs">Draw #{draw.id || index + 1}</span>
                        <span className="text-yellow-400/80 text-xs">{draw.time || '02:32:0'}</span>
                      </div>
                      <div className="flex space-x-1 justify-center">
                        {Array.isArray(draw.numbers) 
                          ? draw.numbers.map((num: any, i: number) => (
                              <div key={i} className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-red-500 to-red-600 text-white rounded flex items-center justify-center text-xs sm:text-sm font-bold shadow-lg">
                                {num}
                              </div>
                            ))
                          : (draw.numbers || '824901').toString().split('').map((num: string, i: number) => (
                              <div key={i} className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-red-500 to-red-600 text-white rounded flex items-center justify-center text-xs sm:text-sm font-bold shadow-lg">
                                {num}
                              </div>
                            ))
                        }
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <Card className="bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-lg border border-yellow-500/20">
            <CardHeader className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-b border-yellow-500/20">
              <CardTitle className="text-white flex items-center space-x-3">
                <History className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                <span className="text-lg sm:text-xl">My Betting History</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3">
                {betHistory.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <History className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-400/30 mx-auto mb-4" />
                    <p className="text-yellow-400/60 text-sm sm:text-base">No betting history available</p>
                    <p className="text-yellow-400/40 text-xs sm:text-sm mt-2">Place your first bet to see history here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {betHistory.map((bet: any, index: number) => (
                      <div key={index} className="bg-black/40 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border border-yellow-500/10">
                        <div>
                          <span className="text-white font-bold text-sm sm:text-base lg:text-lg">{bet.betType} - {bet.betNumber}</span>
                          <p className="text-yellow-400/60 text-xs sm:text-sm">{bet.date}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-white font-bold text-sm sm:text-base">{formatCurrency(bet.amount)}</span>
                          <p className={`text-xs sm:text-sm font-semibold ${bet.status === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                            {bet.status === 'win' ? `+${formatCurrency(bet.winnings || 0)}` : 'Lost'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'live' && (
          <Card className="bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-lg border border-yellow-500/20">
            <CardHeader className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-b border-yellow-500/20">
              <CardTitle className="text-white flex items-center space-x-3">
                <Play className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                <span className="text-lg sm:text-xl">Live Draw</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-12 sm:py-16">
              <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4 sm:mb-6"></div>
              <p className="text-yellow-400/60 text-base sm:text-lg mb-4 sm:mb-6">Live draw will start soon...</p>
              <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold hover:from-yellow-400 hover:to-orange-400 px-6 sm:px-8 py-3">
                <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Watch Live Draw
              </Button>
            </CardContent>
          </Card>
        )}

        {activeTab === 'stats' && (
          <Card className="bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-lg border border-yellow-500/20">
            <CardHeader className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-b border-yellow-500/20">
              <CardTitle className="text-white flex items-center space-x-3">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                <span className="text-lg sm:text-xl">My Performance Statistics</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
                <div className="text-center bg-black/40 rounded-xl p-4 sm:p-6 border border-yellow-500/10">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">{userStats.totalBets}</div>
                  <div className="text-yellow-400/60 text-sm sm:text-base">Total Bets</div>
                </div>
                <div className="text-center bg-black/40 rounded-xl p-4 sm:p-6 border border-yellow-500/10">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-400 mb-2">{formatCurrency(userStats.totalWinnings)}</div>
                  <div className="text-yellow-400/60 text-sm sm:text-base">Total Winnings</div>
                </div>
                <div className="text-center bg-black/40 rounded-xl p-4 sm:p-6 border border-yellow-500/10">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-yellow-400 mb-2">{userStats.winRate}%</div>
                  <div className="text-yellow-400/60 text-sm sm:text-base">Win Rate</div>
                </div>
                <div className="text-center bg-black/40 rounded-xl p-4 sm:p-6 border border-yellow-500/10">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-orange-400 mb-2">{formatCurrency(userStats.lastWin)}</div>
                  <div className="text-yellow-400/60 text-sm sm:text-base">Best Win</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'profile' && (
          <Card className="bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-lg border border-yellow-500/20">
            <CardHeader className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-b border-yellow-500/20">
              <CardTitle className="text-white flex items-center space-x-3">
                <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                <span className="text-lg sm:text-xl">My Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <Label className="text-yellow-400 font-semibold text-sm sm:text-base">Name</Label>
                  <Input 
                    value={userData?.name || 'Guest User'} 
                    disabled 
                    className="bg-black/40 border-yellow-500/30 text-white mt-2"
                  />
                </div>
                <div>
                  <Label className="text-yellow-400 font-semibold text-sm sm:text-base">Email</Label>
                  <Input 
                    value={userData?.email || 'guest@example.com'} 
                    disabled 
                    className="bg-black/40 border-yellow-500/30 text-white mt-2"
                  />
                </div>
                <div>
                  <Label className="text-yellow-400 font-semibold text-sm sm:text-base">Member Since</Label>
                  <Input 
                    value={userData?.createdAt || new Date().toLocaleDateString()} 
                    disabled 
                    className="bg-black/40 border-yellow-500/30 text-white mt-2"
                  />
                </div>
                <div>
                  <Label className="text-yellow-400 font-semibold text-sm sm:text-base">Current Balance</Label>
                  <Input 
                    value={formatCurrency(balance)} 
                    disabled 
                    className="bg-black/40 border-yellow-500/30 text-white mt-2 text-base sm:text-lg font-bold"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}