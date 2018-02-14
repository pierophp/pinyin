import * as express from 'express';
import * as passport from 'passport';
import * as jwt from 'jsonwebtoken';
import * as env from '../../env';

// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/is_logged_in', (req: any, res) => {
  const user: any = {};

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

router.get('/logout', (req: any, res) => {
  req.logout();
  res.redirect('/');
});

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }),
);

router.get(
  '/google/callback',
  passport.authenticate('google'),
  (req: any, res) => {
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
  },
);

router.get('/baidu', passport.authenticate('baidu'));

router.get(
  '/baidu/callback',
  passport.authenticate('baidu'),
  (req: any, res) => {
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
  },
);

module.exports = router;
