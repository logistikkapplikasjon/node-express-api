import db from '../../db/db.js';
import jwt from 'jsonwebtoken';
import secret from './secret';
import bcrypt from 'bcrypt';

/**
 * Validation modules for validation endpoints.
 */

/**
 * Asynchronous function for verifying a users token and returning it.
 * @param {Request} req Request from client.
 * @param {Response} res Response sent to client.
 */
const validate = async (req, res) => {
  const token = req.headers.authorization.split(' ')[1] || 'nothing';
  jwt.verify(token, secret, function (error, decoded) {
    if (error) {
      return res.status(403).json({ error: error });
    }
    return res.status(200).json({ token: decoded });
  });
};

/**
 * Asynchronous function for logging in a user, checking if the user exists, comparing the password using bcrypt.
 * Creates a token and signs it. Returns the token to the client.
 * @param {Request} req Request from client.
 * @param {Response} res Response sent to client.
 */
const signIn = async (req, res) => {
  const {
    body: { password },
    body: { email },
  } = req;

  const user = await db.oneOrNone(
    'SELECT * FROM users WHERE email = $1',
    email
  );
  if (!user) {
    return res.status(400).json({
      message: 'Feil brukernavn eller passord',
    });
  }
  const comparedPassword = await bcrypt.compare(password, user.password);

  if (!comparedPassword) {
    return res.status(400).json({
      message: 'Feil brukernavn eller passord',
    });
  }
  const jwtToken = jwt.sign(
    {
      email: user.email,
      user_id: user.user_id,
      company_id: user.company_id,
      company_name: user.company_name,
      user_level: user.user_level,
    },
    process.env.SECRET,
    {
      expiresIn: '3h',
    }
  );
  return res.status(200).json({
    token: jwtToken,
    expiresIn: 3600,
  });
};

module.exports = {
  validate,
  signIn,
};
