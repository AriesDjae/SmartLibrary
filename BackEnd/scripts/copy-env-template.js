#!/usr/bin/env node

/**
 * Script untuk menyalin env.template ke .env
 * 
 * Usage:
 * node scripts/copy-env-template.js
 */

const fs = require('fs');
const path = require('path');

function copyEnvTemplate() {
    console.log('📋 Copying env.template to .env...');

    const templatePath = path.join(__dirname, '..', 'env.template');
    const envPath = path.join(__dirname, '..', '.env');

    try {
        // Check if template exists
        if (!fs.existsSync(templatePath)) {
            console.error('❌ env.template not found!');
            console.log('   Please make sure env.template exists in BackEnd/ directory');
            return false;
        }

        // Check if .env already exists
        if (fs.existsSync(envPath)) {
            console.log('⚠️  .env file already exists!');
            console.log('   Do you want to overwrite it? (y/N)');

            process.stdin.once('data', (data) => {
                const answer = data.toString().trim().toLowerCase();

                if (answer === 'y' || answer === 'yes') {
                    performCopy(templatePath, envPath);
                } else {
                    console.log('📋 Copy cancelled. Please edit .env manually.');
                }
                process.exit(0);
            });
        } else {
            performCopy(templatePath, envPath);
        }

    } catch (error) {
        console.error('❌ Error copying template:', error.message);
        return false;
    }
}

function performCopy(templatePath, envPath) {
    try {
        const templateContent = fs.readFileSync(templatePath, 'utf8');
        fs.writeFileSync(envPath, templateContent);

        console.log('✅ .env file created successfully!');
        console.log(`📁 Location: ${envPath}`);
        console.log('');
        console.log('🔧 Next steps:');
        console.log('1. Edit .env file and replace placeholder values');
        console.log('2. Generate JWT secret: npm run generate-jwt');
        console.log('3. Test configuration: npm run test-jwt');
        console.log('4. Start server: npm run dev');

        return true;
    } catch (error) {
        console.error('❌ Error creating .env file:', error.message);
        return false;
    }
}

// Run the script
if (require.main === module) {
    copyEnvTemplate();
}

module.exports = {
    copyEnvTemplate
}; 