const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 5000;
const { runQuery } = require('./db');

// Use JSON middleware and CORS
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Define a root route
app.get('/register', (req, res) => {
    res.send('Welcome to the Registration API!');
});

/// Users Table with Role Management
const createUsersTable = `
    IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_NAME = 'users' AND TABLE_TYPE = 'BASE TABLE'
    )
    BEGIN
        CREATE TABLE users (
            id INT IDENTITY(1,1) PRIMARY KEY,
            username VARCHAR(255) UNIQUE,
            password VARCHAR(255),
            email VARCHAR(255) UNIQUE,
            created_at DATETIME DEFAULT GETDATE(),
            last_login DATETIME NULL,  -- New column for last login time
            last_logout DATETIME NULL,     -- New column for last logout time
            action VARCHAR(255) NULL
        );
    END
    ELSE
    BEGIN
        -- Alter the table to add new columns if they do not exist
        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'last_login')
        BEGIN
            ALTER TABLE users ADD last_login DATETIME NULL;
        END

        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'last_logout')
        BEGIN
            ALTER TABLE users ADD last_logout DATETIME NULL;
        END
    END
`;

runQuery(createUsersTable, [], (err) => {
    if (err) {
        console.error('❌ Error creating users table:', err.message);
    } else {
        console.log('✅ Users table created or already exists with last_login and last_logout columns.');
    }
});

// Purchase Orders Table
const createPurchaseOrdersTable = `
    IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_NAME = 'purchase_orders' AND TABLE_TYPE = 'BASE TABLE'
    )
    BEGIN
        CREATE TABLE purchase_orders (
            record_sr_no INT IDENTITY(1,1) PRIMARY KEY,
            work_order_no VARCHAR(255),
            party_name VARCHAR(255),
            purchase_order VARCHAR(255),
            date DATE,
            city VARCHAR(255),
            units VARCHAR(255),
            air_plug_ap INT,
            setting_ring_sr INT,
            air_plug_set  VARCHAR(255),
            sub_sr_no INT,
            qty INT,
            nominal_size FLOAT,
            size_low_tolerance FLOAT,
            size_high_tolerance FLOAT,
            bore_jet_type VARCHAR(255),
            higher_lower VARCHAR(255),
            jet_count VARCHAR(255),
            dispatch_week VARCHAR(255),
            remark VARCHAR(255),
            created_at DATETIME DEFAULT GETDATE(),
            type VARCHAR(255),
            isRejected VARCHAR(255),
            rejectionRemark VARCHAR(255),
            label_size VARCHAR(255),
            air_ring_ar INT,
            setting_plug_sp INT,
            air_ring_set VARCHAR(255),
            air_snap_as INT,
            setting_master_sm INT,
            air_snap_set VARCHAR(255)
        );
    END
`;

runQuery(createPurchaseOrdersTable, [], (err) => {
    if (err) {
        console.error('❌ Error creating purchase orders table:', err.message);
    } else {
        console.log('✅ Purchase Orders table created or already exists.');
    }
});

// Air Snap Table
const createAirSnapTable = `
    IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_NAME = 'air_snap_table' AND TABLE_TYPE = 'BASE TABLE'
    )
    BEGIN
        CREATE TABLE air_snap_table (
            record_sr_no INT NOT NULL,
            work_order_no VARCHAR(255),
            party_name VARCHAR(255),
            purchase_order VARCHAR(255),
            date DATE,
            city VARCHAR(255),
            units VARCHAR(255),
            air_snap_as INT,
            setting_master_sm INT,
            air_snap_set VARCHAR(255),
            sub_sr_no INT,
            qty INT,
            nominal_size FLOAT,
            size_low_tolerance FLOAT,
            size_high_tolerance FLOAT,
            bore_jet_type VARCHAR(255),
            higher_lower VARCHAR(255),
            jet_count VARCHAR(255),
            dispatch_week VARCHAR(255),
            remark VARCHAR(255),
            created_at DATETIME DEFAULT GETDATE(),
            type VARCHAR(255),
            calculatedDispatchDate VARCHAR(255),
            label_size VARCHAR(255),
            isRejected INT,
            rejectionRemark VARCHAR(255),
            PRIMARY KEY (record_sr_no)
        );
    END
`;

runQuery(createAirSnapTable, [], (err) => {
    if (err) {
        console.error('❌ Error creating air_snap_table:', err.message);
    } else {
        console.log('✅ air_snap_table created or already exists.');
    }
});

//Air Ring Table
const createAirRingTable = `
    IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_NAME = 'air_ring_table' AND TABLE_TYPE = 'BASE TABLE'
    )
    BEGIN
        CREATE TABLE air_ring_table (
            record_sr_no INT NOT NULL,
            work_order_no VARCHAR(255),
            party_name VARCHAR(255),
            purchase_order VARCHAR(255),
            date DATE,
            city VARCHAR(255),
            units VARCHAR(255),
            air_ring_ar INT,
            setting_plug_sp INT,
            air_ring_set VARCHAR(255),
            sub_sr_no INT,
            qty INT,
            nominal_size FLOAT,
            size_low_tolerance FLOAT,
            size_high_tolerance FLOAT,
            bore_jet_type VARCHAR(255),
            higher_lower VARCHAR(255),
            jet_count VARCHAR(255),
            dispatch_week VARCHAR(255),
            remark VARCHAR(255),
            created_at DATETIME DEFAULT GETDATE(),
            type VARCHAR(255),
            calculatedDispatchDate VARCHAR(255),
            label_size VARCHAR(255),
            isRejected INT,
            rejectionRemark VARCHAR(255),
            PRIMARY KEY (record_sr_no)
        );
    END
`;

runQuery(createAirRingTable, [], (err) => {
    if (err) {
        console.error('❌ Error creating air_ring_table:', err.message);
    } else {
        console.log('✅ air_ring_table created or already exists.');
    }
});


// Air Plug Table
const createAirPlugTable = `
    IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_NAME = 'air_plug_table' AND TABLE_TYPE = 'BASE TABLE'
    )
    BEGIN
        CREATE TABLE air_plug_table (
            record_sr_no INT NOT NULL,
            work_order_no VARCHAR(255),
            party_name VARCHAR(255),
            purchase_order VARCHAR(255),
            date DATE,
            city VARCHAR(255),
            units VARCHAR(255),
            air_plug_ap INT,
            setting_ring_sr INT,
            air_plug_set VARCHAR(255),
            sub_sr_no INT,
            qty INT,
            nominal_size FLOAT,
            size_low_tolerance FLOAT,
            size_high_tolerance FLOAT,
            bore_jet_type VARCHAR(255),
            higher_lower VARCHAR(255),
            jet_count VARCHAR(255),
            dispatch_week VARCHAR(255),
            remark VARCHAR(255),
            created_at DATETIME DEFAULT GETDATE(),
            type VARCHAR(255),
            calculatedDispatchDate VARCHAR(255),
            label_size VARCHAR(255),
            isRejected INT,
            rejectionRemark VARCHAR(255),
            PRIMARY KEY (record_sr_no)
        );
    END
`;

runQuery(createAirPlugTable, [], (err) => {
    if (err) {
        console.error('❌ Error creating air_plug_table:', err.message);
    } else {
        console.log('✅ air_plug_table created or already exists.');
    }
});



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////  Progress Bar ////////////////////////////////////////////
const createProgressTable = `
    IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_NAME = 'progress' AND TABLE_TYPE = 'BASE TABLE'
    )
    BEGIN
        CREATE TABLE progress (
            record_sr_no VARCHAR(255) NOT NULL,
            party_name VARCHAR(255) NOT NULL,
            current_stage INT,
            work_order_no VARCHAR(255),
            sub_sr_no INT,
            status VARCHAR(255),
            rejection_remark VARCHAR(MAX), -- ✅ Use VARCHAR(MAX) instead of TEXT
            timestamp DATETIME DEFAULT GETDATE(),
            PRIMARY KEY (record_sr_no, party_name)
        );
    END
`;


runQuery(createProgressTable, [], (err) => {
    if (err) {
        console.error('❌ Error creating progress table:', err.message);
    } else {
        console.log('✅ Progress table created or already exists.');
    }
});





app.get("/ProgressBar/:record_sr_no/:party_name", (req, res) => {
    const { record_sr_no, party_name } = req.params;

    const progressQuery = `
        SELECT current_stage
        FROM dbo.progress
        WHERE record_sr_no = ?
          AND party_name = ?
    `;

    const componentQuery = `
        SELECT *, 'Air Snap' AS type 
        FROM dbo.air_snap_table 
        WHERE record_sr_no = ?
        UNION ALL
        SELECT *, 'Air Ring' AS type 
        FROM dbo.air_ring_table 
        WHERE record_sr_no = ?
        UNION ALL
        SELECT *, 'Air Plug' AS type 
        FROM dbo.air_plug_table 
        WHERE record_sr_no = ?
    `;

    runQuery(progressQuery, [record_sr_no, party_name], (err, progressRow) => {
        if (err) {
            console.error("❌ Error fetching progress:", err.message);
            return res.status(500).json({ error: "Internal server error" });
        }

        runQuery(componentQuery, [record_sr_no, record_sr_no, record_sr_no], (err, componentRow) => {
            if (err) {
                console.error("❌ Error fetching component details:", err.message);
                return res.status(500).json({ error: "Internal server error" });
            }

            if (progressRow.length > 0 && componentRow.length > 0) {
                res.json({
                    currentStage: progressRow[0].current_stage,
                    purchaseOrderDetails: {
                        ...componentRow[0],
                        componentType: componentRow[0].type
                    }
                });
            } else {
                res.status(404).json({ error: "Record not found" });
            }
        });
    });
});


// Save progress (update the current stage)

app.post('/addWorkOrder', (req, res) => {
    const { record_sr_no, party_name, work_order_no, sub_sr_no } = req.body;

    // Validate input
    if (!record_sr_no || !party_name || !work_order_no || !sub_sr_no) {
        return res.status(400).json({ error: "All fields are required: record_sr_no, party_name, work_order_no, sub_sr_no" });
    }

    const query = `
        MERGE progress AS target
        USING (SELECT ? AS record_sr_no, ? AS party_name) AS source
        ON target.record_sr_no = source.record_sr_no AND target.party_name = source.party_name
        WHEN MATCHED THEN
            UPDATE SET work_order_no = ?, sub_sr_no = ?
        WHEN NOT MATCHED THEN
            INSERT (record_sr_no, party_name, work_order_no, sub_sr_no)
            VALUES (?, ?, ?, ?);
    `;

    const params = [
        record_sr_no, party_name,       // for source
        work_order_no, sub_sr_no,       // for update
        record_sr_no, party_name, work_order_no, sub_sr_no // for insert
    ];

    runQuery(query, params, function (err) {
        if (err) {
            console.error("Error inserting/updating work order:", err.message);
            return res.status(500).json({ error: "Failed to insert or update work order" });
        }

        res.status(200).json({
            success: true,
            message: "Work order added or updated successfully",
        });
    });
});



// Save progress (update the current stage)
app.post('/ProgressBar/:record_sr_no/:party_name', (req, res) => {
    const { record_sr_no, party_name } = req.params;
    const { current_stage, work_order_no } = req.body;

    const query = `
        MERGE progress AS target
        USING (SELECT ? AS record_sr_no, ? AS party_name) AS source
        ON target.record_sr_no = source.record_sr_no AND target.party_name = source.party_name
        WHEN MATCHED THEN
            UPDATE SET current_stage = ?, work_order_no = ?
        WHEN NOT MATCHED THEN
            INSERT (record_sr_no, party_name, current_stage, work_order_no)
            VALUES (?, ?, ?, ?);
    `;

    const params = [
        record_sr_no, party_name,         // source for MERGE
        current_stage, work_order_no,     // for UPDATE
        record_sr_no, party_name, current_stage, work_order_no // for INSERT
    ];

    runQuery(query, params, (err) => {
        if (err) {
            console.error("Error saving progress:", err.message);
            return res.status(500).json({ error: err.message });
        }

        res.status(200).json({
            success: true,
            message: 'Progress saved successfully',
            currentStage: current_stage,
        });
    });
});




app.get('/fetch-progress', (req, res) => {
    const { record_sr_no } = req.query;

    // Base queries for each table
    let airSnapQuery = `SELECT *, 'Air Snap' as type FROM dbo.air_snap_table`;
    let airRingQuery = `SELECT *, 'Air Ring' as type FROM dbo.air_ring_table`;
    let airPlugQuery = `SELECT *, 'Air Plug' as type FROM dbo.air_plug_table`;

    // Add WHERE clause if record_sr_no is provided
    const params = [];
    if (record_sr_no) {
        const whereClause = ` WHERE record_sr_no = ?`;
        airSnapQuery += whereClause;
        airRingQuery += whereClause;
        airPlugQuery += whereClause;
        // Add the parameter three times, once for each query
        params.push(record_sr_no, record_sr_no, record_sr_no);
    }

    // Combine all queries with UNION
    const fullQuery = `
        ${airSnapQuery}
        UNION ALL
        ${airRingQuery}
        UNION ALL
        ${airPlugQuery}
    `;

    runQuery(fullQuery, params, (err, rows) => {
        if (err) {
            console.error('Error fetching history:', err.message);
            res.status(500).json({ error: 'Failed to fetch history' });
        } else {
            res.status(200).json({ data: rows });
        }
    });
});


app.post('/reject-entry', (req, res) => {
    const { record_sr_no, work_order_no, sub_sr_no, status, rejection_remark } = req.body;

    // Update only the specific entry matching both record_sr_no and work_order_no
    const sql = `
        UPDATE dbo.progress 
        SET status = ?, rejection_remark = ? 
        WHERE record_sr_no = ? 
        AND work_order_no = ? 
        AND sub_sr_no = ?
    `;

    runQuery(sql, [status, rejection_remark, record_sr_no, work_order_no, sub_sr_no], (err) => {
        if (err) {
            console.error("Update Error:", err.message);
            return res.status(500).json({
                success: false,
                message: "Failed to reject entry",
                error: err.message
            });
        }

        if (this.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "No matching entry found to reject"
            });
        }

        res.json({
            success: true,
            message: "Entry rejected successfully",
            changes: this.affectedRows
        });
    });
});

// Define the /get-order-status route
app.get('/get-order-status', (req, res) => {
    const record_sr_no = req.query.record_sr_no;  // Assuming you pass the orderID as a query parameter

    if (!record_sr_no) {
        return res.status(400).json({ message: 'Order ID is required' });
    }

    // Query the database to fetch the status for the given order
    runQuery('SELECT status, rejection_remark FROM dbo.progress WHERE record_sr_no = ?', [record_sr_no], (err, rows) => {
        if (err) {
            console.error('Error querying database:', err);
            return res.status(500).json({ message: 'Error fetching order status' });
        }

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const status = rows[0].status;  // Get status from the result
        const rejection_remark = rows[0].rejection_remark;
        return res.json({ status, rejection_remark });
    });
});


//////////////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////// Login Route //////////////////////////////////////////////////////


// Example of checking for session timeout
app.use((req, res, next) => {
    const user = req.user; // Assuming you have user info in the request
    if (user) {
        const currentTime = new Date();
        const lastActivityTime = user.last_activity; // Store this in user session
        const timeoutDuration = 15 * 60 * 1000; // 15 minutes

        if (currentTime - lastActivityTime > timeoutDuration) {
            user.last_logout = new Date(); // Update last logout time
            user.save(); // Save user data
            // Optionally, log the user out
            req.logout(); // If using passport.js or similar
        } else {
            user.last_activity = currentTime; // Update last activity time
        }
    }
    next();
});


// Assuming you have a User model
// const User = require('./models/User'); // Adjust the path as necessary


// Function to get the current local timestamp
const getLocalTimestamp = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const localTime = new Date(now.getTime() - offset * 60000);
    return localTime.toISOString().slice(0, 19).replace('T', ' ');
};

// Login endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send({ message: "All fields are required" });
    }

    const query = `SELECT * FROM dbo.users WHERE username = ? AND password = ?`;

    runQuery(query, [username, password], (err, results) => {
        if (err) {
            console.error('Error fetching user:', err.message);
            return res.status(500).send({ message: "Login failed" });
        }

        if (results.length > 0) {
            const user = results[0];

            // Log the login action
            const logActionQuery = `INSERT INTO user_actions (user_id, action) VALUES (?, ?)`;
            runQuery(logActionQuery, [user.id, 'User logged in'], (logErr) => {
                if (logErr) {
                    console.error('Error logging action:', logErr.message);
                }
            });

            res.send({ message: "Login successful", user });
        } else {
            res.status(401).send({ message: "Invalid credentials" });
        }
    });
});

// Logout endpoint
app.post('/logout', (req, res) => {
    const { userId } = req.body; // Get user ID from the request body

    if (!userId) {
        return res.status(400).send({ message: "User ID is required" });
    }

    // Log the logout action
    const logActionQuery = `INSERT INTO user_actions (user_id, action) VALUES (?, ?)`;
    runQuery(logActionQuery, [userId, 'User logged out'], (logErr) => {
        if (logErr) {
            console.error('Error logging action:', logErr.message);
            return res.status(500).send({ message: "Logout failed" });
        }
        res.send({ message: "Logout successful" });
    });
});



app.post('/log-action', (req, res) => {
    const { userId, action } = req.body;

    if (!userId || !action) {
        return res.status(400).send({ message: "User ID and action are required" });
    }

    // Check if an entry already exists for this user and action
    const checkQuery = `SELECT * FROM user_action_summary WHERE user_id = ? AND action = ?`;
    runQuery(checkQuery, [userId, action], (checkErr, checkResults) => {
        if (checkErr) {
            console.error('Error checking action summary:', checkErr.message);
            return res.status(500).send({ message: "Failed to check action summary" });
        }

        if (checkResults.length > 0) {
            // Update existing entry
            const updateQuery = `UPDATE user_action_summary SET action_count = action_count + 1, last_action_timestamp = GETDATE() WHERE id = ?`;
            runQuery(updateQuery, [checkResults[0].id], (updateErr) => {
                if (updateErr) {
                    console.error('Error updating action summary:', updateErr.message);
                    return res.status(500).send({ message: "Failed to update action summary" });
                }
                res.send({ message: "Action logged successfully" });
            });
        } else {
            // Insert new entry
            const insertQuery = `INSERT INTO user_action_summary (user_id, action) VALUES (?, ?)`;
            runQuery(insertQuery, [userId, action], (insertErr) => {
                if (insertErr) {
                    console.error('Error logging action:', insertErr.message);
                    return res.status(500).send({ message: "Failed to log action" });
                }
                res.send({ message: "Action logged successfully" });
            });
        }
    });
});



app.get('/users-with-actions', (req, res) => {
    const query = `
        SELECT u.id, u.username, u.email, u.last_login, u.last_logout, 
               a.action, a.action_count, a.last_action_timestamp
        FROM dbo.users u
        LEFT JOIN dbo.user_action_summary a ON u.id = a.user_id
    `;

    runQuery(query, [], (err, results) => {
        if (err) {
            console.error('Error fetching users with actions:', err.message);
            return res.status(500).send({ message: "Failed to fetch users with actions" });
        }
        res.send({ users: results });
    });
});


app.get('/user-actions/:userId', (req, res) => {
    const { userId } = req.params;

    const query = `
        SELECT u.id, u.username, a.action, last_action_timestamp 
        FROM dbo.users u 
        LEFT JOIN dbo.user_action_summary a ON u.id = a.user_id 
        WHERE u.id = ? 
        ORDER BY last_action_timestamp DESC
    `;
    
    runQuery(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching user actions:', err.message);
            return res.status(500).send({ message: "Failed to fetch user actions" });
        }
        res.send({ actions: results });
    });
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////// Registration Route ///////////////////////////////////////////////////


app.post('/register', (req, res) => {
    const { username, password, email } = req.body; // default role is 'user'

    if (!username || !password || !email) {
        return res.status(400).send({ message: "All fields are required" });
    }

    // Check if the username or email already exists in the database
    const checkQuery = `SELECT *
                        FROM dbo.users
                        WHERE username = ?
                           OR email = ?`;
    runQuery(checkQuery, [username, email], (err, results) => {
        if (err) {
            console.error('Error checking for existing user:', err.message);
            return res.status(500).send({ message: 'Internal server error' });
        }

        // Check for already existing data from the database
        if (results.length > 0) {
            const user = results[0]; // Get the first user from the results
            const errorMessage = user.username === username ? `Username (${username}) is already taken` : `Email (${email}) is already registered`;
            return res.status(400).send({ message: errorMessage });
        }

        const query = `INSERT INTO dbo.users (username, password, email)
                       VALUES (?, ?, ?)`;

        runQuery(query, [username, password, email], (err) => {
            if (err) {
                console.error('Error registering user:', err.message);
                return res.status(500).send({ message: 'Registration failed' });
            }
            res.send({ message: "Registration successful", success: true });
        });
    });
});

// Fetch Daily Data
app.get('/daily-data', (req, res) => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    const sqlDate = `${yyyy}-${mm}-${dd}`;

    const query = `
        SELECT *, 'Air Snap' as type 
        FROM dbo.air_snap_table
        WHERE DATE(created_at) = ?
        UNION ALL
        SELECT *, 'Air Ring' as type 
        FROM dbo.air_ring_table
        WHERE DATE(created_at) = ?
        UNION ALL
        SELECT *, 'Air Plug' as type 
        FROM dbo.air_plug_table
        WHERE DATE(created_at) = ?
    `;

    runQuery(query, [sqlDate, sqlDate, sqlDate], (err, rows) => {
        if (err) {
            console.error('Error fetching daily data:', err.message);
            return res.status(500).send('Internal Server Error');
        }
        res.json({ data: rows });
    });
});

// All-time Order History
app.get('/history', (req, res) => {
    // Query combining all three tables with their component types
    const query = `
        SELECT 
            record_sr_no,
            work_order_no,
            party_name,
            purchase_order,
            FORMAT(date, 'yyyy-MM-dd') AS formatted_date, -- Format the date
            city,
            units,
            air_plug_ap,  -- From air_plug_table
            setting_ring_sr,  -- From air_plug_table
            air_plug_set,  -- From air_plug_table
            sub_sr_no,
            qty,
            label_size,
            nominal_size,
            size_low_tolerance,
            size_high_tolerance,
            bore_jet_type,
            higher_lower,
            jet_count,
            dispatch_week,
            remark,
            'Air Plug' as type
        FROM dbo.air_plug_table

        UNION ALL

        SELECT 
            record_sr_no,
            work_order_no,
            party_name,
            purchase_order,
            FORMAT(date, 'yyyy-MM-dd') AS formatted_date, -- Format the date
            city,
            units,
            air_ring_ar,  -- No equivalent in air_ring_table
            setting_plug_sp,  -- No equivalent in air_ring_table
            air_ring_set,  -- No equivalent in air_ring_table
            sub_sr_no,
            qty,
            label_size,
            nominal_size,
            size_low_tolerance,
            size_high_tolerance,
            bore_jet_type,
            higher_lower,
            jet_count,
            dispatch_week,
            remark,
            'Air Ring' as type
        FROM dbo.air_ring_table

        UNION ALL

        SELECT 
            record_sr_no,
            work_order_no,
            party_name,
            purchase_order,
            FORMAT(date, 'yyyy-MM-dd') AS formatted_date, -- Format the date
            city,
            units,
            air_snap_as,  -- No equivalent in air_snap_table
            setting_master_sm,  -- No equivalent in air_snap_table
            air_snap_set,  -- No equivalent in air_snap_table
            sub_sr_no,
            qty,
            label_size,
            nominal_size,
            size_low_tolerance,
            size_high_tolerance,
            bore_jet_type,
            higher_lower,
            jet_count,
            dispatch_week,
            remark,
            'Air Snap' as type
        FROM dbo.air_snap_table

        ORDER BY formatted_date DESC
    `;

    runQuery(query, [], (err, rows) => {
        if (err) {
            console.error('Error fetching history:', err.message);
            res.status(500).json({ error: 'Failed to fetch history' });
        } else {
            res.status(200).json({ data: rows });
        }
    });
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



// Fetch progress detail
app.get('/progress-detail', (req, res) => {
    const { work_order_no } = req.query;

    if (!work_order_no) {
        return res.status(400).json({ error: 'Work order number is required' });
    }

    // Query to fetch from all three tables
    let componentsQuery = `
        SELECT 
            record_sr_no, 
            work_order_no, 
            party_name, 
            date, 
            sub_sr_no, 
            remark,
            'Air Snap' as type 
        FROM dbo.air_snap_table 
        WHERE work_order_no = ?
        
        UNION ALL
        
        SELECT 
            record_sr_no, 
            work_order_no, 
            party_name, 
            date, 
            sub_sr_no, 
            remark,
            'Air Ring' as type 
        FROM dbo.air_ring_table 
        WHERE work_order_no = ?
        
        UNION ALL
        
        SELECT 
            record_sr_no, 
            work_order_no, 
            party_name, 
            date, 
            sub_sr_no, 
            remark,
            'Air Plug' as type 
        FROM dbo.air_plug_table 
        WHERE work_order_no = ?
    `;

    runQuery(componentsQuery, [work_order_no, work_order_no, work_order_no], (err, components) => {
        if (err) {
            console.error('Error fetching components:', err.message);
            return res.status(500).json({ error: 'Failed to fetch components' });
        }

        if (components.length === 0) {
            return res.status(404).json({ error: 'No components found for this work order' });
        }

        const recordSrNos = components.map(comp => comp.record_sr_no);
        if (recordSrNos.length === 0) {
            return res.status(200).json({
                data: components.map(comp => ({
                    ...comp,
                    stages: [],
                    rejection_remark: '',
                    status: '',
                    timestamp: '',
                }))
            });
        }

        let progressQuery = `
            SELECT pr.record_sr_no,
                   pr.current_stage,
                   pr.timestamp,
                   COALESCE(pr.rejection_remark, '') AS rejection_remark,
                   COALESCE(pr.status, '') AS status
            FROM dbo.progress AS pr
            WHERE pr.record_sr_no IN (${recordSrNos.map(() => '?').join(',')})
        `;

        runQuery(progressQuery, recordSrNos, (err, stages) => {
            if (err) {
                console.error('Error fetching progress stages:', err.message);
                return res.status(500).json({ error: 'Failed to fetch progress stages' });
            }

            // Create maps for stages and other data
            const stageMap = {};
            const rejectionRemarkMap = {};
            const statusMap = {};
            const timestampMap = {};

            stages.forEach(stage => {
                if (!stageMap[stage.record_sr_no]) {
                    stageMap[stage.record_sr_no] = [];
                }
                stageMap[stage.record_sr_no].push({ current_stage: stage.current_stage });
                rejectionRemarkMap[stage.record_sr_no] = stage.rejection_remark;
                statusMap[stage.record_sr_no] = stage.status;
                timestampMap[stage.record_sr_no] = stage.timestamp;
            });


            const formatDate = (date) => {
                const d = new Date(date);
                if (isNaN(d.getTime())) return null;
                const yyyy = d.getFullYear();
                const mm = String(d.getMonth() + 1).padStart(2, '0');
                const dd = String(d.getDate()).padStart(2, '0');
                return `${yyyy}/${mm}/${dd}`;
            };

            
            const result = components.map(comp => ({
                work_order_no: comp.work_order_no,
                sub_sr_no: comp.sub_sr_no,
                party_name: comp.party_name,
                date: formatDate(comp.date),
                remark: comp.remark,
                type: comp.type, // Include component type in response
                rejection_remark: rejectionRemarkMap[comp.record_sr_no] || '',
                status: statusMap[comp.record_sr_no] || '',
                timestamp: timestampMap[comp.record_sr_no] || '',
                stages: stageMap[comp.record_sr_no] || [],
            }));

            res.status(200).json({ data: result });
        });
    });
});



//////////////////////////////////// Air Plug Charts ////////////////////////////////////////////
// Fetch Air Plug History
app.get('/airplug-history', (req, res) => {
    const { fromWorkOrderNo, toWorkOrderNo } = req.query;

    // Base query for Air Plug data
    let query = `SELECT 
                     *,
                     FORMAT(date, 'yyyy/MM/dd') AS formatted_date
                 FROM dbo.purchase_orders
                 WHERE type = 'Air Plug'`;
    const queryParams = [];

    // Add work order range filter if provided
    if (fromWorkOrderNo && toWorkOrderNo) {
        query += ` AND work_order_no BETWEEN ? AND ?`;
        queryParams.push(fromWorkOrderNo, toWorkOrderNo);
    }

    // Execute the query
    runQuery(query, queryParams, (err, rows) => {
        if (err) {
            console.error('Error fetching Air Plug data:', err.message);
            return res.status(500).json({ error: 'Failed to fetch Air Plug data' });
        }

        if (rows.length === 0) {
            return res.status(404).json({ message: 'No data found for the given filters' });
        }

        res.status(200).json({ data: rows });
    });
});


app.put("/airplug-entry/:record_sr_no", (req, res) => {
    const record_sr_no = req.params.record_sr_no;
    const {
        work_order_no,
        party_name,
        purchase_order,
        date,
        city,
        units,
        sub_sr_no,
        qty,
        air_plug_ap,
        setting_ring_sr,
        air_plug_set,
        nominal_size,
        l_size,
        value_size,
        size_low_tolerance,
        size_high_tolerance,
        bore_jet_type,
        higher_lower,
        jet_count,
        dispatch_week,
        remark
    } = req.body;

    const type = "Air Plug";
    const label_size = `${l_size}${value_size}`;
    const formattedNominalSize = parseFloat(nominal_size).toFixed(5);
    const formattedLowTolerance = parseFloat(size_low_tolerance).toFixed(5);
    const formattedHighTolerance = parseFloat(size_high_tolerance).toFixed(5);

    // Update air_plug_table
    const updateLocalQuery = `
        UPDATE dbo.air_plug_table SET
            work_order_no = ?, party_name = ?, purchase_order = ?, date = ?, city = ?,
            units = ?, air_plug_ap = ?, setting_ring_sr = ?, air_plug_set = ?, sub_sr_no = ?, qty = ?,
            nominal_size = ?, label_size = ?, size_low_tolerance = ?, size_high_tolerance = ?,
            bore_jet_type = ?, higher_lower = ?, jet_count = ?, dispatch_week = ?, remark = ?, type = ?
        WHERE record_sr_no = ?
    `;

    const updateMainQuery = `
        UPDATE dbo.purchase_orders SET
            work_order_no = ?, party_name = ?, purchase_order = ?, date = ?, city = ?,
            units = ?, sub_sr_no = ?, qty = ?, nominal_size = ?, size_low_tolerance = ?,
            size_high_tolerance = ?, bore_jet_type = ?, higher_lower = ?, jet_count = ?,
            dispatch_week = ?, remark = ?, type = ?, air_plug_ap = ?, setting_ring_sr = ?, air_plug_set = ?, label_size = ?
        WHERE record_sr_no = ?
    `;

    runQuery(updateLocalQuery, [
        work_order_no, party_name, purchase_order, date, city,
        units, air_plug_ap, setting_ring_sr, air_plug_set, sub_sr_no, qty,
        formattedNominalSize, label_size, formattedLowTolerance, formattedHighTolerance,
        bore_jet_type, higher_lower, jet_count, dispatch_week, remark, type,
        record_sr_no
    ], (err) => {
        if (err) {
            console.error("Error updating air_plug_table:", err.message);
            return res.status(500).json({ error: "Failed to update local table" });
        }

        // Proceed to update purchase_orders after local update
        runQuery(updateMainQuery, [
            work_order_no, party_name, purchase_order, date, city,
            units, sub_sr_no, qty, formattedNominalSize, formattedLowTolerance,
            formattedHighTolerance, bore_jet_type, higher_lower, jet_count,
            dispatch_week, remark, type, air_plug_ap, setting_ring_sr, air_plug_set, label_size,
            record_sr_no
        ], (err2) => {
            if (err2) {
                console.error("Error updating purchase_orders:", err2.message);
                return res.status(500).json({ error: "Failed to update main table" });
            }

            res.status(200).json({ message: "Both tables updated successfully!" });
        });
    });
});



// Add Air Plug Entry
app.post('/air_plug-entry', (req, res) => {
    const {
        record_sr_no,
        work_order_no,
        party_name,
        purchase_order,
        date,
        city,
        units,
        air_plug_ap,
        setting_ring_sr,
        air_plug_set,
        sub_sr_no,
        qty,
        nominal_size,
        l_size,
        value_size,
        size_low_tolerance,
        size_high_tolerance,
        bore_jet_type,
        higher_lower,
        jet_count,
        dispatch_week,
        remark
    } = req.body;

    const type = "Air Plug"; // Automatically set based on the form

    // Create label_size by combining l_size and value_size
    const label_size = `${l_size}${value_size}`;

    // Format the sizes to five decimal places as strings
    const formattedNominalSize = parseFloat(nominal_size).toFixed(5);
    const formattedLowTolerance = parseFloat(size_low_tolerance).toFixed(5);
    const formattedHighTolerance = parseFloat(size_high_tolerance).toFixed(5);

    const insertLocalQuery = `
        INSERT INTO dbo.air_plug_table (record_sr_no, work_order_no, party_name, purchase_order, date, city,
                                    units, air_plug_ap, setting_ring_sr, air_plug_set, sub_sr_no, qty, nominal_size,
                                    label_size,
                                    size_low_tolerance, size_high_tolerance, bore_jet_type,
                                    higher_lower, jet_count, dispatch_week, remark, type)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const insertMainQuery = `
    INSERT INTO dbo.purchase_orders (
        record_sr_no, work_order_no, party_name, purchase_order, date, city,
        units, sub_sr_no, qty, nominal_size, size_low_tolerance,
        size_high_tolerance, bore_jet_type, higher_lower, jet_count,
        dispatch_week, remark, type, air_plug_ap, setting_ring_sr, air_plug_set, label_size
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

    runQuery(insertLocalQuery, [
        record_sr_no, work_order_no, party_name, purchase_order, date, city,
        units, air_plug_ap, setting_ring_sr, air_plug_set, sub_sr_no, qty, formattedNominalSize, label_size, formattedLowTolerance, formattedHighTolerance, bore_jet_type,
        higher_lower, jet_count, dispatch_week, remark, type
    ], (err) => {
        if (err) {
            console.error('Error inserting into air_plug_table:', err.message);
            return res.status(500).json({ error: 'Failed to insert into local table' });
        }

        // Insert into main table after successfully inserting into local table
        runQuery(insertMainQuery, [
            record_sr_no, work_order_no, party_name, purchase_order, date, city,
            units, sub_sr_no, qty, nominal_size, size_low_tolerance,
            size_high_tolerance, bore_jet_type, higher_lower, jet_count,
            dispatch_week, remark, type, air_plug_ap, setting_ring_sr, air_plug_set, label_size
        ], (err) => {
            if (err) {
                console.error('Error inserting into purchase_orders:', err.message);
                return res.status(500).json({ error: 'Failed to insert into main table' });
            }
        
            res.status(200).json({ message: 'Data inserted successfully in both tables' });
        });
    });
});




//////////////////////////////////// Air Ring Charts ////////////////////////////////////////////

// Fetch Air Ring History
app.get('/airring-history', (req, res) => {
    const { fromWorkOrderNo, toWorkOrderNo } = req.query;

    // Base query for Air Ring data
    let query = `SELECT *, 
    FORMAT(date, 'yyyy/MM/dd') AS formatted_date

                 FROM dbo.purchase_orders
                 WHERE type = 'Air Ring'`;
    const queryParams = [];

    // Add work order range filter if provided
    if (fromWorkOrderNo && toWorkOrderNo) {
        query += ` AND work_order_no BETWEEN ? AND ?`;
        queryParams.push(fromWorkOrderNo, toWorkOrderNo);
    }

    // Execute the query
    runQuery(query, queryParams, (err, rows) => {
        if (err) {
            console.error('Error fetching Air Ring data:', err.message);
            return res.status(500).json({ error: 'Failed to fetch Air Ring data' });
        }

        if (rows.length === 0) {
            return res.status(404).json({ message: 'No data found for the given filters' });
        }

        res.status(200).json({ data: rows });
    });
});



app.put("/airring-entry/:record_sr_no", (req, res) => {
    const record_sr_no = req.params.record_sr_no;
    const {
        work_order_no,
        party_name,
        purchase_order,
        date,
        city,
        units,
        sub_sr_no,
        qty,
        air_ring_ar,
        setting_plug_sp,
        air_ring_set,
        nominal_size,
        l_size,
        value_size,
        size_low_tolerance,
        size_high_tolerance,
        bore_jet_type,
        higher_lower,
        jet_count,
        dispatch_week,
        remark
    } = req.body;

    const type = "Air Ring";
    const label_size = `${l_size}${value_size}`;
    const formattedNominalSize = parseFloat(nominal_size).toFixed(5);
    const formattedLowTolerance = parseFloat(size_low_tolerance).toFixed(5);
    const formattedHighTolerance = parseFloat(size_high_tolerance).toFixed(5);

    // Update air_plug_table
    const updateLocalQuery = `
        UPDATE dbo.air_ring_table SET
            work_order_no = ?, party_name = ?, purchase_order = ?, date = ?, city = ?,
            units = ?, air_ring_ar = ?, setting_plug_sp = ?, air_ring_set = ?, sub_sr_no = ?, qty = ?,
            nominal_size = ?, label_size = ?, size_low_tolerance = ?, size_high_tolerance = ?,
            bore_jet_type = ?, higher_lower = ?, jet_count = ?, dispatch_week = ?, remark = ?, type = ?
        WHERE record_sr_no = ?
    `;

    const updateMainQuery = `
        UPDATE dbo.purchase_orders SET
            work_order_no = ?, party_name = ?, purchase_order = ?, date = ?, city = ?,
            units = ?, sub_sr_no = ?, qty = ?, nominal_size = ?, size_low_tolerance = ?,
            size_high_tolerance = ?, bore_jet_type = ?, higher_lower = ?, jet_count = ?,
            dispatch_week = ?, remark = ?, type = ?, air_ring_ar = ?, setting_plug_sp = ?, air_ring_set = ?, label_size = ?
        WHERE record_sr_no = ?
    `;

    runQuery(updateLocalQuery, [
        work_order_no, party_name, purchase_order, date, city,
        units, air_ring_ar, setting_plug_sp, air_ring_set, sub_sr_no, qty,
        formattedNominalSize, label_size, formattedLowTolerance, formattedHighTolerance,
        bore_jet_type, higher_lower, jet_count, dispatch_week, remark, type,
        record_sr_no
    ], (err) => {
        if (err) {
            console.error("Error updating air_plug_table:", err.message);
            return res.status(500).json({ error: "Failed to update local table" });
        }

        // Proceed to update purchase_orders after local update
        runQuery(updateMainQuery, [
            work_order_no, party_name, purchase_order, date, city,
            units, sub_sr_no, qty, formattedNominalSize, formattedLowTolerance,
            formattedHighTolerance, bore_jet_type, higher_lower, jet_count,
            dispatch_week, remark, type, air_ring_ar, setting_plug_sp, air_ring_set, label_size,
            record_sr_no
        ], (err2) => {
            if (err2) {
                console.error("Error updating purchase_orders:", err2.message);
                return res.status(500).json({ error: "Failed to update main table" });
            }

            res.status(200).json({ message: "Both tables updated successfully!" });
        });
    });
});



// Add Air Ring Entry
app.post('/air_ring-entry', (req, res) => {
    const {
        record_sr_no,
        work_order_no,
        party_name,
        purchase_order,
        date,
        city,
        units,
        air_ring_ar,
        setting_plug_sp,
        air_ring_set,
        sub_sr_no,
        qty,
        nominal_size,
        l_size,
        value_size,
        size_low_tolerance,
        size_high_tolerance,
        bore_jet_type,
        higher_lower,
        jet_count,
        dispatch_week,
        remark
    } = req.body;

    const type = "Air Ring"; // Automatically set based on the form

    // Create label_size by combining l_size and value_size
    const label_size = `${l_size}${value_size}`;

    // Format the sizes to five decimal places as strings
    const formattedNominalSize = parseFloat(nominal_size).toFixed(5);
    const formattedLowTolerance = parseFloat(size_low_tolerance).toFixed(5);
    const formattedHighTolerance = parseFloat(size_high_tolerance).toFixed(5);

    const insertLocalQuery = `
        INSERT INTO dbo.air_ring_table (record_sr_no, work_order_no, party_name, purchase_order, date, city,
                                    units, air_ring_ar, setting_plug_sp, air_ring_set, sub_sr_no, qty, nominal_size,
                                    label_size,
                                    size_low_tolerance, size_high_tolerance, bore_jet_type,
                                    higher_lower, jet_count, dispatch_week, remark, type)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const insertMainQuery = `
        INSERT INTO dbo.purchase_orders (record_sr_no, work_order_no, party_name, purchase_order, date, city,
                                     units, sub_sr_no, qty, nominal_size, size_low_tolerance,
                                     size_high_tolerance, bore_jet_type, higher_lower, jet_count,
                                     dispatch_week, remark, type, air_ring_ar, setting_plug_sp, air_ring_set, label_size)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    runQuery(insertLocalQuery, [
        record_sr_no, work_order_no, party_name, purchase_order, date, city,
        units, air_ring_ar, setting_plug_sp, air_ring_set, sub_sr_no, qty, formattedNominalSize, label_size, formattedLowTolerance, formattedHighTolerance, bore_jet_type,
        higher_lower, jet_count, dispatch_week, remark, type
    ], (err) => {
        if (err) {
            console.error('Error inserting into air_ring_table:', err.message);
            return res.status(500).json({ error: 'Failed to insert into local table' });
        }

        // Insert into main table after successfully inserting into local table
        runQuery(insertMainQuery, [
            record_sr_no, work_order_no, party_name, purchase_order, date, city,
            units, sub_sr_no, qty, nominal_size, size_low_tolerance,
            size_high_tolerance, bore_jet_type, higher_lower, jet_count,
            dispatch_week, remark, type, air_ring_ar, setting_plug_sp, air_ring_set, label_size
        ], (err) => {
            if (err) {
                console.error('Error inserting into purchase_orders:', err.message);
                return res.status(500).json({ error: 'Failed to insert into main table' });
            }

            res.status(200).json({ message: 'Data inserted successfully in both tables' });
        });
    });
});
//////////////////////////////////// Air Snap Charts ////////////////////////////////////////////


// Fetch Air Snap History
app.get('/airsnap-history', (req, res) => {
    const { fromWorkOrderNo, toWorkOrderNo } = req.query;

    // Base query for Air Snap data
    let query = `SELECT *, 
    FORMAT(date, 'yyyy/MM/dd') AS formatted_date

                 FROM dbo.purchase_orders
                 WHERE type = 'Air Snap'`;
    const queryParams = [];

    // Add work order range filter if provided
    if (fromWorkOrderNo && toWorkOrderNo) {
        query += ` AND work_order_no BETWEEN ? AND ?`;
        queryParams.push(fromWorkOrderNo, toWorkOrderNo);
    }

    // Execute the query
    runQuery(query, queryParams, (err, rows) => {
        if (err) {
            console.error('Error fetching Air Snap data:', err.message);
            return res.status(500).json({ error: 'Failed to fetch Air Snap data' });
        }

        if (rows.length === 0) {
            return res.status(404).json({ message: 'No data found for the given filters' });
        }

        res.status(200).json({ data: rows });
    });
});



app.put("/airsnap-entry/:record_sr_no", (req, res) => {
    const record_sr_no = req.params.record_sr_no;
    const {
        work_order_no,
        party_name,
        purchase_order,
        date,
        city,
        units,
        sub_sr_no,
        qty,
        air_snap_as,
        setting_master_sm,
        air_snap_set,
        nominal_size,
        l_size,
        value_size,
        size_low_tolerance,
        size_high_tolerance,
        bore_jet_type,
        higher_lower,
        jet_count,
        dispatch_week,
        remark
    } = req.body;

    const type = "Air Snap";
    const label_size = `${l_size}${value_size}`;
    const formattedNominalSize = parseFloat(nominal_size).toFixed(5);
    const formattedLowTolerance = parseFloat(size_low_tolerance).toFixed(5);
    const formattedHighTolerance = parseFloat(size_high_tolerance).toFixed(5);

    // Update air_plug_table
    const updateLocalQuery = `
        UPDATE dbo.air_snap_table SET
            work_order_no = ?, party_name = ?, purchase_order = ?, date = ?, city = ?,
            units = ?, air_snap_as = ?,
        setting_master_sm = ?,
        air_snap_set = ?, sub_sr_no = ?, qty = ?,
            nominal_size = ?, label_size = ?, size_low_tolerance = ?, size_high_tolerance = ?,
            bore_jet_type = ?, higher_lower = ?, jet_count = ?, dispatch_week = ?, remark = ?, type = ?
        WHERE record_sr_no = ?
    `;

    const updateMainQuery = `
        UPDATE dbo.purchase_orders SET
            work_order_no = ?, party_name = ?, purchase_order = ?, date = ?, city = ?,
            units = ?, sub_sr_no = ?, qty = ?, nominal_size = ?, size_low_tolerance = ?,
            size_high_tolerance = ?, bore_jet_type = ?, higher_lower = ?, jet_count = ?,
            dispatch_week = ?, remark = ?, type = ?, air_snap_as = ?,
        setting_master_sm = ?,
        air_snap_set = ?, label_size = ?
        WHERE record_sr_no = ?
    `;

    runQuery(updateLocalQuery, [
        work_order_no, party_name, purchase_order, date, city,
        units, air_snap_as,
        setting_master_sm,
        air_snap_set, sub_sr_no, qty,
        formattedNominalSize, label_size, formattedLowTolerance, formattedHighTolerance,
        bore_jet_type, higher_lower, jet_count, dispatch_week, remark, type,
        record_sr_no
    ], (err) => {
        if (err) {
            console.error("Error updating air_plug_table:", err.message);
            return res.status(500).json({ error: "Failed to update local table" });
        }

        // Proceed to update purchase_orders after local update
        runQuery(updateMainQuery, [
            work_order_no, party_name, purchase_order, date, city,
            units, sub_sr_no, qty, formattedNominalSize, formattedLowTolerance,
            formattedHighTolerance, bore_jet_type, higher_lower, jet_count,
            dispatch_week, remark, type, air_snap_as,
            setting_master_sm,
            air_snap_set, label_size,
            record_sr_no
        ], (err2) => {
            if (err2) {
                console.error("Error updating purchase_orders:", err2.message);
                return res.status(500).json({ error: "Failed to update main table" });
            }

            res.status(200).json({ message: "Both tables updated successfully!" });
        });
    });
});



// Add Air Snap Entry
app.post('/air_snap-entry', (req, res) => {
    const {
        record_sr_no,
        work_order_no,
        party_name,
        purchase_order,
        date,
        city,
        units,
        air_snap_as,
        setting_master_sm,
        air_snap_set,
        sub_sr_no,
        qty,
        nominal_size,
        l_size,
        value_size,
        size_low_tolerance,
        size_high_tolerance,
        bore_jet_type,
        higher_lower,
        jet_count,
        dispatch_week,
        remark
    } = req.body;

    const type = "Air Snap"; // Automatically set based on the form

    // Create label_size by combining l_size and value_size
    const label_size = `${l_size}${value_size}`;

    // Format the sizes to five decimal places as strings
    const formattedNominalSize = parseFloat(nominal_size).toFixed(5);
    const formattedLowTolerance = parseFloat(size_low_tolerance).toFixed(5);
    const formattedHighTolerance = parseFloat(size_high_tolerance).toFixed(5);

    const insertLocalQuery = `
        INSERT INTO dbo.air_snap_table (record_sr_no, work_order_no, party_name, purchase_order, date, city,
                                    units, air_snap_as, setting_master_sm, air_snap_set, sub_sr_no, qty, nominal_size,
                                    label_size,
                                    size_low_tolerance, size_high_tolerance, bore_jet_type,
                                    higher_lower, jet_count, dispatch_week, remark, type)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const insertMainQuery = `
        INSERT INTO dbo.purchase_orders (record_sr_no, work_order_no, party_name, purchase_order, date, city,
                                     units, sub_sr_no, qty, nominal_size, size_low_tolerance,
                                     size_high_tolerance, bore_jet_type, higher_lower, jet_count,
                                     dispatch_week, remark, type, air_snap_as, setting_master_sm, air_snap_set, label_size)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    runQuery(insertLocalQuery, [
        record_sr_no, work_order_no, party_name, purchase_order, date, city,
        units, air_snap_as, setting_master_sm, air_snap_set, sub_sr_no, qty, formattedNominalSize, label_size, formattedLowTolerance, formattedHighTolerance, bore_jet_type,
        higher_lower, jet_count, dispatch_week, remark, type
    ], (err) => {
        if (err) {
            console.error('Error inserting into air_snap_table:', err.message);
            return res.status(500).json({ error: 'Failed to insert into local table' });
        }

        // Insert into main table after successfully inserting into local table
        runQuery(insertMainQuery, [
            record_sr_no, work_order_no, party_name, purchase_order, date, city,
            units, sub_sr_no, qty, nominal_size, size_low_tolerance,
            size_high_tolerance, bore_jet_type, higher_lower, jet_count,
            dispatch_week, remark, type, air_snap_as, setting_master_sm, air_snap_set, label_size
        ], (err) => {
            if (err) {
                console.error('Error inserting into purchase_orders:', err.message);
                return res.status(500).json({ error: 'Failed to insert into main table' });
            }

            res.status(200).json({ message: 'Data inserted successfully in both tables' });
        });
    });
});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////// Add City & Party Details /////////////////////////////////////////////////////


// Adding cities, party names, and contact numbers to the table if not exists
app.post('/cities', (req, res) => {
    const {city, party_name, contact_number} = req.body;

    // Log the city name to check if it's being received
    // console.log("Received city name: ", city);

    if (!city || !party_name || !contact_number) {
        return res.status(400).json({error: "City, Party Name, and Contact Number are required"});
    }

    // Check if the combination of party_name and city already exists
    const checkQuery = `SELECT *
                        FROM Purchase.dbo.cities
                        WHERE party_name = ?
                          AND city = ?`;
    runQuery(checkQuery, [party_name, city], (err, row) => {
        if (err) {
            console.error("Error checking if city exists for party:", err.message);
            return res.status(500).json({error: "Database error"});
        }

        if (row) {
            // Combination of party_name and city already exists
            return res.status(400).json({error: `City ${city} already exists for party ${party_name}`});
        }

        // Insert the city data for the given party name and contact number if combination doesn't exist
        const insertQuery = `INSERT INTO dbo.cities (city, party_name, contact_number)
                             VALUES (?, ?, ?)`;
        db.run(insertQuery, [city, party_name, contact_number], (err) => {
            if (err) {
                console.error("Error inserting city into database:", err.message);
                return res.status(500).json({error: "Database error"});
            }
            res.json({message: `City ${city} added successfully for party ${party_name}`});
        });
    });
});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// API to fetch city names from the database
app.get('/api/cities', async (req, res) => {
    runQuery('SELECT DISTINCT city FROM dbo.cities', [], (err, rows) => {
        if (err) {
            console.error('Error fetching city names:', err.message);
            return res.status(500).json({error: 'Error fetching city'});
        }
        const cities = rows.map(row => row.city);  // Assuming each row has a 'party_name' property
        res.json(cities);
    });
});


///////////////////////////////////////////// Air Plug || Air Ring || Air Snap Forms ///////////////////////////////////

// API to fetch party names from the database
app.get('/api/party-names', (req, res) => {   //////////////////////////////yesterday////////////////////////
    runQuery('SELECT party_name FROM dbo.cities', [], (err, rows) => {
        if (err) {
            console.error('Error fetching party names:', err.message);
            return res.status(500).json({error: 'Error fetching party names'});
        }
        const partyNames = rows.map(row => row.party_name);  // Assuming each row has a 'party_name' property
        res.json(partyNames);
    });
});

app.get('/units', (req, res) => {
    runQuery('SELECT units FROM dbo.units', [], (err, rows) => {
        if (err) {
            console.error('Database query error:', err.message);
            return res.status(500).json({
                error: 'Failed to fetch the units'
            });
        } else {
            const units = rows.map(row => row.units);
            res.json(units);
        }
    });
});

// Fetch Air Ring Units
app.get('/airringunits', (req, res) => {
    runQuery('SELECT runits FROM dbo.airringunits', [], (err, rows) => {
        if (err) {
            console.error('Database query error:', err.message);
            return res.status(500).json({
                error: 'Failed to fetch the units'
            });
        } else {
            const runits = rows.map(row => row.runits);
            res.json(runits);
        }
    });
});

// Fetch Air Snap Units
app.get('/airsnapunits', (req, res) => {
    runQuery('SELECT sunits FROM dbo.airsnapunits', [], (err, rows) => {
        if (err) {
            console.error('Database query error:', err.message);
            return res.status(500).json({
                error: 'Failed to fetch the units'
            });
        } else {
            const sunits = rows.map(row => row.sunits);
            res.json(sunits);
        }
    });
});


// Get Air Plug Tolerances
app.get('/get-airplug-tolerances', (req, res) => {
    const { nominal_size, l_size, value_size } = req.query;

    // Ensure that the required parameters are provided
    if (!nominal_size || !l_size || !value_size) {
        return res.status(400).json({ error: 'nominal_size, l_size, and value_size are required' });
    }

    // Convert nominal_size to a float
    const nominalSize = parseFloat(nominal_size);
    const valueSize = parseInt(value_size, 10); // Convert value_size to an integer

    // SQL query to find the row that matches l_size, value_size, and checks nominal_size within range1 and range2
    const rangeQuery = `
        SELECT range1, range2, l_tolerance, h_tolerance
        FROM dbo.hole
        WHERE l_size = ?
          AND value_size = ?
          AND ? BETWEEN range1 AND range2
    `;

    runQuery(rangeQuery, [l_size, valueSize, nominalSize], (err, rows) => {
        if (err) {
            console.error('Database query error:', err.message);
            return res.status(500).json({ error: 'Failed to fetch data' });
        }

        if (rows.length > 0) {
            const row = rows[0]; // Get the first row from the results
            // Convert tolerances to microns
            const lToleranceMicrons = (row.l_tolerance / 1000).toFixed(5);
            const hToleranceMicrons = (row.h_tolerance / 1000).toFixed(5);

            // Return the range and tolerances in microns
            return res.json({
                range1: row.range1,
                range2: row.range2,
                l_tolerance: lToleranceMicrons,
                h_tolerance: hToleranceMicrons
            });
        } else {
            // No matching record found or nominal size is out of range
            return res.status(404).json({ error: 'Nominal size is out of the specified range or no matching record found' });
        }
    });
});

// Get Air Ring Tolerances
app.get('/get-airring-tolerances', (req, res) => {
    const { nominal_size, l_size, value_size } = req.query;

    // Ensure that the required parameters are provided
    if (!nominal_size || !l_size || !value_size) {
        return res.status(400).json({ error: 'nominal_size, l_size, and value_size are required' });
    }

    // Convert nominal_size to a float
    const nominalSize = parseFloat(nominal_size);
    const valueSize = parseInt(value_size, 10); // Convert value_size to an integer

    // SQL query to find the row that matches l_size, value_size, and checks nominal_size within range1 and range2
    const rangeQuery = `
        SELECT range1, range2, l_tolerance, h_tolerance
        FROM dbo.shaft
        WHERE l_size = ?
          AND value_size = ?
          AND ? BETWEEN range1 AND range2
    `;

    runQuery(rangeQuery, [l_size, valueSize, nominalSize], (err, rows) => {
        if (err) {
            console.error('Database query error:', err.message);
            return res.status(500).json({ error: 'Failed to fetch data' });
        }

        if (rows.length > 0) {
            const row = rows[0]; // Get the first row from the results
            // Convert tolerances to microns
            const lToleranceMicrons = (row.l_tolerance / 1000).toFixed(5);
            const hToleranceMicrons = (row.h_tolerance / 1000).toFixed(5);

            // Return the range and tolerances in microns
            return res.json({
                range1: row.range1,
                range2: row.range2,
                l_tolerance: lToleranceMicrons,
                h_tolerance: hToleranceMicrons
            });
        } else {
            // No matching record found or nominal size is out of range
            return res.status(404).json({ error: 'Nominal size is out of the specified range or no matching record found' });
        }
    });
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////// Air Plug Charts /////////////////////////////////////////////////////////////////////////////////////////////





app.get('/finish-sizes', (req, res) => {
    const query = `
        SELECT 
            record_sr_no,
            nominal_size,
            size_high_tolerance,
            size_low_tolerance,
            bore_jet_type,
            dispatch_week,
            date,
            remark,
            higher_lower,
            'Air Plug' as type,
            ROUND((u.Depression), 3) AS dep,
            u.ReamSize,
            u.CounterSize,
            u.JetDia,
            u.units as Unit,
            srl.Tol AS Tolerance,
            srl.Above,
            srl.UpTo,
            (size_high_tolerance + size_low_tolerance) / 2 AS hl_size,
            nominal_size + ((size_high_tolerance + size_low_tolerance) / 2) AS og_size,
            nominal_size + ((size_high_tolerance + size_low_tolerance) / 2 - u.clearance) AS finish_size,
            ROUND((nominal_size + ((size_high_tolerance + size_low_tolerance) / 2)) - u.clearance - 0.1, 2) AS under_size,
            ROUND((nominal_size + ((size_high_tolerance + size_low_tolerance) / 2)) - u.clearance + 0.1, 2) AS rough_size
        FROM dbo.purchase_orders
        LEFT JOIN dbo.units u ON dbo.purchase_orders.units = u.units
        LEFT JOIN dbo.AirPlugSettingRingLappingData srl ON 
            (nominal_size + ((size_high_tolerance + size_low_tolerance) / 2) - u.clearance) >= srl.Above 
            AND (nominal_size + ((size_high_tolerance + size_low_tolerance) / 2) - u.clearance) < srl.UpTo
        WHERE u.clearance IS NOT NULL AND dbo.purchase_orders.nominal_size IS NOT NULL
    `;

    runQuery(query, [], (err, rows) => {
        if (err) {
            console.error('Error querying finish sizes:', err.message);
            res.status(500).json({ success: false, message: 'Failed to fetch finish sizes.' });
        } else {
            // Function to determine TB and BB chart range based on bore_jet_type
            const getChartRange = (machining_size, bore_jet_type) => {
                const M = parseFloat(machining_size) || 0;
            
                if (bore_jet_type === 'BB') {
                    if (M > 2.50 && M <= 70.00) {
                        return 'BB 2.50-70.00';
                    } else if (M > 70.00) {
                        return 'BB 70.00-Above';
                    }
                } else if (bore_jet_type === 'TB') {
                    // Add logic for TB chart range
                    if (M > 2.50 && M <= 70.00) {
                        return 'TB 2.50-70.00';
                    } else if (M > 70.00) {
                        return 'TB 70.00-Above';
                    }
                }
                return 'N/A'; // Not in range
            };
            const getDrillingChartType = (bore_jet_type) => {
                if (bore_jet_type === 'BB') {
                    return 'BB'; // Return BB for Bore Boring
                } else if (bore_jet_type === 'TB') {
                    return 'TB'; // Return TB for Tapered Bore
                }
                return 'N/A'; // Return N/A if not applicable
            };
                       
            const calculatedRows = rows.map(row => {
                // console.log(`Processing row: ${JSON.stringify(row)}`);

                
                let t_dispatch_week = null;

                if (row.dispatch_week && row.date) {
                    const weekNumberMatch = row.dispatch_week.match(/^(\d+)\s*Week$/);
                    const weekNumber = weekNumberMatch ? parseInt(weekNumberMatch[1], 10) : 0;

                    if (weekNumber > 0) {
                        const entryDate = new Date(row.date);
                        if (!isNaN(entryDate.getTime())) {
                            entryDate.setDate(entryDate.getDate() + weekNumber * 7);
                            t_dispatch_week = entryDate.toISOString().split('T')[0];
                        }
                    }
                }

                // Updated to include the TB/BB Chart Range based on bore_jet_type
                // const chart_range = getChartRange(row.nominal_size, row.bore_jet_type, row.size_low_tolerance, row.size_high_tolerance); // Determine if it's TB or BB
                // console.log(`Chart range for row: ${chart_range}`);



                const calculateFinishSize = (nominalSize, lowTolerance, highTolerance, clearance, SizeFrom, Unit) => {
                    const Nominal = parseFloat(nominalSize) || 0;
                    const Low = parseFloat(lowTolerance) || 0;
                    const High = parseFloat(highTolerance) || 0;
                    const Clearance = parseFloat(clearance) || 0;
                
                    // Calculate the mean
                    const Mean = (High + Low) / 2;
                
                    // Calculate final_size
                    const final_size = Nominal + Mean;
                
                    let FinishSize;
                
                    // Determine FinishSize based on SizeFrom
                    if (SizeFrom === "M") {
                        FinishSize = final_size - Clearance; // For M type
                    } else {
                        FinishSize = Nominal - Low - Clearance; // Default calculation
                    }
                
                    // Special handling for specific units
                    if (Unit === "MODULE 1A +/-0.020 mm BAKER" || Unit === "MODULE 1A +/-0.040 mm BAKER" || Unit === "BAKER MODULE 2A") {
                        FinishSize = Nominal + Low - 0.020; // Adjusted calculation for specific units
                    }
                
                    return FinishSize.toFixed(4); // Return the finish size formatted to 4 decimal places
                };




                
                const calculateMachiningSize = (nominal_size, size_low_tolerance, size_high_tolerance) => {
                    // Convert all inputs to float
                    const Nominal = parseFloat(nominal_size) || 0;
                    const Low = parseFloat(size_low_tolerance);
                    const High = parseFloat(size_high_tolerance);

                    if (isNaN(Low) || isNaN(High)) {
                        return 'N/A';
                    }

                    const Mean = (High + Low) / 2;
                    let M = Nominal + Mean; 

                    // Apply offset based on M value (not nominal)
                    let offset = 0;
                    if (M > 0 && M <= 10) {
                        offset = 0.50;
                    } else if (M > 10 && M <= 30) {
                        offset = 0.10; 
                    } else if (M > 30 && M <= 75) {
                        offset = 0.15;
                    } else if (M > 75 && M <= 125) {
                        offset = 0.20;
                    } else if (M > 125 && M <= 200) {
                        offset = 0.30;
                    } else if (M > 200 && M <= 500) {
                        offset = 0.40;
                    } else {
                        return 'N/A';
                    }

                    // Final calculation (M + offset only, don't add mean_tol again)
                    const machining_size = M + offset;
                    return machining_size.toFixed(4);
                };

                const calculateDrillingSize = (nominal_size, size_low_tolerance, size_high_tolerance, bore_jet_type) => {
                    const M = parseFloat(nominal_size);
                    size_low_tolerance = parseFloat(size_low_tolerance);
                    size_high_tolerance = parseFloat(size_high_tolerance);
                
                    if (isNaN(M) || isNaN(size_low_tolerance) || isNaN(size_high_tolerance)) {
                        return ['N/A', 'N/A'];
                    }
                
                    const mean_tol = (size_low_tolerance + size_high_tolerance) / 2;
                    const nominal = M + mean_tol;
                
                    let cdx = 14; // default logic for TB
                    if (bore_jet_type === 'BB') {
                        cdx = 4.50;
                    } else if (bore_jet_type === 'TB') {
                        if (nominal > 0 && nominal <= 15) {
                            cdx = 8;
                        } else if (nominal > 15 && nominal <= 24) {
                            cdx = 10;
                        } else if (nominal > 24 && nominal <= 30) {
                            cdx = 12;
                        } else if (nominal > 30 && nominal <= 250) {
                            cdx = 14;
                        }
                    }
                
                    return { cdx: parseFloat(cdx.toFixed(2)), drilling_size: nominal.toFixed(4) };
                };
                
                

                const calculateRoughSize = (nominal_size, size_low_tolerance, size_high_tolerance) => {
                    const nominal = parseFloat(nominal_size) || 0; // Convert nominal size to float
                    const low = parseFloat(size_low_tolerance); // Convert low tolerance to float
                    const high = parseFloat(size_high_tolerance); // Convert high tolerance to float
                
                    let rough_size;
                
                    if (nominal === 0) {
                        // If nominal is 0, calculate based on low and high tolerance
                        rough_size = (low + high) / 2; // Calculate the average of low and high tolerance
                    } else {
                        // If nominal is not 0, calculate based on nominal and tolerances
                        const mean_tolerance = (low + high) / 2; // Calculate the mean of the tolerances
                        rough_size = nominal + mean_tolerance; // Add nominal size to the mean tolerance
                    }
                
                    // Add 0.10 to the final rough size
                    rough_size += 0.10;
                
                    return rough_size.toFixed(2); // Return the rough size formatted to two decimal places
                }

                

                // const cdx = 4.50;

                const calculateTolSize = (finish_size) => {
                    let TOL = 0;

                    if (finish_size > 0 && finish_size < 50)
                        TOL = 0.003;
                    else if (finish_size > 50 && finish_size < 100)
                        TOL = 0.004;
                    else
                        TOL = 0.005;
                    return TOL.toFixed(5);
                }


                // const processFinishSize = (nominal_size, size_low_tolerance, size_high_tolerance, higher_lower, units) => {
                const processFinishSize = (nominal_size, size_low_tolerance, size_high_tolerance, higher_lower, units, Tol) => {
                    let Nominal = parseFloat(nominal_size) || 0;
                    let Low = parseFloat(size_low_tolerance) || 0;
                    let High = parseFloat(size_high_tolerance) || 0;
                    let HigherLower = higher_lower;  // Convert to boolean
                    let Unit = units;
                    // console.log(Unit);
                    let Tolerance = Tol;
                    // console.log(Tolerance);
                    let MeanValue;

                    if (HigherLower === 'Yes') {  // If "Yes", apply transformations
                        if (Nominal === 0) {
                            Low = Low;
                            High = High;
                            //
                        } else {
                            Low = Nominal + Low;
                            High = Nominal + High;
                        }
                    } else {
                        // MeanValue = (High + Low) / 2;

                        const unitsMap = {
                            "A/D +/-0.020 mm": 0.010,
                            "A/D +/-0.040 mm": 0.015,
                            "A/D +/-0.060 mm": 0.020,
                            "A/D +/-0.080 mm": 0.030,
                            "BAKER MERCER (BELOW 0.008 mm) +/-0.025 mm": 0.010,
                            "BAKER MERCER (BELOW 0.019 mm) +/-0.025 mm": 0.015,
                            "BAKER MERCER (ABOVE 0.019 mm) +/-0.025 mm": 0.020,
                            "BAKER MERCER (BELOW 0.050 mm) +/-0.050 mm": 0.015,
                            "BAKER MERCER (ABOVE 0.050 mm) +/-0.050 mm": 0.015,
                            "MODULE 1A +/-0.020 mm BAKER": 0.015,
                            "MODULE 1A +/-0.040 mm BAKER": 0.015,
                            "ETAMIC AIR GAUGE UNIT (+/-0.010 mm)": 0.005,
                            "ETAMIC AIR GAUGE UNIT (+/-0.020 mm)": 0.010,
                            "ETAMIC AIR GAUGE UNIT (+/-0.040 mm)": 0.015,
                            "BAKER MODULE 2A": 0.015
                        };

                        if (unitsMap[Unit] !== undefined) {
                            // console.log(Unit);
                            let tolerance = unitsMap[Unit];
                            MeanValue = (High + Low) / 2;
                            let AdjustedNominal = Nominal + MeanValue;  // Preserve original Nominal
                            // console.log(AdjustedNominal);
                            Low = AdjustedNominal - tolerance;
                            // console.log(Low);
                            High = AdjustedNominal + tolerance;
                            // console.log(High);
                        } else if ([
                            "LIQ. COLUMN UNIT B_JET", "LIQ. COLUMN UNIT C_JET", "LIQ. COLUMN UNIT G_JET",
                            "SOLEX", "FEDERAL (+/-0.030 mm)", "SHEFIELD (+/-0.040 mm)"
                        ].includes(Unit)) {
                            Low = Nominal + Low;
                            High = Nominal + High;
                        } else if (Unit === "A/D +/- 0.05") {
                            let AdjustedNominal = Nominal + MeanValue;
                            Low = AdjustedNominal;
                            High = AdjustedNominal;
                        }
                    }

                    return { Nominal, Low, High, units, HigherLower, Tolerance };
                };


                const processGrindingFinishSize = (nominal_size, size_low_tolerance, size_high_tolerance, higher_lower, units, Tol) => {
                    let Nominal = parseFloat(nominal_size) || 0;
                    let Low = parseFloat(size_low_tolerance) || 0;
                    let High = parseFloat(size_high_tolerance) || 0;
                    let HigherLower = higher_lower;
                    let Unit = units;
                    let Tolerance = Tol;
                    let MeanValue;

                    if (HigherLower === 'Yes') {
                        if (Nominal !== 0) {
                            Low = Nominal + Low;
                            High = Nominal + High;
                        }
                    } else {
                        const unitsMap = {
                            "A/D +/-0.020 mm": 0.010,
                            "A/D +/-0.040 mm": 0.015,
                            "A/D +/-0.060 mm": 0.020,
                            "A/D +/-0.080 mm": 0.030,
                            "BAKER MERCER (BELOW 0.008 mm) +/-0.025 mm": 0.010,
                            "BAKER MERCER (BELOW 0.019 mm) +/-0.025 mm": 0.015,
                            "BAKER MERCER (ABOVE 0.019 mm) +/-0.025 mm": 0.020,
                            "BAKER MERCER (BELOW 0.050 mm) +/-0.050 mm": 0.015,
                            "BAKER MERCER (ABOVE 0.050 mm) +/-0.050 mm": 0.015,
                            "MODULE 1A +/-0.020 mm BAKER": 0.015,
                            "MODULE 1A +/-0.040 mm BAKER": 0.015,
                            "ETAMIC AIR GAUGE UNIT (+/-0.010 mm)": 0.005,
                            "ETAMIC AIR GAUGE UNIT (+/-0.020 mm)": 0.010,
                            "ETAMIC AIR GAUGE UNIT (+/-0.040 mm)": 0.015,
                            "BAKER MODULE 2A": 0.015
                        };

                        if (unitsMap[Unit] !== undefined) {
                            let tolerance = unitsMap[Unit];
                            MeanValue = (High + Low) / 2;
                            let AdjustedNominal = Nominal + MeanValue;
                            Low = AdjustedNominal - tolerance;
                            High = AdjustedNominal + tolerance;
                        } else if ([
                            "LIQ. COLUMN UNIT B_JET", "LIQ. COLUMN UNIT C_JET", "LIQ. COLUMN UNIT G_JET",
                            "SOLEX", "FEDERAL (+/-0.030 mm)", "SHEFIELD (+/-0.040 mm)"
                        ].includes(Unit)) {
                            Low = Nominal + Low;
                            High = Nominal + High;
                        } else if (Unit === "A/D +/- 0.05") {
                            let AdjustedNominal = Nominal + MeanValue;
                            Low = AdjustedNominal;
                            High = AdjustedNominal;
                        }
                    }

                    let N = (High + Low) / 2;
                    let GrindingHigh = High;
                    let GrindingLow = Low;

                    if (N > 0 && N <= 10) {
                        GrindingHigh -= 0.010;
                        GrindingLow -= 0.010;
                    } else if (N > 10 && N <= 20) {
                        GrindingHigh -= 0.008;
                        GrindingLow -= 0.008;
                    } else if (N > 20 && N <= 40) {
                        GrindingHigh -= 0.009;
                        GrindingLow -= 0.009;
                    } else if (N > 40 && N <= 60) {
                        GrindingHigh -= 0.010;
                        GrindingLow -= 0.010;
                    } else if (N > 60) {
                        GrindingHigh -= 0.012;
                        GrindingLow -= 0.012;
                    }

                    return { Nominal, GrindingLow, GrindingHigh, units, HigherLower, Tolerance };
                };


                // Function to calculate ID and fetch OD/Chamfer
                const calculateIDAndOD = async (nominal_size, size_low_tolerance, size_high_tolerance) => {
                    let Nominal = parseFloat(nominal_size) || 0;
                    let Low = parseFloat(size_low_tolerance) || 0;
                    let High = parseFloat(size_high_tolerance) || 0;

                    // Calculate Mean Value
                    let Mean = (High + Low) / 2;
                    let MeanValue = Nominal + Mean;
                    let ID = MeanValue; // Initial machining size

                    // Calculate Machining Size (ID)
                    if (ID > 0 && ID <= 40) {
                        ID -= 0.3;
                    } else if (ID > 40 && ID <= 100) {
                        ID -= 0.3;
                    } else if (ID > 100 && ID <= 200) {
                        ID -= 0.5;
                    } else {
                        ID -= 1.0;
                    }

                    // Fetch OD & Chamfer from `PnumaticSettingRingGauge1` table
                    let OD = 0, Chamfer = 0;
                    try {
                        const odQuery = `
                            SELECT DiaD2, Champer
                            FROM dbo.PnumaticSettingRingGauge1
                            WHERE ? > Above
                              AND ? <= UpTo
                        `;
                        const result = await new Promise((resolve, reject) => {
                            runQuery(odQuery, [MeanValue, MeanValue], (err, row) => {
                                if (err) reject(err);
                                else resolve(row);
                            });
                        });

                        if (result) {
                            OD = parseFloat(result.DiaD2).toFixed(2);
                            Chamfer = parseFloat(result.Champer);
                        }
                    } catch (error) {
                        console.error("Error fetching OD & Chamfer:", error);
                    }

                    return { ID, OD, Chamfer };
                };


                const calculateCuttingODSize = (M, size_low_tolerance, size_high_tolerance, higher_lower) => {
                    M = parseFloat(M);
                    size_low_tolerance = parseFloat(size_low_tolerance);
                    size_high_tolerance = parseFloat(size_high_tolerance);
                    let mean;
                    if (higher_lower === 'Yes') {
                        mean = ((size_high_tolerance + size_low_tolerance) / 2);
                    } else {
                        mean = M + ((size_high_tolerance + size_low_tolerance) / 2);
                    }
                    if (isNaN(M) || isNaN(size_low_tolerance) || isNaN(size_high_tolerance)) {
                        return 'N/A';
                    }

                    const mean_tol = (size_low_tolerance + size_high_tolerance) / 2;
                    let offset = 0;

                    if (M > 0 && M <= 10) offset = 0.50;
                    else if (M > 10 && M <= 30) offset = 0.10;
                    else if (M > 30 && M <= 75) offset = 0.15;
                    else if (M > 75 && M <= 125) offset = 0.20;
                    else if (M > 125 && M <= 200) offset = 0.30;
                    else if (M > 200 && M <= 500) offset = 0.40;
                    else return 'N/A';

                    const machining_size = M + offset + mean_tol;
                    return machining_size.toFixed(4);
                }

                // Calculate machining size first
                const machiningResult = calculateMachiningSize(
                    row.nominal_size, 
                    row.size_low_tolerance, 
                    row.size_high_tolerance
                );

                // Get chart range using machining size
                const chart_range = getChartRange(
                    machiningResult, // Use machining size
                    row.bore_jet_type
                );


                const { cdx, drilling_size } = calculateDrillingSize(
                    row.nominal_size,
                    row.size_low_tolerance,
                    row.size_high_tolerance, 
                    row.bore_jet_type
                );


                return {
                    ...row,
                    t_dispatch_week,
                    finish_size: parseFloat(row.finish_size).toFixed(4),
                    machining_size: machiningResult,
                    chart_range,
                    drilling_size: drilling_size,
                    drilling_chart_type: getDrillingChartType(row.bore_jet_type),
                    cdx,
                    f_size : calculateFinishSize(row.nominal_size, row.size_low_tolerance, row.size_high_tolerance, row.clearance, row.SizeFrom, row.Unit),
                    jet_rough_size: calculateRoughSize(row.nominal_size, row.size_low_tolerance, row.size_high_tolerance),
                    Tol: calculateTolSize(row.finish_size),
                    ...processFinishSize(row.nominal_size, row.size_low_tolerance, row.size_high_tolerance, row.higher_lower, row.Unit, row.Tolerance),
                    ...processGrindingFinishSize(row.nominal_size, row.size_low_tolerance, row.size_high_tolerance, row.higher_lower, row.Unit, row.Tolerance),
                    OD: calculateIDAndOD(row.nominal_size, row.size_low_tolerance, row.size_high_tolerance),
                };
            });

            // Group results by component type
            // const groupedResults = {
            //     airPlug: calculatedRows.filter(row => row.type === 'Air Plug'),
            //     all: calculatedRows // Keep the complete array as well
            // };

            res.status(200).json({
                success: true,
                data: calculatedRows.filter(row => row.type === 'Air Plug')
            });
        }
    });
});

///////////////////////////////////////////////////////////////////////////





app.get('/cutting-sizes', (req, res) => {
    const query = `
        SELECT 
            record_sr_no,
            nominal_size,
            size_high_tolerance,
            size_low_tolerance,
            bore_jet_type,
            higher_lower,
            'Air Plug' as type,
            u.clearance,
            psr.DiaD2
        FROM dbo.air_plug_table
        LEFT JOIN dbo.units u ON dbo.air_plug_table.units = u.units
        LEFT JOIN dbo.PnumaticSettingRingGauge1 psr ON dbo.air_plug_table.nominal_size >= psr.Above
            AND dbo.air_plug_table.nominal_size < psr.UpTo
        WHERE u.clearance IS NOT NULL
        AND dbo.air_plug_table.nominal_size IS NOT NULL
    `;

    runQuery(query, [], (err, rows) => {
        if (err) {
            console.error('Error querying cutting sizes:', err.message);
            res.status(500).json({ success: false, message: 'Failed to fetch cutting sizes.' });
        } else {
            const calculateCuttingSize = (M, size_low_tolerance, size_high_tolerance, higher_lower) => {
                M = parseFloat(M);
                size_low_tolerance = parseFloat(size_low_tolerance);
                size_high_tolerance = parseFloat(size_high_tolerance);

                if (isNaN(M) || isNaN(size_low_tolerance) || isNaN(size_high_tolerance)) {
                    return 'N/A';
                }

                const mean_tol = (size_low_tolerance + size_high_tolerance) / 2;
                let offset = 0;

                if (M > 0 && M <= 10) offset = 0.50;
                else if (M > 10 && M <= 30) offset = 0.10;
                else if (M > 30 && M <= 75) offset = 0.15;
                else if (M > 75 && M <= 125) offset = 0.20;
                else if (M > 125 && M <= 200) offset = 0.30;
                else if (M > 200 && M <= 500) offset = 0.40;
                else return 'N/A';

                const cutting_size = (higher_lower === 'Yes') ? mean_tol + offset : M + mean_tol + offset;
                return cutting_size.toFixed(4);
            };

            const calculatedRows = rows.map(row => ({
                ...row,
                cutting_size: calculateCuttingSize(
                    row.nominal_size,
                    row.size_low_tolerance,
                    row.size_high_tolerance,
                    row.higher_lower
                )
            }));


            res.status(200).json({
                success: true,
                data: calculatedRows.filter(row => row.type === 'Air Plug')
            });
        }
    });
});
///////////////////////////////////// Air Plug Setting Ring Lapping Chart ///////////////////////////////////////////////////


app.get('/calculate-values', (req, res) => {
    const query = `
        SELECT 
            component.*,
            'Air Plug' as type,
            ROUND((u.Depression), 3) AS dep,
            u.ReamSize,
            u.CounterSize,
            u.JetDia,
            (component.size_high_tolerance + component.size_low_tolerance) / 2 AS hl_size,
            component.nominal_size + ((component.size_high_tolerance + component.size_low_tolerance) / 2) AS og_size,
            component.nominal_size + ((component.size_high_tolerance + component.size_low_tolerance) / 2 - u.clearance) AS finish_size,
            ROUND((component.nominal_size + ((component.size_high_tolerance + component.size_low_tolerance) / 2)) - u.clearance - 0.1, 2) AS under_size,
            ROUND((component.nominal_size + ((component.size_high_tolerance + component.size_low_tolerance) / 2)) - u.clearance + 0.1, 2) AS rough_size
        FROM dbo.air_plug_table component
        LEFT JOIN dbo.units u ON component.units = u.units
        WHERE u.clearance IS NOT NULL AND component.nominal_size IS NOT NULL
    `;

    runQuery(query, [], (err, rows) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database query failed" });
        }

        if (!rows || rows.length === 0) {
            return res.status(404).json({ error: "Data not found" });
        }

        // Process unit-based logic for each row
        const processedData = rows.map(row => {
            let {
                nominal_size: Nominal,
                size_low_tolerance: Low,
                size_high_tolerance: High,
                higher_lower: HigherLower,
                units: Unit,
                type: type
            } = row;

            // Convert to numbers to avoid concatenation issues
            Nominal = parseFloat(Nominal) || 0;
            Low = parseFloat(Low) || 0;
            High = parseFloat(High) || 0;

            let MeanValue;

            if (HigherLower === "Yes") {
                if (Nominal === 0) {
                    Low = Low;
                    High = High;
                } else {
                    Low = Nominal + Low;
                    High = Nominal + High;
                }
            } else {
                MeanValue = (High + Low) / 2;

                const unitsMap = {
                    "A/D +/-0.020 mm": 0.010,
                    "A/D +/-0.040 mm": 0.015,
                    "A/D +/-0.060 mm": 0.020,
                    "A/D +/-0.080 mm": 0.030,
                    "BAKER MERCER (BELOW 0.008 mm) +/-0.025 mm": 0.010,
                    "BAKER MERCER (BELOW 0.019 mm) +/-0.025 mm": 0.015,
                    "BAKER MERCER (ABOVE 0.019 mm) +/-0.025 mm": 0.020,
                    "BAKER MERCER (BELOW 0.050 mm) +/-0.050 mm": 0.015,
                    "BAKER MERCER (ABOVE 0.050 mm) +/-0.050 mm": 0.015,
                    "MODULE 1A +/-0.020 mm BAKER": 0.015,
                    "MODULE 1A +/-0.040 mm BAKER": 0.015,
                    "ETAMIC AIR GAUGE UNIT (+/-0.010 mm)": 0.005,
                    "ETAMIC AIR GAUGE UNIT (+/-0.020 mm)": 0.010,
                    "ETAMIC AIR GAUGE UNIT (+/-0.040 mm)": 0.015,
                };

                if (unitsMap[Unit] !== undefined) {
                    Nominal = Nominal + MeanValue;
                    Low = Nominal - unitsMap[Unit];
                    High = Nominal + unitsMap[Unit];
                } else if (["LIQ. COLUMN UNIT B_JET", "LIQ. COLUMN UNIT C_JET", "LIQ. COLUMN UNIT G_JET", "SOLEX", "FEDERAL (+/-0.030 mm)", "SHEFIELD (+/-0.040 mm)"].includes(Unit)) {
                    Low = Nominal + Low;
                    High = Nominal + High;
                } else if (Unit === "A/D +/- 0.05") {
                    Nominal = Nominal + MeanValue;
                    Low = Nominal;
                    High = Nominal;
                }
            }

            return {
                RecordSrNo: row.record_sr_no,
                type,
                Nominal: Nominal.toFixed(3),
                Low: isNaN(Low) ? null : Low.toFixed(4),
                High: isNaN(High) ? null : High.toFixed(4),
                hl_size: row.hl_size,
                og_size: row.og_size,
            };
        });

        // Group the processed data by component type
        const groupedData = {
            // airSnap: processedData.filter(item => item.ComponentType === 'Air Snap'),
            // airRing: processedData.filter(item => item.ComponentType === 'Air Ring'),
            data: processedData.filter(item => item.type === 'Air Plug'),
            // all: processedData
        };

        res.json(groupedData);
    });
});


app.get('/calculate-IDOD', async (req, res) => {
    try {
        const query = `
            SELECT 
                po.record_sr_no,
                po.nominal_size,
                po.size_high_tolerance,
                po.size_low_tolerance,
                po.higher_lower,
                po.bore_jet_type,
                po.units,
                po.dispatch_week,
                po.date,
                ROUND((u.Depression), 2) AS dep,
                   u.ReamSize,
                   u.CounterSize,
                   u.JetDia,
                ROUND((po.size_high_tolerance + po.size_low_tolerance) / 2, 2) AS hl_size,
                ROUND(po.nominal_size + ((po.size_high_tolerance + po.size_low_tolerance) / 2), 2) AS og_size,
                ROUND(po.nominal_size + ((po.size_high_tolerance + po.size_low_tolerance) / 2 - u.clearance), 2) AS finish_size,
                ROUND((po.nominal_size + ((po.size_high_tolerance + po.size_low_tolerance) / 2)) - u.clearance - 0.1, 2) AS under_size,
                ROUND((po.nominal_size + ((po.size_high_tolerance + po.size_low_tolerance) / 2)) - u.clearance + 0.1, 2) AS rough_size
            FROM dbo.purchase_orders po
            LEFT JOIN dbo.units u ON po.units = u.units
            WHERE u.clearance IS NOT NULL
            AND po.nominal_size IS NOT NULL
            AND po.type = 'Air Plug'
        `;

        runQuery(query, [], async (err, rows) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Database query failed" });
            }

            if (!rows || rows.length === 0) {
                return res.status(404).json({ error: "Data not found" });
            }

            // Keep existing calculateIDAndOD function unchanged
            const calculateIDAndOD = async (nominal_size, size_low_tolerance, size_high_tolerance) => {
                let Nominal = parseFloat(nominal_size) || 0;
                let Low = parseFloat(size_low_tolerance) || 0;
                let High = parseFloat(size_high_tolerance) || 0;

                // Calculate Mean Value
                let Mean = (High + Low) / 2;
                let MeanValue = Nominal + Mean;
                let ID = MeanValue; // Initial machining size

                // Calculate Machining Size (ID)
                if (ID > 0 && ID <= 40) {
                    ID -= 0.3;
                } else if (ID > 40 && ID <= 100) {
                    ID -= 0.3;
                } else if (ID > 100 && ID <= 200) {
                    ID -= 0.5;
                } else {
                    ID -= 1.0;
                }

                ID = parseFloat(ID.toFixed(2));

                // Determine the correct table based on MeanValue
                let tableName = "";
                if (MeanValue >= 2.5 && MeanValue <= 100) {
                    tableName = "dbo.PnumaticSettingRingGauge1";
                } else if (MeanValue > 100 && MeanValue <= 260) {
                    tableName = "dbo.PnumaticSettingRingGauge2";
                } else {
                    return { ID, OD: 0, Chamfer: 0 };
                }

                // Fetch OD & Chamfer from the correct table
                let OD = 0, Chamfer = 0;
                try {
                    const odQuery = `
                    SELECT DiaD2, Champer
                    FROM ${tableName}
                    WHERE ? > Above
                    AND ? <= UpTo
                `;

                const result = await new Promise((resolve, reject) => {
                    runQuery(odQuery, [MeanValue, MeanValue], (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows[0]); // ✅ fix: get first matching row
                    });
                });

                if (result) {
                    OD = parseFloat(parseFloat(result.DiaD2).toFixed(2));
                    Chamfer = parseFloat(parseFloat(result.Champer).toFixed(2));
                }

                } catch (error) {
                    console.error(`Error fetching OD & Chamfer from ${tableName}:`, error);
                }

                return { ID, OD, Chamfer };
            };

            // Process all rows and calculate ID, OD, and Chamfer
            const calculatedRows = await Promise.all(rows.map(async (row) => {
                let t_dispatch_week = null;

                if (row.dispatch_week && row.date) {
                    const weekNumberMatch = row.dispatch_week.match(/^(\d+)\s*Week$/);
                    const weekNumber = weekNumberMatch ? parseInt(weekNumberMatch[1], 10) : 0;

                    if (weekNumber > 0) {
                        const entryDate = new Date(row.date);
                        if (!isNaN(entryDate.getTime())) {
                            entryDate.setDate(entryDate.getDate() + weekNumber * 7);
                            t_dispatch_week = entryDate.toISOString().split('T')[0];
                        }
                    }
                }

                const { ID, OD, Chamfer } = await calculateIDAndOD(
                    row.nominal_size,
                    row.size_low_tolerance,
                    row.size_high_tolerance
                );

                return {
                    ...row,
                    ID,
                    OD,
                    Chamfer,
                    t_dispatch_week
                };
            }));

            res.status(200).json({
                success: true,
                data: calculatedRows
            });
        });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});





app.get('/calculate-finish-values', (req, res) => {
    const query = `
        SELECT po.record_sr_no,
               po.nominal_size,
               po.size_high_tolerance,
               po.size_low_tolerance,
               po.higher_lower,
               po.bore_jet_type,
               po.units,
               po.dispatch_week,
               po.date,
               po.higher_lower,
               po.work_order_no,
               au.allowance,
               (po.size_high_tolerance + po.size_low_tolerance) / 2 AS hl_size,
               po.nominal_size + ((po.size_high_tolerance + po.size_low_tolerance) / 2) AS og_size
        FROM purchase_orders po
        LEFT JOIN airringunits au ON po.units = au.runits
        WHERE au.runits IS NOT NULL
          AND po.nominal_size IS NOT NULL
          AND po.type = 'Air Ring'
    `;

    runQuery(query, [], (err, rows) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database query failed" });
        }

        if (!rows || rows.length === 0) {
            return res.status(404).json({ error: "Data not found" });
        }

        const processedData = rows.map(row => {
            let {
                nominal_size: Nominal,
                size_low_tolerance: Low,
                size_high_tolerance: High,
                higher_lower: HigherLower,
                units: Unit,
                dispatch_week,
                date,
                higher_lower: higher_lower,
                record_sr_no,
                work_order_no: workOrderNo,
                hl_size,
                og_size
            } = row;

            Nominal = parseFloat(Nominal);
            Low = parseFloat(Low) || 0;
            High = parseFloat(High) || 0;
            // console.log(Nominal, Low, High);

            // Adjusted logic based on C code
            if (HigherLower === "Yes") {
                if (Nominal === 0) {
                    // No change
                    Low = Low; // Keep Low as is
                    High = High; // Keep High as is
                } else {
                    Low = Nominal + Low; // Adjust Low
                    High = Nominal + High; // Adjust High
                }
            } else {
                // Handle different units
                if (Unit === "A/D +/-0.020 MM") {
                    const MeanValue = (High + Low) / 2;
                    Nominal += MeanValue;
                    Low = Nominal - 0.010;
                    High = Nominal + 0.010;
                } else if (Unit === "A/D +/-0.040 MM") {
                    const MeanValue = (High + Low) / 2;
                    Nominal += MeanValue;
                    Low = Nominal - 0.015;
                    High = Nominal + 0.015;
                } else if (Unit === "A/D +/-0.060 MM") {
                    const MeanValue = (High + Low) / 2;
                    Nominal += MeanValue;
                    Low = Nominal - 0.020;
                    High = Nominal + 0.020;
                } else if (Unit === "A/D +/-0.080 MM") {
                    const MeanValue = (High + Low) / 2;
                    Nominal += MeanValue;
                    Low = Nominal - 0.030;
                    High = Nominal + 0.030;
                } else if (["L/C B-JET (B JET)", "L/C C-JET (C JET)", "L/C G-JET (G JET)", "SOLEX", "FEDERAL +/-0.030", "SHEFIELD +/-0.030"].includes(Unit)) {
                    Low = Nominal + Low; // Adjust Low based on Nominal
                    High = Nominal + High; // Adjust High based on Nominal
                } else if (Unit === "BAKER MERCER (BHM BELOW 0.008) (+/-0.025 MM)") {
                    const MeanValue = (High + Low) / 2;
                    Nominal += MeanValue;
                    Low = Nominal - 0.010;
                    High = Nominal + 0.010;
                } else if (Unit === "BAKER MERCER (BHM BELOW 0.019) (+/-0.025 MM)") {
                    const MeanValue = (High + Low) / 2;
                    Nominal += MeanValue;
                    Low = Nominal - 0.015;
                    High = Nominal + 0.015;
                } else if (Unit === "BAKER MERCER (BHM ABOVE 0.019) (+/-0.025 MM)") {
                    const MeanValue = (High + Low) / 2;
                    Nominal += MeanValue;
                    Low = Nominal - 0.020;
                    High = Nominal + 0.020;
                } else if (Unit === "BAKER MERCER (BHM BELOW 0.050) (+/-0.050 MM)") {
                    const MeanValue = (High + Low) / 2;
                    Nominal += MeanValue;
                    Low = Nominal - 0.030;
                    High = Nominal + 0.030;
                } else if (Unit === "BAKER MERCER (BHM ABOVE 0.050) (+/-0.050 MM)") {
                    const MeanValue = (High + Low) / 2;
                    Nominal += MeanValue;
                    Low = Nominal - 0.040;
                    High = Nominal + 0.040;
                } else if (Unit === "BAKER MERCER MODULE 1A +/-0.020") {
                    const MeanValue = (High + Low) / 2;
                    Nominal += MeanValue;
                    Low = Nominal - 0.010;
                    High = Nominal + 0.010;
                } else if (Unit === "BAKER MERCER MODULE 1A +/-0.040") {
                    const MeanValue = (High + Low) / 2;
                    Nominal += MeanValue;
                    Low = Nominal - 0.015;
                    High = Nominal + 0.015;
                } else if (Unit === "E-JET +/-0.010") {
                    const MeanValue = (High + Low) / 2;
                    Nominal += MeanValue;
                    Low = Nominal - 0.005;
                    High = Nominal + 0.005;
                } else if (Unit === "E-JET +/-0.020") {
                    const MeanValue = (High + Low) / 2;
                    Nominal += MeanValue;
                    Low = Nominal - 0.010;
                    High = Nominal + 0.010;
                } else if (Unit === "E-JET +/-0.040") {
                    const MeanValue = (High + Low) / 2;
                    Nominal += MeanValue;
                    Low = Nominal - 0.015;
                    High = Nominal + 0.015;
                } else if (Unit === "E-JET H +/-0.040") {
                    const MeanValue = (High + Low) / 2;
                    Nominal += MeanValue;
                    Low = Nominal - 0.015;
                    High = Nominal + 0.015;
                } else if (Unit === "+/-0.05 (0.05 MM)") {
                    const MeanValue = (High + Low) / 2;
                    Nominal += MeanValue;
                    Low = Nominal; // Set Low to Nominal
                    High = Nominal; // Set High to Nominal
                } else if (Unit === "BAKER MODULE 2A ") {
                    // const MeanValue = (High + Low) / 2;
                    // Nominal += MeanValue;
                    Low = Nominal + Low; // Set Low to Nominal
                    High = Nominal + High; // Set High to Nominal
                }
            }

            // Debugging: print final values of Low and High
            // console.log("Final Low and High:", { Low, High });

            let t_dispatch_week = null;

            if (dispatch_week && date) {
                const match = dispatch_week.match(/^(\d+)\s*Week$/);
                const weekNum = match ? parseInt(match[1], 10) : 0;

                if (weekNum > 0) {
                    const entryDate = new Date(date);
                    if (!isNaN(entryDate)) {
                        entryDate.setDate(entryDate.getDate() + (weekNum * 7));
                        t_dispatch_week = entryDate.toISOString().split('T')[0];
                    }
                }
            }

            return {
                record_sr_no,
                Nominal: Nominal.toFixed(3),
                Low: Low.toFixed(4),
                High: High.toFixed(4),
                hl_size: parseFloat(hl_size).toFixed(3),
                og_size: parseFloat(og_size).toFixed(3),
                allowance: "+6 TO 8mu",
                Unit,
                workOrderNo,
                t_dispatch_week,
                higher_lower,
            };
        });

        res.json({ data: processedData });
    });
});




// Define the calculateValues function
function calculateValues(Nominal, Low, High, codes, HigherLower) {
    let MeanValue = 0;

    if (HigherLower === "Yes") {
        if (Nominal === 0) {
            // Leave Low and High unchanged
        } else {
            Low = Nominal + Low;
            High = Nominal + High;
        }
    } else {
        MeanValue = (High + Low) / 2;

        const adjustments = {
            "A/D +/-0.020": 0.010,
            "A/D  +/-0.040": 0.015,
            "A/D +/-0.060": 0.030,
            "A/D +/-0.080": 0.030,
            "BHM BELOW 0.008": 0.010,
            "BHM BELOW 0.019": 0.015,
            "BHM ABOVE 0.019": 0.020,
            "BHM BELOW 0.050": 0.030,
            "BHM ABOVE 0.050": 0.040,
            "MODUL 1A +/-0.020": 0.010,
            "MODUL 1A +/-0.040": 0.015,
            "E-JET +/-0.010": 0.005,
            "E-JET +/-0.020": 0.010,
            "E-JET +/-0.040": 0.015,
            "MODULE 2A": 0.020,
        };

        if (adjustments[codes]) {
            Nominal += MeanValue;
            Low = Nominal - adjustments[codes];
            High = Nominal + adjustments[codes];
        } else if (
            ["L/C B JET", "L/C C JET", "L/C G JET", "SOLEX", "F/D +/-0.030", "S/F +/-0.030"].includes(codes)
        ) {
            Low = Nominal + Low;
            High = Nominal + High;
        } else if (codes === "+/-0.050") {
            Nominal += MeanValue;
            Low = Nominal;
            High = Nominal;
        }
    }

    return { Low, High };
}


app.get('/airsnap-values', (req, res) => {
    const query = `
        SELECT ar.record_sr_no,
               ar.nominal_size,
               ar.size_high_tolerance,
               ar.size_low_tolerance,
               ar.higher_lower,
               ar.bore_jet_type,
               ar.units,
               au.Code,
               au.Size1,
               au.Size2,
               ar.dispatch_week,
               ar.date,
               ar.remark,
               ar.work_order_no,
               (ar.size_high_tolerance + ar.size_low_tolerance) / 2 AS hl_size,
               ar.nominal_size + ((ar.size_high_tolerance + ar.size_low_tolerance) / 2) AS og_size
        FROM dbo.air_snap_table ar
        LEFT JOIN dbo.airsnapunits au ON ar.units = au.sunits
        WHERE au.sunits IS NOT NULL
          AND ar.nominal_size IS NOT NULL
    `;

    runQuery(query, [], (err, rows) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database query failed" });
        }

        if (!rows || rows.length === 0) {
            return res.status(404).json({ error: "Data not found" });
        }

        const processedData = rows.map(row => {
            let {
                nominal_size: Nominal,
                size_low_tolerance: Low,
                size_high_tolerance: High,
                higher_lower: HigherLower,
                units: Unit,
                bore_jet_type,
                Code: codes,
                remark,
                work_order_no: workOrderNo
            } = row;

            Nominal = Nominal ? parseFloat(Nominal) : 0;
            Low = Low ? parseFloat(Low) : 0;
            High = High ? parseFloat(High) : 0;

            // Call the calculateValues function
            const { Low: adjustedLow, High: adjustedHigh } = calculateValues(Nominal, Low, High, codes, HigherLower);

            // Dispatch week logic
            let t_dispatch_week = null;
            if (row.dispatch_week && row.date) {
                const weekNumberMatch = row.dispatch_week.match(/^(\d+)\s*Week$/);
                const weekNumber = weekNumberMatch ? parseInt(weekNumberMatch[1], 10) : 0;
                const entryDate = new Date(row.date);

                if (weekNumber > 0 && !isNaN(entryDate.getTime())) {
                    entryDate.setDate(entryDate.getDate() + weekNumber * 7);
                    t_dispatch_week = entryDate.toISOString().split('T')[0];
                }
            }

            // Internal diameter calculation remains the same
            let internal_dia;
            const unitText = Unit?.toUpperCase().trim() || "";
            const Size1 = row.Size1?.toUpperCase() || "";
            const Size2 = parseFloat(row.Size2 || 0);
            const hl_average = (Low + High) / 2;

            // General calculation for internal_dia
            if (Nominal === 0 && Size1 === "M") {
                internal_dia = (hl_average + Size2).toFixed(4);
            } else if (Size1 === "M") {
                internal_dia = (Nominal + Size2).toFixed(4);
            } else {
                internal_dia = (hl_average + Size2).toFixed(4);
            }

            // Special case handling for specific units
            if (unitText.includes("BAKER MERCER MODULE 1A (+/-0.020 MM)") || 
                unitText.includes("BAKER MERCER MODULE 1A (+/-0.040 MM)") || 
                unitText.includes("BAKER MODULE 2A")) {
                internal_dia = (Nominal + 0.200).toFixed(4); // Example adjustment
            }

            return {
                record_sr_no: row.record_sr_no,
                Nominal: Nominal.toFixed(3),
                l: isNaN(adjustedLow) ? null : adjustedLow.toFixed(4),
                h: isNaN(adjustedHigh) ? null : adjustedHigh.toFixed(4),
                Low: row.size_low_tolerance.toFixed(4),
                High: row.size_high_tolerance.toFixed(4),
                hl_size: row.hl_size,
                og_size: row.og_size,
                allowance: "6 TO 8mu",
                Unit,
                codes,
                remark,
                internal_dia,
                bore_jet_type,
                workOrderNo,
                t_dispatch_week,
            };
        });

        res.json({ data: processedData });
    });
});





////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


app.get('/internal-diameter', (req, res) => {
    const query = `
        SELECT DISTINCT 
            po.*,
            'Air Ring' as type,
                        au.runits as Runits,
                        au.cdx,
                        au.tap,
                        au.baker_type,
                        au.airring_size,
                        au.allowance,
                        ROUND((au.jet_diameter), 2) AS jet_diameter,
                        au.size,
                        -- M Calculation (Size Condition)
                        CASE
                WHEN au.size = 'M' THEN ROUND(po.nominal_size + au.airring_size, 4)
                ELSE ROUND(po.size_high_tolerance + au.airring_size, 4)
            END AS M_value,

                        -- Baker Internal Diameter
                        CASE
                WHEN au.baker_type = 'baker' THEN ROUND(po.nominal_size + po.size_high_tolerance + 0.020, 4)
                            ELSE NULL
            END AS baker_internal_diameter,

                        -- Non-Baker Internal Diameter
                        CASE
                            WHEN au.baker_type != 'baker' THEN ROUND(
                    po.nominal_size + ((po.size_low_tolerance + po.size_high_tolerance) / 2) +
                                    au.airring_size, 4)
                            ELSE NULL
            END AS non_baker_internal_diameter,

                        -- DEP Calculation
                        CASE
                            WHEN au.baker_type = 'baker' THEN ROUND(((0.100 -
                    ABS((po.nominal_size + (po.size_low_tolerance + po.size_high_tolerance) / 2) -
                        (po.nominal_size + po.size_high_tolerance + 0.020))) /
                                                                     2), 4)
                            ELSE ROUND((au.dep), 4)
            END AS dep
        FROM dbo.purchase_orders po
        LEFT JOIN dbo.airringunits au ON po.units = au.runits
        WHERE au.airring_size IS NOT NULL
        AND po.nominal_size IS NOT NULL
        AND po.size_high_tolerance IS NOT NULL
        `;
        
        runQuery(query, [], async (err, rows) => {
            if (err) {
                console.error('Error querying internal diameters:', err.message);
                return res.status(500).json({ success: false, message: 'Failed to fetch internal diameters.' });
            }
            
            try {
                const calculatedRows = await Promise.all(rows.map(async (row) => {
                    let t_dispatch_week = null;
        
                    if (row.dispatch_week && row.date) {
                        const weekMatch = row.dispatch_week.match(/^\d+/);
                        const weekNumber = weekMatch ? parseInt(weekMatch[0], 10) : 0;
        
                        if (weekNumber > 0) {
                            const entryDate = new Date(row.date);
                            if (!isNaN(entryDate.getTime())) {
                                entryDate.setDate(entryDate.getDate() + weekNumber * 7);
                                t_dispatch_week = entryDate.toISOString().split('T')[0];
                            }
                        }
                    }

                    const fetchFinishData = async (internalDiameter) => {
                        const query = `
                            SELECT TOP 1 FinishThickness, FinishOD
                            FROM dbo.AirRingCuttingSizeData
                            WHERE ? BETWEEN Range1 AND Range2
                        `;
                        return new Promise((resolve, reject) => {
                            runQuery(query, [internalDiameter], (err, rows) => {
                                if (err) {
                                    console.error('Error fetching finish data:', err);
                                    reject(err);
                                }
                                resolve(rows[0] || { FinishThickness: null, FinishOD: null });
                            });
                        });
                    };

        const calculateRangeAndPlugSize = (high, low, nominal, airRingSize, size) => {
            let tol_mean = (parseFloat(high) + parseFloat(low)) / 2;
            let mean = parseFloat(nominal) + tol_mean;
            let m = mean;

            if (size === "M") {
                m = mean + parseFloat(airRingSize);
            } else {
                m = parseFloat(high) + parseFloat(airRingSize) + parseFloat(nominal);
            }

            m = isNaN(m) ? 0 : m;
            let settingPlugSize = (m + 0.3).toFixed(1);

            let range = "";
            nominal = parseFloat(nominal) || (parseFloat(high) + parseFloat(low)) / 2;

            if (nominal > 4.8 && nominal <= 7) {
                range = "4.8 - 7";
            } else if (nominal > 7 && nominal <= 10) {
                range = "7 - 10";
            } else if (nominal > 10 && nominal <= 14) {
                range = "10 - 14";
            } else if (nominal > 14 && nominal <= 18) {
                range = "14 - 18";
            } else if (nominal > 18 && nominal <= 30) {
                range = "18 - 30";
            } else if (nominal > 30 && nominal <= 40) {
                range = "30 - 40";
            } else if (nominal > 40 && nominal <= 65) {
                range = "40 - 65";
            } else if (nominal > 65 && nominal <= 120) {
                range = "65 - 120";
            } else {
                range = "Above 120";
            }

            return { range, settingPlugSize };
        };


        const calculateInternalDiameter = (nominalSize, lowTolerance, highTolerance, airring_size, size, Runit) => {
            const Nominal = parseFloat(nominalSize) || 0;
            const Low = parseFloat(lowTolerance) || 0;
            const High = parseFloat(highTolerance) || 0;
            const AirRingSize = parseFloat(airring_size) || 0;

            let M;

            // Calculate M based on SizeFrom
            if (size === "M") {
                M = Nominal + AirRingSize; // If SizeFrom is "M"
            } else {
                M = Nominal + ((Low + High) /2)+ AirRingSize; // Default calculation
            }

            // Initialize FinishSize and Depression
            let FinishSize = 0, Depression = 0;



            // Special handling for specific units
            if (Runit === "BAKER MERCER MODULE 1A +/-0.020" || Runit === "BAKER MERCER MODULE 1A +/-0.040" || Runit === "BAKER MODULE 2A ") {
                FinishSize = Nominal + (High + Low) / 2 + 0.020; // Adjusted calculation for specific units
            }

            return { FinishSize: M.toFixed(4), Depression: Depression.toFixed(5) }; // Return formatted values
        };




                const calculateTolerance = (internal_diameter) => {
                    let M = parseFloat(internal_diameter);
                    if (isNaN(M)) return 0; // Handle NaN case
                
                    if (M <= 10) return 0.002;
                    if (M <= 18) return 0.0025;
                    if (M <= 30) return 0.0030;
                    if (M <= 50) return 0.0035;
                    if (M <= 80) return 0.0040;
                    if (M <= 120) return 0.0050;
                    if (M <= 180) return 0.0060;
                    if (M <= 250) return 0.0070;
                    return 0;
                };
                
                const calculateBoreSize = (nominal_size, size_high_tolerance, size_low_tolerance) => {
                    // Convert nominal_size to a number
                    let M = parseFloat(nominal_size);
                
                    // Check if M is 0 and calculate it based on tolerances
                    if (M === 0) {
                        M = (parseFloat(size_high_tolerance) + parseFloat(size_low_tolerance)) / 2;
                    }
                
                    // Calculate BoreSize based on the value of M
                    let BoreSize = M < 40 ? M - 0.2 : M < 150 ? M - 0.4 : M - 0.5;
                
                    // Ensure BoreSize is not negative
                    if (BoreSize < 0) {
                        // console.warn("Calculated BoreSize is negative:", BoreSize);
                        return BoreSize; // or handle it as needed
                    }
                
                    return BoreSize.toFixed(1);
                };


                const { FinishSize, Depression } = calculateInternalDiameter(
                    row.nominal_size,
                    row.size_low_tolerance,
                    row.size_high_tolerance,
                    row.airring_size,
                    row.units,
                    row.bore_jet_type
                );



                

                const { range, settingPlugSize } = calculateRangeAndPlugSize(
                    row.size_high_tolerance,
                    row.size_low_tolerance,
                    row.nominal_size,
                    row.airring_size,
                    row.units
                );


                const internalDiameter = row.baker_internal_diameter || row.non_baker_internal_diameter;
                const tolerance = calculateTolerance(internalDiameter);
                const finish_thickness = fetchFinishData(internalDiameter);


                const { FinishThickness, FinishOD } = await fetchFinishData(internalDiameter);
                let finalFinishOD = FinishOD;
                if (row.nominal_size >= 30) {
                    finalFinishOD = row.nominal_size + 45;
                }

                return {
                    ...row,
                    tolerance:tolerance.toFixed(4),
                    // tolerance: calculateTolerance(row.nominal_size),
                    t_dispatch_week,
                    range,
                    jet_diameter: parseFloat(row.jet_diameter).toFixed(2), // Format to 2 decimal places
                    dep: parseFloat(row.dep).toFixed(4), // Format to 2 decimal places
                    settingPlugSize,
                    finish_thickness: FinishThickness, // Assign FinishThickness directly
                    finish_od: finalFinishOD !== null ? Number(finalFinishOD).toFixed(2) : null,
                    cdx: row.cdx?.toFixed(2) || null,
                    tap: row.tap,
                    baker_internal_diameter: row.baker_internal_diameter || null,
                    non_baker_internal_diameter: row.non_baker_internal_diameter || null,
                    bore_size: calculateBoreSize(row.nominal_size, row.size_high_tolerance, row.size_low_tolerance),

                    // ...calculateInternalDiameter(HigherLower, Nominal, Low, High, Unit),
                    FinishSize,
                    // depression: Depression.toFixed(4), // Return formatted Depression
                };
            }));

            

            res.status(200).json({
                success: true, data: calculatedRows.filter(row => row.type === 'Air Ring'),
            });

        } catch (error) {
            console.error('Error processing rows:', error);
            res.status(500).json({ success: false, message: 'Error processing data.' });
        }
    });
});



app.get('/airplug-history/:work_order_no', (req, res) => {
    // const workOrderNo = req.params.work_order_no;
    const recordSrNo = `SELECT *
                        FROM purchase_orders
                        WHERE work_order_no = ?`;

    db.query(recordSrNo, [], (err, rows) => {
        if (err) {
            console.error('Error fetching work order data:', err.message);
            res.status(500).json({ error: 'Failed to fetch work order data' });
        } else {
            res.status(200).json({ data: rows });
        }
    });
});


/////////////////////////////////////////////// Inventory Sense ////////////////////////////////////////////////////////


// app.get('/analytics/history', (req, res) => {
//     db.all(`SELECT *
//             FROM purchase_orders`, [], (err, rows) => {
//         if (err) {
//             console.error('Error fetching history:', err.message);
//             res.status(500).json({ error: 'Failed to fetch history' });
//         } else {
//             // Group the rows by work_order_no and party_name
//             const groupedData = {};

//             rows.forEach((row) => {
//                 const { work_order_no, party_name, air_plug_ap, setting_ring_sr, date } = row;

//                 // Parse and format the date into dd/mm/yyyy
//                 let formattedDate = null;
//                 if (date) {
//                     const parsedDate = new Date(date);
//                     if (!isNaN(parsedDate)) {
//                         formattedDate = parsedDate.toLocaleDateString('en-GB'); // Format as dd/mm/yyyy
//                     }
//                 }

//                 // Initialize grouping by work_order_no and party_name
//                 const key = `${work_order_no}-${party_name}`;
//                 if (!groupedData[key]) {
//                     groupedData[key] = {
//                         work_order_no,
//                         party_name,
//                         air_plug_ap: 0,
//                         setting_ring_sr: 0,
//                         total_orders: 0,
//                         date: null, // This will be updated with the latest date
//                     };
//                 }

//                 // Update quantities and order count
//                 groupedData[key].air_plug_ap += air_plug_ap;
//                 groupedData[key].setting_ring_sr += setting_ring_sr;
//                 groupedData[key].total_orders += 1;

//                 // Track the most recent order date
//                 if (!groupedData[key].date || new Date(date) > new Date(groupedData[key].date)) {
//                     groupedData[key].date = formattedDate;
//                 }
//             });

//             // Map the results for the CSV file
//             const results = Object.values(groupedData).map((entry) => {
//                 const predictedDemand = entry.total_orders * 10; // Dummy prediction logic (10 units per order)
//                 const stockNeeded = predictedDemand - entry.air_plug_ap;

//                 return {
//                     work_order_no: entry.work_order_no,
//                     party_name: entry.party_name,
//                     air_plug_ap: entry.air_plug_ap,
//                     setting_ring_sr: entry.setting_ring_sr,
//                     stock_needed: stockNeeded,
//                     predicted_demand: predictedDemand,
//                     date: entry.date, // Formatted date
//                 };
//             });

//             // Convert the results to CSV
//             const csv = parse(results);
//             const frontendDirectory = path.join(__dirname, '..', 'frontend', 'src', 'components');

//             const filePath = path.join(frontendDirectory, 'purchase_orders_history.csv');

//             // Write the CSV data to a file
//             fs.writeFile(filePath, csv, (err) => {
//                 // console.log('Data being saved to CSV:', results);

//                 if (err) {
//                     console.error('Error writing to CSV file:', err.message);
//                     res.status(500).json({ error: 'Failed to save data to CSV' });
//                 } else {
//                     // console.log('Data successfully saved to CSV file');
//                     res.status(200).json({ message: 'Data saved to CSV file', data: results });
//                 }
//             });
//         }
//     });
// });


// app.get('/api/recommendations', (req, res) => {
//     const selectedMonth = req.query.month; // Get selected month (e.g., "2024-11")

//     if (!selectedMonth) {
//         return res.status(400).json({ error: 'Month is required' });
//     }

//     // Extract year and month from selectedMonth (e.g., "2024-11")
//     const [year, month] = selectedMonth.split('-');

//     db.all('SELECT * FROM purchase_orders WHERE strftime("%Y-%m", date) = ?', [`${year}-${month}`], (err, rows) => {
//         if (err) {
//             console.error('Error fetching data:', err.message);
//             return res.status(500).json({ error: 'Failed to fetch data' });
//         }

//         // Group by work_order_no and party_name
//         const groupedData = {};

//         rows.forEach((row) => {
//             const { work_order_no, party_name, air_plug_ap, setting_ring_sr, date } = row;

//             const key = `${work_order_no}-${party_name}`;
//             if (!groupedData[key]) {
//                 groupedData[key] = {
//                     work_order_no,
//                     party_name,
//                     air_plug_ap: 0,
//                     setting_ring_sr: 0,
//                     total_orders: 0,
//                     date: null,
//                 };
//             }

//             // Update quantities and order count
//             groupedData[key].air_plug_ap += air_plug_ap;
//             groupedData[key].setting_ring_sr += setting_ring_sr;
//             groupedData[key].total_orders += 1;

//             // Track the most recent order date
//             if (!groupedData[key].date || new Date(date) > new Date(groupedData[key].date)) {
//                 groupedData[key].date = date;
//             }
//         });

//         // Calculate predicted values for December
//         const predictions = Object.values(groupedData).map((entry) => {
//             const predictedDemand = entry.total_orders * 10; // Simple prediction logic: 10 units per order
//             const stockNeeded = predictedDemand - entry.air_plug_ap;

//             return {
//                 work_order_no: entry.work_order_no,
//                 party_name: entry.party_name,
//                 air_plug_ap: entry.air_plug_ap,
//                 setting_ring_sr: entry.setting_ring_sr,
//                 stock_needed: stockNeeded,
//                 predicted_demand: predictedDemand,
//                 date: entry.date, // Last order date in November
//             };
//         });

//         // Save data to CSV (optional)
//         const csv = parse(predictions);
//         const frontendDirectory = path.join(__dirname, 'frontend', 'src', 'components');
//         const filePath = path.join(frontendDirectory, 'purchase_orders_history.csv');

//         fs.writeFile(filePath, csv, (err) => {
//             if (err) {
//                 console.error('Error writing to CSV file:', err.message);
//                 return res.status(500).json({ error: 'Failed to save data to CSV' });
//             } else {
//                 // console.log('Data successfully saved to CSV file');
//                 return res.status(200).json({ message: 'Data saved to CSV file', predictions });
//             }
//         });
//     });
// });


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


app.delete('/airplug-entry/:record_sr_no', (req, res) => {
    const { record_sr_no } = req.params;

    // Delete from air_plug_table
    runQuery('DELETE FROM dbo.air_plug_table WHERE record_sr_no = ?', [record_sr_no], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Delete from purchase_orders table (corrected query)
        runQuery("DELETE FROM dbo.purchase_orders WHERE record_sr_no = ? AND type = 'Air Plug'", [record_sr_no], function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // Delete from progress table
            runQuery('DELETE FROM dbo.progress WHERE record_sr_no = ?', [record_sr_no], function (err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                res.json({
                    success: true,
                    message: 'Entry deleted successfully from all tables'
                });
            });
        });
    });
});


app.delete('/airring-entry/:record_sr_no', (req, res) => {
    const { record_sr_no } = req.params;

    // Delete from air_ring_table
    runQuery('DELETE FROM dbo.air_ring_table WHERE record_sr_no = ?', [record_sr_no], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Delete from purchase_orders table (corrected query)
        runQuery("DELETE FROM dbo.purchase_orders WHERE record_sr_no = ? AND type = 'Air Ring'", [record_sr_no], function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // Delete from progress table
            runQuery('DELETE FROM dbo.progress WHERE record_sr_no = ?', [record_sr_no], function (err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                res.json({
                    success: true,
                    message: 'Entry deleted successfully from all tables'
                });
            });
        });
    });
});

app.delete('/airsnap-entry/:record_sr_no', (req, res) => {
    const { record_sr_no } = req.params;

    // Delete from air_snap_table
    runQuery('DELETE FROM dbo.air_snap_table WHERE record_sr_no = ?', [record_sr_no], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Delete from purchase_orders table (corrected query)
        runQuery("DELETE FROM dbo.purchase_orders WHERE record_sr_no = ? AND type = 'Air Snap'", [record_sr_no], function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // Delete from progress table
            runQuery('DELETE FROM dbo.progress WHERE record_sr_no = ?', [record_sr_no], function (err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                res.json({
                    success: true,
                    message: 'Entry deleted successfully from all tables'
                });
            });
        });
    });
});

app.delete('/delete-all-airsnap-entries', (req, res) => {
    runQuery("SELECT record_sr_no FROM air_snap_table", [], (err, rows) => {
        if (err) {
            console.error("Error fetching records:", err.message);
            return res.status(500).json({ error: err.message });
        }

        // Delete from purchase_orders table
        runQuery("DELETE FROM purchase_orders WHERE type = ?", ['Air Snap'], function (err) {
            if (err) {
                console.error("Error deleting entries:", err.message);
                return res.status(500).json({ error: err.message });
            }

            // Delete from progress table for all record_sr_nos
            const recordIds = rows.map(row => row.record_sr_no);
            if (recordIds.length > 0) {
                const placeholders = recordIds.map(() => '?').join(',');
                runQuery(`DELETE FROM progress WHERE record_sr_no IN (${placeholders})`, recordIds, function (err) {
                    if (err) {
                        console.error("Error deleting progress entries:", err.message);
                        return res.status(500).json({ error: err.message });
                    }
                    res.json({ message: `Deleted ${this.changes} entries successfully` });
                });
            } else {
                res.json({ message: "No entries found to delete" });
            }
        });
    });
});

app.delete('/delete-all-airring-entries', (req, res) => {
    runQuery("SELECT record_sr_no FROM air_ring_table", [], (err, rows) => {
        if (err) {
            console.error("Error fetching records:", err.message);
            return res.status(500).json({ error: err.message });
        }

        // Delete from purchase_orders table
        runQuery("DELETE FROM purchase_orders WHERE type = ?", ['Air Ring'], function (err) {
            if (err) {
                console.error("Error deleting entries:", err.message);
                return res.status(500).json({ error: err.message });
            }

            // Delete from progress table for all record_sr_nos
            const recordIds = rows.map(row => row.record_sr_no);
            if (recordIds.length > 0) {
                const placeholders = recordIds.map(() => '?').join(',');
                runQuery(`DELETE FROM progress WHERE record_sr_no IN (${placeholders})`, recordIds, function (err) {
                    if (err) {
                        console.error("Error deleting progress entries:", err.message);
                        return res.status(500).json({ error: err.message });
                    }
                    res.json({ message: `Deleted ${this.changes} entries successfully` });
                });
            } else {
                res.json({ message: "No entries found to delete" });
            }
        });
    });
});

app.delete('/delete-all-airplug-entries', (req, res) => {
    runQuery("SELECT record_sr_no FROM air_plug_table", [], (err, rows) => {
        if (err) {
            console.error("Error fetching records:", err.message);
            return res.status(500).json({ error: err.message });
        }

        // Delete from purchase_orders table
        runQuery("DELETE FROM purchase_orders WHERE type = ?", ['Air Plug'], function (err) {
            if (err) {
                console.error("Error deleting entries:", err.message);
                return res.status(500).json({ error: err.message });
            }

            // Delete from progress table for all record_sr_nos
            const recordIds = rows.map(row => row.record_sr_no);
            if (recordIds.length > 0) {
                const placeholders = recordIds.map(() => '?').join(',');
                runQuery(`DELETE FROM progress WHERE record_sr_no IN (${placeholders})`, recordIds, function (err) {
                    if (err) {
                        console.error("Error deleting progress entries:", err.message);
                        return res.status(500).json({ error: err.message });
                    }
                    res.json({ message: `Deleted ${this.changes} entries successfully` });
                });
            } else {
                res.json({ message: "No entries found to delete" });
            }
        });
    });
});

// GET existing entries
app.get('/api/main-table-entries', async (req, res) => {
    try {
        const entries = await MainTable.find({}, 'record_sr_no');
        res.json(entries);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching entries' });
    }
});





// Create cities Table
const createCitiesTable = `
    IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_NAME = 'cities' AND TABLE_TYPE = 'BASE TABLE'
    )
    BEGIN
        CREATE TABLE cities (
            id INT IDENTITY(1,1) PRIMARY KEY, -- Use IDENTITY for auto-increment
            uid VARCHAR(255) NOT NULL,
            city VARCHAR(255) NOT NULL,
            party_name VARCHAR(255) NOT NULL,
            contact_no VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            address TEXT,
            other TEXT,
            CONSTRAINT UC_CityParty UNIQUE (city, party_name) -- Create UNIQUE constraint on city and party_name
        );
    END
`;

runQuery(createCitiesTable, [], (err) => {
    if (err) {
        console.error('❌ Error creating cities table:', err.message);
    } else {
        console.log('✅ Cities table created or already exists.');
    }
});


// API: Get All Cities
app.get('/api/city', (req, res) => {
    const query = "SELECT * FROM dbo.cities";

    runQuery(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows); // 'rows' is an array of city records
    });
});

// API: Add New Customer
app.post("/api/cities", (req, res) => {
    const { uid, city, party_name, contact_no, email, address, other } = req.body;

    if (!uid) {
        return res.status(400).json({ error: "UID is required" });
    }

    // Check if this party_name already exists for the same city,
    // OR contact number/email is already used (globally)
    const checkSql = `
        SELECT * FROM dbo.cities
        WHERE (party_name = ? AND city = ?)
           OR contact_no = ?
           OR email = ?
    `;

    runQuery(checkSql, [party_name, city, contact_no, email], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (results.length > 0) {
            let message = "Duplicate entry found: ";
            const row = results[0];

            if (row.party_name === party_name && row.city === city)
                message += `Party Name "${party_name}" already exists in "${city}". `;
            if (row.contact_no === contact_no)
                message += `Contact No "${contact_no}" already exists. `;
            if (row.email === email)
                message += `Email "${email}" already exists.`;

            return res.status(400).json({ error: message.trim() });
        }

        // Insert new party record — city can be reused
        const insertSql = `
            INSERT INTO dbo.cities (uid, city, party_name, contact_no, email, address, other)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        runQuery(insertSql, [uid, city, party_name, contact_no, email, address, other], function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ success: true, uid });
        });
    });
});


// API: Check if a party_name exists in a city
app.get('/api/cities/check', (req, res) => {
    const { party_name, city, contact_no, email } = req.query;

    const sql = `
        SELECT * FROM cities
        WHERE (party_name = ? AND city = ?)
            OR contact_no = ?
            OR email = ?
    `;

    runQuery(sql, [party_name, city, contact_no, email], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (rows && rows.length > 0) {
            const match = rows[0];
            let message = "Error: ";
            if (match.party_name === party_name && match.city === city)
                message += `Party "${party_name}" already exists in "${city}". `;
            if (match.contact_no === contact_no)
                message += `Contact No "${contact_no}" already exists. `;
            if (match.email === email)
                message += `Email "${email}" already exists.`;

            return res.json({ exists: true, message: message.trim() });
        }

        res.json({ exists: false });
    });
});



app.put('/api/cities/:id', (req, res) => {
    const { contact_no, email, address, other } = req.body;
    const customerId = parseInt(req.params.id, 10);

    if (!customerId || isNaN(customerId)) {
        return res.status(400).json({ error: "Invalid ID parameter" });
    }

    // Optional: basic input validation
    if (!contact_no || !email || !address) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const updateSql = `
        UPDATE cities
        SET
            contact_no = ?,
            email = ?,
            address = ?,
            other = ?
        WHERE id = ?
    `;

    runQuery(updateSql, [contact_no, email, address, other, customerId], function (err, result) {
        if (err) {
            console.error('Error updating customer:', err);
            return res.status(500).json({ error: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Customer not found or no changes made" });
        }

        res.json({ message: "Customer details updated successfully" });
    });
});



// API: Delete Customer
app.delete('/api/cities/:id', (req, res) => {
    const cityId = parseInt(req.params.id, 10);
    // console.log("Deleting city with ID:", cityId);
    const sql = `DELETE
                 FROM dbo.cities
                 WHERE id = ?`;
    runQuery(sql, [cityId], function (err) {
        if (err) {
            console.error('Error deleting city:', err);
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ message: "Customer deleted successfully" });
    });
});


const padMonth = (m) => m.toString().padStart(2, "0");

app.get("/api/orders", (req, res) => {
    const { uid, range, month, year, category } = req.query;

    if (!uid) {
        return res.status(400).json({ error: "UID is required." });
    }

    const citySql = `SELECT uid, city, party_name FROM cities WHERE uid = ?`;

    runQuery(citySql, [uid], (err, cityRows) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!cityRows || cityRows.length === 0) return res.status(404).json({ error: "No customer found with this UID" });

        const { city, party_name } = cityRows[0];

        // Handle date filtering in MS SQL
        let dateFilter = "";
        let dateParams = [];

        const now = new Date();
        if (range === "1month") {
            dateFilter = "AND date >= DATEADD(month, -1, GETDATE())";
        } else if (range === "3months") {
            dateFilter = "AND date >= DATEADD(month, -3, GETDATE())";
        } else if (range === "6months") {
            dateFilter = "AND date >= DATEADD(month, -6, GETDATE())";
        } else if (range === "1year") {
            dateFilter = "AND date >= DATEADD(year, -1, GETDATE())";
        } else if (month && year) {
            dateFilter = "AND MONTH(date) = ? AND YEAR(date) = ?";
            dateParams = [parseInt(padMonth(month)), parseInt(year)];
        }

        let categoryFilter = "";
        let categoryParam = [];
        if (category && category !== "all") {
            categoryFilter = "AND type = ?";
            categoryParam = [category];
        }

        const orderSql = `
            SELECT work_order_no, party_name, city, date, type AS category, sub_sr_no, COUNT(*) AS total_orders
            FROM dbo.purchase_orders
            WHERE city = ? AND party_name = ?
            ${dateFilter} ${categoryFilter}
            GROUP BY work_order_no, party_name, city, date, type, sub_sr_no
            ORDER BY work_order_no, category, sub_sr_no
        `;

        const baseParams = [city, party_name];
        const fullParams = baseParams.concat(dateParams, categoryParam);

        runQuery(orderSql, fullParams, (err, orders) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!orders || orders.length === 0) {
                return res.json({ message: "No orders found for the selected period." });
            }

            const formatted = orders.map((order) => ({
                uid,
                date: order.date,
                sub_sr_no: order.sub_sr_no,
                work_order_no: order.work_order_no,
                party_name: order.party_name,
                city: order.city,
                category: order.category,
                total_orders: order.total_orders,
            }));

            res.json(formatted);
        });
    });
});


app.get('/api/uids', (req, res) => {
    runQuery("SELECT DISTINCT uid FROM cities", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows.map(row => row.uid));
    });
});


app.get('/next-record-sr-no', (req, res) => {
    const sql = "SELECT MAX(record_sr_no) AS last_sr_no FROM dbo.purchase_orders";

    runQuery(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        const lastSrNo = rows[0]?.last_sr_no || 0;
        const record_sr_no = lastSrNo + 1;

        res.json({ record_sr_no });
    });
});


app.get('/airplug-entry/:recordSrNo', (req, res) => {
    const { recordSrNo } = req.params; // Get the recordSrNo from the URL
    const recordSrNoInt = parseInt(recordSrNo, 10); // Convert to integer

    // SQL query to fetch the specific record from the purchase_orders table
    const sql = "SELECT * FROM dbo.purchase_orders WHERE record_sr_no = ?"; // Use parameterized query

    runQuery(sql, [recordSrNoInt], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (rows.length > 0) {
            // If a record is found, return it
            res.json(rows[0]); // Return the first matching record
        } else {
            // If no record is found, return a 404 response
            res.status(404).json({ message: 'Entry not found' });
        }
    });
});



app.get('/airring-entry/:recordSrNo', (req, res) => {
    const { recordSrNo } = req.params; // Get the recordSrNo from the URL
    const recordSrNoInt = parseInt(recordSrNo, 10); // Convert to integer

    // SQL query to fetch the specific record from the purchase_orders table
    const sql = "SELECT * FROM dbo.purchase_orders WHERE record_sr_no = ?"; // Use parameterized query

    runQuery(sql, [recordSrNoInt], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (rows.length > 0) {
            // If a record is found, return it
            res.json(rows[0]); // Return the first matching record
        } else {
            // If no record is found, return a 404 response
            res.status(404).json({ message: 'Entry not found' });
        }
    });
});



app.post("/new-airsnap", (req, res) => {
    const {
        record_sr_no,
        work_order_no,
        party_name,
        purchase_order,
        date,
        city,
        units
    } = req.body;

    if (!record_sr_no) {
        return res.status(400).json({ error: "record_sr_no is required!" });
    }

    const sql = `INSERT INTO air_snap_table 
        (record_sr_no, work_order_no, party_name, purchase_order, date, city, units)
        VALUES (?, ?, ?, ?, ?, ?, ?)`;

    runQuery(sql, [record_sr_no, work_order_no, party_name, purchase_order, date, city, units], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Entry added successfully!", record_sr_no });
    });
});


app.get("/api/rev", (req, res) => {
    const { uid, range, month, year } = req.query;

    if (!uid) {
        return res.status(400).json({ error: "UID is required." });
    }

    const citySql = `SELECT uid, city, party_name FROM dbo.cities WHERE uid = ?`;

    runQuery(citySql, [uid], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!rows || rows.length === 0) return res.status(404).json({ error: "No customer found with this UID" });

        const { city, party_name } = rows[0];

        let dateFilter = "";
        let params = [city, party_name];

        if (range === "1month") {
            dateFilter = "AND date >= DATEADD(month, -1, GETDATE())";
        } else if (range === "3months") {
            dateFilter = "AND date >= DATEADD(month, -3, GETDATE())";
        } else if (range === "6months") {
            dateFilter = "AND date >= DATEADD(month, -6, GETDATE())";
        } else if (range === "1year") {
            dateFilter = "AND date >= DATEADD(year, -1, GETDATE())";
        } else if (month && year) {
            dateFilter = "AND MONTH(date) = ? AND YEAR(date) = ?";
            params.push(Number(month), Number(year));
        }

        const orderSql = `
            SELECT 
                type AS category, 
                COUNT(*) AS total_orders,
                SUM(CAST(air_snap_as AS INT)) AS total_air_snap_as,
                SUM(CAST(setting_master_sm AS INT)) AS total_setting_master_sm,
                SUM(TRY_CAST(LEFT(air_snap_set, CHARINDEX(' ', air_snap_set + ' ') - 1) AS INT)) AS total_air_snap_set,
                SUM(CAST(air_ring_ar AS INT)) AS total_air_ring_ar,
                SUM(CAST(setting_plug_sp AS INT)) AS total_setting_plug_sp,
                SUM(TRY_CAST(LEFT(air_ring_set, CHARINDEX(' ', air_ring_set + ' ') - 1) AS INT)) AS total_air_ring_set,
                SUM(CAST(air_plug_ap AS INT)) AS total_air_plug_ap,
                SUM(CAST(setting_ring_sr AS INT)) AS total_setting_ring_sr,
                SUM(TRY_CAST(LEFT(air_plug_set, CHARINDEX(' ', air_plug_set + ' ') - 1) AS INT)) AS total_air_plug_set
            FROM dbo.purchase_orders
            WHERE city = ? 
              AND party_name = ? 
              ${dateFilter}
            GROUP BY type
        `;

        runQuery(orderSql, params, (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!rows || rows.length === 0) {
                return res.json({ message: "No orders found for the selected period." });
            }

            const componentCounts = {
                components: {
                    total_air_plug_ap: 0,
                    total_setting_ring_sr: 0,
                    total_air_ring_ar: 0,
                    total_setting_plug_sp: 0,
                    total_air_snap_as: 0,
                    total_setting_master_sm: 0
                },
                sets: {
                    total_air_plug_set: 0,
                    total_air_snap_set: 0,
                    total_air_ring_set: 0
                }
            };

            const unitPrices = {
                total_air_plug_ap: 15000,
                total_setting_ring_sr: 10000,
                total_air_ring_ar: 12000,
                total_setting_plug_sp: 10000,
                total_air_snap_as: 18500,
                total_setting_master_sm: 10000,
                total_air_plug_set: 25000,
                total_air_snap_set: 28500,
                total_air_ring_set: 22000
            };

            rows.forEach(row => {
                if (row.category === "Air Plug") {
                    componentCounts.sets.total_air_plug_set = row.total_orders;
                    componentCounts.components.total_air_plug_ap = row.total_orders;
                    componentCounts.components.total_setting_ring_sr = row.total_orders;
                }
                if (row.category === "Air Snap") {
                    componentCounts.sets.total_air_snap_set = row.total_orders;
                    componentCounts.components.total_air_snap_as = row.total_orders;
                    componentCounts.components.total_setting_master_sm = row.total_orders;
                }
                if (row.category === "Air Ring") {
                    componentCounts.sets.total_air_ring_set = row.total_orders;
                    componentCounts.components.total_air_ring_ar = row.total_orders;
                    componentCounts.components.total_setting_plug_sp = row.total_orders;
                }
            });

            let totalSalesOfSets = 0;
            let totalSalesOfComponents = 0;
            let salesBreakdown = {};

            Object.keys(componentCounts.sets).forEach(setType => {
                const count = componentCounts.sets[setType];
                const price = unitPrices[setType] || 0;
                salesBreakdown[setType] = count * price;
                totalSalesOfSets += count * price;
            });

            Object.keys(componentCounts.components).forEach(cType => {
                const count = componentCounts.components[cType];
                const price = unitPrices[cType] || 0;
                salesBreakdown[cType] = count * price;
                totalSalesOfComponents += count * price;
            });

            res.json({
                validSets: componentCounts.sets,
                validComponents: componentCounts.components,
                totalSalesOfComponents,
                totalSalesOfSets,
                salesBreakdown,
                partyDetails: {
                    uid,
                    city,
                    party_name
                }
            });
        });
    });
});






app.get("/api/party-revenue", (req, res) => {
    const { uid, range, month, year } = req.query;

    if (!uid) {
        return res.status(400).json({ error: "UID is required." });
    }

    const citySql = `SELECT uid, city, party_name FROM cities WHERE uid = ?`;

    runQuery(citySql, [uid], (err, cityRow) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!cityRow || cityRow.length === 0) return res.status(404).json({ error: "No customer found with this UID" });

        const { city, party_name } = cityRow[0];  // Access the first row as cityRow is an array

        let dateFilter = "";
        let params = [city, party_name];  // Initialize params with city and party_name

        // Modify date filter based on range or month/year
        if (range === "1month") {
            dateFilter = "AND date >= DATEADD(MONTH, -1, GETDATE())";
        } else if (range === "3months") {
            dateFilter = "AND date >= DATEADD(MONTH, -3, GETDATE())";
        } else if (range === "6months") {
            dateFilter = "AND date >= DATEADD(MONTH, -6, GETDATE())";
        } else if (range === "1year") {
            dateFilter = "AND date >= DATEADD(YEAR, -1, GETDATE())";
        } else if (month && year) {
            // Filter based on the month and year using SQL Server functions
            dateFilter = "AND MONTH(date) = ? AND YEAR(date) = ?";
            params.push(month, year);  // Add formatted month and year to params
        }

        const orderSql = `
            SELECT 
                type AS category,
                COUNT(*) AS total_orders,
                SUM(qty) AS total_quantity
            FROM purchase_orders
            WHERE city = ? 
            AND party_name = ? 
            ${dateFilter}
            GROUP BY type;
        `;

        const unitPrices = {
            total_air_plug_ap: 15000,
            total_setting_ring_sr: 10000,
            total_air_ring_ar: 12000,
            total_setting_plug_sp: 10000,
            total_air_snap_as: 18500,
            total_setting_master_sm: 10000,
            total_air_plug_set: 25000,
            total_air_snap_set: 28500,
            total_air_ring_set: 22000
        };

        runQuery(orderSql, params, (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!rows || rows.length === 0) return res.json({
                message: "No orders found for the selected period.",
                partyDetails: { uid, city, party_name }
            });

            let componentCounts = {
                components: {
                    total_air_plug_ap: 0,
                    total_setting_ring_sr: 0,
                    total_air_ring_ar: 0,
                    total_setting_plug_sp: 0,
                    total_air_snap_as: 0,
                    total_setting_master_sm: 0
                },
                sets: {
                    total_air_plug_set: 0,
                    total_air_snap_set: 0,
                    total_air_ring_set: 0
                }
            };

            rows.forEach(row => {
                const orderCount = Number(row.total_orders || 0);

                if (row.category === "Air Plug") {
                    componentCounts.sets.total_air_plug_set = orderCount;
                    componentCounts.components.total_air_plug_ap = orderCount;
                    componentCounts.components.total_setting_ring_sr = orderCount * 2;
                }
                else if (row.category === "Air Snap") {
                    componentCounts.sets.total_air_snap_set = orderCount;
                    componentCounts.components.total_air_snap_as = orderCount;
                    componentCounts.components.total_setting_master_sm = orderCount * 2;
                }
                else if (row.category === "Air Ring") {
                    componentCounts.sets.total_air_ring_set = orderCount;
                    componentCounts.components.total_air_ring_ar = orderCount;
                    componentCounts.components.total_setting_plug_sp = orderCount * 2;
                }
            });

            let salesBreakdown = {};

            // Calculate sales for sets
            Object.entries(componentCounts.sets).forEach(([key, count]) => {
                salesBreakdown[key] = count * unitPrices[key];
            });

            // Calculate sales for components
            Object.entries(componentCounts.components).forEach(([key, count]) => {
                salesBreakdown[key] = count * unitPrices[key];
            });

            const totalSalesOfSets = Object.entries(componentCounts.sets).reduce((total, [key, count]) => {
                return total + (count * unitPrices[key]);
            }, 0);

            const totalSalesOfComponents = Object.entries(componentCounts.components).reduce((total, [key, count]) => {
                return total + (count * unitPrices[key]);
            }, 0);

            res.json({
                partyDetails: {
                    uid,
                    city,
                    party_name
                },
                validSets: componentCounts.sets,
                validComponents: componentCounts.components,
                totalSalesOfComponents,
                totalSalesOfSets,
                salesBreakdown
            });
        });
    });
});






app.get("/api/all-revenue", (req, res) => {
    const { range, month, year } = req.query;

    let dateFilter = "";

    if (range === "1year") {
        dateFilter = "AND date >= DATEADD(YEAR, -1, GETDATE())";
    } else if (range === "2years") {
        dateFilter = "AND date >= DATEADD(YEAR, -2, GETDATE())";
    } else if (range === "3years") {
        dateFilter = "AND date >= DATEADD(YEAR, -3, GETDATE())";
    } else if (range === "1months") {
        dateFilter = "AND date >= DATEADD(MONTH, -1, GETDATE())";
    } else if (range === "3months") {
        dateFilter = "AND date >= DATEADD(MONTH, -3, GETDATE())";
    } else if (range === "6months") {
        dateFilter = "AND date >= DATEADD(MONTH, -6, GETDATE())";
    } else if (month && year) {
        dateFilter = "AND MONTH(date) = ? AND YEAR(date) = ?";
    }
    
    const orderSql = `
        SELECT 
            type,
            SUM(CAST(air_snap_as AS INT)) AS total_air_snap_as,
                SUM(CAST(setting_master_sm AS INT)) AS total_setting_master_sm,
                SUM(TRY_CAST(LEFT(air_snap_set, CHARINDEX(' ', air_snap_set + ' ') - 1) AS INT)) AS total_air_snap_set,
                SUM(CAST(air_ring_ar AS INT)) AS total_air_ring_ar,
                SUM(CAST(setting_plug_sp AS INT)) AS total_setting_plug_sp,
                SUM(TRY_CAST(LEFT(air_ring_set, CHARINDEX(' ', air_ring_set + ' ') - 1) AS INT)) AS total_air_ring_set,
                SUM(CAST(air_plug_ap AS INT)) AS total_air_plug_ap,
                SUM(CAST(setting_ring_sr AS INT)) AS total_setting_ring_sr,
                SUM(TRY_CAST(LEFT(air_plug_set, CHARINDEX(' ', air_plug_set + ' ') - 1) AS INT)) AS total_air_plug_set
            FROM dbo.purchase_orders
        WHERE 1=1 ${dateFilter}
        GROUP BY type;
    `;

    const params = month && year ? [month.padStart(2, "0"), year] : [];

    const unitPrices = {
        total_air_plug_ap: 15000,
        total_setting_ring_sr: 10000,
        total_air_ring_ar: 12000,
        total_setting_plug_sp: 10000,
        total_air_snap_as: 18500,
        total_setting_master_sm: 10000,
        total_air_plug_set: 25000,
        total_air_snap_set: 28500,
        total_air_ring_set: 22000
    };

    runQuery(orderSql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        let validSets = {
            total_air_plug_set: 0,
            total_air_snap_set: 0,
            total_air_ring_set: 0
        };

        let validComponents = {
            total_air_plug_ap: 0,
            total_setting_ring_sr: 0,
            total_air_ring_ar: 0,
            total_setting_plug_sp: 0,
            total_air_snap_as: 0,
            total_setting_master_sm: 0
        };

        let extraComponents = {};
        let extraComponentPrice = 0;
        let salesBreakdown = {};

        rows.forEach(row => {
            if (row.type === "Air Plug") {
                validSets.total_air_plug_set += Number(row.total_air_plug_set || 0);
                validComponents.total_air_plug_ap += Number(row.total_air_plug_ap || 0);
                validComponents.total_setting_ring_sr += Number(row.total_setting_ring_sr || 0);
            }
            if (row.type === "Air Snap") {
                validSets.total_air_snap_set += Number(row.total_air_snap_set || 0);
                validComponents.total_air_snap_as += Number(row.total_air_snap_as || 0);
                validComponents.total_setting_master_sm += Number(row.total_setting_master_sm || 0);
            }
            if (row.type === "Air Ring") {
                validSets.total_air_ring_set += Number(row.total_air_ring_set || 0);
                validComponents.total_air_ring_ar += Number(row.total_air_ring_ar || 0);
                validComponents.total_setting_plug_sp += Number(row.total_setting_plug_sp || 0);
            }
        });
        

        // Validate component ratios and extract extra components
        const checkAndExtractExtras = (setKey, compKey1, compKey2, ratio1, ratio2) => {
            let expectedComp1 = validSets[setKey] * ratio1;
            let expectedComp2 = validSets[setKey] * ratio2;

            if (validComponents[compKey1] > expectedComp1) {
                extraComponents[compKey1] = validComponents[compKey1] - expectedComp1;
                extraComponentPrice += extraComponents[compKey1] * unitPrices[compKey1];
            }

            if (validComponents[compKey2] > expectedComp2) {
                extraComponents[compKey2] = validComponents[compKey2] - expectedComp2;
                extraComponentPrice += extraComponents[compKey2] * unitPrices[compKey2];
            }
        };

        checkAndExtractExtras("total_air_plug_set", "total_air_plug_ap", "total_setting_ring_sr", 1, 2);
        checkAndExtractExtras("total_air_snap_set", "total_air_snap_as", "total_setting_master_sm", 1, 2);
        checkAndExtractExtras("total_air_ring_set", "total_air_ring_ar", "total_setting_plug_sp", 1, 2);

        // Calculate sales breakdown
        Object.keys(validSets).forEach(key => {
            salesBreakdown[key] = validSets[key] * unitPrices[key];
        });

        Object.keys(validComponents).forEach(key => {
            salesBreakdown[key] = validComponents[key] * unitPrices[key];
        });

        const totalSalesOfSets = Object.values(validSets).reduce((total, count, index) => {
            return total + count * unitPrices[Object.keys(validSets)[index]];
        }, 0);

        const totalSalesOfComponents = Object.values(validComponents).reduce((total, count, index) => {
            return total + count * unitPrices[Object.keys(validComponents)[index]];
        }, 0) + extraComponentPrice;

        res.json({
            validSets,
            validComponents,
            extraComponents,
            extraComponentPrice,
            totalSalesOfComponents,
            totalSalesOfSets,
            salesBreakdown
        });
    });
});




app.get('/api/search-parties', (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.json([]); // Return empty if no query is provided
    }

    const sql = `
        SELECT TOP 10 uid, party_name 
        FROM dbo.cities 
        WHERE party_name LIKE @searchTerm
    `;

    const params = { searchTerm: `%${query}%` };

    runQuery(sql, params, (err, rows) => {
        if (err) {
            console.error("Database Error:", err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});




// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
});


