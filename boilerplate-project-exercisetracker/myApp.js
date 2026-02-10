require('dotenv').config();
const mongoose = require('mongoose');
const MONGO_URI = process.env.MONGO_URI;

const connect = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("MongoDB connected");
    } catch (err) {
        console.error(err);
    }
}

mongoose.connect(MONGO_URI);

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
});

const exceriseSchema = new mongoose.Schema({
    user_id: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    date: Date
});

const User = mongoose.model('User', userSchema);
const Exercise = mongoose.model('Exercise', exceriseSchema);

const createUser = async (username) => {
    const newUser = new User({ username });
    return await newUser.save();
}

const getAllUsers = async () => {
    return await User.find({}).select('username _id');
}

const addExercise = async (userId, exerciseData) => {
    const user = await User.findById(userId);
    if (!user)  throw new Error("User not found");

    const newExercise = await Exercise({
        user_id: userId,
        description: exerciseData.description,
        duration: exerciseData.duration,
        date: exerciseData.date ? new Date(exerciseData.date) : new Date()
    });

    const savedExercise = await newExercise.save();
    return {
        username: user.username,
        description: savedExercise.description,
        duration: savedExercise.duration,
        date: savedExercise.date.toDateString(),
        _id: user._id
    };
}

const getLogs = async (userId, {from, to, limit}) => {
    const user = await User.findById(userId);
    if (!user)  throw new Error("User not found");

    let query = { user_id: userId };
    if (from || to){
        query.date = {};
        if (from) query.date.$gte = new Date(from);
        if (to) query.date.$lte = new Date(to);
    }

    const exercises = await Exercise.find(query).limit(parseInt(limit) || 100);

    return {
        username: user.username,
        count: exercises.length,
        _id: user._id,
        log: exercises.map((e) => ({
            description: e.description,
            duration: e.duration,
            date: e.date.toDateString()
        }))
    };
};

// Mock test

module.exports = {
    connect,
    createUser,
    getAllUsers,
    addExercise,
    getLogs
};