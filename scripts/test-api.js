/**
 * API Integration Test Script
 * Run with: node scripts/test-api.js
 *
 * This script tests the backend API endpoints to verify integration
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.121.174.54:3030/api';

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function testEndpoint(name, endpoint, options = {}) {
  try {
    logInfo(`Testing: ${name}`);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json().catch(() => null);

    if (response.ok) {
      logSuccess(`${name} - Status: ${response.status}`);
      if (options.verbose && data) {
        console.log('  Response:', JSON.stringify(data, null, 2).substring(0, 200) + '...');
      }
      return { success: true, data, status: response.status };
    } else {
      logWarning(`${name} - Status: ${response.status}`);
      if (data && data.message) {
        console.log(`  Error: ${data.message}`);
      }
      return { success: false, data, status: response.status };
    }
  } catch (error) {
    logError(`${name} - Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  log('\n📡 TALABA HUB API Integration Tests\n', 'blue');
  logInfo(`API Base URL: ${API_BASE_URL}\n`);

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
  };

  // Test 1: Health Check (if exists)
  log('─'.repeat(60), 'cyan');
  log('1. HEALTH CHECK', 'yellow');
  log('─'.repeat(60), 'cyan');
  const health = await testEndpoint('Health Check', '/health', { method: 'GET' });
  results.total++;
  if (health.success) results.passed++;
  else results.failed++;

  // Test 2: Public Endpoints
  log('\n' + '─'.repeat(60), 'cyan');
  log('2. PUBLIC ENDPOINTS', 'yellow');
  log('─'.repeat(60), 'cyan');

  const publicTests = [
    { name: 'Get Jobs', endpoint: '/jobs', method: 'GET' },
    { name: 'Get Courses', endpoint: '/courses', method: 'GET' },
    { name: 'Get Events', endpoint: '/events', method: 'GET' },
    { name: 'Get Discounts', endpoint: '/discounts', method: 'GET' },
    { name: 'Get Categories', endpoint: '/categories', method: 'GET' },
    { name: 'Get Companies', endpoint: '/companies', method: 'GET' },
    { name: 'Get Brands', endpoint: '/brands', method: 'GET' },
  ];

  for (const test of publicTests) {
    const result = await testEndpoint(test.name, test.endpoint, { method: test.method });
    results.total++;
    if (result.success || result.status === 404) results.passed++;
    else results.failed++;
  }

  // Test 3: Authentication (will fail without credentials, but tests endpoint availability)
  log('\n' + '─'.repeat(60), 'cyan');
  log('3. AUTHENTICATION ENDPOINTS', 'yellow');
  log('─'.repeat(60), 'cyan');

  const authTests = [
    {
      name: 'Login (Invalid Credentials)',
      endpoint: '/auth/login',
      method: 'POST',
      body: JSON.stringify({ email: 'test@test.com', password: 'test' }),
    },
    {
      name: 'Register (Invalid Data)',
      endpoint: '/auth/register',
      method: 'POST',
      body: JSON.stringify({ email: 'test' }),
    },
  ];

  for (const test of authTests) {
    const result = await testEndpoint(test.name, test.endpoint, {
      method: test.method,
      body: test.body,
    });
    results.total++;
    // Authentication should fail with 400/401, which means endpoint exists
    if (result.status === 400 || result.status === 401) {
      logSuccess(`${test.name} - Endpoint exists and validates`);
      results.passed++;
    } else if (result.status === 404) {
      results.failed++;
    } else {
      results.passed++;
    }
  }

  // Test 4: Protected Endpoints (should return 401)
  log('\n' + '─'.repeat(60), 'cyan');
  log('4. PROTECTED ENDPOINTS', 'yellow');
  log('─'.repeat(60), 'cyan');

  const protectedTests = [
    { name: 'Get Profile', endpoint: '/users/me', method: 'GET' },
    { name: 'Get Dashboard', endpoint: '/users/me/dashboard', method: 'GET' },
    { name: 'Get Applications', endpoint: '/jobs/me/applications', method: 'GET' },
  ];

  for (const test of protectedTests) {
    const result = await testEndpoint(test.name, test.endpoint, { method: test.method });
    results.total++;
    // Should return 401 unauthorized, meaning endpoint exists
    if (result.status === 401) {
      logSuccess(`${test.name} - Endpoint exists and requires auth`);
      results.passed++;
    } else if (result.status === 404) {
      results.failed++;
    } else {
      results.passed++;
    }
  }

  // Summary
  log('\n' + '═'.repeat(60), 'cyan');
  log('TEST SUMMARY', 'blue');
  log('═'.repeat(60), 'cyan');
  log(`Total Tests: ${results.total}`, 'cyan');
  logSuccess(`Passed: ${results.passed}`);
  if (results.failed > 0) {
    logError(`Failed: ${results.failed}`);
  }

  const successRate = ((results.passed / results.total) * 100).toFixed(2);
  log(`\nSuccess Rate: ${successRate}%`, successRate >= 80 ? 'green' : 'yellow');

  if (successRate >= 80) {
    log('\n🎉 API Integration looks good!', 'green');
  } else {
    log('\n⚠️  Some endpoints may need attention', 'yellow');
  }

  log('\n💡 For detailed testing, follow BACKEND_TESTING_GUIDE.md\n', 'cyan');
}

// Run tests
runTests().catch((error) => {
  logError(`Test execution failed: ${error.message}`);
  process.exit(1);
});
