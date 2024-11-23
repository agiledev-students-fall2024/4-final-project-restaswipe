const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const UserSchema = new Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  otp: { type: String },
  otpExpiresAt: { type: Date },
  likedRestaurants: [{ type: String, ref: 'Restaurant' }],
  dislikedRestaurants: [{ type: String, ref: 'Restaurant' }],
});


UserSchema.methods.generateOTP = async function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOTP = await bcrypt.hash(otp, 10);
  this.otp = hashedOTP;
  this.otpExpiresAt = Date.now() + 5 * 60000;
  await this.save();
  return otp; 
};

UserSchema.methods.validateOTP = async function (otpValue) {
  if (!this.otp || !this.otpExpiresAt) {
    return false;
  }
  if (this.otpExpiresAt < Date.now()) {
    return false;
  }
  const isValid = await bcrypt.compare(otpValue, this.otp);
  return isValid;
};

UserSchema.methods.clearOTP = async function () {
  this.otp = undefined;
  this.otpExpiresAt = undefined;
  await this.save();
};

UserSchema.methods.generateJWT = function () {
  const today = new Date();
  const exp = new Date(today);
  exp.setDate(today.getDate() + parseInt(process.env.JWT_EXP_DAYS || '1'));

  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      exp: Math.floor(exp.getTime() / 1000),
    },
    process.env.JWT_SECRET
  );
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
