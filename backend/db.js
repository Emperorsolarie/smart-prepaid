import { Pool } from "pg";

const pool = new Pool({
    host: "localhost",
    port: 5432,
    database: "smartprepaid",
    user: "postgres",
    password: "653",
})
export default pool;