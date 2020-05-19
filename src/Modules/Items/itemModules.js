import db from '../../db/db.js';
import jwt from 'jsonwebtoken';
import secret from '../Authorization/secret';

/**
 * Item modules for item endpoints
 */

/**
 * Asynchronous function for creating an item. Takes in an object with name, item_type_id and amount. Checks if the item name already exists in the company. Stores it in the database.
 * @param {Request} req Request from client.
 * @param {Response} res Response sent to client.
 */
const createItem = async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const tokendata = jwt.verify(token, secret);
  const {
    body: { name },
    body: { item_type_id },
    body: { amount },
  } = req;
  const item = {
    name: name,
    item_type_id: item_type_id,
    amount: amount,
    company_id: tokendata.company_id,
  };
  const itemCheck = await db.oneOrNone(
    'SELECT * FROM items where company_id = $1 AND name = $2',
    [item.company_id, item.name]
  );

  if (itemCheck && itemCheck.name) {
    return res.status(400).json({
      message: `Vare med navn ${itemCheck.name} eksisterer allerede`,
      error: 'Duplicate',
    });
  } else {
    await db
      .query(
        'INSERT INTO items (${this:name}) VALUES (${this:csv}) RETURNING item_id',
        item
      )
      .then((response) => {
        console.log(name);
        return res.status(200).json({
          message: 'Vare registrert',
          result: response,
        });
      })
      .catch((error) => {
        return res.status(500).json({
          error: error,
          message: 'Vare kunne ikke registreres',
        });
      });
  }
};

module.exports = {
  createItem,
};
