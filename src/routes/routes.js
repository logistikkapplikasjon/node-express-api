import express from 'express';
const router = express.Router();
import authorize from '../Modules/Authorization/auth';
import { signIn, validate } from '../Modules/Authorization/validation';
import { createUser, getMe } from '../Modules/Users/userModules';
import { createItem } from '../Modules/Items/itemModules';
import { createItemType } from '../Modules/ItemTypes/itemTypeModules';
import {
  createTransaction,
  getTransactionsByDate,
} from '../Modules/Transactions/transactions';
import { imageDetections } from '../Modules/Images/detections';
import { createProject } from '../Modules/Projects/projects';
import { registerCompany } from '../Modules/Company/company';
import { check } from 'express-validator';
import {
  getAll,
  getById,
  update,
  deleteFromDb,
} from '../Modules/Functions/genericFunctions';

/**
 * Route-file for API server.
 * Contains all end points for the api
 */

/**
 * Authorization routes.
 */
router.post('/signin', signIn);
router.route('/validate').get(authorize, validate);

/**
 * Register routes
 */
router
  .route('/signup')
  .post(
    [
      check('password')
        .isLength({ min: 5 })
        .withMessage('Passord må være minimum 5 tegn'),
      check('name').not().isEmpty().withMessage('Må inneholde bedriftsnavn'),
      check('first_name')
        .not()
        .isEmpty()
        .withMessage('Må inneholde et fornavn'),
      check('last_name')
        .not()
        .isEmpty()
        .withMessage('Må inneholde et etternavn'),
      check('user_level').not().isEmpty().withMessage('Brukernivå ikke valgt'),
      check('phone_number')
        .not()
        .isEmpty()
        .isLength({ max: 8, min: 8 })
        .withMessage('Feil i telefonnummer'),
    ],
    registerCompany
  );

/**
 * User routes
 */
router.route('/users').get(authorize, getAll('users'));
router.route('/users/:id').get(authorize, getById('users', 'user_id'));
router.route('/me').get(authorize, getMe);
router
  .route('/users')
  .post(
    authorize,
    [
      check('password')
        .isLength({ min: 5 })
        .withMessage('Passord må være minimum 5 tegn'),
      check('first_name')
        .not()
        .isEmpty()
        .withMessage('Må inneholde et fornavn'),
      check('last_name')
        .not()
        .isEmpty()
        .withMessage('Må inneholde et etternavn'),
      check('user_level').not().isEmpty().withMessage('Brukernivå ikke valgt'),
      check('phone_number')
        .not()
        .isEmpty()
        .isLength({ max: 8 })
        .withMessage('Feil i telefonnummer'),
    ],
    createUser
  );
router.route('/users/:id').put(authorize, update('users', 'user_id'));
router.route('/users/:id').delete(authorize, deleteFromDb('users', 'user_id'));

/**
 * Item routes
 */
router.route('/items').get(authorize, getAll('items'));
router.route('/items/:id').get(authorize, getById('items', 'item_id'));
router
  .route('/items')
  .post(
    authorize,
    [
      check('name').not().isEmpty().withMessage('Må inneholde et navn'),
      check('amount').not().isEmpty().withMessage('Må inneholde antall'),
    ],
    createItem
  );
router.route('/items/:id').put(authorize, update('items', 'item_id'));
router.route('/items/:id').delete(authorize, deleteFromDb('items', 'item_id'));

/**
 * Item type routes
 */
router.route('/itemtypes').get(authorize, getAll('item_types'));
router
  .route('/itemtypes/:id')
  .get(authorize, getById('item_types', 'item_type_id'));
router
  .route('/itemtypes')
  .post(
    authorize,
    [
      check('item_type_name')
        .not()
        .isEmpty()
        .withMessage('Må inneholde et navn'),
    ],
    createItemType
  );
router
  .route('/itemtypes/:id')
  .put(authorize, update('item_types', 'item_type_id'));
router
  .route('/itemtypes/:id')
  .delete(authorize, deleteFromDb('item_types', 'item_type_id'));

/**
 * Transaction routes
 */
router.route('/transactions').get(getTransactionsByDate);
router
  .route('/transactions/:id')
  .get(authorize, getById('transactions', 'transaction_id'));
router.route('/transactions').post(authorize, createTransaction);

/**
 * Image routes
 */
router.route('/images').post(authorize, imageDetections);

/**
 * Project routes
 */
router.route('/projects').get(authorize, getAll('projects'));
router.route('/projects/:id').get(authorize, getById('projects', 'project_id'));
router
  .route('/projects/')
  .post(
    authorize,
    [
      check('project_name').not().isEmpty().withMessage('Må inneholde et navn'),
      check('project_number')
        .not()
        .isEmpty()
        .withMessage('Må inneholde nummer'),
    ],
    createProject
  );
router.route('/projects/:id').put(authorize, update('projects', 'project_id'));
router
  .route('/projects/:id')
  .delete(authorize, deleteFromDb('projects', 'project_id'));

/**
 * Company routes
 */

router.route('/company').get(authorize, getAll('company'));

export default router;
