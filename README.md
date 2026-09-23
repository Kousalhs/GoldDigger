# GoldDigger App

A fully responsive, accessible web application that simulates a live gold investment platform. This project utilizes a custom Node.js backend to push real-time price updates to the client, process user investments, log transaction data, generate PDF receipts, and mock confirmation emails.

---

## Built with

- Semantic HTML5
- CSS3 (CSS Variables, Flexbox, `rem` units for responsiveness)
- Vanilla JavaScript (DOM Manipulation, Fetch API)
- Node.js (Native `http`, `fs`, `path`, and `events` modules)
- Server-Sent Events (SSE)
- NPM Packages (`pdfkit`, `nodemailer`)
- Render (Hosting)

---

## Features

- Real-time frontend updates displaying realistic simulated gold prices pushed from the backend via Server-Sent Events (SSE)
- Transaction processing that calculates purchased ounces dynamically based on the exact live price at the moment of investment
- Persistent transaction logging that writes user purchase details securely to a server-side text file (`purchases.txt`)
- Dynamic PDF receipt generation utilizing `pdfkit` to document the transaction details (amount, price, ounces, timestamp)
- Mock email dispatch integration using `nodemailer` and Ethereal to simulate post-purchase email confirmations
- AAA Accessibility compliance, including high-contrast styling, semantic landmarks, and dynamic `aria-live` regions for live price and connection status announcements
- Fully responsive layout built with relative units (`rem`) and custom CSS to remove default browser input styling (like number spin buttons) for a seamless cross-browser UI

---

**What I learned in this section:**

- Building and configuring a custom backend server using strictly native Node.js modules without external frameworks like Express
- Establishing one-way, real-time data streaming from a server to a client using Server-Sent Events (SSE) and the `EventEmitter` class
- Manually handling routing and serving static files (HTML, CSS, JavaScript, and images) by parsing URLs and MIME types 
- Processing asynchronous POST requests in native Node.js by listening to data chunks and parsing the final payload
- Generating and writing binary files (PDFs) to the server's file system using third-party NPM packages
- Implementing development-environment email mocking to test transaction confirmation flows without requiring live SMTP credentials

---

# Live Demo

[Link](https://golddigger-lhbz.onrender.com)
