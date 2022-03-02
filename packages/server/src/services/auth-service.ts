import passport from "passport";
import { Strategy as localStrategy } from "passport-local";
import { Strategy as jwtStrategy, ExtractJwt } from "passport-jwt";
import { createUser, getUsers, isValidPassword } from "services";
import dotenv from "dotenv";

dotenv.config();

const options = {
  usernameField: "email",
  passwordField: "password",
};

passport.use(
  "signup",
  new localStrategy(options, async (email, password, done) => {
    try {
      const user = await createUser({ email, password });
      return done(null, user);
    } catch (e: any) {
      done(e);
    }
  })
);

passport.use(
  "login",
  new localStrategy(options, async (email, password, done) => {
    try {
      const valid = await isValidPassword(email, password);
      if (!valid) return done(null, false, { message: "Wrong Password" });
      const user = (await getUsers({ email }))?.[0];
      return done(null, user, { message: "Logged in Successfully" });
    } catch (e: any) {
      return done(e);
    }
  })
);

passport.use(
  new jwtStrategy(
    {
      //TODO: replace this
      secretOrKey: process.env.AUTH_SECRET as string,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    },
    async (token, done) => {
      try {
        return done(null, token.user);
      } catch (e: any) {
        done(e);
      }
    }
  )
);

// @ts-ignore
export const requireAuth = (req, res, next) => next();
