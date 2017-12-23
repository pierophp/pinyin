const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const env = require('../../env');

// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/is_logged_in', (req, res) => {
  const user = {};

  if (req.isAuthenticated()) {
    user.id = req.user.id;
    user.name = req.user.name;
    user.email = req.user.email;
  }

  const response = {
    isAuthenticated: req.isAuthenticated(),
    user,
  };

  res.setHeader('Content-Type', 'application/json');
  res.send(response);
});

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }),
);

router.get('/google/callback', passport.authenticate('google'), (req, res) => {
  const token = jwt.sign(
    { id: req.user.id, admin: req.user.admin },
    env.jwt_key,
  );
  res.send({
    token,
    user: {
      name: req.user.name,
      email: req.user.email,
      admin: req.user.admin,
    },
  });
});

router.get('/baidu', passport.authenticate('baidu'));

router.get('/baidu/callback', passport.authenticate('baidu'), (req, res) => {
  const token = jwt.sign(
    { id: req.user.id, admin: req.user.admin },
    env.jwt_key,
  );
  res.send({
    token,
    user: {
      name: req.user.name,
      email: req.user.email,
      admin: req.user.admin,
    },
  });
});

module.exports = router;
