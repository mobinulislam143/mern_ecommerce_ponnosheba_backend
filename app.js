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

app.use(cors({
  origin: ['http://localhost:5173', 'https://ponno-sheba.vercel.app'], // Allowed origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
}));

app.options('*', cors()); // Handle preflight requests

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

app.use(helmet());
app.use(xss());
app.use(hpp());
app.use(mongoSanitize());

mongoose.set('strictQuery', false);

app.use(bodyParser.json());

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

app.use((req, res) => {
  res.status(404).json({ status: "error", message: "Not Found" });
});

// MongoDB Connection
let URI = "mongodb+srv://mobinulislam:8NWFTTL3vZqC2W0L@cluster0.mskd8ua.mongodb.net/awave_market";

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

// Frontend Connection
app.use(express.static('client/dist'));
app.get('*', function(req, res) {
  res.sendFile(path.resolve(__dirname, 'client', 'dist', 'index.html'));
});

module.exports = app;
