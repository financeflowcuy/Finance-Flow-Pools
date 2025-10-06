'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, CheckCircle, XCircle, Eye, EyeOff, Lock, Key, Fingerprint } from 'lucide-react'

export default function SecurityPage() {
  const [securityInfo, setSecurityInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showSeed, setShowSeed] = useState(false)
  const [verifyData, setVerifyData] = useState({
    seed: '',
    hash: '',
    numbers: '',
    signature: '',
    publicKey: ''
  })
  const [verificationResult, setVerificationResult] = useState<any>(null)

  useEffect(() => {
    fetchSecurityInfo()
  }, [])

  const fetchSecurityInfo = async () => {
    try {
      const response = await fetch('/api/lottery/verify')
      const data = await response.json()
      if (data.success) {
        setSecurityInfo(data.security)
      }
    } catch (error) {
      console.error('Failed to fetch security info:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    try {
      const response = await fetch('/api/lottery/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(verifyData)
      })

      const data = await response.json()
      setVerificationResult(data)
    } catch (error) {
      console.error('Verification error:', error)
      setVerificationResult({
        success: false,
        error: 'Verification failed'
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-yellow-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat informasi keamanan...</p>
        </div>
      </div>
    )
  }

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-yellow-50 to-orange-50 overflow-x-hidden">
      <div className="w-full max-w-screen-2xl mx-auto px-4 py-8">
=======
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-yellow-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
>>>>>>> b54ed963e42b18f24b0debb1a41952154db626e5
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-8 h-8 text-red-600" />
            <h1 className="text-3xl font-bold text-red-800">Keamanan & Verifikasi</h1>
          </div>
          <p className="text-gray-600">Sistem keamanan kriptografi Batik Pools</p>
        </div>

        {/* Security Overview */}
        <Card className="mb-6 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <Lock className="w-5 h-5" />
              Fitur Keamanan
            </CardTitle>
          </CardHeader>
          <CardContent>
            {securityInfo && (
              <div className="space-y-4">
<<<<<<< HEAD
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
=======
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
>>>>>>> b54ed963e42b18f24b0debb1a41952154db626e5
                  {securityInfo.features.map((feature: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <h3 className="font-semibold mb-3 text-red-800">Algoritma Keamanan</h3>
<<<<<<< HEAD
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                    {Object.entries(securityInfo.algorithms).map(([key, value]) => (
=======
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(securityInfo.algorithms).map(([key, value]: [string, string]) => (
>>>>>>> b54ed963e42b18f24b0debb1a41952154db626e5
                      <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
<<<<<<< HEAD
                        <Badge variant="secondary">{String(value)}</Badge>
=======
                        <Badge variant="secondary">{value}</Badge>
>>>>>>> b54ed963e42b18f24b0debb1a41952154db626e5
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Fingerprint className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-blue-800">Audit Keamanan</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Audit terakhir: {new Date(securityInfo.lastSecurityAudit).toLocaleString('id-ID')}
                  </p>
                  <p className="text-sm text-gray-600">
                    Audit berikutnya: {new Date(securityInfo.nextSecurityAudit).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Verification Tool */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <Key className="w-5 h-5" />
              Alat Verifikasi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Gunakan alat ini untuk memverifikasi keaslian dan keadilan hasil undian. 
                  Masukkan seed, hash, dan tanda tangan digital dari hasil undian.
                </AlertDescription>
              </Alert>

<<<<<<< HEAD
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
=======
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
>>>>>>> b54ed963e42b18f24b0debb1a41952154db626e5
                <div>
                  <label className="block text-sm font-medium mb-2">Seed (Rahasia)</label>
                  <div className="relative">
                    <Input
                      type={showSeed ? "text" : "password"}
                      value={verifyData.seed}
                      onChange={(e) => setVerifyData({...verifyData, seed: e.target.value})}
                      placeholder="Masukkan seed"
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowSeed(!showSeed)}
                    >
                      {showSeed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Hash (Publik)</label>
                  <Input
                    value={verifyData.hash}
                    onChange={(e) => setVerifyData({...verifyData, hash: e.target.value})}
                    placeholder="Masukkan hash seed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Nomor Undian</label>
                  <Input
                    value={verifyData.numbers}
                    onChange={(e) => setVerifyData({...verifyData, numbers: e.target.value})}
                    placeholder="Contoh: 1,2,3,4"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tanda Tangan Digital</label>
                  <Input
                    value={verifyData.signature}
                    onChange={(e) => setVerifyData({...verifyData, signature: e.target.value})}
                    placeholder="Masukkan tanda tangan"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Public Key</label>
                  <Input
                    value={verifyData.publicKey}
                    onChange={(e) => setVerifyData({...verifyData, publicKey: e.target.value})}
                    placeholder="Masukkan public key"
                  />
                </div>
              </div>

              <Button 
                onClick={handleVerify} 
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={!verifyData.hash || !verifyData.numbers}
              >
                Verifikasi
              </Button>

              {verificationResult && (
                <div className={`p-4 rounded-lg ${
                  verificationResult.success ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {verificationResult.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className={`font-semibold ${
                      verificationResult.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {verificationResult.success ? 'Verifikasi Berhasil' : 'Verifikasi Gagal'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {verificationResult.message || verificationResult.error}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="mt-6 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-800">Cara Kerja Sistem Keamanan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold">Generasi Seed Acak</h4>
                  <p className="text-sm text-gray-600">Setiap undian menggunakan seed acak yang dihasilkan dengan kriptografi aman.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold">Hash Publik</h4>
                  <p className="text-sm text-gray-600">Hash dari seed dipublikasikan sebelum undian untuk transparansi.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold">Tanda Tangan Digital</h4>
                  <p className="text-sm text-gray-600">Setiap hasil ditandatangani secara digital untuk mencegah pemalsuan.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h4 className="font-semibold">Verifikasi Independen</h4>
                  <p className="text-sm text-gray-600">Siapa pun dapat memverifikasi keaslian hasil menggunakan alat verifikasi.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}