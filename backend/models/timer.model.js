import mongoose, { mongo } from "mongoose";

const timerSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    time: {
        type:Number,
        required: true,
    },
    count: {
        type: Number,
        required: true,
    },
    limit: {
        type: Number,
        required: true,
    }
}, {
    timestamps: true // createdAt, updatedAt
});

const Timer = mongoose.model('Timer', timerSchema);

export default Timer;