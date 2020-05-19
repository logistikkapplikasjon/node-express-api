import db from '../../db/db.js';
import bcrypt from 'bcrypt';
import secret from '../Authorization/secret.js';
import jwt from 'jsonwebtoken';
/**
 * Company modules for company endpoints
 */

/**
 * Asynchronous function for registering a company.
 * Takes in name, erp_system of a company, first_name, last_name, password, email and phone_number of a user.
 * Generates an APIkey for the company
 * Stores the company in the database, returning the company_id.
 * Stores the user in the database with the company_id.
 * @param {Request} req Request from client.
 * @param {Response} res Response sent to client.
 */
const registerCompany = async (req, res) => {
  db.tx(async (t) => {
    const {
      body: { name },
      body: { erp_system },
      body: { first_name },
      body: { last_name },
      body: { password },
      body: { email },
      body: { phone_number },
    } = req;
    var crypto = require('crypto');
    var apiKey = crypto.randomBytes(20).toString('hex');
    const company = {
      name: name,
      erp_system: erp_system,
      apikey: apiKey,
    };
    const user = {
      first_name: first_name,
      last_name: last_name,
      email: email,
      user_level: 'Admin',
      phone_number: phone_number,
    };
    const id = await t.one(
      'INSERT INTO company (${this:name}) VALUES (${this:csv}) RETURNING company_id',
      company
    );
    user.password = await bcrypt.hash(password, 10);
    const userWithCompany = { ...user, company_id: id.company_id };
    const userReponse = await t.oneOrNone(
      'INSERT INTO users (${this:name}) VALUES (${this:csv}) RETURNING user_id',
      userWithCompany
    );
    return { id, apiKey, company, userReponse };
  })
    .then((response) => {
      return res.status(200).json({
        message: `Bedrift med navn ${response.company.name} og bruker med id ${response.userReponse.user_id} opprettet. Bedriften har APInøkkel ${response.apiKey}`,
        result: response,
      });
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).json({
        error: error,
        message: 'Kunne ikke registrere bedriften!',
      });
    });
};

module.exports = {
  registerCompany,
};
