#!/usr/bin/env node

/**
 * Script untuk generate JWT Secret yang aman
 * 
 * Usage:
 * node scripts/generate-jwt-secret.js
 * 
 * Atau untuk generate dengan custom length:
 * node scripts/generate-jwt-secret.js 128
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function generateJWTSecret(length = 64) {
    return crypto.randomBytes(length).toString('hex');
}

function generateRefreshSecret(length = 64) {
    return crypto.randomBytes(length).toString('hex');
}

function createEnvTemplate() {
    const jwtSecret = generateJWTSecret();
    const refreshSecret = generateRefreshSecret();

    const envContent = `# ========================================
# SMARTLIBRARY - ENVIRONMENT VARIABLES
# ========================================

# JWT Configuration
JWT_SECRET=${jwtSecret}
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=${refreshSecret}
JWT_REFRESH_EXPIRES_IN=7d

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/smartlibrary
DATABASE_NAME=smartlibrary

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Security Configuration
BCRYPT_SALT_ROUNDS=10
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# AI Service Configuration
AI_SERVICE_URL=http://localhost:5001
OPENAI_API_KEY=your_openai_api_key_here
`;

    return envContent;
}

function main() {
    const args = process.argv.slice(2);
    const length = parseInt(args[0]) || 64;

    console.log('🔐 JWT Secret Generator - SmartLibrary');
    console.log('=====================================\n');

    // Generate secrets
    const jwtSecret = generateJWTSecret(length);
    const refreshSecret = generateRefreshSecret(length);

    console.log('✅ Generated JWT Secret:');
    console.log(`JWT_SECRET=${jwtSecret}\n`);

    console.log('✅ Generated Refresh Secret:');
    console.log(`JWT_REFRESH_SECRET=${refreshSecret}\n`);

    console.log('📝 Secret Details:');
    console.log(`- JWT Secret Length: ${jwtSecret.length} characters`);
    console.log(`- Refresh Secret Length: ${refreshSecret.length} characters`);
    console.log(`- Entropy: ${length * 8} bits\n`);

    // Check if .env exists
    const envPath = path.join(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
        console.log('⚠️  Warning: .env file already exists!');
        console.log('   Backup current .env file before overwriting.\n');
    }

    // Ask user if they want to create .env file
    console.log('🤔 Do you want to create/update .env file? (y/N)');
    process.stdin.once('data', (data) => {
        const answer = data.toString().trim().toLowerCase();

        if (answer === 'y' || answer === 'yes') {
            try {
                const envContent = createEnvTemplate();
                fs.writeFileSync(envPath, envContent);
                console.log('✅ .env file created successfully!');
                console.log(`📁 Location: ${envPath}`);
            } catch (error) {
                console.error('❌ Error creating .env file:', error.message);
            }
        } else {
            console.log('📋 Copy the secrets above to your .env file manually.');
        }

        console.log('\n🔒 Security Reminders:');
        console.log('- Keep your JWT secrets secure and private');
        console.log('- Never commit .env file to version control');
        console.log('- Use different secrets for development and production');
        console.log('- Rotate secrets periodically in production');

        process.exit(0);
    });
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
    console.log('\n\n👋 Goodbye!');
    process.exit(0);
});

// Run the script
if (require.main === module) {
    main();
}

module.exports = {
    generateJWTSecret,
    generateRefreshSecret,
    createEnvTemplate
}; 