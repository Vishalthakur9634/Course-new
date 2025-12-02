const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');

// Simulated Payment Endpoint
router.post('/purchase', async (req, res) => {
    try {
        const { userId, courseId, paymentDetails } = req.body;

        if (!userId || !courseId) {
            return res.status(400).json({ message: 'User ID and Course ID are required' });
        }

        // 1. Verify User and Course exist
        const user = await User.findById(userId);
        const course = await Course.findById(courseId);

        if (!user) return res.status(404).json({ message: 'User not found' });
        if (!course) return res.status(404).json({ message: 'Course not found' });

        // 2. Check if already purchased
        if (user.purchasedCourses.includes(courseId)) {
            return res.status(400).json({ message: 'Course already purchased' });
        }

        // 3. Simulate Payment Processing
        // In a real app, you'd use Stripe/PayPal SDK here with paymentDetails
        // const charge = await stripe.charges.create({...});

        console.log(`Processing payment for user ${user.email} for course ${course.title} - Amount: ${course.price}`);

        // Simulate success
        const paymentSuccess = true;

    } catch (error) {
        console.error('Payment Error:', error);
        res.status(500).json({ message: 'Server error during payment processing' });
    }
});

module.exports = router;
