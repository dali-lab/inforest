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
// options.jwtFromRequest = ExtractJwt.fromHeader("authorization");
// options.secretOrKey = process.env.AUTH_SECRET;

// passport.use(
//   new Strategy(options, async (payload, done) => {
//     const user = await User.findOne({ where: { id: payload.sub } });
//     console.log("new user");
//     done(user);
//   })
// );

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
      const user = (await getUsers({ email }))?.[0];
      if (!user) return done(null, false, { message: "User not found" });
      const valid = await isValidPassword(user, password);
      if (!valid) return done(null, false, { message: "Wrong Password" });
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
      jwtFromRequest: ExtractJwt.fromUrlQueryParameter("secret_token"),
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

export const requireAuth = passport.authenticate("jwt", { session: false });
