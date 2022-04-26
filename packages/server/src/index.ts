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
  treeCensusRouter,
  plotRouter,
  plotCensusRouter,
  plotCensusAssignmentRouter,
  userRouter,
  teamRouter,
  forestRouter,
  forestCensusRouter,
  membershipRouter,
  tripRouter,
} from "routes";

const app = express();
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
const server = createServer(app);
const port = process.env.PORT;
server.listen({ port }, () => {
  console.log(`Server listening on port ${port}!`);
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());

const sequelize = new Sequelize(
  process.env.DATABASE_URL ??
    `postgres://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
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

app.use("/trees", treeRouter);
app.use("/tree_census", treeCensusRouter);
app.use("/plots", plotRouter);
app.use("/plot_census", plotCensusRouter);
app.use("/plot_census_assignments", plotCensusAssignmentRouter);
app.use("/users", userRouter);
app.use("/teams", teamRouter);
app.use("/forests", forestRouter);
app.use("/forest_census", forestCensusRouter);
app.use("/memberships", membershipRouter);
app.use("/trips", tripRouter);
