
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const Signup = require('./models/signup.models');

const app = express();
app.use(express.json());


const PORT = 3000;


app.get("/api/signups", async (req, res) => {
    try {
        const user = await Signup.find();
        if(user.length === 0){
            return res.status(404).json({ message: "No user found" });
        }

        return res.status(200).json(user);
    } catch (err) {
        res.status(505).json({ message: err.message });
    }
})




app.post("/api/signup", async (req, res) => {
    try {
        console.log("Request body:", req.body);
        
        const { name, email, username, password } = req.body;
        
        if (!name || !email || !username || !password) {
            return res.status(400).json({ 
                message: "All fields are required",
                missing: {
                    name: !name,
                    email: !email,
                    username: !username,
                    password: !password
                }
            });
        }
        
        if (password.length < 6) {
            return res.status(400).json({ 
                message: "Password must be at least 6 characters long" 
            });
        }
        
        const user = await Signup.create({ name, email, username, password });
        return res.status(201).json(user);
    } catch (err) {
        console.error("Signup error:", err);
        
        // Handle validation errors
        if (err.name === 'ValidationError') {
            return res.status(400).json({ 
                message: "Validation failed",
                errors: err.errors 
            });
        }
        
        // Handle duplicate key errors
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern)[0];
            return res.status(400).json({ 
                message: `${field} already exists`,
                field: field
            });
        }
        
        res.status(500).json({ message: err.message });
    }
})



mongoose.connect(process.env.database_url)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Error connecting to MongoDB:', err.message));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
    