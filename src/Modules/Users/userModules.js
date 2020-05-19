import db from '../../db/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import secret from '../Authorization/secret';
import { validationResult } from 'express-validator';

/**
 * User modules for user endpoints
 */

/**
 * Asynchronous function for providing current users information. Takes in a header with token in request.
 * @param {Request} req Request from client.
 * @param {Response} res Response sent to client.
 */
const getMe = async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const tokendata = jwt.verify(token, secret);
  const company_id = tokendata.company_id;
  const user_id = tokendata.user_id;
  await db
    .oneOrNone('SELECT * FROM users WHERE user_id = $1 AND company_id = $2', [
      user_id,
      company_id,
    ])
    .then((response) => {
      return res.status(200).json({ result: response });
    })
    .catch((error) => {
      return res.status(500).json({ error: error });
    });
};

/**
 * Asynchronous function for creating a user and storing it in the database. Takes in an object with first_name, last_name, password, email, user_level and phone_number.
 * Checks for duplications on email address.
 * Hashes and salts the password with bcrypt.
 * @param {Request} req Request from client.
 * @param {Response} res Response sent to client.
 */
const createUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  const token = req.headers.authorization.split(' ')[1];
  const tokendata = jwt.verify(token, secret);
  const {
    body: { first_name },
    body: { last_name },
    body: { password },
    body: { email },
    body: { user_level },
    body: { phone_number },
  } = req;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = {
    first_name: first_name,
    last_name: last_name,
    password: hashedPassword,
    email: email,
    company_id: tokendata.company_id,
    user_level: user_level,
    phone_number: phone_number,
  };
  const userCheck = await db.oneOrNone(
    'SELECT * FROM users WHERE company_id = $1 AND email = $2',
    [user.company_id, user.email]
  );

  if (userCheck && userCheck.email) {
    return res.status(400).json({
      message: `Bruker med epostadresse ${userCheck.email} eksisterer allerede`,
      error: 'Duplicate',
    });
  } else {
    await db
      .query(
        'INSERT INTO users (${this:name}) VALUES (${this:csv}) RETURNING user_id',
        user
      )
      .then((response) => {
        return res.status(200).json({
          message: 'Bruker opprettet',
          result: response,
        });
      })
      .catch((error) => {
        return res.status(500).json({
          error: error,
          message: 'Bruker kunne ikke registreres',
        });
      });
  }
};

module.exports = {
  getMe,
  createUser,
};
