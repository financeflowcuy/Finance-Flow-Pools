'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Trophy, Clock, Shield, RefreshCw, Eye } from 'lucide-react'

export default function LiveDrawPage() {
  const [latestResult, setLatestResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [timeUntilNext, setTimeUntilNext] = useState(300)
  const [showVerification, setShowVerification] = useState(false)

  useEffect(() => {
    fetchLatestResult()
    const timer = setInterval(() => {
      setTimeUntilNext(prev => prev > 0 ? prev - 1 : 300)
      fetchLatestResult()
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const fetchLatestResult = async () => {
    try {
      const response = await fetch('/api/lottery/draw')
      const data = await response.json()
      if (data.success) {
        setLatestResult(data.result)
      }
    } catch (error) {
      console.error('Failed to fetch latest result:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const generateNewDraw = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/lottery/draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ betType: '4D' })
      })
      const data = await response.json()
      if (data.success) {
        setLatestResult(data.result)
        setTimeUntilNext(300)
      }
    } catch (error) {
      console.error('Failed to generate draw:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 to-red-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Button 
            variant="outline" 
            className="mb-4 text-white border-white hover:bg-red-700"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-12 h-12 text-yellow-400" />
            <h1 className="text-5xl font-bold text-white">Live Draw Result</h1>
            <Trophy className="w-12 h-12 text-yellow-400" />
          </div>
          
          <p className="text-red-100 text-lg">
            Hasil undian terpercaya dengan sistem kriptografi
          </p>
          
          <div className="flex justify-center gap-4 mt-4">
            <Badge className="bg-yellow-500 text-white">
              <Clock className="w-4 h-4 mr-1" />
              Next: {formatTime(timeUntilNext)}
            </Badge>
            <Badge className="bg-green-500 text-white">
              <Shield className="w-4 h-4 mr-1" />
              Verified
            </Badge>
          </div>
        </div>

        {/* Main Result Display */}
        <Card className="max-w-4xl mx-auto mb-8 bg-white/95 backdrop-blur">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-red-800">
              {latestResult ? 'Hasil Undian Terbaru' : 'Menunggu Hasil...'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Memuat hasil undian...</p>
              </div>
            ) : latestResult ? (
              <div className="space-y-6">
                {/* Numbers Display */}
                <div className="flex justify-center gap-4 py-8">
                  {latestResult.numbers.map((num: number, idx: number) => (
                    <div 
                      key={idx} 
                      className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-700 text-white rounded-xl flex items-center justify-center text-3xl font-bold shadow-lg transform hover:scale-105 transition-transform"
                    >
                      {num}
                    </div>
                  ))}
                </div>

                {/* Draw Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="text-sm text-gray-600">Jenis Undian</div>
                    <div className="text-lg font-semibold text-red-800">{latestResult.betType}</div>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="text-sm text-gray-600">Waktu Undian</div>
                    <div className="text-lg font-semibold text-red-800">
                      {new Date(latestResult.drawTime).toLocaleTimeString('id-ID')}
                    </div>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="text-sm text-gray-600">ID Undian</div>
                    <div className="text-lg font-semibold text-red-800">
                      {latestResult.id.substring(0, 8)}...
                    </div>
                  </div>
                </div>

                {/* Verification Section */}
                <div className="border-t pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-red-800">Informasi Verifikasi</h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowVerification(!showVerification)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {showVerification ? 'Sembunyikan' : 'Tampilkan'} Detail
                    </Button>
                  </div>
                  
                  {showVerification && (
                    <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Seed Hash:</span>
                        <code className="block text-xs bg-white p-2 rounded border break-all">
                          {latestResult.seedHash}
                        </code>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Public Key:</span>
                        <code className="block text-xs bg-white p-2 rounded border break-all">
                          {latestResult.publicKey}
                        </code>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Signature:</span>
                        <code className="block text-xs bg-white p-2 rounded border break-all">
                          {latestResult.signature}
                        </code>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4 pt-4">
                  <Button 
                    onClick={generateNewDraw}
                    disabled={loading}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Generate New Draw
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => window.open('/security', '_blank')}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Verifikasi Hasil
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">Belum ada hasil undian</p>
                <Button 
                  onClick={generateNewDraw}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Mulai Undian Pertama
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Results */}
        <Card className="max-w-4xl mx-auto bg-white/95 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-red-800">Cara Verifikasi Hasil</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-2">
                  1
                </div>
                <h4 className="font-semibold text-blue-800">Salin Data</h4>
                <p className="text-sm text-gray-600">Salin seed hash, signature, dan public key dari hasil</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-2">
                  2
                </div>
                <h4 className="font-semibold text-green-800">Verifikasi</h4>
                <p className="text-sm text-gray-600">Gunakan halaman security untuk verifikasi keaslian</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-2">
                  3
                </div>
                <h4 className="font-semibold text-purple-800">Konfirmasi</h4>
                <p className="text-sm text-gray-600">Pastikan hasil terverifikasi dan adil</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}