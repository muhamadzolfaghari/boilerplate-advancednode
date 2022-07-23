const passport = require("bcrypt/promises");
const profile = require("mongodb");
const GitHubStrategy = require("passport-github").Strategy;

module.exports = function (app, myDataBase) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/github/callback",
      },
      function (accessToken, refreshToken, profile, cb) {
        console.log(profile);
        //Database logic here with callback containing our user object
      }
    )
  );

  myDataBase.findOneAndUpdate(
    { id: profile.id },
    {
      $setOnInsert: {
        id: profile.id,
        name: profile.displayName || "John Doe",
        photo: profile.photos[0].value || "",
        email: Array.isArray(profile.emails)
          ? profile.emails[0].value
          : "No public email",
        created_on: new Date(),
        provider: profile.provider || "",
      },
      $set: {
        last_login: new Date(),
      },
      $inc: {
        login_count: 1,
      },
    },
    { upsert: true, new: true },
    (err, doc) => {
      return cb(null, doc.value);
    }
  );
};