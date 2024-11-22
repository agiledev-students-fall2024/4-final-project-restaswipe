const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
const User = require('../models/User')

const passportJWT = require('passport-jwt')
const ExtractJwt = passportJWT.ExtractJwt
const JwtStrategy = passportJWT.Strategy

let jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('JWT'),
  secretOrKey: process.env.JWT_SECRET,
}

const jwtVerifyToken = async function (jwt_payload, next) {
  const expirationDate = new Date(jwt_payload.exp * 1000)
  if (expirationDate < new Date()) {
    return next(null, false, { message: 'JWT token has expired.' })
  }

  const userId = new ObjectId(jwt_payload.id)
  const user = await User.findOne({ _id: userId }).exec()
  if (user) {
    next(null, user)
  } else {
    next(null, false, { message: 'User not found' })
  }
}

const jwtStrategy = jwtOptions => {
  const strategy = new JwtStrategy(jwtOptions, jwtVerifyToken)
  return strategy
}

module.exports = jwtStrategy(jwtOptions, jwtVerifyToken)