const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  emailOrPhone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['consumer', 'farmer', 'coop', 'admin'], default: 'consumer' },
  cksNumber: { type: String },
  mernisNumber: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);