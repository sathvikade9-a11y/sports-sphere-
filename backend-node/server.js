require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 5000;
const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000';

// Initialize Supabase client — use env vars, fall back to project defaults
const supabaseUrl = process.env.SUPABASE_URL || 'https://bzmkegjbvpejazbekwpr.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6bWtlZ2pidnBlamF6YmVrd3ByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3NTA4OTYsImV4cCI6MjA5NzMyNjg5Nn0.b9FPoiM-vjdhDnwTdr09TSAlzp5USKg-k8BG9jYjAAY';

let supabase = null;
try {
  supabase = createClient(supabaseUrl, supabaseKey);
} catch (e) {
  supabase = null;
}

// Middleware
app.use(cors());
app.use(express.json());

// Ensure data folder and storage files exist
const DATA_DIR = path.join(__dirname, 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const INQUIRIES_FILE = path.join(DATA_DIR, 'inquiries.json');
const CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const initializeFile = (filePath, defaultData) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf8');
  }
};

initializeFile(INQUIRIES_FILE, []);
initializeFile(CONTACTS_FILE, []);

// Utility function to read files safely
const readJsonFile = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    return [];
  }
};

// Utility function to write files safely
const writeJsonFile = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    return false;
  }
};

// Mapping helpers for Supabase (snake_case) to camelCase frontend expectations
const mapInquiryToFrontend = (inq) => ({
  id: inq.id,
  name: inq.name,
  email: inq.email || '',
  phone: inq.phone || '',
  productName: inq.product_name,
  message: inq.message || '',
  submittedAt: inq.submitted_at
});

const mapContactToFrontend = (contact) => ({
  id: contact.id,
  name: contact.name,
  email: contact.email || '',
  phone: contact.phone || '',
  message: contact.message || '',
  analysis: contact.analysis || {},
  submittedAt: contact.submitted_at
});

// ==========================================
// API Endpoints
// ==========================================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    supabase: supabase ? 'connected' : 'not connected',
    supabaseUrl: supabaseUrl ? supabaseUrl.split('.')[0] + '.***' : 'missing'
  });
});

// 1. Get Products (Supports Search and Category Filters)
app.get('/api/products', async (req, res) => {
  const { category, search } = req.query;

  try {
    if (supabase) {
      let query = supabase.from('products').select('*');
      
      if (category && category !== 'all') {
        query = query.eq('category', category);
      }
      
      if (search) {
        const term = `%${search}%`;
        query = query.or(`name.ilike.${term},description.ilike.${term},brand.ilike.${term}`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return res.json(data);
    }
  } catch (err) {
    // Fall back to local storage on error
  }

  const products = readJsonFile(PRODUCTS_FILE);
  let filtered = [...products];

  if (category && category !== 'all') {
    filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const query = search.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.brand.toLowerCase().includes(query)
    );
  }

  res.json(filtered);
});

// 2. Submit Inquiry
app.post('/api/inquiries', async (req, res) => {
  const { name, email, phone, productName, message } = req.body;

  if (!name || !productName) {
    return res.status(400).json({ error: "Name and product name are required." });
  }

  try {
    if (supabase) {
      const dbInquiry = {
        name,
        email: email || '',
        phone: phone || '',
        product_name: productName,
        message: message || ''
      };
      
      const { data, error } = await supabase
        .from('inquiries')
        .insert([dbInquiry])
        .select();
        
      if (error) throw error;
      return res.status(201).json({
        message: "Inquiry submitted successfully",
        inquiry: mapInquiryToFrontend(data[0])
      });
    }
  } catch (err) {
    // Fall back to local JSON
  }

  const inquiries = readJsonFile(INQUIRIES_FILE);
  const newInquiry = {
    id: inquiries.length + 1,
    name,
    email: email || '',
    phone: phone || '',
    productName,
    message: message || '',
    submittedAt: new Date().toISOString()
  };

  inquiries.push(newInquiry);
  writeJsonFile(INQUIRIES_FILE, inquiries);

  res.status(201).json({
    message: "Inquiry submitted successfully",
    inquiry: newInquiry
  });
});

// 3. Submit Contact / Service Message (Proxies classification to Python service if online)
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !message) {
    return res.status(400).json({ error: "Name and message are required." });
  }

  let analysis = { category: "General Inquiry", urgency: "Medium", detectedTopics: [] };

  // Attempt to call Python NLP analysis endpoint
  try {
    const pyResponse = await axios.post(`${PYTHON_BACKEND_URL}/classify`, {
      message: message,
      name: name
    }, { timeout: 2000 });
    
    analysis = {
      category: pyResponse.data.category,
      urgency: pyResponse.data.urgency,
      detectedTopics: pyResponse.data.detectedTopics
    };
  } catch (err) {
    // Ignore and proceed with defaults
  }

  try {
    if (supabase) {
      const dbContact = {
        name,
        email: email || '',
        phone: phone || '',
        message,
        analysis
      };

      const { data, error } = await supabase
        .from('contacts')
        .insert([dbContact])
        .select();

      if (error) throw error;
      return res.status(201).json({
        message: "Contact message logged successfully",
        contact: mapContactToFrontend(data[0])
      });
    }
  } catch (err) {
    // Fall back to local JSON
  }

  const contacts = readJsonFile(CONTACTS_FILE);
  const newContact = {
    id: contacts.length + 1,
    name,
    email: email || '',
    phone: phone || '',
    message,
    analysis,
    submittedAt: new Date().toISOString()
  };

  contacts.push(newContact);
  writeJsonFile(CONTACTS_FILE, contacts);

  res.status(201).json({
    message: "Contact message logged successfully",
    contact: newContact
  });
});

// 4. Get submission history for a customer by email
app.get('/api/history', async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    if (supabase) {
      const { data: inqs, error: err1 } = await supabase
        .from('inquiries')
        .select('*')
        .eq('email', normalizedEmail);

      const { data: conts, error: err2 } = await supabase
        .from('contacts')
        .select('*')
        .eq('email', normalizedEmail);

      if (err1 || err2) throw (err1 || err2);

      return res.json({
        inquiries: (inqs || []).map(mapInquiryToFrontend),
        contacts: (conts || []).map(mapContactToFrontend)
      });
    }
  } catch (err) {
    // Fall back to local JSON
  }

  const inquiries = readJsonFile(INQUIRIES_FILE);
  const contacts = readJsonFile(CONTACTS_FILE);

  const userInquiries = inquiries.filter(i => (i.email || '').toLowerCase().trim() === normalizedEmail);
  const userContacts = contacts.filter(c => (c.email || '').toLowerCase().trim() === normalizedEmail);

  res.json({
    inquiries: userInquiries,
    contacts: userContacts
  });
});

// 5. Smart Pump Recommendation Proxy
app.post('/api/recommend', async (req, res) => {
  const { head, flow, application, dailyHours, electricityRate } = req.body;

  if (!head || !flow) {
    return res.status(400).json({ error: "Dynamic head (meters) and flow rate (LPM) are required." });
  }

  let products = [];
  try {
    if (supabase) {
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;
      products = data;
    }
  } catch (err) {
    // Fall back to local JSON
  }

  if (!products || products.length === 0) {
    products = readJsonFile(PRODUCTS_FILE);
  }

  try {
    const pythonResponse = await axios.post(`${PYTHON_BACKEND_URL}/recommend`, {
      products: products,
      requirements: {
        head: parseFloat(head),
        flow: parseFloat(flow),
        application: application || 'all',
        dailyHours: parseFloat(dailyHours || 4.0),
        electricityRate: parseFloat(electricityRate || 7.0)
      }
    });

    res.json(pythonResponse.data);
  } catch (error) {
    res.status(502).json({
      error: "Failed to connect to the smart recommendation engine.",
      details: error.message
    });
  }
});

// Start Server
app.listen(PORT, () => {
  // Silent start
});
