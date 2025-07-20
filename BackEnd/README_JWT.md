# 🔐 JWT Configuration - SmartLibrary BackEnd

Dokumen lengkap untuk mengkonfigurasi JWT (JSON Web Token) di SmartLibrary BackEnd.

## 📋 Daftar Isi

1. [Quick Start](#-quick-start)
2. [Manual Setup](#-manual-setup)
3. [Environment Variables](#-environment-variables)
4. [Security Best Practices](#-security-best-practices)
5. [Testing](#-testing)
6. [Troubleshooting](#-troubleshooting)
7. [Production Deployment](#-production-deployment)

## ⚡ Quick Start

### Method 1: Automated Setup (Recommended)

```bash
cd BackEnd
npm install
npm run init
npm run test-jwt
npm run dev
```

### Method 2: Step by Step

```bash
cd BackEnd
npm install
npm run copy-env
npm run generate-jwt
npm run test-jwt
npm run dev
```

## 🔧 Manual Setup

### 1. Install Dependencies

```bash
cd BackEnd
npm install
```

### 2. Create Environment File

```bash
# Copy template
cp env.template .env

# Atau buat manual
touch .env
```

### 3. Generate JWT Secret

```bash
# Menggunakan script
npm run generate-jwt

# Atau manual
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Configure Environment Variables

Edit file `.env`:

```env
# JWT Configuration
JWT_SECRET=your_generated_secret_here
JWT_EXPIRES_IN=1h

# Database
MONGODB_URI=mongodb://localhost:27017/smartlibrary
DATABASE_NAME=smartlibrary

# Server
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173
```

### 5. Test Configuration

```bash
npm run test-jwt
```

### 6. Start Server

```bash
npm run dev
```

## 🌍 Environment Variables

### Required Variables

| Variable      | Description                  | Example                                  |
| ------------- | ---------------------------- | ---------------------------------------- |
| `JWT_SECRET`  | Secret key untuk JWT signing | `a1b2c3d4e5f6...`                        |
| `MONGODB_URI` | MongoDB connection string    | `mongodb://localhost:27017/smartlibrary` |
| `PORT`        | Server port                  | `3000`                                   |
| `NODE_ENV`    | Environment mode             | `development`                            |

### Optional Variables

| Variable                  | Description              | Default                 |
| ------------------------- | ------------------------ | ----------------------- |
| `JWT_EXPIRES_IN`          | Token expiration time    | `1h`                    |
| `JWT_REFRESH_SECRET`      | Refresh token secret     | -                       |
| `JWT_REFRESH_EXPIRES_IN`  | Refresh token expiration | `7d`                    |
| `CORS_ORIGIN`             | Allowed CORS origins     | `http://localhost:5173` |
| `BCRYPT_SALT_ROUNDS`      | Password hashing rounds  | `10`                    |
| `RATE_LIMIT_WINDOW_MS`    | Rate limit window        | `900000`                |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window  | `100`                   |

### Complete .env Example

```env
# ========================================
# SMARTLIBRARY - ENVIRONMENT VARIABLES
# ========================================

# JWT Configuration
JWT_SECRET=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890a1
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
```

## 🔒 Security Best Practices

### 1. JWT Secret Requirements

- **Minimal 32 karakter** (disarankan 64+ karakter)
- **Random dan unpredictable**
- **Jangan gunakan kata-kata umum**
- **Jangan commit ke repository**

### 2. Token Expiration

```env
# Development
JWT_EXPIRES_IN=1h

# Production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### 3. Environment-specific Secrets

```env
# Development
JWT_SECRET=dev_secret_key_here

# Production
JWT_SECRET=prod_super_secure_secret_key_here
```

### 4. Security Checklist

- [ ] JWT_SECRET minimal 64 karakter
- [ ] File `.env` tidak di-commit ke git
- [ ] JWT_EXPIRES_IN diset ke nilai yang reasonable
- [ ] HTTPS enabled di production
- [ ] Rate limiting aktif
- [ ] CORS origin dibatasi
- [ ] Input validation aktif
- [ ] Error handling yang aman

## 🧪 Testing

### 1. Test JWT Configuration

```bash
npm run test-jwt
```

### 2. Test API Endpoints

```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Test login endpoint
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test protected endpoint
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Test JWT Token Manual

```javascript
// test-token.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

const payload = { userId: "test123", email: "test@example.com" };
const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

console.log("Generated Token:", token);

try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log("Decoded:", decoded);
} catch (error) {
  console.log("Error:", error.message);
}
```

## 🚨 Troubleshooting

### Common Errors

#### 1. "JWT_SECRET is not defined"

**Error:**

```
ReferenceError: JWT_SECRET is not defined
```

**Solution:**

1. Pastikan file `.env` ada di folder `BackEnd/`
2. Restart server: `npm run dev`
3. Cek isi file `.env`: `cat .env`

#### 2. "Token tidak valid"

**Error:**

```
Token tidak valid
```

**Solution:**

1. Generate ulang JWT secret: `npm run generate-jwt`
2. Restart server
3. Login ulang di frontend

#### 3. "Cannot find module 'dotenv'"

**Error:**

```
Cannot find module 'dotenv'
```

**Solution:**

```bash
npm install dotenv
```

#### 4. "Token expired"

**Error:**

```
jwt expired
```

**Solution:**

1. Implement refresh token mechanism
2. Atau user harus login ulang
3. Sesuaikan `JWT_EXPIRES_IN` sesuai kebutuhan

#### 5. "invalid signature"

**Error:**

```
invalid signature
```

**Solution:**

1. Cek apakah JWT_SECRET sama antara saat generate dan verify
2. Pastikan tidak ada whitespace di JWT_SECRET
3. Restart server setelah mengubah JWT_SECRET

### Debug Steps

1. **Check Environment Variables:**

   ```bash
   node -e "require('dotenv').config(); console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not Set');"
   ```

2. **Check .env File:**

   ```bash
   cat .env | grep JWT_SECRET
   ```

3. **Test JWT Generation:**

   ```bash
   npm run test-jwt
   ```

4. **Check Server Logs:**
   ```bash
   npm run dev
   # Look for JWT-related errors in console
   ```

## 🔄 Production Deployment

### 1. Environment Variables untuk Production

```env
NODE_ENV=production
JWT_SECRET=your_production_super_secure_secret_key_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
MONGODB_URI=mongodb://your_production_mongodb_uri
CORS_ORIGIN=https://yourdomain.com
PORT=3000
```

### 2. Security Checklist untuk Production

- [ ] JWT_SECRET minimal 64 karakter
- [ ] JWT_SECRET berbeda untuk setiap environment
- [ ] Token expiration time yang reasonable
- [ ] HTTPS enabled
- [ ] Rate limiting aktif
- [ ] CORS origin dibatasi
- [ ] Input validation aktif
- [ ] Error handling yang aman
- [ ] Logging yang proper
- [ ] Monitoring dan alerting

### 3. Deployment Steps

1. **Set Environment Variables:**

   ```bash
   # Di server production
   export NODE_ENV=production
   export JWT_SECRET=your_production_secret
   ```

2. **Install Dependencies:**

   ```bash
   npm install --production
   ```

3. **Start Server:**

   ```bash
   npm start
   ```

4. **Monitor Logs:**
   ```bash
   tail -f logs/app.log
   ```

## 📁 File Structure

```
BackEnd/
├── .env                    # Environment variables (buat manual)
├── env.template           # Template untuk .env
├── scripts/
│   ├── generate-jwt-secret.js    # Generate JWT secret
│   ├── test-jwt-config.js        # Test JWT configuration
│   └── copy-env-template.js      # Copy template ke .env
├── controllers/
│   └── authController.js         # JWT login logic
├── middleware/
│   └── auth.js                   # JWT verification
├── package.json
├── JWT_SETUP.md                 # Quick setup guide
├── JWT_CONFIGURATION.md         # Detailed configuration
└── README_JWT.md               # This file
```

## 📞 Support

Jika mengalami masalah:

1. **Jalankan test script:**

   ```bash
   npm run test-jwt
   ```

2. **Cek dokumentasi:**

   - `JWT_SETUP.md` - Quick setup guide
   - `JWT_CONFIGURATION.md` - Detailed configuration

3. **Debug steps:**

   - Cek log server untuk error details
   - Pastikan MongoDB berjalan
   - Restart server setelah perubahan `.env`

4. **Common issues:**
   - File `.env` tidak ada atau salah lokasi
   - JWT_SECRET terlalu pendek
   - Server tidak restart setelah mengubah environment variables

---

**Happy Coding! 🎉**

Untuk informasi lebih lanjut, lihat:

- [JWT_SETUP.md](./JWT_SETUP.md) - Quick setup guide
- [JWT_CONFIGURATION.md](./JWT_CONFIGURATION.md) - Detailed configuration
