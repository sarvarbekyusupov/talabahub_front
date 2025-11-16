'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';

interface HealthCheck {
  status: string;
  info?: any;
  error?: any;
  details?: any;
}

interface SystemMetrics {
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  cpu: {
    user: number;
    system: number;
  };
  uptime: number;
  platform: string;
  nodeVersion: string;
}

export default function HealthMonitorPage() {
  const router = useRouter();
  const [health, setHealth] = useState<HealthCheck | null>(null);
  const [readiness, setReadiness] = useState<HealthCheck | null>(null);
  const [liveness, setLiveness] = useState<HealthCheck | null>(null);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }
    loadHealthData();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadHealthData();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const loadHealthData = async () => {
    setLoading(true);
    try {
      const [healthData, readyData, liveData, metricsData] = await Promise.all([
        api.getHealth() as Promise<HealthCheck>,
        api.getHealthReady() as Promise<HealthCheck>,
        api.getHealthLive() as Promise<HealthCheck>,
        api.getHealthMetrics() as Promise<SystemMetrics>,
      ]);

      setHealth(healthData);
      setReadiness(readyData);
      setLiveness(liveData);
      setMetrics(metricsData);
    } catch (error) {
      console.error('Error loading health data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ok':
        return <Badge variant="success">Ishlayapti</Badge>;
      case 'error':
        return <Badge variant="danger">Xatolik</Badge>;
      case 'shutting_down':
        return <Badge variant="warning">O'chmoqda</Badge>;
      default:
        return <Badge variant="info">{status}</Badge>;
    }
  };

  return (
    <Container className="py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tizim Monitoringi</h1>
          <p className="text-gray-600 mt-1">Backend tizim holati va metrikalar</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-700">Avtomatik yangilanish (10s)</span>
          </label>
          <Button onClick={loadHealthData} disabled={loading}>
            {loading ? 'Yuklanmoqda...' : 'Yangilash'}
          </Button>
          <Link href="/admin/dashboard">
            <Button variant="outline">Orqaga</Button>
          </Link>
        </div>
      </div>

      {/* Health Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Overall Health */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Umumiy Holat</h3>
            {health && getStatusBadge(health.status)}
          </div>
          <div className="space-y-2">
            {health?.details && Object.keys(health.details).map((key) => (
              <div key={key} className="flex items-center justify-between text-sm">
                <span className="text-gray-600 capitalize">{key}:</span>
                <span className={`font-medium ${
                  health.details[key].status === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {health.details[key].status}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Readiness */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Tayyorlik (Readiness)</h3>
            {readiness && getStatusBadge(readiness.status)}
          </div>
          <p className="text-sm text-gray-600">
            Ma'lumotlar bazasi ulanishi va barcha kerakli xizmatlar tayyorligi
          </p>
        </Card>

        {/* Liveness */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Jonlilik (Liveness)</h3>
            {liveness && getStatusBadge(liveness.status)}
          </div>
          <p className="text-sm text-gray-600">
            Server ishlab turganligini tekshirish
          </p>
        </Card>
      </div>

      {/* System Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Memory Usage */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Xotira Foydalanishi</h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">RSS (Resident Set Size):</span>
                  <span className="font-semibold">{formatBytes(metrics.memory.rss)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(metrics.memory.rss / (300 * 1024 * 1024)) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Heap Used:</span>
                  <span className="font-semibold">{formatBytes(metrics.memory.heapUsed)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${(metrics.memory.heapUsed / metrics.memory.heapTotal) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Heap Total:</span>
                  <span className="font-semibold">{formatBytes(metrics.memory.heapTotal)}</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">External:</span>
                  <span className="font-semibold">{formatBytes(metrics.memory.external)}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* System Info */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tizim Ma'lumotlari</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Uptime:</span>
                <span className="font-semibold">{formatUptime(metrics.uptime)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Platform:</span>
                <span className="font-semibold capitalize">{metrics.platform}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Node.js Version:</span>
                <span className="font-semibold">{metrics.nodeVersion}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">CPU User Time:</span>
                <span className="font-semibold">{(metrics.cpu.user / 1000000).toFixed(2)}s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">CPU System Time:</span>
                <span className="font-semibold">{(metrics.cpu.system / 1000000).toFixed(2)}s</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Info */}
      <Card className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ma'lumot</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-600 mb-1">Health Check:</p>
            <p className="text-gray-900">Ma'lumotlar bazasi, xotira va disk bo'sh joyini tekshiradi</p>
          </div>
          <div>
            <p className="text-gray-600 mb-1">Readiness Probe:</p>
            <p className="text-gray-900">Kubernetes uchun - server trafikni qabul qilishga tayyormi</p>
          </div>
          <div>
            <p className="text-gray-600 mb-1">Liveness Probe:</p>
            <p className="text-gray-900">Kubernetes uchun - server ishlab turibmi</p>
          </div>
        </div>
      </Card>
    </Container>
  );
}
