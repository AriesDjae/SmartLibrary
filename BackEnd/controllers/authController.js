const UserModel = require('../models/authModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET;

//membuat user baru
const registerUser = async (req, res) => {
    console.log('BODY:', req.body);
    try{

        const { username, email, password, full_name, role_id, is_active, profile_picture} = req.body;
        // const { username, email, password} = req.body;

        //cek email apakah sudah terdaftar
        const existingUser = await UserModel.findByEmail(email);
        if(existingUser) {
            return res.status(409).json({success: false, message: "Email already exists"});
        }

        //hash password
        const hashedPassword = await bcrypt.hash(password, 10); // 10 = salt rounds
        
        //simpan user baru
        // const newUser = await UserModel.create({ username, email, password });
        const newUser = await UserModel.create({ username, email, password:hashedPassword, full_name, role_id, is_active, profile_picture });
        res.status(201).json({success: true, data: newUser, message: 'User created successfully'});

    }catch (error){
        res.status(500).json({ success: false, message: 'Something went wrong on the server', error: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        //cari user berdasarkan email
        const user = await UserModel.findByEmail(email);
        if(!user) {
            return res.status(401).json({ success: false, message: 'incorrect email and password' })
        }
        ///bandingkan password dengan hash di database
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.status(401).json({ success:false, message: 'incorrect email and password' })
        }

        //buat JWT json web token
        const token = jwt.sign(
            {userId: user._id, email: user.email},
            JWT_SECRET,
            { expiresIn: '1h' } // Token berlaku 1 jam
        );
        res.status(200).json({success: true, token, message: 'Login accepted'});
    }catch(error){
        res.status(500).json({success:false, message:'Login Failed', error: error.message})
    }
}

//get all user
const getAllUsers = async (req, res) => {
    try {
        const user = await UserModel.findAll();
        res.status(200).json({success: true, data:user})
    }catch (error){
        res.status(500).json({ success: false, message: 'Gagal mengambil data user', error: error.message });
    }
};

//get user by id
const getUserById = async (req, res) => {
    console.log('🔍 GET USER BY ID REQUEST:', {
        id: req.params.id,
        timestamp: new Date().toISOString()
    });

    try {
        const id = req.params.id;
        
        // Validate ID
        if (!id) {
            console.error('❌ Missing user ID');
            return res.status(400).json({ 
                success: false, 
                message: 'User ID is required' 
            });
        }

        // Use the new findById method
        const user = await UserModel.findById(id);
        if (!user) {
            console.error('❌ User not found:', id);
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        console.log('✅ User found:', {
            id: id,
            email: user.email,
            full_name: user.full_name
        });

        res.status(200).json({ 
            success: true, 
            data: user 
        });
    } catch (error) {
        console.error('❌ Error getting user by ID:', {
            error: error.message,
            stack: error.stack,
            id: req.params.id
        });
        res.status(500).json({ 
            success: false, 
            message: 'Failed to get user', 
            error: error.message 
        });
    }
};

//update user by id
const updateUser = async (req, res) => {
    console.log('🔄 UPDATE USER REQUEST:', {
        id: req.params.id,
        body: req.body,
        timestamp: new Date().toISOString()
    });

    try {
        const id = req.params.id;
        const updateData = req.body;
        
        // Validate required fields
        if (!id) {
            console.error('❌ Missing user ID');
            return res.status(400).json({ 
                success: false, 
                message: 'User ID is required' 
            });
        }

        // Check if user exists
        const existingUser = await UserModel.findById(id);
        if (!existingUser) {
            console.error('❌ User not found:', id);
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // If email is being updated, check if it's already taken by another user
        if (updateData.email && updateData.email !== existingUser.email) {
            const emailExists = await UserModel.findByEmail(updateData.email);
            if (emailExists && emailExists._id.toString() !== id) {
                console.error('❌ Email already exists:', updateData.email);
                return res.status(409).json({ 
                    success: false, 
                    message: 'Email already exists' 
                });
            }
        }

        // Update user
        const updated = await UserModel.updateById(id, updateData);
        if (!updated) {
            console.error('❌ Failed to update user:', id);
            return res.status(500).json({ 
                success: false, 
                message: 'Failed to update user' 
            });
        }

        // Get updated user data
        const updatedUser = await UserModel.findById(id);
        
        console.log('✅ User updated successfully:', {
            id: id,
            updatedFields: Object.keys(updateData)
        });

        res.status(200).json({ 
            success: true, 
            message: 'User updated successfully',
            data: updatedUser
        });
    } catch (error) {
        console.error('❌ Error updating user:', {
            error: error.message,
            stack: error.stack,
            id: req.params.id
        });
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update user', 
            error: error.message 
        });
    }
};

//delete user by id
const deleteUser = async (req, res) => {
    try {
        const id = req.params.id;
        const deleted = await UserModel.deleteById(id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'User not found or not deleted' });
        }
        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal delete user', error: error.message });
    }
};

const countNonAdminUsers = async (req, res) => {
  try {
    const db = getDb();
    const count = await db.collection('user').countDocuments({ role_id: { $ne: 'r2' } });
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const avgReadingTimeNonAdmin = async (req, res) => {
    try {
      const db = getDb();
      const result = await db.collection('user').aggregate([
        { $match: { role_id: { $ne: 'r2' } } },
        { $group: { _id: null, avg: { $avg: '$reading_time' } } }
      ]).toArray();
      res.json({ success: true, avg: result[0]?.avg || 0 });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

module.exports = { 
    registerUser, 
    getAllUsers, 
    getUserById, 
    updateUser, 
    deleteUser, 
    loginUser, 
    countNonAdminUsers,
    avgReadingTimeNonAdmin
 };