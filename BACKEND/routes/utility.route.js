const utilityController = require('../controllers/utility.controller');

const express = require('express');
const router = express.Router();
const { body } = require("express-validator");
const authMiddleware = require('../middleware/auth.middleware');

const { updateStatus } = require("../controllers/utility.controller");
router.post('/register', [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('fullname.firstname').isLength({ min: 3 }).withMessage('Firstname must be at least 3 characters long'),
    body('fullname.lastname').isLength({ min: 3 }).withMessage('Lastname must be at least 3 characters long'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('contact').isLength({ min: 10, max: 10 }).withMessage('Contact number must be exactly 10 digits long'),
    body('profession').isIn(['plumber', 'electrician', 'mechanic', 'technician'])
      .withMessage('Profession must be one of: plumber, electrician, mechanic, technician'),
    body('experience').isNumeric().withMessage('Experience must be a number'),
], utilityController.registerUtility);  
// LOGIN
router.post('/login', [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
], utilityController.loginUtility);

// PROFILE
router.get('/profile', authMiddleware.authUtility, utilityController.getUtilityProfile);

// LOGOUT
router.post('/logout', authMiddleware.authUtility, utilityController.logoutUtility); // ✅ better as POST

router.patch("/:id/status", authMiddleware.authUtility, utilityController.updateStatus);
router.put('/update-profile', authMiddleware.authUtility, utilityController.updateProfile);
module.exports = router;
