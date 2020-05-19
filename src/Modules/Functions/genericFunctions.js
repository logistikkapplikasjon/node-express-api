import db from '../../db/db.js';
import jwt from 'jsonwebtoken';
import secret from '../Authorization/secret';
import bcrypt from 'bcrypt';

/**
 * Generic database for RUD (read, update, delete) for the different tables.
 */

/**
 * Asynchronous function for reading the signed token in header and returning the company_id of the user.
 * @param {Request} req Request from client.
 */
const getCompanyId = async (req) => {
  const token = req.headers.authorization.split(' ')[1];
  const tokendata = jwt.verify(token, secret);
  return tokendata.company_id;
};

/**
 * Asynchronous function for getting all entities in a table belonging to a company.
 * @param {string} table name of table in the database
 */
const getAll = (table) => async (req, res) => {
  const company_id = await getCompanyId(req);
  await db
    .manyOrNone(`SELECT * FROM ${table} WHERE company_id = $1`, company_id)
    .then((response) => {
      return res.status(200).json({ result: response });
    })
    .catch((error) => {
      return res
        .status(400)
        .json({ message: 'kunne ikke hente', error: error });
    });
};

/**
 * Asynchronous function for getting a specific entity in a table belonging to a company.
 * @param {string} table name of table in the database
 * @param {string} entity name of id-column
 */
const getById = (table, entity) => async (req, res) => {
  const entity_id = req.params.id;
  const company_id = await getCompanyId(req);
  await db
    .oneOrNone(
      `SELECT * FROM ${table} WHERE ${entity} = $1 AND company_id = $2`,
      [entity_id, company_id]
    )
    .then((response) => {
      return res.status(200).json({ result: response });
    })
    .catch((error) => {
      return res.status(400).json({
        message: 'Kunne ikke hente',
        error: error,
      });
    });
};

/**
 * Asynchronous function for updating a specific entity in a table
 * @param {string} table name of table in the database
 * @param {string} entity name of id-column
 */
const update = (table, entity) => async (req, res) => {
  const entity_id = req.params.id;
  const company_id = await getCompanyId(req);
  const pgp = require('pg-promise')();
  if (req.body.password) {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    req.body.password = hashedPassword;
  }
  const query = pgp.helpers.sets(req.body);
  const condition = pgp.as.format(
    ` WHERE ${entity} = $1 AND company_id = $2 RETURNING ${entity}`,
    [entity_id, company_id]
  );
  await db
    .query(`UPDATE ${table} SET ` + query + condition)
    .then((response) => {
      return res.status(200).json({
        message: 'Oppdatert',
        result: response,
      });
    })
    .catch((error) => {
      return res.status(400).json({
        error: error,
        message: 'Kunne ikke oppdatere',
      });
    });
};

/**
 * Asynchronous function for deleting a specific entity from a table
 * @param {string} table name of table in the database
 * @param {string} entity name of id-column
 */
const deleteFromDb = (table, entity) => async (req, res) => {
  const entity_id = req.params.id;
  const company_id = await getCompanyId(req);
  await db
    .result(
      `DELETE from ${table} where ${entity} = $1 AND company_id = $2 RETURNING ${entity}`,
      [entity_id, company_id]
    )
    .then((response) => {
      res.status(200).json({
        message: 'Slettet',
        result: response,
      });
    })
    .catch((error) => {
      console.log(error);
      return res.status(400).json({
        message: 'Kunne ikke slette',
        error: error,
      });
    });
};

module.exports = {
  getAll,
  getById,
  update,
  deleteFromDb,
};
