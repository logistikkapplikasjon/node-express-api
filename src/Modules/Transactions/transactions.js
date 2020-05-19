import db from '../../db/db.js';
import jwt from 'jsonwebtoken';
import secret from '../Authorization/secret';
import moment from 'moment';

/**
 * Transaction modules for transaction endpoint
 */

/**
 * Asynchronous function for creating a transactions. Takes in an object with item_id, amount, project_id and option.
 * Performs invertion on amount number if items are deposited using the option parameter.
 * Performs two db transactions, INSERT to transactions and UPDATE on items.
 * @param {Request} req Request from client.
 * @param {Response} res Response sent to client.
 */
const createTransaction = async (req, res) => {
  db.task('create transaction and update items', async (t) => {
    const token = req.headers.authorization.split(' ')[1];
    const tokendata = jwt.verify(token, secret);
    const {
      body: { item_id },
      body: { amount },
      body: { project_id },
      body: { option },
    } = req;

    let multiplicator = -1;
    if (option === 'add') {
      multiplicator = 1;
    }

    const transaction = {
      item_id: item_id,
      amount: amount * multiplicator,
      project_id: project_id,
      date: moment().format('LLLL'),
      company_id: tokendata.company_id,
      user_id: tokendata.user_id,
    };

    if (option === 'add') {
      await t.none('UPDATE items SET amount = amount + $1 WHERE item_id = $2', [
        amount,
        item_id,
      ]);
    } else {
      await t.none('UPDATE items SET amount = amount - $1 WHERE item_id = $2', [
        amount,
        item_id,
      ]);
    }

    const transaction_id = await t.one(
      'INSERT INTO transactions (${this:name}) VALUES (${this:csv}) RETURNING transaction_id',
      transaction
    );

    return { transaction_id };
  })
    .then((result) => {
      return res.status(200).json({
        message: `Transaksjon med ID ${result.transaction_id} lagret`,
        result: result.transaction_id,
      });
    })
    .catch((error) => {
      return res.status(500).json({
        error: error,
        message: 'Kunne ikke legge inn transaksjon',
      });
    });
};

/**
 * Asynchronous function for suppling ERP-systems or others with transaction details between two dates. Checks API against the company DB and returns the transactions
 * @param {Request} req
 * @param {Response} res
 */
const getTransactionsByDate = async (req, res) => {
  db.task(
    'check API key for company and get transactions between two dates',
    async (t) => {
      const fromDate = req.query.fromDate;
      const toDate = req.query.toDate;
      const apiKey = req.query.APIkey;

      const company = await t.oneOrNone(
        'SELECT * FROM company WHERE apikey = $1',
        apiKey
      );
      if (!company) return { result: undefined };
      const company_id = company.company_id;
      const transactions = await t.manyOrNone(
        'SELECT * FROM transactions WHERE date BETWEEN $1 AND $2 AND company_id = $3',
        [fromDate, toDate, company_id]
      );
      return { transactions, toDate, fromDate };
    }
  )
    .then((response) => {
      return res.status(200).json({
        message: `Transaksjoner fra ${response.fromDate} til ${response.toDate}`,
        result: response.transactions,
      });
    })
    .catch((error) => {
      return res.status(500).json({
        error: error,
        message: 'Kunne ikke hente transaksjoner',
      });
    });
};

module.exports = {
  createTransaction,
  getTransactionsByDate,
};
