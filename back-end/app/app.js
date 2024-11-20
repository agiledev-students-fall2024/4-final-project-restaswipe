import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import restaurant_routes from "./routes/restaurant_routes.js";


dotenv.config({ silent: true });

const app = express();

app.use(cors({
  origin: 'http://localhost:3000'
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", restaurant_routes);


app.get("/", (req, res) => {
  res.send("Hello!");
});

export default app;
