import express from "express";
import { createServer } from "http";
import cors from "cors";
import { Sequelize } from "sequelize-typescript";
import passport from "passport";
import bodyParser from "body-parser";
import morgan from "morgan";
import { User as CustomUser } from "@ong-forestry/schema";

import * as models from "db/models";
import {
  authRouter,
  treeRouter,
  plotRouter,
  plotCensusAssignmentRouter,
  userRouter,
  teamRouter,
  forestRouter,
  membershipRouter,
  syncRouter,
} from "routes";

declare global {
  namespace Express {
    interface User extends CustomUser {}
  }
}

const app = express();
app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "100mb" }));

const server = createServer(app);
const port = process.env.PORT;
server.listen({ port }, () => {
  console.log(`Server listening on port ${port}!`);
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());

export const sequelize = new Sequelize(
  process.env.DATABASE_URL ??
    `postgres://${process.env.RDS_USERNAME}:${process.env.RDS_PASSWORD}@${process.env.RDS_HOSTNAME}:${process.env.RDS_PORT}/${process.env.RDS_DB_NAME}`,
  {
    dialect: "postgres",
    logging: false,
    models: Object.values(models),
    dialectOptions: {
      ssl: process.env.NODE_ENV === "production" && {
        require: true,
        rejectUnauthorized: false,
      },
    },
  }
);

// sequelize.sync();

try {
  sequelize.authenticate();
  console.log("Database connection has been established successfully.");
} catch (error) {
  console.error("Unable to connect to the database:", error);
}

app.use("/auth", authRouter);
app.use("/trees", treeRouter);
app.use("/plots", plotRouter);
app.use("/plot_census_assignments", plotCensusAssignmentRouter);
app.use("/users", userRouter);
app.use("/teams", teamRouter);
app.use("/forests", forestRouter);
app.use("/memberships", membershipRouter);
app.use("/sync", syncRouter);
