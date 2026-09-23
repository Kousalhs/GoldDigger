// server.js
const http = require("http");
const fs = require("fs");
const path = require("path");
const EventEmitter = require("events");
const PDFDocument = require("pdfkit"); // Stretch Goal
const nodemailer = require("nodemailer"); // Stretch Goal

const PORT = process.env.PORT || 3000;
const priceEmitter = new EventEmitter();
let latestPrice = 2100.0;

// Algorithm to supply realistic looking prices
setInterval(() => {
  // Fluctuate price by up to £5 up or down
  const fluctuation = Math.random() * 10 - 5;
  latestPrice += fluctuation;
  priceEmitter.emit("newPrice", latestPrice);
}, 3000);

// Stretch Goal: Mock Email Transporter
async function sendMockEmail(amount, ounces) {
  try {
    let testAccount = await nodemailer.createTestAccount();
    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });

    let info = await transporter.sendMail({
      from: '"GoldDigger App" <no-reply@golddigger.app>',
      to: "investor@example.com",
      subject: "Purchase Confirmation",
      text: `Thank you for your purchase of ${ounces.toFixed(4)} oz of gold for £${amount}.`,
    });
    console.log(
      "Mock Email sent! Preview URL: %s",
      nodemailer.getTestMessageUrl(info),
    );
  } catch (err) {
    console.error("Failed to send mock email:", err);
  }
}

const server = http.createServer((req, res) => {
  // ROUTING: Server Sent Events
  if (req.url === "/stream-prices") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    res.write(`data: ${JSON.stringify({ price: latestPrice })}\n\n`);

    const sendPrice = (price) => {
      res.write(`data: ${JSON.stringify({ price })}\n\n`);
    };

    priceEmitter.on("newPrice", sendPrice);
    req.on("close", () => priceEmitter.removeListener("newPrice", sendPrice));
    return;
  }

  // ROUTING: Handle Purchase and Create Folders
  if (req.url === "/buy" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk.toString()));
    req.on("end", () => {
      const data = JSON.parse(body);
      const ounces = data.amount / data.priceAtPurchase;

      // Define directory paths
      const recordsDir = path.join(__dirname, "records");
      const receiptsDir = path.join(recordsDir, "receipts");
      const purchasesFile = path.join(recordsDir, "purchases.txt");

      // Create directories if they do not exist
      if (!fs.existsSync(receiptsDir)) {
        // { recursive: true } creates the parent 'records' folder and the nested 'receipts' folder at the same time
        fs.mkdirSync(receiptsDir, { recursive: true });
      }

      // Write to purchases.txt inside the 'records' folder
      const logEntry = `Date: ${new Date().toISOString()} | Amount: £${data.amount} | Price: £${data.priceAtPurchase}/oz | Bought: ${ounces.toFixed(4)} oz\n`;
      fs.appendFile(purchasesFile, logEntry, (err) => {
        if (err) console.error("Error writing to file:", err);
      });

      // Generate a PDF inside the 'receipts' folder
      const doc = new PDFDocument();
      const pdfPath = path.join(receiptsDir, `receipt_${Date.now()}.pdf`);
      doc.pipe(fs.createWriteStream(pdfPath));

      doc
        .fontSize(20)
        .text("GoldDigger Transaction Receipt", { align: "center" });
      doc.moveDown().fontSize(14).text(`Investment Amount: £${data.amount}`);
      doc.text(`Price at Purchase: £${data.priceAtPurchase.toFixed(2)} / oz`);
      doc.text(`Total Ounces Purchased: ${ounces.toFixed(4)} oz`);
      doc.text(`Date: ${new Date().toLocaleString()}`);
      doc.end();

      // Send Mock Email
      sendMockEmail(data.amount, ounces);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, ounces }));
    });
    return;
  }

  // ROUTING: Serve Static Files
  let filePath = path.join(
    __dirname,
    "public",
    req.url === "/" ? "index.html" : req.url,
  );
  let extname = path.extname(filePath);

  let contentType = "text/html";
  switch (extname) {
    case ".js":
      contentType = "text/javascript";
      break;
    case ".css":
      contentType = "text/css";
      break;
    case ".png":
      contentType = "image/png";
      break;
    case ".jpg":
      contentType = "image/jpg";
      break;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code == "ENOENT") {
        fs.readFile(
          path.join(__dirname, "public", "404.html"),
          (err, errorContent) => {
            res.writeHead(404, { "Content-Type": "text/html" });
            res.end(errorContent, "utf-8");
          },
        );
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`);
      }
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(content, "utf-8");
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
