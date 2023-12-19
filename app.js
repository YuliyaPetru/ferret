const express = require('express');
require('dotenv').config();
const app = express();
const PORT = 3000;
app.use(express.json());

const mongoose = require('mongoose');
// const { ferret } = require('./ferret');

//mongodb key from .env
const mongoURI = process.env.URI;

// Connect to MongoDB
mongoose.connect(mongoURI, {})
    .then(() => {
        console.log('MongoDB connected');
    })
    .catch(err => {
        console.error('MongoDB connection error', err);
    });

// change between mongoose or ferret to use either one
const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    age: Number,
    occupation: String,
});

// change between mongoose or ferret to use either one
const User = mongoose.model('User', UserSchema, 'User');

app.get('/getAllUsers', async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/addUser', async (req, res) => {
    try {
        const { name, email, age, occupation } = req.body;
        const newUser = await User.create({ name, email, age, occupation });
        res.status(201).json(newUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

//find by id
app.get('/userById/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id);
        if (!user) {
        return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//find by other params
app.get('/user/:queryKey/:queryValue', async (req, res) => {
    const { queryKey, queryValue } = req.params;

    try {
        const user = await User.find({[queryKey]: queryValue});
        if (!user) {
        return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.patch('/userByIdAndUpdate/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, age, occupation } = req.body;

    try {
        const updatedUser = await User.findByIdAndUpdate(id, { name, email, age, occupation });
        if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
        }
        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.delete('/userDelete/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedUser = await User.findByIdAndDelete(id);
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});