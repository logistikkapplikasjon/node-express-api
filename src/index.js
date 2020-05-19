require('dotenv').config();
import express from 'express';
import bodyParser, { json as _json } from 'body-parser';
import cors from 'cors';
import router from './routes/routes';

var port = process.env.PORT || 27121;

/**
 * Main file for API. defines the server and sets up the basepath.
 * Runs the server
 */
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: '50MB' }));
app.use('/api', router);
app.use(express.json());
app.use('/docs/', express.static('public/docs'));

app.listen(port, () => {
  console.log('Server running at ' + port);
});

app.use(function (err, req, res, next) {
  console.error(err.message);
  if (!err.statusCode) err.statusCode = 500;
  res.status(err.statusCode).send(err.message);
});
export default app;
