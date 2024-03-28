const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');


const app = express();

app.use(express.json());
app.use(cors());
mongoose.connect('mongodb+srv://eppkirti:sFaoRBudRRaboM43@cluster0.oyufr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });

const userSchema = new mongoose.Schema({
        username: { type: String, required: true },
        password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);
const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    rollNo: { type: String, required: true },
    department: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true }
});

const Student = mongoose.model('Student', studentSchema);
// Register a new user
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if the username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// User login
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find the user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare the password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        res.status(200).json({ message: 'Login successful' });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/students', async (req, res) => {
    try {
        const students = await Student.find();
        res.status(200).json(students);
    } catch (error) {
        console.error('Error getting students:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/students', async (req, res) => {
    try {
        const { name, rollNo, department, email, phone } = req.body;
        const newStudent = new Student({ name, rollNo, department, email, phone });
        await newStudent.save();
        res.status(201).json(newStudent);
    } catch (error) {
        console.error('Error adding student:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.put('/students/:id', async (req, res) => {
    try {
        const { name, rollNo, department, email, phone } = req.body;
        await Student.findByIdAndUpdate(req.params.id, { name, rollNo, department, email, phone });
        res.status(200).json({ message: 'Student updated successfully' });
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.delete('/students/:id', async (req, res) => {
    try {
        await Student.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
