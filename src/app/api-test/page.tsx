'use client';

import { useState } from 'react';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
  duration?: number;
}

export default function APITestPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);

  const tests = [
    {
      name: 'Get Jobs',
      test: async () => {
        const data = await api.getJobs({ page: 1, limit: 5 });
        return { success: true, message: `Found ${data?.data?.length || 0} jobs` };
      },
    },
    {
      name: 'Get Courses',
      test: async () => {
        const data = await api.getCourses({ page: 1, limit: 5 });
        return { success: true, message: `Found ${data?.data?.length || 0} courses` };
      },
    },
    {
      name: 'Get Events',
      test: async () => {
        const data = await api.getEvents({ page: 1, limit: 5 });
        return { success: true, message: `Found ${data?.data?.length || 0} events` };
      },
    },
    {
      name: 'Get Discounts',
      test: async () => {
        const data = await api.getDiscounts({ page: 1, limit: 5 });
        return { success: true, message: `Found ${data?.data?.length || 0} discounts` };
      },
    },
    {
      name: 'Get Categories',
      test: async () => {
        const data = await api.getCategories();
        return { success: true, message: `Found ${data?.length || 0} categories` };
      },
    },
    {
      name: 'Get Companies',
      test: async () => {
        const data = await api.getCompanies();
        return { success: true, message: `Found ${data?.data?.length || 0} companies` };
      },
    },
    {
      name: 'Get Brands',
      test: async () => {
        const data = await api.getBrands();
        return { success: true, message: `Found ${data?.data?.length || 0} brands` };
      },
    },
  ];

  const runTests = async () => {
    setTesting(true);
    const testResults: TestResult[] = [];

    for (const test of tests) {
      const startTime = Date.now();
      const result: TestResult = {
        name: test.name,
        status: 'pending',
      };

      try {
        const response = await test.test();
        const duration = Date.now() - startTime;
        result.status = 'success';
        result.message = response.message;
        result.duration = duration;
      } catch (error: any) {
        const duration = Date.now() - startTime;
        result.status = 'error';
        result.message = error.message || 'Unknown error';
        result.duration = duration;
      }

      testResults.push(result);
      setResults([...testResults]);
    }

    setTesting(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'pending':
        return '⏳';
      default:
        return '⚪';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const passedTests = results.filter((r) => r.status === 'success').length;
  const failedTests = results.filter((r) => r.status === 'error').length;
  const successRate = results.length > 0 ? ((passedTests / results.length) * 100).toFixed(2) : 0;

  return (
    <Container className="py-12">
      <Card>
        <h1 className="text-3xl font-bold text-dark mb-4">API Integration Test</h1>
        <p className="text-dark/60 mb-6">
          This page tests the backend API integration. Click the button below to run all tests.
        </p>

        <div className="mb-6">
          <Button onClick={runTests} disabled={testing} fullWidth>
            {testing ? 'Running Tests...' : 'Run API Tests'}
          </Button>
        </div>

        {results.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-blue-50">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{results.length}</div>
                  <div className="text-sm text-blue-800">Total Tests</div>
                </div>
              </Card>
              <Card className="bg-green-50">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{passedTests}</div>
                  <div className="text-sm text-green-800">Passed</div>
                </div>
              </Card>
              <Card className="bg-red-50">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{failedTests}</div>
                  <div className="text-sm text-red-800">Failed</div>
                </div>
              </Card>
            </div>

            <Card className={`mb-6 ${parseFloat(successRate.toString()) >= 80 ? 'bg-green-50' : 'bg-yellow-50'}`}>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">
                  {successRate}%
                </div>
                <div className="text-sm">Success Rate</div>
              </div>
            </Card>

            <div className="space-y-3">
              {results.map((result, index) => (
                <Card key={index} hover className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getStatusIcon(result.status)}</span>
                    <div>
                      <div className="font-semibold text-dark">{result.name}</div>
                      <div className={`text-sm ${getStatusColor(result.status)}`}>
                        {result.message}
                      </div>
                    </div>
                  </div>
                  {result.duration && (
                    <div className="text-sm text-dark/60">{result.duration}ms</div>
                  )}
                </Card>
              ))}
            </div>

            {parseFloat(successRate.toString()) >= 80 ? (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-2 text-green-800">
                  <span className="text-2xl">🎉</span>
                  <div>
                    <div className="font-semibold">API Integration Looks Good!</div>
                    <div className="text-sm">
                      Most endpoints are working correctly. You can proceed with testing individual features.
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="flex items-center gap-2 text-yellow-800">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <div className="font-semibold">Some Issues Detected</div>
                    <div className="text-sm">
                      Some endpoints may need attention. Check the backend API or network connection.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="text-sm text-blue-800">
            <strong>💡 Tip:</strong> For detailed testing instructions, see{' '}
            <code className="bg-blue-100 px-2 py-1 rounded">BACKEND_TESTING_GUIDE.md</code>
          </div>
        </div>
      </Card>
    </Container>
  );
}
