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

const templateSchema = new mongoose.Schema({
  personalDetails: {
    name: {
      type: String,
    },
    file: {
      type: String,
    },
    designation: {
      type: String,
    },
    experience: {
      type: Number,
    },
    email: {
      type: String,
    },
    birthday: {
      type: String,
    },
    phone: {
      type: Number,
    },
    city: {
      type: String,
    },
    age: {
      type: Number,
    },
    professionalSummary: {
      type: String,
    },
  },
  educationDetails: [
    {
      // Change the type to an array of objects

      qualification: {
        type: String,
      },
      institution: {
        type: String,
      },
      dates: {
        type: String,
      },
      coursework: {
        type: String,
      },
    },
  ],

  workExperience: [
    {
      jobTitle: {
        type: String,
      },
      company: {
        type: String,
      },
      dates: {
        type: String,
      },
      responsibility: {
        type: String,
      },
    },
  ],

  skills: [
    {
      skillName: {
        type: String,
      },
      skillPercentage: {
        type: Number,
      },
    },
  ],

  personid: {
    type: String,
  },
  projects: [
    {
      projectName: {
        type: String,
      },
      description: {
        type: String,
      },
      technologies: {
        type: String,
      },
      role: {
        type: String,
      },
      file: {
        type: Object,
      },
    },
  ],
});

const Template = mongoose.model("template", templateSchema);
export { Template };
