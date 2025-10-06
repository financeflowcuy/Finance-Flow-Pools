'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  CheckCircle,
  RefreshCw,
  Settings
} from 'lucide-react';

// Simple socket hook
const useSocket = () => {
  const [socket, setSocket] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    try {
      const socketInstance = (window as any).io?.({
        path: '/api/socketio',
        timeout: 20000,
      });

      if (socketInstance) {
        socketInstance.on('connect', () => {
          console.log('Socket connected');
          setIsConnected(true);
        });

        socketInstance.on('disconnect', () => {
          setIsConnected(false);
        });

        socketInstance.on('connect_error', () => {
          setIsConnected(false);
        });

        setSocket(socketInstance);
      }
    } catch (error) {
      console.log('Socket not available');
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  return { socket, isConnected };
};

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { socket, isConnected } = useSocket();

  const authHeaders = {
    'x-admin-key': adminKey
  };

  const handleLogin = async () => {
    if (!adminKey.trim()) {
      setError('Masukkan admin key');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/dashboard', {
        headers: authHeaders
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setIsAuthenticated(true);
          setDashboard(data.dashboard);
        } else {
          setError('Admin key tidak valid');
        }
      } else {
        setError('Admin key tidak valid');
      }
    } catch (error) {
      setError('Terjadi kesalahan saat login');
    } finally {
      setLoading(false);
    }
  };

  const refreshDashboard = async () => {
    try {
      const response = await fetch('/api/admin/dashboard', {
        headers: authHeaders
      });
      const data = await response.json();
      if (data.success) {
        setDashboard(data.dashboard);
      }
    } catch (error) {
      console.error('Failed to refresh dashboard:', error);
    }
  };

  const updateSetting = async (action: string, data: any) => {
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify({ action, data })
      })

      const result = await response.json()
      if (result.success) {
        alert('Balance fix completed successfully!')
        refreshDashboard()
      } else {
        alert('Error: ' + result.error)
      }
    } catch (error) {
      alert('Terjadi kesalahan saat memperbarui pengaturan')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold text-red-600">
              Batik Pools Admin
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Admin Key</label>
              <Input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Masukkan admin key"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}
            <Button 
              onClick={handleLogin} 
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Loading...' : 'Login'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-red-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Batik Pools Admin Management & Monitoring Panel</h1>
          <div className="flex items-center gap-2">
            <div className={`text-sm px-2 py-1 rounded ${isConnected ? 'bg-green-600' : 'bg-yellow-600'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshDashboard}
              className="text-white border-white hover:bg-red-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsAuthenticated(false)}
              className="text-white border-white hover:bg-red-700"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {/* Overview Cards */}
        {dashboard && dashboard.overview && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-xl font-bold">{dashboard.overview.totalUsers || 0}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Bets</p>
                    <p className="text-xl font-bold">{dashboard.overview.totalBets || 0}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Winnings</p>
                    <p className="text-xl font-bold">Rp {((dashboard.overview.totalWinnings || 0) / 1000000).toFixed(1)}M</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending Bets</p>
                    <p className="text-xl font-bold">{dashboard.overview.pendingBets || 0}</p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Completed Draws</p>
                    <p className="text-xl font-bold">{dashboard.overview.completedDraws || 0}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="bets">Bets</TabsTrigger>
            <TabsTrigger value="draws">Draws</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Today's Stats */}
              {dashboard?.todayStats && (
                <Card>
                  <CardHeader>
                    <CardTitle>Today's Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded">
                        <p className="text-2xl font-bold text-blue-600">{dashboard.todayStats.bets || 0}</p>
                        <p className="text-sm text-gray-600">Today's Bets</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded">
                        <p className="text-2xl font-bold text-green-600">Rp {((dashboard.todayStats.winnings || 0) / 1000).toFixed(0)}K</p>
                        <p className="text-sm text-gray-600">Today's Winnings</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded">
                        <p className="text-2xl font-bold text-purple-600">{dashboard.todayStats.newUsers || 0}</p>
                        <p className="text-sm text-gray-600">New Users</p>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded">
                        <p className="text-2xl font-bold text-orange-600">{dashboard.todayStats.draws || 0}</p>
                        <p className="text-sm text-gray-600">Draws Today</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Draws */}
              {dashboard?.recentDraws && Array.isArray(dashboard.recentDraws) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Draws</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {dashboard.recentDraws.length > 0 ? (
                        dashboard.recentDraws.map((draw: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <div className="flex gap-2">
                              {Array.isArray(draw.numbers) ? draw.numbers.map((num: number, i: number) => (
                                <div key={i} className="w-6 h-6 bg-red-600 text-white rounded text-xs flex items-center justify-center">
                                  {num}
                                </div>
                              )) : (
                                <span className="text-xs text-red-500">Invalid</span>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-600">{draw.betType}</div>
                              <div className="text-xs text-gray-500">
                                {draw.drawTime ? new Date(draw.drawTime).toLocaleTimeString('id-ID') : 'N/A'}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          No draws found
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Top Users by Balance</CardTitle>
                  <Button 
                    onClick={() => updateSetting('fixBalance', {})}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Fix Balance Issues
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {dashboard?.topUsers && Array.isArray(dashboard.topUsers) && dashboard.topUsers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">User</th>
                          <th className="text-left p-2">Balance</th>
                          <th className="text-left p-2">Member Since</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboard.topUsers.map((user: any, idx: number) => (
                          <tr key={idx} className="border-b hover:bg-gray-50">
                            <td className="p-2">
                              <div>
                                <div className="font-medium">{user.name || user.email}</div>
                                <div className="text-xs text-gray-600">{user.email}</div>
                              </div>
                            </td>
                            <td className="p-2 font-semibold">
                              Rp {user.balance.toLocaleString('id-ID')}
                            </td>
                            <td className="p-2 text-xs text-gray-600">
                              {user.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID') : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {dashboard ? 'No users found' : 'Loading users...'}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bets">
            <Card>
              <CardHeader>
                <CardTitle>Recent Bets</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboard?.recentBets && Array.isArray(dashboard.recentBets) && dashboard.recentBets.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">ID</th>
                          <th className="text-left p-2">User</th>
                          <th className="text-left p-2">Numbers</th>
                          <th className="text-left p-2">Type</th>
                          <th className="text-left p-2">Amount</th>
                          <th className="text-left p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboard.recentBets.map((bet: any, idx: number) => (
                          <tr key={idx} className="border-b hover:bg-gray-50">
                            <td className="p-2 text-xs">{bet.id.substring(0, 8)}...</td>
                            <td className="p-2">{bet.user}</td>
                            <td className="p-2">{bet.numbers}</td>
                            <td className="p-2">{bet.betType}</td>
                            <td className="p-2">Rp {bet.amount.toLocaleString('id-ID')}</td>
                            <td className="p-2">
                              <Badge variant={bet.status === 'won' ? 'default' : bet.status === 'lost' ? 'destructive' : 'secondary'}>
                                {bet.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {dashboard ? 'No bets found' : 'Loading bets...'}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="draws">
            <Card>
              <CardHeader>
                <CardTitle>Draw History</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboard?.recentDraws && Array.isArray(dashboard.recentDraws) && dashboard.recentDraws.length > 0 ? (
                  <div className="space-y-3">
                    {dashboard.recentDraws.map((draw: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <div className="flex gap-3">
                          {Array.isArray(draw.numbers) ? draw.numbers.map((num: number, i: number) => (
                            <div key={i} className="w-10 h-10 bg-red-600 text-white rounded-lg flex items-center justify-center font-bold">
                              {num}
                            </div>
                          )) : (
                            <span className="text-red-500">Invalid numbers</span>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{draw.betType}</div>
                          <div className="text-sm text-gray-600">
                            {draw.drawTime ? new Date(draw.drawTime).toLocaleString('id-ID') : 'N/A'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {dashboard ? 'No draws found' : 'Loading draws...'}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}