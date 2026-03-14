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

// users
// POST method
app.post("/users", async(req: Request, res: Response) => {
     const { name, email } = await req?.body;

     if(!name || !email) {
          return res.status(400).json({
               success: false,
               message: "Valid name & email required",
               data: null
          });
     }

     try{
          const result = await pool.query(`INSERT INTO users(name, email) VALUES($1, $2) RETURNING *`, [name, email]);

          res.status(201).json({
               success: true,
               message: "User insert successfully",
               data: result?.rows[0]
          });
     }catch(err: any) {
          res.status(500).json({
               success: false,
               message: "Something went wrong!",
               data: null
          });

          console.error(err);
          console.error(err?.message);
     }
});

// GET method
app.get("/users", async(req: Request, res: Response) => {
     try{
          const result = await pool.query(`SELECT * FROM users`);

          if(result?.rows.length > 0) {
               res.status(200).json({
                    success: false,
                    message: "Users fetched successfully",
                    data: result?.rows
               });
          }else{
               res.status(404).json({
                    success: false,
                    message: "Users not found",
                    data: null
               });
          }
     }catch(err: any) {
          res.status(500).json({
               success: false,
               message: "Something went wrong!",
               data: null
          });
     }
})

app.get("/users/:id", async(req: Request, res: Response) => {
     const { id } = req?.params;

     if(!id) {
          return res.status(400).json({
               success: false,
               message: "Valid id is required",
               data: null
          });
     }

     try{
          const result = await pool.query(`SELECT * FROM users WHERE id=$1`, [id]);

          if(result?.rows.length > 0){
               res.status(200).json({
                    success: true,
                    message: "User fetched successfully",
                    data: result?.rows[0]
               });
          }else{
               res.status(404).json({
                    success: false,
                    message: "User not found!",
                    data: null
               });
          }
     }catch(err: any) {
          res.status(500).json({
               success: false,
               message: "Something went wrong!",
               data: null
          });

          console.error(err);
          console.error(err?.message);
     }
})

// DELETE method
app.delete("/users/:id", async(req: Request, res: Response) => {
     const { id } = req?.params;

     if(!id) {
          return res.status(400).json({
               success: false,
               message: "Valid id is required",
               data: null
          });
     }

     try{
          const result = await pool.query(`DELETE FROM users WHERE id=$1 RETURNING *`, [id]);

          if(result?.rowCount === 0) {
               res.status(404).json({
                    success: false,
                    message: "User not found!",
                    data: null
               });
          }

          res.status(204).send();
     }catch(err: any) {
          res.status(500).json({
               success: false,
               message: "Something went wrong!",
               data: null
          });

          console.error(err);
          console.error(err?.message);
     }
});

// PUT method
app.put("/users/:id", async(req: Request, res: Response) => {
     const { id } = req?.params;
     const { name, email } = await req?.body;

     if(!id) {
          return res.status(400).json({
               success: false,
               message: "Valid id is required",
               data: null
          });
     }

     if(!name || !email) {
          return res.status(400).json({
               success: false,
               message: "Valid name & email is required",
               data: null
          });
     }

     try{
          const result = await pool.query(`UPDATE users SET name=$1, email=$2 WHERE id=$3 RETURNING *`, [name, email, id]);

          if(result?.rowCount === 0){
               res.status(404).json({
                    success: false,
                    message: "User not found!",
                    data: null
               });
          }else{
               res.status(201).json({
                    success: true,
                    message: "User updated successfully",
                    data: result?.rows[0]
               });
          }
     }catch(err: any) {
          res.status(500).json({
               success: false,
               message: "Something went wrong!",
               data: null
          });

          console.error(err);
          console.error(err?.message);
     }
});

// not found route (404)
app.use((req: Request, res: Response) => {
     res.status(404).json({
          success: false,
          message: "Route not found!",
          path: req?.path
     });
});


app.listen(port, () => {
  console.log(`L2B6M12_prac1 app listening on port ${port}`);
});
