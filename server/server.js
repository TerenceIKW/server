
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================
// CORS CONFIGURATION
// ============================================================

const allowedOrigins = [
    'https://bobabnetworking.org',
    'https://www.bobabnetworking.org'
];

const corsOptions = {
    origin: function (origin, callback) {

        // Allow requests without an Origin header
        // (e.g. Postman and server-to-server requests)
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        console.error('Blocked by CORS:', origin);

        return callback(
            new Error(`CORS blocked: ${origin}`)
        );
    },

    methods: [
        'GET',
        'POST',
        'PUT',
        'PATCH',
        'DELETE',
        'OPTIONS'
    ],

    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With'
    ],

    credentials: true,
    optionsSuccessStatus: 204
};

// ============================================================
// MIDDLEWARE
// ============================================================

// CORS must be registered before API routes
app.use(cors(corsOptions));

// Handle browser preflight requests
app.options(/.*/, cors(corsOptions));

// Parse incoming JSON
app.use(express.json());

// Parse URL-encoded form submissions
app.use(express.urlencoded({ extended: true }));

// ============================================================
// STATIC FILE CONFIGURATION
// ============================================================

// Local website directory
const WEBSITE_PATH = path.join(
    'C:',
    'Users',
    'Ofentse Milanzi',
    'Documents',
    'New Baobab',
    'New Baobab'
);

// Admin dashboard and backend public files
app.use(
    express.static(path.join(__dirname, 'public'))
);

// Main Baobab Networking website
app.use(
    express.static(WEBSITE_PATH)
);

// ============================================================
// API ROUTES
// ============================================================

// Contact form
app.use(
    '/api/contact',
    require('./routes/contact')
);

// Donations
app.use(
    '/api/donation',
    require('./routes/donation')
);

// Volunteer applications
app.use(
    '/api/volunteer',
    require('./routes/volunteer')
);

// Admin dashboard and management
app.use(
    '/api/admin',
    require('./routes/admin')
);

// ============================================================
// HEALTH CHECK
// ============================================================

app.get('/api/health', (req, res) => {

    res.status(200).json({
        success: true,
        message: 'Baobab backend is running',
        timestamp: new Date().toISOString()
    });

});

// ============================================================
// ROOT ROUTE
// ============================================================

app.get('/', (req, res) => {

    res.sendFile(
        path.join(WEBSITE_PATH, 'index.html'),
        (err) => {
            if (err) {
                console.error('Website loading error:', err.message);

                if (!res.headersSent) {
                    res.status(500).send(
                        'Unable to load the website.'
                    );
                }
            }
        }
    );

});

// ============================================================
// 404 HANDLER
// ============================================================

// Handles unmatched requests
app.use((req, res) => {

    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl
    });

});

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

app.use((err, req, res, next) => {

    console.error('Server error:', err.message);

    // CORS errors
    if (err.message.startsWith('CORS blocked:')) {

        return res.status(403).json({
            success: false,
            message: 'Origin not allowed by CORS policy'
        });

    }

    // Invalid JSON requests
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {

        return res.status(400).json({
            success: false,
            message: 'Invalid JSON request body'
        });

    }

    // General server errors
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });

});

// ============================================================
// START SERVER
// ============================================================

async function start() {

    try {

        // Connect to database first
        await connectDB();

        // Start Express server
        app.listen(PORT, () => {

            console.log('======================================');
            console.log(' BAOBAB NETWORKING BACKEND');
            console.log('======================================');

            console.log(`Backend: http://localhost:${PORT}`);

            console.log(`Website: http://localhost:${PORT}/`);

            console.log(`Admin: http://localhost:${PORT}/admin.html`);

            console.log(`Health: http://localhost:${PORT}/api/health`);

            console.log('======================================');

        });

    } catch (err) {

        console.error(
            'Failed to start server:',
            err.message
        );

        process.exit(1);

    }

}

// Run application
start();
