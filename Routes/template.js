import express from "express";
import { Template } from "../Models/template.js";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import puppeteer from "puppeteer";
import fs from "fs";
import nodemailer from "nodemailer";
import { Upload } from "../Models/upload.js";

const router = express.Router();

// const upload = multer({ storage });
const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    const uniqueFileName = `${Date.now()}${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    cb(null, uniqueFileName);
  },
});

const upload = multer({ storage });
const templateId = Date.now().toString();

router.get("/all", async (req, res) => {
  try {
    const templates = await Template.find();
    if (!templates) return res.status(400).json({ data: "No templates found" });
    res.status(200).json({ data: templates });
  } catch (error) {
    console.log(error);
    res.status(500).json({ data: "Internal Server Error" });
  }
});
router.get("/allUploader", async (req, res) => {
  try {
    const templates = await Upload.find();
    if (!templates) return res.status(400).json({ data: "No templates found" });
    res.status(200).json({ data: templates });
  } catch (error) {
    console.log(error);
    res.status(500).json({ data: "Internal Server Error" });
  }
});

router.post("/templateUser", async (req, res) => {
  try {
    const template = new Template({
      personalDetails: req.body.personalDetails, // Store the file path in the personalDetails object

      educationDetails: req.body.educationDetails || [], // Ensure default empty array if not provided
      workExperience: req.body.workExperience || [], // Ensure default empty array if not provided
      projects: req.body.projects || [],
      skills: req.body.skills || [], // Ensure default empty array if not provided
      personid: templateId,
    });

    const newTemplate = await template.save();
    if (!newTemplate) {
      return res.status(400).json({ error: "Failed to save template" });
    }

    res
      .status(200)
      .json({ message: "Template added successfully", data: newTemplate });
  } catch (error) {
    console.log(error);
    res.status(500).json({ data: "Internal Server Error" });
  }
});
router.post("/uploader", upload.single("uploaded_file"), async (req, res) => {
  try {
    const upload = new Upload({
      personid: templateId,
      file: req.file,
    });

    const newTemplate = await upload.save();
    if (!newTemplate) {
      return res.status(400).json({ error: "Failed to save template" });
    }

    // Send the file URL as the response

    res
      .status(200)
      .json({ message: "Template added successfully", data: newTemplate });
  } catch (error) {
    console.log(error);
    res.status(500).json({ data: "Internal Server Error" });
  }
});
router.get(`/uploader/:id`, async (req, res) => {
  try {
    const { id } = req.params;
    const templatedata = await Upload.findOne({ personid: id });
    console.log(templatedata);
    const fileUrl = `http://localhost:7070/uploads/${templatedata.file.filename}`;
    console.log(fileUrl);
    if (!templatedata) res.status(400).json({ message: "Not found" });
    res.status(200).json({ fileUrl });
  } catch (error) {
    console.log(error);
    res.status(500).json({ data: "Internal Server Error" });
  }
});
router.get(`/templateid/:id`, async (req, res) => {
  try {
    const { id } = req.params;
    const templatedata = await Template.findOne({ personid: id });
    if (!templatedata) res.status(400).json({ message: "Not found" });
    res.status(200).json({ data: templatedata });
  } catch (error) {
    console.log(error);
  }
});
router.get("/download-pdf", async (req, res) => {
  try {
    const { template } = req.query;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`http://localhost:3000/${template}`, {
      waitUntil: "networkidle2",
    });
    await page.evaluate(() => {
      if (document.querySelector(".collapse")) {
        const collapses = document.querySelectorAll(".collapse");
        document.querySelector(".form-contact").classList.add("hidden");
        document.querySelector("#main-footer").classList.add("hidden");
        for (let i = 0; i < collapses.length; i++) {
          collapses[i].classList.add("show");
          collapses[i].classList.add("mar-height");
        }
      }
      if (document.querySelector(".template-2")) {
        document.querySelector(".php-email-form").classList.add("hidden");
        document.querySelector("header").classList.add("hidden");
        document.querySelector(".hero").classList.add("hero-edit");
        document.querySelector(".downloader").classList.add("hidden");
        const sections = document.querySelectorAll("section");
        sections.forEach((section, index) => {
          // Create a new page for each section
          if (index > 0) {
            const newPage = document.createElement("div");
            newPage.style.pageBreakBefore = "always";
            section.parentNode.insertBefore(newPage, section);
            newPage.appendChild(section);
          }
        });
      }
    });
    await page.addStyleTag({
      content: `
        @media print {
          body {
            width: auto;
            height: auto;
            margin: 20px;
            padding: 20px;
          }
        }
      `,
    });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      scale: 0.8,
      margin: {
        top: "150px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
    });

    await browser.close();

    const pdfPath = path.join("temp", "resume.pdf");

    fs.writeFile(pdfPath, pdfBuffer, (error) => {
      if (error) {
        console.error("Error saving PDF:", error);
        res.status(500).send("Error saving PDF");
      } else {
        res.download(pdfPath, "webpage.pdf", (error) => {
          if (error) {
            console.error("Error downloading PDF:", error);
            res.status(500).send("Error downloading PDF");
          }

          // Delete the temporary PDF file after download
          fs.unlink(pdfPath, (error) => {
            if (error) {
              console.error("Error deleting PDF:", error);
            }
          });
        });
      }
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Error generating PDF");
  }
});

router.post("/send-email", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Create a transporter using your SMTP settings
    const transporter = nodemailer.createTransport({
      host: "Gmail",

      auth: {
        user: "venkats1078@gmail.com",
        pass: "rtr@1078",
      },
    });
    console.log(email);
    // Create the email message
    const mailOptions = {
      from: "venkats1078@gmail.com",
      to: "venkatsp1997@gmail.com", // Replace with the template owner's email
      subject,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage: ${message}`,
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ message: "Failed to send the message" });
      } else {
        console.log("Message sent:", info.response);
        res.json({ message: "Message sent successfully" });
      }
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Failed to send the message" });
  }
});

export const templateRouter = router;
