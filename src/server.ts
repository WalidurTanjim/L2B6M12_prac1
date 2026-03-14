import express, { Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import { Pool } from "pg";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const app = express()
const port = process.env.PORT || 5000;

// parser
app.use(express.json());

// database
const pool = new Pool({
     connectionString: process.env.PG_CONNECTION_STRING
});

const initDB = async() => {
     try{
          await pool.query("BEGIN");

          await pool.query(`
                    CREATE TABLE IF NOT EXISTS users(
                         id SERIAL PRIMARY KEY,
                         name VARCHAR(100) NOT NULL,
                         email VARCHAR(150) UNIQUE NOT NULL,
                         age INT,
                         phone VARCHAR(15),
                         address TEXT,
                         created_at TIMESTAMP DEFAULT NOW(),
                         updated_at TIMESTAMP DEFAULT NOW()
                    )
               `);

          await pool.query(`
                    CREATE TABLE IF NOT EXISTS todos(
                         id SERIAL PRIMARY KEY,
                         user_id INT REFERENCES users(id) ON DELETE CASCADE,
                         title VARCHAR(200) NOT NULL,
                         description TEXT,
                         completed BOOLEAN DEFAULT FALSE,
                         due_date DATE,
                         created_at TIMESTAMP DEFAULT NOW(),
                         updated_at TIMESTAMP DEFAULT NOW()
                    )
               `);

          await pool.query("COMMIT");
     }catch(err: any){
          await pool.query("ROLLBACK");

          console.error(err?.message);
          console.error("Database not initialized");
     }
}

initDB();

app.get('/', (req: Request, res: Response) => {
  res.send('Hello Next Level Developers');
});

app.listen(port, () => {
  console.log(`L2B6M12_prac1 app listening on port ${port}`);
});
