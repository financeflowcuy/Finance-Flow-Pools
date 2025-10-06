'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  TrendingUp, 
  Clock, 
  Users, 
  Shield, 
  History, 
  Lock,
  Play,
  Trophy,
  Gift,
  Star,
  Zap,
  Eye,
  ChevronRight,
  UserPlus,
  LogIn,
  Crown
} from 'lucide-react'

export default function BatikPoolsLanding() {
  const [lastResults, setLastResults] = useState([
    { draw: 5, numbers: [8, 2, 4, 9, 0, 1], time: '6/10/2025 02:32:06' },
    { draw: 4, numbers: [3, 7, 1, 5, 9, 2], time: '6/10/2025 01:57:06' },
    { draw: 3, numbers: [6, 4, 8, 0, 3, 7], time: '6/10/2025 01:32:06' }
  ])
  const [nextDrawTime, setNextDrawTime] = useState(3600)
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setNextDrawTime(prev => prev > 0 ? prev - 1 : 3600)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Keamanan Terjamin",
      description: "Sistem kriptografi modern untuk fair play 100%"
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Hadiah Terbesar",
      description: "Total hadiah miliaran rupiah setiap bulannya"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Draw Cepat",
      description: "Setiap 30 menit, non-stop 24/7"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Jutaan Member",
      description: "Bergabung dengan jutaan pemenang lainnya"
    }
  ]

  const promotions = [
    {
      title: "Bonus New Member 100%",
      description: "Deposit pertama langsung dapat 2x lipat!",
      color: "bg-gradient-to-r from-green-500 to-green-600",
      icon: <Gift className="w-6 h-6" />
    },
    {
      title: "Cashback 10%",
      description: "Kekalahan dibayar kembali setiap minggu",
      color: "bg-gradient-to-r from-blue-500 to-blue-600", 
      icon: <TrendingUp className="w-6 h-6" />
    },
    {
      title: "Referral 1%",
      description: "Dapat komisi seumur hidup dari referal",
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
      icon: <Users className="w-6 h-6" />
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900">
      {/* Navigation */}
      <nav className="bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-yellow-500 rounded-lg flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Batik Pools</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <a href="#live" className="text-white/80 hover:text-white transition">Live Draw</a>
              <a href="#history" className="text-white/80 hover:text-white transition">History</a>
              <a href="#promo" className="text-white/80 hover:text-white transition">Promo</a>
              <a href="#about" className="text-white/80 hover:text-white transition">Tentang</a>
            </div>

            <div className="flex items-center space-x-3">
              <Dialog open={showLogin} onOpenChange={setShowLogin}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-white/40 text-white hover:bg-white/20 hover:text-white bg-white/10">
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-white/20 text-white">
                  <DialogHeader>
                    <DialogTitle>Login ke Akun Anda</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" className="bg-slate-700 border-white/20" placeholder="Masukkan username" />
                    </div>
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" type="password" className="bg-slate-700 border-white/20" placeholder="Masukkan password" />
                    </div>
                    <Button className="w-full bg-red-600 hover:bg-red-700">
                      Login
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showRegister} onOpenChange={setShowRegister}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Daftar
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-white/20 text-white">
                  <DialogHeader>
                    <DialogTitle>Daftar Akun Baru</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="reg-username">Username</Label>
                      <Input id="reg-username" className="bg-slate-700 border-white/20" placeholder="Pilih username" />
                    </div>
                    <div>
                      <Label htmlFor="reg-email">Email</Label>
                      <Input id="reg-email" type="email" className="bg-slate-700 border-white/20" placeholder="Email aktif" />
                    </div>
                    <div>
                      <Label htmlFor="reg-password">Password</Label>
                      <Input id="reg-password" type="password" className="bg-slate-700 border-white/20" placeholder="Buat password" />
                    </div>
                    <Button className="w-full bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700">
                      Daftar Sekarang
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-yellow-600/20"></div>
        <div className="container mx-auto text-center relative z-10">
          <Badge className="mb-4 bg-yellow-500 text-black">
            <Star className="w-4 h-4 mr-1" />
            #1 Lottery System Indonesia
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Batik Pools
            <span className="block text-3xl md:text-4xl text-yellow-400 mt-2">
              Lottery System Terpercaya
            </span>
          </h1>
          
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            System kriptografi modern, pembayaran instant, dan jutaan pemenang setiap hari. 
            Bergabung sekarang dan raih kemenangan Anda!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700 text-lg px-8 py-4"
              onClick={() => setShowRegister(true)}
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Daftar & Dapat Bonus 100%
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white/40 text-white hover:bg-white/20 hover:text-white bg-white/10 text-lg px-8 py-4 font-semibold"
              onClick={() => setShowLogin(true)}
            >
              <LogIn className="w-5 h-5 mr-2" />
              Login
            </Button>
          </div>

          <div className="flex justify-center space-x-8 text-white/60">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">10M+</div>
              <div>Total Member</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">Rp 50T+</div>
              <div>Total Hadiah</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">24/7</div>
              <div>Live Draw</div>
            </div>
          </div>
        </div>
      </section>

      {/* Next Live Draw */}
      <section className="py-12 px-4 bg-black/30">
        <div className="container mx-auto">
          <Card className="bg-gradient-to-r from-red-600/20 to-yellow-600/20 border-white/20 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-yellow-400 mr-3" />
                <h2 className="text-3xl font-bold text-white">Next Live Draw</h2>
              </div>
              <div className="text-6xl font-bold text-yellow-400 mb-4">
                {formatTime(nextDrawTime)}
              </div>
              <p className="text-white/80 mb-6">Draw berikutnya akan dimulai dalam</p>
              <Button 
                size="lg"
                className="bg-red-600 hover:bg-red-700"
                onClick={() => window.open('/live_draw', '_blank')}
              >
                <Play className="w-5 h-5 mr-2" />
                Tonton Live Draw
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Live Results */}
      <section id="history" className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Hasil Live Draw Terakhir</h2>
            <p className="text-white/80">Transparansi dan kejujuran adalah prioritas kami</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {lastResults.map((result, idx) => (
              <Card key={idx} className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <CardTitle className="text-white flex items-center justify-center">
                    <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                    Draw #{result.draw}
                  </CardTitle>
                  <p className="text-white/60 text-sm">{result.time}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center gap-2">
                    {result.numbers.map((num, numIdx) => (
                      <div 
                        key={numIdx} 
                        className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 text-black rounded-lg flex items-center justify-center font-bold"
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button 
              variant="outline" 
              className="border-white/40 text-white hover:bg-white/20 hover:text-white bg-white/10 font-semibold"
              onClick={() => window.open('/live_draw', '_blank')}
            >
              <Eye className="w-4 h-4 mr-2" />
              Lihat Semua History
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-black/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Mengapa Memilih Batik Pools?</h2>
            <p className="text-white/80">Platform terpercaya dengan fitur terlengkap</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <Card key={idx} className="bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/15 transition">
                <CardContent className="p-6 text-center">
                  <div className="text-yellow-400 mb-4 flex justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-white/70 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Promotions */}
      <section id="promo" className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Promo & Bonus Menarik</h2>
            <p className="text-white/80">Berbagai bonus menanti Anda setiap hari</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {promotions.map((promo, idx) => (
              <Card key={idx} className={`${promo.color} border-0`}>
                <CardContent className="p-6 text-center">
                  <div className="text-white mb-4 flex justify-center">
                    {promo.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{promo.title}</h3>
                  <p className="text-white/90 text-sm mb-4">{promo.description}</p>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => setShowRegister(true)}
                  >
                    Klaim Sekarang
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-red-600 to-yellow-600">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Siap Menang Hari Ini?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Daftar sekarang dan dapatkan bonus new member 100%
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="bg-white text-red-600 hover:bg-gray-100 text-lg px-8 py-4"
            onClick={() => setShowRegister(true)}
          >
            <Crown className="w-5 h-5 mr-2" />
            Daftar & Menang Sekarang
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/50 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-yellow-500 rounded-lg flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">Batik Pools</span>
              </div>
              <p className="text-white/60 text-sm">
                Lottery system terpercaya dengan sistem kriptografi modern
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-2 text-white/60 text-sm">
                <li><a href="#live" className="hover:text-white transition">Live Draw</a></li>
                <li><a href="#history" className="hover:text-white transition">History</a></li>
                <li><a href="#promo" className="hover:text-white transition">Promo</a></li>
                <li><a href="/dashboard_user" className="hover:text-white transition">Dashboard</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-white/60 text-sm">
                <li><a href="#" className="hover:text-white transition">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                <li><a href="#" className="hover:text-white transition">Terms & Conditions</a></li>
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-3">Contact</h4>
              <ul className="space-y-2 text-white/60 text-sm">
                <li>support@batikpools.com</li>
                <li>+62 812-3456-7890</li>
                <li>24/7 Online Support</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/20 pt-8 text-center text-white/60 text-sm">
            <p>&copy; 2025 Batik Pools. All rights reserved. | Bermain dengan bertanggung jawab</p>
          </div>
        </div>
      </footer>
    </div>
  )
}