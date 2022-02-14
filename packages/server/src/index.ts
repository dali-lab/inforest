import express from "express";
import { createServer } from "http";
import cors from "cors";
import dotenv from "dotenv";
import { Sequelize } from "sequelize-typescript";

import * as models from "db/models";
import {
  treeRouter,
  plotRouter,
  userRouter,
  teamRouter,
  forestRouter,
  membershipRouter,
  tripRouter,
} from "routes";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
const server = createServer(app);
server.listen({ port: 3000 }, () => {
  console.log("Server listening on port 3000!");
});

const sequelize = new Sequelize(
  process.env.DB_NAME || "ong_forestry_dev",
  process.env.DB_USER || "postgres",
  process.env.DB_PASSWORD || "password",
  {
    dialect: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    logging: false,
    models: Object.values(models),
  }
);

try {
  sequelize.authenticate();
  console.log("Database connection has been established successfully.");
} catch (error) {
  console.error("Unable to connect to the database:", error);
}

app.use("/trees", treeRouter);
app.use("/plots", plotRouter);
app.use("/users", userRouter);
app.use("/teams", teamRouter);
app.use("/forests", forestRouter);
app.use("/memberships", membershipRouter);
app.use("/trips", tripRouter);
