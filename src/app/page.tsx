'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Clock, Users, Shield, History, Lock, ArrowLeft } from 'lucide-react'

export default function BatikPools() {
  const [userBalance, setUserBalance] = useState(10000)
  const [lastResult, setLastResult] = useState([8, 2, 4, 9, 0, 1])
  const [timeUntilDraw, setTimeUntilDraw] = useState(3600)
  const [bettingFrozen, setBettingFrozen] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeUntilDraw(prev => prev > 0 ? prev - 1 : 3600)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    // Fetch latest result
    fetchLatestResult()
  }, [])

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

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 to-red-800 flex flex-col">
      {/* Header with Back Button */}
      <div className="p-4 flex items-center">
        <Button 
          variant="ghost" 
          className="text-white hover:bg-white/20 p-2"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="w-6 h-6 mr-2" />
          Kembali
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Title */}
        <h1 className="text-5xl font-bold text-white mb-4 text-center">Batik Pools</h1>
        <p className="text-xl text-yellow-300 mb-12 text-center">Lottery System dengan Keamanan Kriptografi</p>

        {/* Balance Card */}
        <Card className="w-full max-w-md mb-8 bg-white/10 border-white/20 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <p className="text-white/80 text-lg mb-2">Saldo Anda:</p>
            <p className="text-4xl font-bold text-yellow-300">
              Rp {userBalance.toLocaleString('id-ID')}
            </p>
          </CardContent>
        </Card>

        {/* Last Result */}
        <Card className="w-full max-w-md mb-8 bg-white/10 border-white/20 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-white text-xl">Draw #{5}</CardTitle>
            <p className="text-yellow-300 text-sm">6/10/2025 02:32:06</p>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center gap-3 mb-4">
              {lastResult.map((num, idx) => (
                <div key={idx} className="w-14 h-14 bg-yellow-400 text-red-800 rounded-lg flex items-center justify-center text-2xl font-bold shadow-lg">
                  {num}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Betting Frozen Notice */}
        <Card className="w-full max-w-md bg-orange-500/20 border-orange-400/50 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <AlertCircle className="w-8 h-8 text-orange-300 mr-3" />
              <h3 className="text-xl font-bold text-orange-300">Betting Dibekukan</h3>
            </div>
            <p className="text-white/90 text-lg">Betting sedang dibekukan</p>
          </CardContent>
        </Card>

        {/* Draw Schedule */}
        <div className="mt-8 text-center text-white/80">
          <p className="text-lg mb-2">Next Draw:</p>
          <p className="text-2xl font-bold text-yellow-300">{formatTime(timeUntilDraw)}</p>
        </div>

        {/* Security Badge */}
        <div className="mt-8">
          <Badge 
            variant="secondary" 
            className="bg-green-500/20 text-green-300 border-green-400/50 cursor-pointer hover:bg-green-500/30"
            onClick={() => window.open('/security', '_blank')}
          >
            <Shield className="w-4 h-4 mr-1" />
            Keamanan Terjamin
          </Badge>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 text-center text-white/60 text-sm">
        <p>Hasil undian terpercaya dengan sistem kriptografi</p>
      </div>
    </div>
  )
}