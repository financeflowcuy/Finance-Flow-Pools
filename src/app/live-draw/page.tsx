'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  Clock, 
  Trophy, 
  ArrowLeft,
  RefreshCw,
  Volume2,
  VolumeX
} from 'lucide-react'

export default function LiveDraw() {
  const [countdown, setCountdown] = useState(3600)
  const [isLive, setIsLive] = useState(false)
  const [currentNumbers, setCurrentNumbers] = useState<number[]>([])
  const [drawHistory, setDrawHistory] = useState([])
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [nextDrawNumber, setNextDrawNumber] = useState(6)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 0) {
          triggerNewDraw()
          return 3600 // Reset to 1 hour
        }
        return prev - 1
      })
    }, 1000)

    fetchDrawHistory()
    return () => clearInterval(timer)
  }, [])

  const fetchDrawHistory = async () => {
    try {
      const response = await fetch('/api/draw')
      const data = await response.json()
      if (data.success) {
        setDrawHistory(data.draws)
        setNextDrawNumber(data.nextDraw.drawNumber)
      }
    } catch (error) {
      console.error('Failed to fetch draw history:', error)
    }
  }

  const triggerNewDraw = async () => {
    setIsLive(true)
    setCurrentNumbers([])
    
    // Simulate drawing numbers one by one
    for (let i = 0; i < 7; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      if (i === 2) {
        setCurrentNumbers(prev => [...prev, -1]) // Dash for position 3
      } else {
        const newNumber = Math.floor(Math.random() * 10)
        setCurrentNumbers(prev => [...prev, newNumber])
        
        if (soundEnabled) {
          // Play sound effect (would need actual audio implementation)
          console.log('Play sound for number:', newNumber)
        }
      }
    }

    // Save the draw result
    try {
      const response = await fetch('/api/draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await response.json()
      if (data.success) {
        fetchDrawHistory() // Refresh history
      }
    } catch (error) {
      console.error('Failed to save draw:', error)
    }

    setTimeout(() => {
      setIsLive(false)
    }, 5000)
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const formatNumber = (num: number) => {
    return num === -1 ? '-' : num.toString()
  }

  const getNumberColor = (index: number) => {
    if (currentNumbers[index] === -1) return 'bg-white/20'
    return 'bg-gradient-to-br from-red-500 to-red-600 text-white'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-slate-900 to-red-900 overflow-x-hidden">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="w-full max-w-screen-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between overflow-x-hidden">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                className="text-white/80 hover:text-white"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Button>
              <h1 className="text-2xl font-bold text-white">Live Draw Result</h1>
              <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/40">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-red-400 animate-pulse' : 'bg-green-400'}`} />
                  <span>{isLive ? 'LIVE' : 'READY'}</span>
                </div>
              </Badge>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="text-white/80 hover:text-white"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchDrawHistory}
                className="text-white/80 hover:text-white"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-screen-2xl mx-auto px-4 py-8">
        {/* Live Draw Section */}
        <div className="text-center mb-12">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-white mb-4">
                Hasil undian terpercaya dengan sistem kriptografi
              </h2>
              <p className="text-white/60 text-lg">
                Draw #{nextDrawNumber} • {new Date().toLocaleDateString('id-ID', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>

            {/* Countdown Timer */}
            {!isLive && (
              <div className="mb-12">
                <div className="text-white/60 mb-4 text-xl">Next Draw In:</div>
                <div className="text-7xl font-bold text-yellow-400 mb-8 font-mono">
                  {formatTime(countdown)}
                </div>
                <Button 
                  onClick={triggerNewDraw}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Draw Now
                </Button>
              </div>
            )}

            {/* Live Draw Display */}
            {isLive && (
              <div className="mb-12">
                <div className="text-white/60 mb-6 text-xl animate-pulse">
                  Drawing Numbers...
                </div>
                <div className="flex justify-center items-center space-x-4 mb-8">
                  {Array.from({ length: 7 }, (_, i) => (
                    <div
                      key={i}
                      className={`w-20 h-20 rounded-xl flex items-center justify-center text-4xl font-bold transition-all duration-500 transform ${
                        currentNumbers[i] !== undefined 
                          ? `${getNumberColor(i)} scale-110` 
                          : 'bg-white/10 scale-100'
                      }`}
                    >
                      {currentNumbers[i] !== undefined ? formatNumber(currentNumbers[i]) : '?'}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Last Result */}
            {currentNumbers.length === 7 && !isLive && (
              <div className="mb-12">
                <div className="text-white/60 mb-6 text-xl">Last Result:</div>
                <div className="flex justify-center items-center space-x-4 mb-8">
                  {currentNumbers.map((num, idx) => (
                    <div
                      key={idx}
                      className={`w-20 h-20 rounded-xl flex items-center justify-center text-4xl font-bold ${getNumberColor(idx)}`}
                    >
                      {formatNumber(num)}
                    </div>
                  ))}
                </div>
                <div className="text-white/80">
                  <p className="text-lg mb-2">Winning Logic:</p>
                  <div className="flex justify-center space-x-8 text-sm">
                    <span>2D: Last 2 digits</span>
                    <span>3D: Last 3 digits</span>
                    <span>4D: Last 4 digits</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Draw History */}
        <div className="max-w-6xl mx-auto">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span>Recent Draw History</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                {drawHistory.map((draw: any) => (
                  <div key={draw.id} className="bg-black/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white/60 text-sm">Draw #{draw.id}</span>
                      <span className="text-white/80 text-xs">{draw.time}</span>
                    </div>
                    <div className="flex space-x-1 justify-center mb-3">
                      {draw.numbers.map((num: any, idx: number) => (
                        <div
                          key={idx}
                          className={`w-8 h-8 rounded flex items-center justify-center text-sm font-bold ${
                            num === '-' 
                              ? 'bg-white/10' 
                              : 'bg-gradient-to-br from-red-500 to-red-600 text-white'
                          }`}
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                    <div className="text-center text-white/60 text-xs">
                      {draw.date}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rules and Information */}
        <div className="max-w-4xl mx-auto mt-12">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white">How to Play</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                <div className="text-center">
                  <div className="w-12 h-12 bg-yellow-500 text-black rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-3">
                    2D
                  </div>
                  <h4 className="text-white font-semibold mb-2">2D Betting</h4>
                  <p className="text-white/60 text-sm">
                    Match the last 2 digits of the draw result
                  </p>
                  <p className="text-yellow-400 font-semibold mt-2">Prize: x70</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-yellow-500 text-black rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-3">
                    3D
                  </div>
                  <h4 className="text-white font-semibold mb-2">3D Betting</h4>
                  <p className="text-white/60 text-sm">
                    Match the last 3 digits of the draw result
                  </p>
                  <p className="text-yellow-400 font-semibold mt-2">Prize: x400</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-yellow-500 text-black rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-3">
                    4D
                  </div>
                  <h4 className="text-white font-semibold mb-2">4D Betting</h4>
                  <p className="text-white/60 text-sm">
                    Match the last 4 digits of the draw result
                  </p>
                  <p className="text-yellow-400 font-semibold mt-2">Prize: x3000</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}