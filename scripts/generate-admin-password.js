#!/usr/bin/env node

/**
 * Script para generar hash de contraseñas para administradores del dashboard
 * Uso: node scripts/generate-admin-password.js [password]
 */

import bcrypt from 'bcrypt';
import { createInterface } from 'readline';

async function generatePasswordHash(password) {
  try {
    const hash = await bcrypt.hash(password, 10);
    return hash;
  } catch (error) {
    console.error('Error generating password hash:', error.message);
    process.exit(1);
  }
}

async function promptPassword() {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('Enter password for admin user: ', (password) => {
      rl.close();
      resolve(password);
    });
  });
}

async function main() {
  console.log('🔐 Admin Password Hash Generator');
  console.log('================================\n');

  let password = process.argv[2];
  
  if (!password) {
    password = await promptPassword();
  }

  if (!password || password.length < 6) {
    console.error('❌ Password must be at least 6 characters long');
    process.exit(1);
  }

  console.log('Generating password hash...\n');
  
  const hash = await generatePasswordHash(password);
  
  console.log('✅ Password hash generated successfully!');
  console.log('\nAdd this to your faucet-config.yaml:');
  console.log('=====================================');
  console.log(`passwordHash: "${hash}"`);
  console.log('\nExample configuration:');
  console.log('=====================');
  console.log(`modules:
  admin-dashboard:
    enabled: true
    adminUsers:
      - username: "admin"
        passwordHash: "${hash}"
        permissions: ["all"]
        email: "admin@example.com"`);
  
  console.log('\n⚠️  Security Notes:');
  console.log('- Keep this hash secure and never share it');
  console.log('- Change the sessionSecret in your config');
  console.log('- Use HTTPS in production');
  console.log('- Consider using strong, unique passwords');
}

main().catch(console.error);