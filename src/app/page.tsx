'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertCircle, TrendingUp, Clock, Users, Shield, History, Lock } from 'lucide-react'

export default function BatikPools() {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([])
  const [betAmount, setBetAmount] = useState('')
  const [betType, setBetType] = useState('4D')
  const [userBalance, setUserBalance] = useState(1000000)
  const [lastResult, setLastResult] = useState([8, 3, 7, 2])
  const [timeUntilDraw, setTimeUntilDraw] = useState(3600)
  const [betHistory, setBetHistory] = useState<any[]>([])
  const [showBetDialog, setShowBetDialog] = useState(false)
  const [statistics, setStatistics] = useState<any>(null)
  const [loadingStats, setLoadingStats] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeUntilDraw(prev => prev > 0 ? prev - 1 : 3600)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    // Fetch initial data
    fetchLatestResult()
    fetchBetHistory()
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    setLoadingStats(true)
    try {
      const response = await fetch('/api/lottery/stats')
      const data = await response.json()
      if (data.success) {
        setStatistics(data.statistics)
      }
    } catch (error) {
      console.error('Failed to fetch statistics:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  const fetchLatestResult = async () => {
    try {
      const response = await fetch('/api/lottery/draw')
      const data = await response.json()
      if (data.success && data.result) {
        setLastResult(data.result.numbers)
      }
    } catch (error) {
      console.error('Failed to fetch latest result:', error)
    }
  }

  const fetchBetHistory = async () => {
    try {
      const response = await fetch('/api/lottery/bet?userId=demo-user')
      const data = await response.json()
      if (data.success) {
        setBetHistory(data.bets)
        setUserBalance(data.balance)
      }
    } catch (error) {
      console.error('Failed to fetch bet history:', error)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleNumberSelect = (num: number) => {
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter(n => n !== num))
    } else if (selectedNumbers.length < parseInt(betType)) {
      setSelectedNumbers([...selectedNumbers, num])
    }
  }

  const handleBet = async () => {
    if (selectedNumbers.length !== parseInt(betType) || !betAmount) return
    
    try {
      const response = await fetch('/api/lottery/bet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          numbers: selectedNumbers,
          betType,
          amount: parseInt(betAmount),
          userId: 'demo-user'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setBetHistory([data.bet, ...betHistory])
        setUserBalance(data.newBalance)
        setSelectedNumbers([])
        setBetAmount('')
        setShowBetDialog(false)
        
        // Show success message
        alert('Taruhan berhasil dipasang!')
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      console.error('Bet error:', error)
      alert('Terjadi kesalahan saat memasang taruhan')
    }
  }

  const generateLogo = () => {
    return (
      <div className="relative w-32 h-32 mx-auto mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-yellow-600 to-red-700 rounded-full opacity-90"></div>
        <div className="absolute inset-2 bg-gradient-to-br from-yellow-500 to-red-600 rounded-full"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="text-2xl font-bold">BATIK</div>
            <div className="text-sm">POOLS</div>
          </div>
        </div>
        <div className="absolute -inset-1 bg-gradient-to-br from-yellow-400 to-red-600 rounded-full opacity-30 animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-yellow-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          {generateLogo()}
          <h1 className="text-4xl font-bold text-red-800 mb-2">Batik Pools</h1>
          <p className="text-gray-600">Lottery System dengan Keamanan Kriptografi</p>
          <div className="flex justify-center gap-4 mt-4">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Shield className="w-4 h-4 mr-1" /> Secure & Fair
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <Clock className="w-4 h-4 mr-1" /> {formatTime(timeUntilDraw)}
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800 cursor-pointer" onClick={() => window.open('/security', '_blank')}>
              <Lock className="w-4 h-4 mr-1" /> Keamanan
            </Badge>
          </div>
        </div>

        {/* User Balance */}
        <Card className="mb-6 border-red-200">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Saldo Anda:</span>
              <span className="text-2xl font-bold text-green-600">
                Rp {userBalance.toLocaleString('id-ID')}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Last Result */}
        <Card className="mb-6 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <History className="w-5 h-5" />
              Hasil Terakhir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center gap-4">
              {lastResult.map((num, idx) => (
                <div key={idx} className="w-16 h-16 bg-red-600 text-white rounded-lg flex items-center justify-center text-2xl font-bold shadow-lg">
                  {num}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="bet" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bet">Betting</TabsTrigger>
            <TabsTrigger value="history">Riwayat</TabsTrigger>
            <TabsTrigger value="stats">Statistik</TabsTrigger>
          </TabsList>

          <TabsContent value="bet">
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-800">Pasang Taruhan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="bet-type">Jenis Taruhan</Label>
                    <Select value={betType} onValueChange={setBetType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4D">4D (4 Angka)</SelectItem>
                        <SelectItem value="3D">3D (3 Angka)</SelectItem>
                        <SelectItem value="2D">2D (2 Angka)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Pilih Angka (0-9)</Label>
                    <div className="grid grid-cols-5 gap-2 mt-2">
                      {Array.from({ length: 10 }, (_, i) => (
                        <Button
                          key={i}
                          variant={selectedNumbers.includes(i) ? "default" : "outline"}
                          className="h-12 text-lg font-bold"
                          onClick={() => handleNumberSelect(i)}
                        >
                          {i}
                        </Button>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Dipilih: {selectedNumbers.join(', ') || 'Belum ada'}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="bet-amount">Jumlah Taruhan (Rp)</Label>
                    <Input
                      id="bet-amount"
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(e.target.value)}
                      placeholder="Minimal Rp 10.000"
                    />
                  </div>

                  <Dialog open={showBetDialog} onOpenChange={setShowBetDialog}>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full bg-red-600 hover:bg-red-700"
                        disabled={selectedNumbers.length !== parseInt(betType) || !betAmount}
                      >
                        Pasang Taruhan
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Konfirmasi Taruhan</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-2">
                        <p><strong>Jenis:</strong> {betType}</p>
                        <p><strong>Angka:</strong> {selectedNumbers.join(', ')}</p>
                        <p><strong>Jumlah:</strong> Rp {parseInt(betAmount).toLocaleString('id-ID')}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setShowBetDialog(false)}>
                          Batal
                        </Button>
                        <Button onClick={handleBet} className="bg-red-600 hover:bg-red-700">
                          Konfirmasi
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-800">Riwayat Taruhan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {betHistory.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Belum ada riwayat taruhan</p>
                  ) : (
                    betHistory.map((bet) => (
                      <div key={bet.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-semibold">{bet.type}: {bet.numbers.join(', ')}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(bet.timestamp).toLocaleString('id-ID')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">Rp {bet.amount.toLocaleString('id-ID')}</p>
                          <Badge variant="secondary">Menunggu</Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-800">
                  <TrendingUp className="w-5 h-5" />
                  Statistik Batik Pools
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingStats ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Memuat statistik...</p>
                  </div>
                ) : statistics ? (
                  <div className="space-y-6">
                    {/* Overview Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {statistics.overview.totalUsers.toLocaleString('id-ID')}
                        </div>
                        <div className="text-sm text-gray-600">Total Pemain</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          Rp {(statistics.overview.totalWinnings / 1000000).toFixed(1)}M
                        </div>
                        <div className="text-sm text-gray-600">Total Hadiah</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {statistics.overview.winRate}%
                        </div>
                        <div className="text-sm text-gray-600">Tingkat Kemenangan</div>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">
                          {statistics.overview.totalDraws}
                        </div>
                        <div className="text-sm text-gray-600">Total Undian</div>
                      </div>
                    </div>

                    {/* Today's Activity */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="text-lg font-semibold text-purple-800">
                          {statistics.overview.todayBets}
                        </div>
                        <div className="text-sm text-gray-600">Taruhan Hari Ini</div>
                      </div>
                      <div className="p-4 bg-indigo-50 rounded-lg">
                        <div className="text-lg font-semibold text-indigo-800">
                          Rp {statistics.overview.todayWinnings.toLocaleString('id-ID')}
                        </div>
                        <div className="text-sm text-gray-600">Hadiah Hari Ini</div>
                      </div>
                    </div>

                    {/* Number Frequency */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-red-800">Frekuensi Angka</h3>
                      <div className="grid grid-cols-5 gap-2">
                        {statistics.numberFrequency.slice(0, 10).map((item: any) => (
                          <div key={item.number} className="text-center p-2 bg-gray-50 rounded">
                            <div className="text-lg font-bold">{item.number}</div>
                            <div className="text-xs text-gray-600">{item.frequency}x</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent Draws */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-red-800">Hasil Terbaru</h3>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {statistics.recentDraws.slice(0, 5).map((draw: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <div className="flex gap-2">
                              {draw.numbers.map((num: number, i: number) => (
                                <div key={i} className="w-8 h-8 bg-red-600 text-white rounded flex items-center justify-center text-sm font-bold">
                                  {num}
                                </div>
                              ))}
                            </div>
                            <div className="text-sm text-gray-600">
                              {new Date(draw.time).toLocaleString('id-ID', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button 
                      onClick={fetchStatistics} 
                      variant="outline" 
                      className="w-full"
                    >
                      Refresh Statistik
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Gagal memuat statistik</p>
                    <Button onClick={fetchStatistics} variant="outline" className="mt-2">
                      Coba Lagi
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}