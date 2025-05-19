import connectDB from "./db/db.js";
import dotenv from "dotenv";
import { app } from "./app.js";

dotenv.config();

connectDB()
  .then(() =>
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server is running at port: ${process.env.PORT}`);
    })
  )
  .catch((error) => {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  });
