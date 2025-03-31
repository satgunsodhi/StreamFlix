import Timer from "../models/timer.model.js";

export const createTimer = async (req, res) => {
    const { name, time } = req.body; // Extract values directly
    if (!name || !time) {
        return res.status(400).json({ success: false, message: "Please provide all fields" });
    }

    try {
        // Check if a timer with the same name already exists
        const existingTimer = await Timer.findOne({ name });
        if (existingTimer) {
            return res.status(400).json({ success: false, message: "Timer with this name already exists" });
        }

        const newTimer = new Timer({ name, time });
        await newTimer.save();
        res.status(201).json({ success: true, data: newTimer });
    } catch (error) {
        console.error("Error in creating timer:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const getTimer = async (req, res) => {
    const { name } = req.params; // Extract name from URL params

    try {
        const timer = await Timer.findOne({ name }); // Search by 'name' field
        if (!timer) {
            return res.status(404).json({ success: false, message: "Timer not found" });
        }
        res.status(200).json({ success: true, data: timer });
    } catch (error) {
        console.error("Error in fetching timer:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const updateTimer = async (req, res) => {
    try {
        const { name } = req.params;
        const updatedData = req.body;

        // Example: Update logic (replace with your database logic)
        const updatedTimer = await Timer.findOneAndUpdate(
            { name },
            updatedData,
            { new: true }
        );

        if (!updatedTimer) {
            return res.status(404).json({ message: "Timer not found" });
        }

        res.status(200).json(updatedTimer);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

