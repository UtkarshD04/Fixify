const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const utilitySchema = new mongoose.Schema({
  fullname: {
    firstname: {
      type: String,
      required: true,
      minlength: [3, 'Fullname must be at least 3 characters long'],
    },
    lastname: {
      type: String,
      minlength: [3, 'Fullname must be at least 3 characters long'],
    }
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/.+\@.+\..+/, 'Please enter a valid email address'],
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  contact: {
    type: Number,
    required: true,
    maxlength: [10, 'Contact number must not exceed 10 characters'],
  },
  profession: {
    type: String,
    required: true,
    enum: ['plumber', 'electrician', 'mechanic', 'technician'],
  },
  experience: {
    type: Number,
    required: true,
    min: [0, 'Experience must be at least 0 years'],
  },
  socketId: {
    type: String,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'busy'],
    default: 'inactive',
  },
  profileImage: {
    type: String,
    default: ''
  },
}, { timestamps: true });

// 🔐 Hash password before saving

utilitySchema.methods.generateAuthToken = async function () {
const token = await jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
return token;
};

utilitySchema.methods.comparePassword = async function (Password) {
  return bcrypt.compare(Password, this.password);
};
utilitySchema.statics.hashPassword = async function (password) {
  
    return await bcrypt.hash(password, 10);
};

const utilityModel = mongoose.model('utility', utilitySchema);
module.exports = utilityModel;
