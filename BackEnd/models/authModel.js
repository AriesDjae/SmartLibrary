// Import ObjectId dari MongoDB untuk ID unik
const { ObjectId } = require('mongodb');

// Import fungsi getDb untuk koneksi ke database
const { getDb } = require('../config/db');

// Membuat class UserModel untuk operasi database user
class UserModel {
    //struktur data user
    static schema = {
        username : {type: 'string', required: true},
        password : {type: 'string', required: true},
        full_name : {type: 'string', required: true},
        email : {type: 'string', required: true},
        role_id : {type: 'string', required: true}, //FK
        is_active : {type: 'boolean', required: true},
        profile_picture : {type: 'string', required: false} // null = optional
    };

    //simpan user ke db
    static async create(userData) {
        const db = getDb();
        //simpan ke koleksi user
        const result = await db.collection('user').insertOne(userData);
        return {_id: result.insertedId, ...userData} //Ambil semua isi dari userData (...) adalah spread operator
    }

    //cari user berdasarkan email
    static async findByEmail(email) {
        const db = getDb();
        return await db.collection('user').findOne({email});
    }

    //cari user berdasarkan ID
    static async findById(id) {
        const db = getDb();
        return await db.collection('user').findOne({ _id: new ObjectId(id) });
    }

    //get all user
    static async findAll(){
        const db = getDb();
        return await db.collection('user').find().toArray();
    }

    //update user by id
    static async updateById(id, updateData) {
        const db = getDb();
        const result = await db.collection('user').updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );
        return result.modifiedCount > 0;
    }

    //delete user by id
    static async deleteById(id) {
        const db = getDb();
        const result = await db.collection('user').deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount > 0;
    }
}

module.exports = UserModel;

//Method	Endpoint	    Keterangan
// GET	    /users	        Ambil semua user
// GET	    /users/:id	    Ambil user berdasarkan ID
// POST	    /users	        Tambah user baru
// POST	    /users/register	Register user baru
// PATCH	/users/:id	    Update user berdasarkan ID
// DELETE	/users/:id	    Hapus user berdasarkan ID


