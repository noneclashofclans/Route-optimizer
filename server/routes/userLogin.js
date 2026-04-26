const express = require('express');
const router =  express.Router();
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User.js');

router.post('/register', async(req, res)=>{
    try{
        const {email, password, username} = req.body;

        if (!username || !password || !email)
            return res.status(400).json({message: 'No user find'});

        const user = await User.findOne({$or: [{email}, {username}]});

        if (user)
           return res.status(400).json({message: 'User already present'});

        const salting = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salting);

        const newUser = await User.create({
            username, email, password: hashedPassword,
        });

        res.status(201).json({
            message: 'user registered',
            user:{
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email,
            }
        })
    }
    catch(err){
        console.log(err.message);
        res.status(500).json({message: 'Error during registration'});
    }
})

router.post('/login', async(req, res)=>{
    try{
        const {email, password} = req.body;

        const user = await User.findOne({email});

        if (!user) return res.status(401).json({message: 'Invalid email/password'});

        const passwordMatched = await bcrypt.compare(password, user.password);

        if (!passwordMatched) 
            res.status(401).json({message: 'Invalid email/password'});

        const payload = {
            userEmail: user.email,
            userName: user.username
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {expiresIn: '200d'});

        res.status(200).json({
            message: 'Logged in successfuly',
            token,
            user:{
                _id: user._id,
                username: user.username, 
                email: user.email
            }
        });
    }
    catch(err){
        console.log(err.message);
        res.status(500).json({message: 'Error during login'});
    }
})

module.exports = router;