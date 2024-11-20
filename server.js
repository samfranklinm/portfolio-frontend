// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');
const pdf = require('pdf-parse');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const { body, validationResult } = require('express-validator');
const RedisStore = require('connect-redis').default; // Updated usage
const helmet = require('helmet');
const redis = require('redis');
const crypto = require('crypto'); // Import crypto
const dotenv = require('dotenv');
dotenv.config(); // Load environment variables

// Initialize Redis Client without password
const redisClient = redis.createClient({
  host: 'localhost',
  port: 5000 // Ensure this port matches your Redis configuration
});

redisClient.on('error', (err) => {
  console.error('Redis error: ', err);
});

redisClient.connect().catch(console.error); // Ensure Redis client is connected

// Initialize Express App
const app = express();

// Configure trust proxy
app.set('trust proxy', 1); // Trust first proxy
const allowedOrigins = ['http://localhost:3000', 'https://samfranklin.dev'];
for (let port = 5000; port <= 5010; port++) {
  allowedOrigins.push(`http://localhost:${port}`);
}
// Configure CORS
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['POST'],
  allowedHeaders: ['Content-Type']
}));

// Use Helmet for secure HTTP headers
app.use(helmet());

// Configure Rate Limiting
const chatLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: 'Too many requests from this IP, please try again after 10 minutes'
});

// Configure Body Parser
app.use(bodyParser.json());
const XAI_API_KEY = process.env.XAI_API_KEY;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
const SESSION_SECRET = process.env.SESSION_SECRET;
// Configure Session Management with Redis
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET || 'your-secret-key', // Use a strong secret in production
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production', // true in production with HTTPS
    httpOnly: true,
    sameSite: 'lax'
  }
}));

// Load Resume Text
let resumeText = '';

const loadResume = async () => {
  try {
    const dataBuffer = fs.readFileSync('./resume.pdf');
    const data = await pdf(dataBuffer);
    resumeText = data.text;
    console.log('Resume loaded successfully.');
  } catch (error) {
    console.error('Error loading resume:', error);
  }
};

loadResume();

// Helper Functions

function getSystemPrompts(isNewSession, resumeText) {
  const basePrompt = {
    role: "system", 
    content: `${process.env.BASE_PERSONA} ${
      isNewSession ? process.env.GREETING_PERSONA : process.env.SUBSEQUENT_PERSONA
    } Always conclude responses with an appropriate follow-up unless context clearly requires otherwise.`
  };
  
  const resumePrompt = {
    role: "system",
    content: `Resume: ${resumeText}`
  };
  
  return [basePrompt, resumePrompt];
}

function generateUUID() {
  return crypto.randomUUID();
}

// Chat Endpoint
app.post('/api/chat', 
  chatLimiter,
  body('question').isString().trim().escape(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const session = req.session;
    const isNewSession = !session.history;

    if (isNewSession) {
      session.history = [];
    }

    const question = req.body.question;

    const messages = [
      ...getSystemPrompts(isNewSession, resumeText),
      ...session.history,
      {
        role: "user",
        content: question
      }
    ];

    try {
      const response = await axios.post('https://api.x.ai/v1/chat/completions', {
        messages,
        model: "grok-beta",
        temperature: 0.7,
        stream: false
      }, {
        headers: {
          'Authorization': `Bearer ${XAI_API_KEY}`, // Ensure this is set in .env
          'Content-Type': 'application/json',
        },
      });

      const answer = response.data.choices[0].message.content;
      
      // Update conversation history
      session.history.push(
        { role: "user", content: question },
        { role: "assistant", content: answer }
      );

      // Keep history manageable
      if (session.history.length > 10) {
        session.history = session.history.slice(-10);
      }

      res.json({ 
        answer
      });
    } catch (error) {
      console.error('Error generating response:', error.response ? error.response.data : error.message);
      let errorMessage = 'An unexpected error occurred. Please try again later.';
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Invalid API key. Please check your configuration.';
        } else if (error.response.status === 429) {
          errorMessage = 'Too many requests. Please try again later.';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      }
      res.status(500).json({ error: errorMessage });
    }
  }
);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack); // Log detailed error on the server
  if (!res.headersSent) {
    res.status(500).json({ error: 'Something went wrong! Please try again later.' }); // Generic message to the client
  }
});

// Start the Server
const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});