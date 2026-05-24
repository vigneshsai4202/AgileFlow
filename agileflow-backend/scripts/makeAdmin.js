/**
 * Usage: node scripts/makeAdmin.js <email>
 * Example: node scripts/makeAdmin.js sai@gmail.com
 */

require('dotenv').config()
const mongoose = require('mongoose')
const User = require('../models/User')

const email = process.argv[2]

if (!email) {
  console.error('Usage: node scripts/makeAdmin.js <email>')
  process.exit(1)
}

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const user = await User.findOneAndUpdate(
    { email },
    { role: 'admin' },
    { returnDocument: 'after' }
  ).select('name email role')

  if (!user) {
    console.error(`No user found with email: ${email}`)
  } else {
    console.log(`✅ ${user.name} (${user.email}) → role: ${user.role}`)
  }

  mongoose.disconnect()
})
