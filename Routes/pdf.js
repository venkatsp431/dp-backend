router.get("/download-pdf", async (req, res) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("http://localhost:7070", { waitUntil: "networkidle2" });

    const pdfBuffer = await page.pdf({ format: "A4" });

    await browser.close();

    const pdfPath = path.join(__dirname, "temp", "webpage.pdf");

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
