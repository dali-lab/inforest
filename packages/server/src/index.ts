import express from "express";
import { createServer } from "http";
import cors from "cors";
import { Sequelize } from "sequelize-typescript";
import passport from "passport";
import bodyParser from "body-parser";
import morgan from "morgan";

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

const app = express();
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
const server = createServer(app);
server.listen({ port: 3000 }, () => {
  console.log("Server listening on port 3000!");
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());

console.log(process.env.NODE_ENV);

const sequelize = new Sequelize(
  process.env.DATABASE_URL ??
    `postgres://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  {
    dialect: "postgres",
    logging: false,
    models: Object.values(models),
    dialectOptions: {
      ssl: process.env.NODE_ENV === "production",
    },
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
