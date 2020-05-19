require('dotenv').config();
/**
 * PG-promise configuration file. From: http://vitaly-t.github.io/pg-promise/Database.html
 */

// Proper way to initialize and share the Database object
// Loading and initializing the library:
const pgp = require('pg-promise')({
  // Initialization Options
});
// Preparing the connection details:
const cn = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
};
// Creating a new database instance from the connection details:
const db = pgp(cn);
// Exporting the database object for shared use:
export default db;
