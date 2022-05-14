import passport from "passport";
import { Strategy as localStrategy } from "passport-local";
import { Strategy as jwtStrategy, ExtractJwt } from "passport-jwt";
import dotenv from "dotenv";
import { createUser, getUsers, isValidPassword } from "services";
import { sendVerificationCode } from "../util";

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
      sendVerificationCode(email);

      return done("You must verify your email to gain access.", user);
    } catch (e: any) {
      done(e);
    }
  })
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

      // check for verified
      if (!user.verified) {
        // send email with verification code
        sendVerificationCode(email);

        return done(new Error("You must verify your email to gain access."));
      }

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
        const user = await getUsers({ id: token.user.id });
        if (user.length == 0) return done(new Error("Invalid token."));

        return done(null, token.user);
      } catch (e: any) {
        done(e);
      }
    }
  )
);

export const requireAuth = passport.authenticate("jwt", { session: false });
