// SmartPrepaid backend
import express from "express";
import cors from "cors";
import pool from "./db.js";
import bcrypt from "bcrypt";
import session from "express-session";

const app = express();

app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(session({
    secret: "smartprepaid-dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24
    }
}));

app.get("/api/hello", (req, res)=>{
    res.json({
        message: "Hello from SmartPrepaid backend"
    });
});

app.get("/api/meters", async(req, res) => {

    if (!req.session.userId) {
        return res.status(401).json({
            error: "Not authenticated"
        });
    }

    try{
        const reply = await pool.query(
            `SELECT m.*
            FROM meter m
            JOIN user_meters um
            ON m.meter_number = um.meter_number
            WHERE um.user_id = $1`,
            [req.session.userId]
        );

        res.json(reply.rows);
    }catch (error){
        console.error(error);
        res.status(500).json({error: "Database query failed"})
    }
    
});


app.get("/api/db-test", async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            error: "Not authenticated"
        });
    }

    try {
        const result = await pool.query(
            `SELECT *
             FROM meter
             WHERE meter_number IN (
                 SELECT meter_number
                 FROM user_meters
                 WHERE user_id = $1
             )`,
            [req.session.userId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Database query failed"
        });
    }
});



app.get("/api/recharges", async(req, res)=>{

    if (!req.session.userId) {
        return res.status(401).json({
            error: "Not authenticated"
        });
    }

    try{
        const result = await pool.query(
            `SELECT
                r.*,
                CASE
                    WHEN EXISTS (
                        SELECT 1
                        FROM user_meters um
                        WHERE um.user_id = $1
                        AND um.meter_number = r.meter_number
                    ) THEN 'My Meter'
                    ELSE 'Other Meter'
                END AS recharge_type
            FROM recharges r
            WHERE EXISTS (
                SELECT 1
                FROM user_meters um
                WHERE um.user_id = $1
                AND um.meter_number = r.meter_number
            )
            OR r.recharged_by_user_id = $1
            ORDER BY r.created_at DESC`,
            [req.session.userId]
        );

        res.json(result.rows);
    }catch (error) {
        console.error(error);
        res.status(500).json({error: "Database query failed"})
    }
});


app.get("/api/tokens", async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            error: "Not authenticated"
        });
    }

    try {
        const result = await pool.query(
            "SELECT * FROM tokens"
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Database query failed"
        });
    }
});


app.post("/api/recharges", async(req, res) => {

    if (!req.session.userId) {
        return res.status(401).json({
            error: "Not authenticated"
        });
    }

    let client;

    const {meterNumber, token} = req.body;

    if(!meterNumber || !token){
        return res.status(400).json({
            error: "Meter number and token are required."
        });
    }
    
    try{

        client = await pool.connect();
        await client.query("BEGIN");

        const tokenResult = await client.query(
            "SELECT * FROM tokens WHERE token = $1 FOR UPDATE",
            [token]
        );

        console.log(tokenResult.rows);

        if (tokenResult.rows.length === 0) {

            await client.query("ROLLBACK");

            return res.status(400).json({
                error: "Invalid token"
            });
        }

        const tokenRecord = tokenResult.rows[0];

        if (tokenRecord.status !== "Available") {

            await client.query("ROLLBACK");

            return res.status(400).json({
                error: "Token has already been used"
            });
        }

        if (tokenRecord.meter_number !== meterNumber) {

            await client.query("ROLLBACK");

            return res.status(400).json({
                error: "Token does not belong to this meter"
            });
        }

        const meterResult = await client.query(
            "SELECT * FROM meter WHERE meter_number = $1",
            [meterNumber]
        );

        if (meterResult.rows.length === 0) {

            await client.query("ROLLBACK");

            return res.status(400).json({
                error: "Meter not found"
            });
        }

        console.log(meterResult.rows);

        const currentBalance = meterResult.rows[0].balance;
        const newBalance = Number(currentBalance) + Number(tokenRecord.energy);

        console.log("Current balance:", currentBalance);
        console.log("New balance:", newBalance);


        await client.query(
            "UPDATE meter SET balance = $1 WHERE meter_number = $2",
            [newBalance, meterNumber]
        );

        
        const result = await client.query(
            `INSERT INTO recharges
            (meter_number, token, energy, status, recharged_by_user_id)
            VALUES ($1, $2, $3, $4, $5)`,
            [
                meterNumber,
                token,
                tokenRecord.energy,
                "Successful",
                req.session.userId
            ]
        );
        

        await client.query("UPDATE tokens SET status = $1 WHERE token = $2", ["Used", token]);

        await client.query("COMMIT");


        res.json({
                message: "Recharge saved successfully", 
                energy: tokenRecord.energy,
                balance: newBalance 
        });

    
    } catch (error) {
        console.error(error);

        if (client) {
            try {
                await client.query("ROLLBACK");
            } catch (rollbackError) {
                console.error("Rollback failed:", rollbackError);
            } 
        }

        res.status(500).json({
            error: "Database query failed"
        });
        
    }finally {
        if (client) {
            client.release();
        }
    }

});



app.delete("/api/recharges", async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            error: "Not authenticated"
        });
    }

    try {
        await pool.query(
            `DELETE FROM recharges
             WHERE recharged_by_user_id = $1`,
            [req.session.userId]
        );

        res.json({
            message: "Your recharge history has been cleared"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Database query failed"
        });
    }
});



app.post("/api/connect-meter", async (req, res) => {

    if (!req.session.userId) {
        return res.status(401).json({
            error: "Not authenticated"
        });
    }

    const { meterNumber } = req.body;

    if (!meterNumber || !/^\d{12}$/.test(meterNumber)) {
        return res.status(400).json({
            error: "Meter number must be 12 digits"
        });
    }
    
    try {
        const meterResult = await pool.query(
            "SELECT meter_number FROM meter WHERE meter_number = $1",
            [meterNumber]
        );

        if (meterResult.rows.length === 0) {
            return res.status(404).json({
                error: "Meter number not recognized"
            });
        }
        
        const linkResult = await pool.query(
            `INSERT INTO user_meters (user_id, meter_number)
            VALUES ($1, $2)
            ON CONFLICT (user_id, meter_number) DO NOTHING
            RETURNING id`,
            [req.session.userId, meterNumber]
        );

        if (linkResult.rows.length === 0) {
            return res.status(409).json({
                error: "This meter is already connected to your account"
            });
        }

        return res.status(201).json({
            message: "Meter connected successfully",
            meterNumber
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Database query failed"
        });
    }
    
});



    
app.delete("/api/disconnect-meter", async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            error: "Not authenticated"
        });
    }
    
    const { meterNumber } = req.body;

    if (!meterNumber || !/^\d{12}$/.test(meterNumber)) {
        return res.status(400).json({
            error: "Meter number must be 12 digits"
        });
    }
    
    try {
        const result = await pool.query(
            `DELETE FROM user_meters
             WHERE user_id = $1
               AND meter_number = $2
             RETURNING id`,
            [req.session.userId, meterNumber]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "This meter is not connected to your account"
            });
        }

        return res.json({
            message: "Meter disconnected successfully"
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Database query failed"
        });
    }

});




///////////////////////////////////// user login/////////////////////////////////////////


app.post("/api/register", async (req, res) => {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            error: "Name, email, and password are required"
        });
    }

    if (password.length < 8) {
        return res.status(400).json({
            error: "Password must be at least 8 characters long"
        });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        return res.status(400).json({
            error: "Please enter a valid email address"
        });
    }

    try {

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
            [name, email, hashedPassword]
        );

        res.json({
            message: "User registered successfully",
            user: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        if (error.code === "23505") {
            return res.status(409).json({
                error: "This email is already registered"
            });
        }

        res.status(500).json({
            error: "Registration failed. Please try again."
        });
    }
});

/*//////////////////////////////// LOGIN ///////////////////////////////////////*/

app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            error: "Email and password are required"
        });
    }

    try {
        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                error: "Invalid email or password"
            });
        }

        const user = result.rows[0];

        const passwordMatches = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatches) {
            return res.status(401).json({
                error: "Invalid email or password"
            });
        }

        req.session.userId = user.id;

        res.json({
            message: "Login successful",
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Login failed. Please try again."
        });
    }
});


app.get("/api/me", (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            error: "Not authenticated"
        });
    }

    res.json({
        authenticated: true,
        userId: req.session.userId
    });
});


app.post("/api/logout",(req, res)=>{
    req.session.destroy((err) =>{
        if(err){
            return res.status(500).json({
                error: "Logout failed"
            });
        }

        res.clearCookie("connect.sid");
        return res.json({
            message: "Logout successful"
        });
        
    });
    
});


app.listen(5000, () =>{
    console.log("SmartPrepaid backend running on port 5000");
    console.log("Starting Express server...");
});