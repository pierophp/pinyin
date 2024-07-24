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
      .then((data) => {
        done(null, data[0]);
      });
  });

  const googleClientId =
    process.env['GOOGLE_CLIENT_ID'] ?? env.google_client_id;
  const googleClientSecret =
    process.env['GOOGLE_CLIENT_SECRET'] ?? env.google_client_secret;

  if (!googleClientId || !googleClientSecret) {
    throw new Error(
      'define google_client_id and google_client_secret in your env.js file',
    );
  }

  const frontUrl = process.env['FRONT_URL'] ?? env.front_url;

  const googleOpts = {
    clientID: googleClientId,
    clientSecret: googleClientSecret,
    callbackURL: `${frontUrl}/`,
  };

  passport.use(
    new GoogleStrategy(googleOpts, (token, refreshToken, profile, done) => {
      process.nextTick(() => {
        knex('user')
          .where({
            provider: 'google',
            profile_id: profile.id,
          })
          .then((data) => {
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
                  .then((user) => done(null, user[0]));
              });
          });
      });
    }),
  );

  const baiduClientId = process.env['BAIDU_CLIENT_ID'] ?? env.baidu_client_id;
  const baiduClientSecret =
    process.env['BAIDU_CLIENT_SECRET'] ?? env.baidu_client_secret;

  if (baiduClientId && baiduClientSecret) {
    const baiduOpts = {
      clientID: baiduClientId,
      clientSecret: baiduClientSecret,
      callbackURL: `${frontUrl}#/login/baidu`,
    };

    passport.use(
      new BaiduStrategy(baiduOpts, (token, refreshToken, profile, done) => {
        process.nextTick(() => {
          knex('user')
            .where({
              provider: 'baidu',
              profile_id: profile.id,
            })
            .then((data) => {
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
                    .then((user) => done(null, user[0]));
                });
            });
        });
      }),
    );
  }
};
