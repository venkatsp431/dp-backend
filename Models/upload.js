import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

// const fileSchema = new mongoose.Schema({
//   fileName: {
//     type: String,
//   },
//   filePath: {
//     type: String,
//   },
// });
// const projectSchema = new mongoose.Schema({
//   // fileUploads: [fileSchema],
// });

const uploadSchema = new mongoose.Schema({
  personid: {
    type: String,
  },
  file: {
    type: Object,
  },
});

const Upload = mongoose.model("upload", uploadSchema);
export { Upload };
