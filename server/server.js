require('dotenv').config();
const PORT = process.env.PORT || 3000;
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');


const allowedOrigins = ['http://localhost:5173', 'https://route-opimizer-rishit.netlify.app'];

app.use(cors({
    origin: (origin, cb) => {
        if (!origin || allowedOrigins.includes(origin))
            cb(null, true);
        else {
            console.log('cors is blocked');
            cb(new Error('Not allowed'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const authRoutes = require('./routes/userLogin');
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to backend');
})



mongoose.set('strictQuery', true);

mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log('MongoDB connected');
        app.listen(PORT, (err) => {
            console.log(`Backend started at ${PORT}`);
        });
    })
    .catch(err => console.log("MongoDB Connection Error:", err));