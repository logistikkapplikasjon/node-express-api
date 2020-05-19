import db from '../../db/db.js';
import jwt from 'jsonwebtoken';
import secret from '../Authorization/secret';

/**
 * ItemType modules for item type endpoints
 */

/**
 * Asynchronous function for creating an item type. Takes in an object with item_type_name and description. Stores it in the database.
 * @param {Request} req Request from client.
 * @param {Response} res Response sent to client.
 */
const createItemType = async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const tokendata = jwt.verify(token, secret);
  const {
    body: { item_type_name },
    body: { description },
  } = req;
  const itemtype = {
    item_type_name: item_type_name,
    description: description,
    company_id: tokendata.company_id,
  };
  const itemTypeCheck = await db.oneOrNone(
    'SELECT * FROM item_types WHERE company_id = $1 AND item_type_name = $2',
    [itemtype.company_id, itemtype.item_type_name]
  );
  if (itemTypeCheck && itemTypeCheck.item_type_name) {
    return res.status(400).json({
      message: `Varetype med navn ${itemTypeCheck.item_type_name} eksisterer allerede`,
    });
  } else {
    await db
      .query(
        'INSERT INTO item_types (${this:name}) VALUES (${this:csv}) RETURNING item_type_id',
        itemtype
      )
      .then((response) => {
        return res.status(200).json({
          message: 'Varetype registrert',
          result: response,
        });
      })
      .catch((error) => {
        return res.status(500).json({
          error: error,
          message: 'Kunne ikke registrere varetype',
        });
      });
  }
};
module.exports = {
  createItemType,
};
