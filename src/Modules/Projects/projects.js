import db from '../../db/db.js';
import jwt from 'jsonwebtoken';
import secret from '../Authorization/secret';

/**
 * Project modules for project endpoints
 */

/**
 * Asynchronous function for creating a project. Takes in an object with project_number, project_name and project_description.
 * Stores it in the database.
 * Checks for duplicates
 * @param {Request} req Request from client.
 * @param {Response} res Response sent to client.
 */
const createProject = async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const tokendata = jwt.verify(token, secret);
  const {
    body: { project_number },
    body: { project_name },
    body: { project_description },
  } = req;

  const project = {
    project_name: project_name,
    company_id: tokendata.company_id,
    project_number: project_number,
    project_description: project_description,
  };

  const projectCheck = await db.oneOrNone(
    'SELECT * FROM projects WHERE company_id = $1 AND project_number = $2',
    [project.company_id, project.project_number]
  );

  if (projectCheck && projectCheck.project_number) {
    return res.status(400).json({
      message: `Prosjektnummer ${projectCheck.project_number} eksisterer allerede`,
      error: 'Duplicate',
    });
  } else {
    await db
      .query(
        'INSERT INTO projects (${this:name}) VALUES (${this:csv}) RETURNING project_id',
        project
      )
      .then((response) => {
        return res.status(200).json({
          message: 'Prosjekt lagret',
          result: response,
        });
      })
      .catch((error) => {
        console.log(error);
        return res.status(500).json({
          error: error,
          message: 'Kunne ikke lagre prosjekt',
        });
      });
  }
};

module.exports = {
  createProject,
};
