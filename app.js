// Basic Imports
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');

// Security Middleware Imports
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const hpp = require('hpp');
const xss = require('xss-clean');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');

// Database Import
const mongoose = require('mongoose');

// Security Middleware Implementation
app.use(cookieParser());

// Correct CORS setup
app.use(cors({
  origin: ['http://localhost:5173', 'https://ponno-sheba.vercel.app'], // Allowed origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization', 'token'], // Allowed headers (include 'token')
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
}));


app.options('*', cors()); // Handle preflight requests

// Remove conflicting manual headers. CORS setup above handles everything.

// Security middlewares
app.use(helmet()); // Secures HTTP headers
app.use(xss()); // Prevents XSS attacks
app.use(hpp()); // Prevents HTTP Parameter Pollution
app.use(mongoSanitize()); // Prevents NoSQL injection attacks

mongoose.set('strictQuery', false);

app.use(bodyParser.json()); // Parses incoming requests with JSON payloads

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3000 // Limit each IP to 3000 requests per windowMs
});
app.use(limiter);

// Routing Implementation
app.get("/test", async (req, res) => {
  res.send("Server is working properly.");
});

const appRouter = require('./src/Routes/api');
app.use("/api", appRouter);

// Handle 404 errors for unknown routes
app.use((req, res) => {
  res.status(404).json({ status: "error", message: "Not Found" });
});

// MongoDB Connection
const URI = "mongodb+srv://mobinulislam:8NWFTTL3vZqC2W0L@cluster0.mskd8ua.mongodb.net/awave_market";

mongoose.connect(URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: true,
})
.then(() => {
  console.log(`Mongoose is connected`);
})
.catch(e => {
  console.log(e);
});

// Serve frontend static files from 'client/dist'
app.use(express.static('client/dist'));
app.get('*', function(req, res) {
  res.sendFile(path.resolve(__dirname, 'client', 'dist', 'index.html'));
});

module.exports = app;
