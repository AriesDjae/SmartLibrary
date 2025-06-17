const { ObjectId } = require('mongodb');

class User {
    constructor(name, email, password) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    static validate(user) {
        const errors = [];

        // Name validation
        if (!user.name || user.name.trim().length < 2) {
            errors.push('Name must be at least 2 characters long');
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!user.email || !emailRegex.test(user.email)) {
            errors.push('Please provide a valid email address');
        }

        // Password validation
        if (!user.password || user.password.length < 6) {
            errors.push('Password must be at least 6 characters long');
        }

        return errors;
    }

    static validateLogin(credentials) {
        const errors = [];

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!credentials.email || !emailRegex.test(credentials.email)) {
            errors.push('Please provide a valid email address');
        }

        // Password validation
        if (!credentials.password) {
            errors.push('Password is required');
        }

        return errors;
    }
}

module.exports = User; 