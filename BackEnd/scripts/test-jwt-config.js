#!/usr/bin/env node

/**
 * Script untuk test konfigurasi JWT
 * 
 * Usage:
 * node scripts/test-jwt-config.js
 */

const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

function testJWTConfiguration() {
    console.log('🔍 JWT Configuration Test - SmartLibrary');
    console.log('========================================\n');

    let allTestsPassed = true;

    // Test 1: Check if JWT_SECRET exists
    console.log('1️⃣ Testing JWT_SECRET...');
    if (!process.env.JWT_SECRET) {
        console.log('❌ JWT_SECRET tidak ditemukan di environment variables');
        allTestsPassed = false;
    } else {
        console.log('✅ JWT_SECRET ditemukan');
        console.log(`   Length: ${process.env.JWT_SECRET.length} characters`);

        if (process.env.JWT_SECRET.length < 32) {
            console.log('⚠️  Warning: JWT_SECRET terlalu pendek (minimal 32 karakter)');
        } else {
            console.log('✅ JWT_SECRET length sudah aman');
        }
    }
    console.log('');

    // Test 2: Check JWT_EXPIRES_IN
    console.log('2️⃣ Testing JWT_EXPIRES_IN...');
    const expiresIn = process.env.JWT_EXPIRES_IN || '1h';
    console.log(`✅ JWT_EXPIRES_IN: ${expiresIn}`);
    console.log('');

    // Test 3: Test JWT token generation and verification
    console.log('3️⃣ Testing JWT token generation and verification...');
    try {
        const testPayload = {
            userId: 'test123',
            email: 'test@example.com',
            timestamp: new Date().toISOString()
        };

        const token = jwt.sign(testPayload, process.env.JWT_SECRET, {
            expiresIn: expiresIn
        });

        console.log('✅ Token generated successfully');
        console.log(`   Token length: ${token.length} characters`);

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('✅ Token verified successfully');
        console.log(`   Decoded payload: ${JSON.stringify(decoded, null, 2)}`);

    } catch (error) {
        console.log('❌ JWT token test failed:', error.message);
        allTestsPassed = false;
    }
    console.log('');

    // Test 4: Test with invalid secret
    console.log('4️⃣ Testing with invalid secret...');
    try {
        const testPayload = { userId: 'test123' };
        const token = jwt.sign(testPayload, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Try to verify with wrong secret
        jwt.verify(token, 'wrong_secret');
        console.log('❌ Token verification should have failed with wrong secret');
        allTestsPassed = false;
    } catch (error) {
        if (error.message.includes('invalid signature')) {
            console.log('✅ Token correctly rejected with wrong secret');
        } else {
            console.log('❌ Unexpected error:', error.message);
            allTestsPassed = false;
        }
    }
    console.log('');

    // Test 5: Test expired token
    console.log('5️⃣ Testing expired token...');
    try {
        const testPayload = { userId: 'test123' };
        const token = jwt.sign(testPayload, process.env.JWT_SECRET, { expiresIn: '1ms' });

        // Wait for token to expire
        setTimeout(() => {
            try {
                jwt.verify(token, process.env.JWT_SECRET);
                console.log('❌ Expired token should have been rejected');
                allTestsPassed = false;
            } catch (error) {
                if (error.message.includes('jwt expired')) {
                    console.log('✅ Expired token correctly rejected');
                } else {
                    console.log('❌ Unexpected error:', error.message);
                    allTestsPassed = false;
                }
            }
        }, 10);

    } catch (error) {
        console.log('❌ Error creating expired token:', error.message);
        allTestsPassed = false;
    }
    console.log('');

    // Test 6: Check environment variables
    console.log('6️⃣ Checking environment variables...');
    const requiredVars = [
        'JWT_SECRET',
        'MONGODB_URI',
        'PORT',
        'NODE_ENV'
    ];

    const optionalVars = [
        'JWT_EXPIRES_IN',
        'JWT_REFRESH_SECRET',
        'JWT_REFRESH_EXPIRES_IN',
        'CORS_ORIGIN',
        'BCRYPT_SALT_ROUNDS'
    ];

    console.log('Required variables:');
    requiredVars.forEach(varName => {
        if (process.env[varName]) {
            console.log(`   ✅ ${varName}: Set`);
        } else {
            console.log(`   ❌ ${varName}: Not set`);
            allTestsPassed = false;
        }
    });

    console.log('\nOptional variables:');
    optionalVars.forEach(varName => {
        if (process.env[varName]) {
            console.log(`   ✅ ${varName}: ${process.env[varName]}`);
        } else {
            console.log(`   ⚪ ${varName}: Not set (optional)`);
        }
    });
    console.log('');

    // Test 7: Check .env file
    console.log('7️⃣ Checking .env file...');
    const envPath = path.join(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
        console.log('✅ .env file exists');
        const stats = fs.statSync(envPath);
        console.log(`   Size: ${stats.size} bytes`);
        console.log(`   Last modified: ${stats.mtime}`);
    } else {
        console.log('❌ .env file not found');
        allTestsPassed = false;
    }
    console.log('');

    // Final result
    console.log('📊 Test Results:');
    console.log('================');
    if (allTestsPassed) {
        console.log('🎉 All tests passed! JWT configuration is working correctly.');
        console.log('\n✅ Ready to use JWT authentication in SmartLibrary!');
    } else {
        console.log('❌ Some tests failed. Please check the configuration.');
        console.log('\n🔧 Troubleshooting tips:');
        console.log('- Make sure .env file exists in BackEnd/ directory');
        console.log('- Ensure JWT_SECRET is set and at least 32 characters long');
        console.log('- Check that all required environment variables are set');
        console.log('- Restart the server after making changes to .env');
    }

    return allTestsPassed;
}

// Run the test
if (require.main === module) {
    const success = testJWTConfiguration();
    process.exit(success ? 0 : 1);
}

module.exports = {
    testJWTConfiguration
}; 