import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { Strategy as localStrategy, IStrategyOptions } from "passport-local";
import { Strategy as jwtStrategy, ExtractJwt } from "passport-jwt";
import dotenv from "dotenv";
import {
  createUser,
  getForests,
  getMemberships,
  getPlots,
  getTreeCensuses,
  getTrees,
  getUsers,
  isValidPassword,
} from "services";
import { sendVerificationCode } from "../util";
import { HeaderAPIKeyStrategy } from "passport-headerapikey";
import { User } from "@ong-forestry/schema";
import { MembershipRoles } from "../enums";

dotenv.config();

const options: IStrategyOptions = {
  usernameField: "email",
  passwordField: "password",
};

passport.use(
  "signup",
  new localStrategy(
    { ...options, passReqToCallback: true },
    async (req, email, password, done) => {
      try {
        const user = await createUser(req.body);

        sendVerificationCode(email);

        return done(null, user, { message: "Sign up successful." });
      } catch (e: any) {
        return done(e);
      }
    }
  )
);

passport.use(
  "login",
  new localStrategy(options, async (email, password, done) => {
    try {
      //get user object
      const user = (await getUsers({ email }))?.[0];
      if (user == null) throw new Error("No user with this email exists.");

      const passwordValid = await isValidPassword(email, password);
      if (!passwordValid) return done(new Error("Wrong password"), false);

      // // check for verified
      // if (!user.verified) {
      //   // send email with verification code
      //   sendVerificationCode(email);

      //   return done(new Error("You must verify your email to gain access."));
      // }

      return done(null, user, { message: "Logged in successfully" });
    } catch (e: any) {
      return done(e);
    }
  })
);

passport.use(
  "jwt",
  new jwtStrategy(
    {
      //TODO: replace this
      secretOrKey: process.env.AUTH_SECRET as string,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    },
    async (token, done) => {
      try {
        // use id encrypted in token to get user
        const userResult: User[] = await getUsers({ id: token.user.id });
        if (userResult.length == 0) return done(new Error("Invalid token."));

        return done(null, userResult[0]);
      } catch (e: any) {
        done(e);
      }
    }
  )
);

passport.use(
  "apikey",
  new HeaderAPIKeyStrategy(
    { header: "Authorization", prefix: "Api-key" },
    false,
    (apiKey, done) => {
      console.log(
        apiKey,
        process.env.RETOOL_API_KEY,
        typeof apiKey,
        typeof process.env.RETOOL_API_KEY,
        apiKey === process.env.RETOOL_API_KEY
      );
      if (apiKey === process.env.RETOOL_API_KEY) return done(null, {});
      // else return done(new Error("Invalid API key."));
    }
  )
);

export const requireAuth = passport.authenticate("jwt", { session: false });
export const retoolAuth = passport.authenticate("apikey", { session: false });

export const requireMembership = (
  key: string,
  type: string,
  options?: { admin?: boolean; fromQuery?: boolean }
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // ensure user is not null
      if (!req.user) throw new Error("Not logged in");

      // get team id from given key
      var teamId;
      var id =
        options?.fromQuery != null && options?.fromQuery
          ? req.query[key]
          : req.body[key];

      switch (type) {
        case "treeCensusId":
          id = (await getTreeCensuses({ id }))[0].treeId; // get tree id
        case "treeId":
          id = (await getTrees({ ids: [id] }))[0].plotId; // plot id
        case "plotId":
          id = (await getPlots({ id }))[0].forestId; // forest id
        case "forestId":
          id = (await getForests({ id }))[0].teamId; // team id
        case "teamId":
          teamId = id;
      }

      // check for membership
      const membership = await getMemberships({ userId: req.user.id, teamId });
      if (membership.length == 0)
        throw new Error(
          "You must be a member of this forest's team to perform this action."
        );

      // if require admin, check for admin
      if (options?.admin && membership[0].role != MembershipRoles.Admin) {
        throw new Error(
          "You must be an administrator of this forest to perform this action."
        );
      }

      next();
    } catch (e: any) {
      console.log(e);
      res.status(500).send(e?.message ?? "An unknown error occured.");
    }
  };
};
