const jwt = require('jsonwebtoken');
const UserModel = require('../models/authModel');
const JWT_SECRET = process.env.JWT_SECRET

//middleware untuk verifikasi token jwt
async function authenticateToken(req, res, next){
    console.log('🔐 Auth middleware: Verifying token...');
    
    //ambil token dari headeer Authorization: Bearer <token>
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if(!token) {
        console.error('❌ Auth middleware: Token not found');
        return res.status(401).json({ success: false, message: 'Token not found' });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('✅ Auth middleware: Token verified, user ID:', decoded.userId);
        
        // Ambil data lengkap user dari database
        const user = await UserModel.findById(decoded.userId);
        if (!user) {
            console.error('❌ Auth middleware: User not found in database');
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        // Simpan data lengkap user ke req.user
        req.user = user;
        console.log('✅ Auth middleware: User data loaded:', {
            id: user._id,
            email: user.email,
            full_name: user.full_name
        });
        
        next();
    } catch (err) {
        console.error('❌ Auth middleware: Token verification failed:', err.message);
        return res.status(403).json({ success: false, message: 'Token tidak valid' });
    }
}

module.exports = authenticateToken;