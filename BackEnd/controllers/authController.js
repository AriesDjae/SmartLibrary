const UserModel = require('../models/authModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
    try {
        const id = req.params.id;
        const user = await UserModel.findAll();
        const found = user.find(u => u._id.toString() === id);
        if (!found) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, data: found });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal mengambil data user', error: error.message });
    }
};

//update user by id
const updateUser = async (req, res) => {
    try {
        const id = req.params.id;
        const updateData = req.body;
        const updated = await UserModel.updateById(id, updateData);
        if (!updated) {
            return res.status(404).json({ success: false, message: 'User not found or not updated' });
        }
        res.status(200).json({ success: true, message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal update user', error: error.message });
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

module.exports = { registerUser, getAllUsers, getUserById, updateUser, deleteUser, loginUser };