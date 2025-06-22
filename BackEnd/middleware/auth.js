const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET

//middleware untuk verifikasi token jwt
function authenticateToken(req, res, next){
    //ambil token dari headeer Authorization: Bearer <token>
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if(!token) return res.status(401).json({ success: false, message: 'Token not found' })
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ success: false, message: 'Token tidak valid' });
        req.user = user; // Simpan data user dari token ke req
        next();
    });
}

module.exports = authenticateToken;