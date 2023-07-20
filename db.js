import mongoose from "mongoose";

export function dbConnection() {
  const params = {
    useNewURLParser: true,
    useUnifiedTopology: true,
  };
  try {
    mongoose.connect(
      "mongodb+srv://venkat_port:venkat_port@clusterport.3wpp3xp.mongodb.net/?retryWrites=true&w=majority",
      params
    );
    console.log("Mongo Successfully Connected");
  } catch (error) {
    console.log("Error Connecting to:", error);
  }
}
export default dbConnection;
