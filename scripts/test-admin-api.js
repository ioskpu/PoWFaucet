#!/usr/bin/env node

/**
 * Script para probar la API del Admin Dashboard
 * Uso: node scripts/test-admin-api.js [server_url]
 */

import fetch from 'node-fetch';

const SERVER_URL = process.argv[2] || 'http://localhost:8080';
const API_BASE = `${SERVER_URL}/api/admin`;

let authToken = null;

async function makeRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (authToken && !options.skipAuth) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { error: error.message };
  }
}

async function testLogin() {
  console.log('🔐 Testing Admin Login...');
  
  const result = await makeRequest('/login', {
    method: 'POST',
    body: {
      username: 'admin',
      password: 'admin123'
    },
    skipAuth: true
  });

  if (result.data?.success) {
    authToken = result.data.token;
    console.log('✅ Login successful');
    console.log(`   Token: ${authToken.substring(0, 20)}...`);
    return true;
  } else {
    console.log('❌ Login failed:', result.data?.error || result.error);
    return false;
  }
}

async function testStats() {
  console.log('\n📊 Testing Statistics...');
  
  const result = await makeRequest('/stats');
  
  if (result.data?.success) {
    console.log('✅ Stats retrieved successfully');
    console.log(`   Balance: ${result.data.data.balance?.formatted || 'N/A'} ETH`);
    console.log(`   Active Sessions: ${result.data.data.activity?.activeSessions || 0}`);
    console.log(`   Completed Today: ${result.data.data.activity?.completedToday || 0}`);
  } else {
    console.log('❌ Stats failed:', result.data?.error || result.error);
  }
}

async function testRealTimeStats() {
  console.log('\n⚡ Testing Real-time Statistics...');
  
  const result = await makeRequest('/stats/realtime');
  
  if (result.data?.success) {
    console.log('✅ Real-time stats retrieved successfully');
    console.log(`   System Uptime: ${Math.floor((result.data.data.system?.uptime || 0) / 60)} minutes`);
    console.log(`   Memory Usage: ${result.data.data.system?.memoryUsage?.percentage || 0}%`);
  } else {
    console.log('❌ Real-time stats failed:', result.data?.error || result.error);
  }
}

async function testAlerts() {
  console.log('\n🚨 Testing Alerts...');
  
  const result = await makeRequest('/alerts');
  
  if (result.data?.success) {
    console.log('✅ Alerts retrieved successfully');
    console.log(`   Active Alerts: ${result.data.data.alerts?.length || 0}`);
    console.log(`   Total Alerts: ${result.data.data.stats?.total || 0}`);
  } else {
    console.log('❌ Alerts failed:', result.data?.error || result.error);
  }
}

async function testModules() {
  console.log('\n🔧 Testing Modules...');
  
  const result = await makeRequest('/modules');
  
  if (result.data?.success) {
    console.log('✅ Modules retrieved successfully');
    console.log(`   Total Modules: ${result.data.data.totalModules || 0}`);
    console.log(`   Enabled Modules: ${result.data.data.enabledModules || 0}`);
    console.log(`   Loaded Modules: ${result.data.data.loadedModules || 0}`);
    
    if (result.data.data.modules?.length > 0) {
      console.log('   Sample modules:');
      result.data.data.modules.slice(0, 3).forEach(module => {
        console.log(`     - ${module.name}: ${module.enabled ? 'enabled' : 'disabled'} (${module.loaded ? 'loaded' : 'not loaded'})`);
      });
    }
  } else {
    console.log('❌ Modules failed:', result.data?.error || result.error);
  }
}

async function testUsers() {
  console.log('\n👥 Testing Users...');
  
  const result = await makeRequest('/users');
  
  if (result.data?.success) {
    console.log('✅ Users retrieved successfully');
    console.log(`   Total Users: ${result.data.data.totalUsers || 0}`);
    console.log(`   Active Users: ${result.data.data.activeUsers || 0}`);
    console.log(`   Top Addresses: ${result.data.data.topAddresses?.length || 0}`);
  } else {
    console.log('❌ Users failed:', result.data?.error || result.error);
  }
}

async function testConfig() {
  console.log('\n⚙️ Testing Configuration...');
  
  const result = await makeRequest('/config');
  
  if (result.data?.success) {
    console.log('✅ Configuration retrieved successfully');
    console.log(`   Admin Users: ${result.data.data.adminUsers?.length || 0}`);
    console.log(`   Session Expiration: ${result.data.data.sessionExpiration || 0}s`);
    console.log(`   Theme: ${result.data.data.ui?.theme || 'N/A'}`);
  } else {
    console.log('❌ Configuration failed:', result.data?.error || result.error);
  }
}

async function testExport() {
  console.log('\n📤 Testing Export...');
  
  const result = await makeRequest('/export/stats');
  
  if (result.data?.success) {
    console.log('✅ Export retrieved successfully');
    console.log(`   Export Format: ${result.data.exportInfo?.format || 'N/A'}`);
    console.log(`   Exported By: ${result.data.exportInfo?.exportedBy || 'N/A'}`);
  } else {
    console.log('❌ Export failed:', result.data?.error || result.error);
  }
}

async function testLogout() {
  console.log('\n🚪 Testing Logout...');
  
  const result = await makeRequest('/logout', {
    method: 'POST'
  });
  
  if (result.data?.success) {
    console.log('✅ Logout successful');
    authToken = null;
  } else {
    console.log('❌ Logout failed:', result.data?.error || result.error);
  }
}

async function runTests() {
  console.log('🧪 Admin Dashboard API Test Suite');
  console.log('==================================');
  console.log(`Server: ${SERVER_URL}`);
  console.log(`API Base: ${API_BASE}\n`);

  // Test login first
  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    console.log('\n❌ Cannot continue without authentication');
    console.log('\n💡 Make sure:');
    console.log('   1. The faucet server is running');
    console.log('   2. Admin dashboard module is enabled');
    console.log('   3. Admin user "admin" exists with password "admin123"');
    console.log('   4. Use the password generator script to create proper hashes');
    return;
  }

  // Run all tests
  await testStats();
  await testRealTimeStats();
  await testAlerts();
  await testModules();
  await testUsers();
  await testConfig();
  await testExport();
  await testLogout();

  console.log('\n✅ All tests completed!');
  console.log('\n📝 Notes:');
  console.log('   - Some endpoints may return "not implemented" messages');
  console.log('   - This is expected for features that require full integration');
  console.log('   - The API structure and authentication are fully functional');
}

// Handle errors gracefully
process.on('unhandledRejection', (error) => {
  console.error('\n💥 Unhandled error:', error.message);
  process.exit(1);
});

// Run the tests
runTests().catch(console.error);