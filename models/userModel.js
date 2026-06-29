import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minLength: 3,
    maxLength: 20,
    match: /^[a-zA-Z0-9_]+$/,
    immutable: true // Enforces immutability at the Mongoose level
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true // Stored hash, edge handles the raw password string length
  },
  displayName: {
    type: String,
    required: true,
    trim: true,
    minLength: 1,
    maxLength: 50
  },
  bio: {
    type: String,
    default: "",
    maxLength: 200
  },
  avatarUrl: {
    type: String,
    default: "",
    maxLength: 500
  },
  acceptingQuestions: {
    type: Boolean,
    default: true
  },
  tags: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        return v.length <= 10 && v.every(tag => /^[a-z0-9-]{2,20}$/.test(tag));
      },
      message: "Tags must be 0-10 items, each 2-20 lowercase alphanumeric characters or hyphens."
    }
  },
  passwordResetToken: {
    type: String,
    default: null
  },
  passwordResetExpires: {
    type: Date,
    default: null
  },
  refreshToken: {
    type: String,
    default: null
  }
}, { timestamps: true });

//remove _id , __v , password from response
UserSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.password; // or passwordHash if you rename the field
    delete ret.passwordResetToken;
    delete ret.passwordResetExpires;
    delete ret.refreshToken;
    return ret;
  }
});

const User = mongoose.model('User', UserSchema);
export default User;