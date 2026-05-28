const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['admin', 'team_leader', 'member'], default: 'member' },
    mustChangePassword: { type: Boolean, default: false },
    notificationPrefs: {
      emailOnAssign: { type: Boolean, default: true },
      emailOnComment: { type: Boolean, default: true },
      emailOnChange: { type: Boolean, default: false },
      dailyDigest: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
)

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password)
}

userSchema.set('toJSON', {
  transform: (_, obj) => {
    delete obj.password
    return obj
  },
})

module.exports = mongoose.model('User', userSchema)
