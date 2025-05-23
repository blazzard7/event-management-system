const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.js');

class AuthService{
    async register(username, password,role){
        const hashedPassword = await bcrypt.hash(password,10);
        const user = await User.create({username, password: hashedPassword, role});
        return user;
    }

async login(username, password){
    const user = await User.findOne({where: {username}});
    if(!user){
        throw new Error("Неверные данные");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
        throw new Error("Неверные данные");
    }
    const token = jwt.sign({userId: user.id, role: user.role}, process.env.JWT_SECRET,{expiresIn: '1h'});
    return token;
}
}
module.exports = new AuthService();