import mongoose from "mongoose";
import { DB_name } from "../constants.js";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async (req,res,next) => {
  try {
    const ConnectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_name}`,
      {
        maxPoolSize: 50,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 5000,
      }
    );
  } catch (error) {
    next(error)
    process.exit(1);
  }
};


//logs
mongoose.connection.on("connected", () =>
  console.log(`connected to ${DB_name}`)
);
mongoose.connection.on("open", () => console.log(`open to ${DB_name}`));
mongoose.connection.on("disconnected", () =>
  console.log(`disconnected to ${DB_name}`)
);
mongoose.connection.on("reconnected", () =>
  console.log(`reconnected to ${DB_name}`)
);
mongoose.connection.on("disconnecting", () =>
  console.log(`disconnecting to ${DB_name}`)
);
mongoose.connection.on("close", () =>
  console.log(`closing connection to ${DB_name}`)
);

export default connectDB;
