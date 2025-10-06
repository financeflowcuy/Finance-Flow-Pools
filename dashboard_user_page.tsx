'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Trophy, 
  History,
  RefreshCw,
  User,
  Target
} from 'lucide-react'

export default function UserDashboard() {
  const [userBalance, setUserBalance] = useState(1000000)
  const [betHistory, setBetHistory] = useState<any[]>([])
  const [statistics, setStatistics] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [userId] = useState('demo-user')

  useEffect(() => {
    fetchUserData()
    fetchStatistics()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch(`/api/lottery/bet?userId=${userId}`)
      const data = await response.json()
      if (data.success) {
        setBetHistory(data.bets)
        setUserBalance(data.balance)
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    }
  }

  const fetchStatistics = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/lottery/stats')
      const data = await response.json()
      if (data.success) {
        setStatistics(data.statistics)
      }
    } catch (error) {
      console.error('Failed to fetch statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = () => {
    fetchUserData()
    fetchStatistics()
  }

  const calculateUserStats = () => {
    const totalBets = betHistory.reduce((sum, bet) => sum + bet.amount, 0)
    const wonBets = betHistory.filter(bet => bet.status === 'won')
    const totalWinnings = wonBets.reduce((sum, bet) => {
      // Calculate winnings based on bet type
      const multipliers = { '2D': 50, '3D': 400, '4D': 3000 }
      const multiplier = multipliers[bet.betType as keyof typeof multipliers] || 1
      return sum + (bet.amount * multiplier)
    }, 0)
    
    const winRate = betHistory.length > 0 ? (wonBets.length / betHistory.length) * 100 : 0
    
    return {
      totalBets,
      totalWinnings,
      winRate: winRate.toFixed(1),
      totalBetsCount: betHistory.length,
      wonBetsCount: wonBets.length
    }
  }

  const userStats = calculateUserStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-yellow-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-red-800">Dashboard User</h1>
            <p className="text-gray-600">Kelola taruhan dan pantau statistik Anda</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={refreshData}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => window.location.href = '/'}>
              Main Betting
            </Button>
          </div>
        </div>

        {/* User Info Card */}
        <Card className="mb-6 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-yellow-600 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Demo User</h2>
                  <p className="text-gray-600">ID: {userId}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Saldo Saat Ini</p>
                <p className="text-3xl font-bold text-green-600">
                  Rp {userBalance.toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Taruhan</p>
                  <p className="text-xl font-bold text-red-600">
                    Rp {userStats.totalBets.toLocaleString('id-ID')}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Kemenangan</p>
                  <p className="text-xl font-bold text-green-600">
                    Rp {userStats.totalWinnings.toLocaleString('id-ID')}
                  </p>
                </div>
                <Trophy className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tingkat Menang</p>
                  <p className="text-xl font-bold text-blue-600">{userStats.winRate}%</p>
                </div>
                <Target className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Jumlah Taruhan</p>
                  <p className="text-xl font-bold text-purple-600">{userStats.totalBetsCount}</p>
                </div>
                <History className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="history" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="history">Riwayat Taruhan</TabsTrigger>
            <TabsTrigger value="analytics">Analitik</TabsTrigger>
            <TabsTrigger value="performance">Performa</TabsTrigger>
          </TabsList>

          <TabsContent value="history">
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-800">
                  <History className="w-5 h-5" />
                  Riwayat Taruhan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {betHistory.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Belum ada riwayat taruhan</p>
                  ) : (
                    betHistory.map((bet) => (
                      <div key={bet.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{bet.betType}</Badge>
                            <span className="font-semibold">{bet.numbers.join(', ')}</span>
                            <Badge 
                              variant={bet.status === 'won' ? 'default' : bet.status === 'lost' ? 'destructive' : 'secondary'}
                            >
                              {bet.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {new Date(bet.timestamp).toLocaleString('id-ID')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">Rp {bet.amount.toLocaleString('id-ID')}</p>
                          {bet.status === 'won' && (
                            <p className="text-sm text-green-600">
                              +Rp {(bet.amount * (bet.betType === '2D' ? 50 : bet.betType === '3D' ? 400 : 3000)).toLocaleString('id-ID')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-800">Distribusi Jenis Taruhan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['2D', '3D', '4D'].map(type => {
                      const typeBets = betHistory.filter(bet => bet.betType === type)
                      const percentage = betHistory.length > 0 ? (typeBets.length / betHistory.length) * 100 : 0
                      
                      return (
                        <div key={type} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{type}</Badge>
                            <span className="text-sm text-gray-600">{typeBets.length} taruhan</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-red-600 h-2 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{percentage.toFixed(1)}%</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-800">Statistik Kemenangan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-green-800">Total Menang</span>
                      <span className="text-xl font-bold text-green-600">{userStats.wonBetsCount}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="text-red-800">Total Kalah</span>
                      <span className="text-xl font-bold text-red-600">{userStats.totalBetsCount - userStats.wonBetsCount}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-blue-800">Profit/Loss</span>
                      <span className={`text-xl font-bold ${userStats.totalWinnings - userStats.totalBets >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        Rp {(userStats.totalWinnings - userStats.totalBets).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance">
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-800">
                  <TrendingUp className="w-5 h-5" />
                  Performa Taruhan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Ringkasan Performa</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Return on Investment (ROI)</span>
                        <span className={`font-semibold ${userStats.totalWinnings >= userStats.totalBets ? 'text-green-600' : 'text-red-600'}`}>
                          {userStats.totalBets > 0 ? ((userStats.totalWinnings - userStats.totalBets) / userStats.totalBets * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rata-rata Taruhan</span>
                        <span className="font-semibold">
                          Rp {userStats.totalBetsCount > 0 ? Math.floor(userStats.totalBets / userStats.totalBetsCount).toLocaleString('id-ID') : 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rata-rata Kemenangan</span>
                        <span className="font-semibold text-green-600">
                          Rp {userStats.wonBetsCount > 0 ? Math.floor(userStats.totalWinnings / userStats.wonBetsCount).toLocaleString('id-ID') : 0}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Rekomendasi</h3>
                    <div className="space-y-2 text-sm">
                      {parseFloat(userStats.winRate) < 20 && (
                        <div className="p-3 bg-yellow-50 rounded-lg">
                          <p className="text-yellow-800">⚠️ Tingkat kemenangan rendah. Pertimbangkan strategi berbeda.</p>
                        </div>
                      )}
                      {userStats.totalWinnings < userStats.totalBets && (
                        <div className="p-3 bg-red-50 rounded-lg">
                          <p className="text-red-800">📉 Sedang dalam kerugian. Batasi taruhan Anda.</p>
                        </div>
                      )}
                      {parseFloat(userStats.winRate) >= 30 && userStats.totalWinnings >= userStats.totalBets && (
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-green-800">🎉 Performa bagus! Pertahankan strategi Anda.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}