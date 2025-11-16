'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  uptime: number; // in seconds
  services: {
    api: {
      status: 'up' | 'down';
      responseTime: number;
      lastCheck: string;
    };
    database: {
      status: 'up' | 'down';
      connections: number;
      maxConnections: number;
      lastCheck: string;
    };
    storage: {
      status: 'up' | 'down';
      usedSpace: number;
      totalSpace: number;
      lastCheck: string;
    };
    cache: {
      status: 'up' | 'down';
      hitRate: number;
      memoryUsage: number;
      lastCheck: string;
    };
  };
  metrics: {
    requestsPerMinute: number;
    activeUsers: number;
    errorRate: number;
    averageResponseTime: number;
  };
  errors: Array<{
    timestamp: string;
    type: string;
    message: string;
    count: number;
  }>;
}

export default function SystemHealthPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadSystemHealth();

    if (autoRefresh) {
      const interval = setInterval(loadSystemHealth, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadSystemHealth = async () => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      // Fetch data from multiple health endpoints in parallel
      const [healthResponse, servicesResponse, metricsResponse, errorsResponse] = await Promise.all([
        api.getHealth(),
        api.getHealthServices(token),
        api.getHealthMetrics(),
        api.getHealthErrors(token, { limit: '10' }),
      ]) as any[];

      const healthData: SystemHealth = {
        status: healthResponse.status || 'healthy',
        uptime: healthResponse.uptime || 0,
        services: {
          api: {
            status: servicesResponse?.api?.status || 'up',
            responseTime: servicesResponse?.api?.responseTime || 0,
            lastCheck: servicesResponse?.api?.lastCheck || new Date().toISOString(),
          },
          database: {
            status: servicesResponse?.database?.status || 'up',
            connections: servicesResponse?.database?.connections || 0,
            maxConnections: servicesResponse?.database?.maxConnections || 100,
            lastCheck: servicesResponse?.database?.lastCheck || new Date().toISOString(),
          },
          storage: {
            status: servicesResponse?.storage?.status || 'up',
            usedSpace: servicesResponse?.storage?.usedSpace || 0,
            totalSpace: servicesResponse?.storage?.totalSpace || 1000,
            lastCheck: servicesResponse?.storage?.lastCheck || new Date().toISOString(),
          },
          cache: {
            status: servicesResponse?.cache?.status || 'up',
            hitRate: servicesResponse?.cache?.hitRate || 0,
            memoryUsage: servicesResponse?.cache?.memoryUsage || 0,
            lastCheck: servicesResponse?.cache?.lastCheck || new Date().toISOString(),
          },
        },
        metrics: {
          requestsPerMinute: metricsResponse?.requestsPerMinute || 0,
          activeUsers: metricsResponse?.activeUsers || 0,
          errorRate: metricsResponse?.errorRate || 0,
          averageResponseTime: metricsResponse?.averageResponseTime || 0,
        },
        errors: errorsResponse?.data || [],
      };

      setHealth(healthData);
    } catch (error) {
      console.error('Error loading system health:', error);
      // Set default values on error
      setHealth({
        status: 'down',
        uptime: 0,
        services: {
          api: { status: 'down', responseTime: 0, lastCheck: new Date().toISOString() },
          database: { status: 'down', connections: 0, maxConnections: 100, lastCheck: new Date().toISOString() },
          storage: { status: 'down', usedSpace: 0, totalSpace: 1000, lastCheck: new Date().toISOString() },
          cache: { status: 'down', hitRate: 0, memoryUsage: 0, lastCheck: new Date().toISOString() },
        },
        metrics: {
          requestsPerMinute: 0,
          activeUsers: 0,
          errorRate: 0,
          averageResponseTime: 0,
        },
        errors: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    if (status === 'healthy' || status === 'up') return 'success';
    if (status === 'degraded') return 'warning';
    return 'danger';
  };

  if (loading || !health) {
    return (
      <Container className="py-12">
        <div className="text-center">Yuklanmoqda...</div>
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-dark mb-2">Sistema holati</h1>
            <p className="text-lg text-dark/60">Real vaqt monitoring va diagnostika</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-dark">Avtomatik yangilash (30s)</span>
            </label>
            <Button onClick={loadSystemHealth}>Yangilash</Button>
          </div>
        </div>

        {/* Overall Status */}
        <Card className={`mb-8 ${
          health.status === 'healthy'
            ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
            : health.status === 'degraded'
            ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200'
            : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-dark mb-2">Sistema holati</h2>
              <div className="flex items-center gap-4">
                <Badge variant={getStatusColor(health.status)}>
                  {health.status === 'healthy'
                    ? '✓ Faol'
                    : health.status === 'degraded'
                    ? '⚠ Sekinlashtirilgan'
                    : '✗ Ishlamayapti'}
                </Badge>
                <span className="text-dark/70">Uptime: {formatUptime(health.uptime)}</span>
              </div>
            </div>
            <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl ${
              health.status === 'healthy'
                ? 'bg-green-500 text-white'
                : health.status === 'degraded'
                ? 'bg-yellow-500 text-white'
                : 'bg-red-500 text-white'
            }`}>
              {health.status === 'healthy' ? '✓' : health.status === 'degraded' ? '⚠' : '✗'}
            </div>
          </div>
        </Card>

        {/* Services Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* API Service */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-dark">API Service</h3>
              <Badge variant={getStatusColor(health.services.api.status)}>
                {health.services.api.status === 'up' ? 'Faol' : 'Ishlamayapti'}
              </Badge>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-dark/60">Javob vaqti:</span>
                <span className="font-semibold">{health.services.api.responseTime}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark/60">Oxirgi tekshiruv:</span>
                <span className="font-semibold">
                  {new Date(health.services.api.lastCheck).toLocaleTimeString('uz-UZ')}
                </span>
              </div>
            </div>
          </Card>

          {/* Database */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-dark">Ma'lumotlar bazasi</h3>
              <Badge variant={getStatusColor(health.services.database.status)}>
                {health.services.database.status === 'up' ? 'Faol' : 'Ishlamayapti'}
              </Badge>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-dark/60">Ulanishlar:</span>
                <span className="font-semibold">
                  {health.services.database.connections}/{health.services.database.maxConnections}
                </span>
              </div>
              <div className="w-full bg-lavender-100 rounded-full h-2">
                <div
                  className="bg-brand h-2 rounded-full"
                  style={{
                    width: `${(health.services.database.connections / health.services.database.maxConnections) * 100}%`,
                  }}
                />
              </div>
            </div>
          </Card>

          {/* Storage */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-dark">Saqlash</h3>
              <Badge variant={getStatusColor(health.services.storage.status)}>
                {health.services.storage.status === 'up' ? 'Faol' : 'Ishlamayapti'}
              </Badge>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-dark/60">Ishlatilgan:</span>
                <span className="font-semibold">
                  {health.services.storage.usedSpace}GB / {health.services.storage.totalSpace}GB
                </span>
              </div>
              <div className="w-full bg-lavender-100 rounded-full h-2">
                <div
                  className="bg-brand h-2 rounded-full"
                  style={{
                    width: `${(health.services.storage.usedSpace / health.services.storage.totalSpace) * 100}%`,
                  }}
                />
              </div>
            </div>
          </Card>

          {/* Cache */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-dark">Kesh</h3>
              <Badge variant={getStatusColor(health.services.cache.status)}>
                {health.services.cache.status === 'up' ? 'Faol' : 'Ishlamayapti'}
              </Badge>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-dark/60">Hit Rate:</span>
                <span className="font-semibold">{health.services.cache.hitRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark/60">Xotira:</span>
                <span className="font-semibold">{health.services.cache.memoryUsage}%</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Real-time Metrics */}
        <Card className="mb-8">
          <h2 className="text-2xl font-bold text-dark mb-6">Real vaqt ko'rsatkichlar</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-dark/60 mb-2">So'rovlar (daqiqada)</p>
              <h3 className="text-3xl font-bold text-brand">
                {health.metrics.requestsPerMinute.toLocaleString()}
              </h3>
            </div>
            <div>
              <p className="text-sm text-dark/60 mb-2">Faol foydalanuvchilar</p>
              <h3 className="text-3xl font-bold text-green-600">
                {health.metrics.activeUsers.toLocaleString()}
              </h3>
            </div>
            <div>
              <p className="text-sm text-dark/60 mb-2">Xatoliklar darajasi</p>
              <h3 className="text-3xl font-bold text-orange-600">{health.metrics.errorRate}%</h3>
            </div>
            <div>
              <p className="text-sm text-dark/60 mb-2">O'rtacha javob</p>
              <h3 className="text-3xl font-bold text-blue-600">
                {health.metrics.averageResponseTime}ms
              </h3>
            </div>
          </div>
        </Card>

        {/* Recent Errors */}
        <Card>
          <h2 className="text-2xl font-bold text-dark mb-6">So'nggi xatoliklar</h2>
          {health.errors.length === 0 ? (
            <div className="text-center py-8 text-dark/60">
              ✓ Xatoliklar yo'q
            </div>
          ) : (
            <div className="space-y-4">
              {health.errors.map((error, index) => (
                <div
                  key={index}
                  className="p-4 bg-red-50 border border-red-200 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="danger">{error.type}</Badge>
                        <span className="text-sm text-dark/60">
                          {new Date(error.timestamp).toLocaleString('uz-UZ')}
                        </span>
                      </div>
                      <p className="text-dark">{error.message}</p>
                    </div>
                    <Badge variant="outline">{error.count}x</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </Container>
  );
}
