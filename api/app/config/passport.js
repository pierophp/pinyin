const env = require('../../env');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const BaiduStrategy = require('passport-baidu').Strategy;
const knex = require('../services/knex');

module.exports = function passportConfig(passport) {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    knex('user')
      .where({
        id,
      })
      .then(data => {
        done(null, data[0]);
      });
  });

  if (!env.google_client_id || !env.google_client_secret) {
    throw new Error(
      'define google_client_id and google_client_secret in your env.js file',
    );
  }

  const googleOpts = {
    clientID: env.google_client_id,
    clientSecret: env.google_client_secret,
    callbackURL: `${env.front_url}/`,
  };

  passport.use(
    new GoogleStrategy(googleOpts, (token, refreshToken, profile, done) => {
      process.nextTick(() => {
        knex('user')
          .where({
            provider: 'google',
            profile_id: profile.id,
          })
          .then(data => {
            if (data.length > 0) {
              done(null, data[0]);
              return;
            }

            knex('user')
              .insert({
                provider: 'google',
                profile_id: profile.id,
                token,
                name: profile.displayName,
                email: profile.emails[0].value,
                created_at: new Date(),
              })
              .then(() => {
                knex('user')
                  .where({
                    provider: 'google',
                    profile_id: profile.id,
                  })
                  .then(user => done(null, user[0]));
              });
          });
      });
    }),
  );

  const baiduOpts = {
    clientID: env.baidu_client_id,
    clientSecret: env.baidu_client_secret,
    callbackURL: `${env.front_url}#/login/baidu`,
  };

  passport.use(
    new BaiduStrategy(baiduOpts, (token, refreshToken, profile, done) => {
      process.nextTick(() => {
        knex('user')
          .where({
            provider: 'baidu',
            profile_id: profile.id,
          })
          .then(data => {
            if (data.length > 0) {
              done(null, data[0]);
              return;
            }

            let name = profile.displayName;
            if (!name) {
              name = profile.username;
            }

            knex('user')
              .insert({
                provider: 'baidu',
                profile_id: profile.id,
                token,
                name,
                email: profile.username,
                created_at: new Date(),
              })
              .then(() => {
                knex('user')
                  .where({
                    provider: 'baidu',
                    profile_id: profile.id,
                  })
                  .then(user => done(null, user[0]));
              });
          });
      });
    }),
  );
};
