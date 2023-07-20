import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const generateJWTToken = (id) => {
  return jwt.sign({ id }, process.env.SECRETKEY);
};

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 32,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  contact: {
    type: Number,
  },
  password: {
    type: String,
    required: true,
  },
  templates: {
    type: Array,
  },
});

const User = mongoose.model("user", userSchema);
export { User };
export { generateJWTToken };
