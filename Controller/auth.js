import jwt from "jsonwebtoken";
import { User } from "../Models/user.js";

const isAuthenticated = async (req, res, next) => {
  let token;
  if (req.headers) {
    try {
      token = await req.headers["x-auth-token"];
      const decode = jwt.verify(token, "heythereiamsecretcode");
      console.log(decode);
      req.user = await User.findById(decode.id).select("_id name email");
      next();
    } catch (error) {
      console.log(error);
      return res.status(401).json({ message: "Invalid token" });
    }
  }
  if (!req.headers) {
    console.log("no token found");
  }
};
export default isAuthenticated;
