import request from 'supertest';
import app from '../src/index';
let token = '';
const endPoints = ['users', 'items', 'itemtypes', 'projects'];
const images = [
  'tests/IMG_0050.jpg',
  'tests/IMG_0051.jpg',
  'tests/IMG_0052.jpg',
  'tests/IMG_0053.jpg',
  'tests/IMG_0055.jpg',
];
const testDataToDelete = [];
import fs from 'fs';
import db from '../src/db/db';

const base64_encode = (file) => {
  let bitmap = fs.readFileSync(file);
  return new Buffer(bitmap).toString('base64');
};

const findID = (endpoint) => {
  switch (endpoint) {
    case 'users':
      return testDataToDelete[0].user_id;
    case 'items':
      return testDataToDelete[1].item_id;
    case 'itemtypes':
      return testDataToDelete[2].item_type_id;
    case 'projects':
      return testDataToDelete[3].project_id;
    default:
      return 0;
  }
};

describe('Register a company and user', () => {
  it('should be possible to register a new company and admin user', async () => {
    const res = await request(app).post('/api/signup').send({
      email: 'testscriptuser@test.no',
      password: '12345',
      first_name: 'test',
      last_name: 'test',
      phone_number: '81549300',
      name: 'testscriptcompany',
      erp_system: 'nothing',
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body.result).toHaveProperty('company');
  });
});

describe('Authorization', () => {
  it('should return error messages when signing in with wrong username or password', async () => {
    const res = await request(app).post('/api/signin').send({
      email: 'userthat@doesnt.exist',
      password: 'dummyPassword',
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual('Feil brukernavn eller passord');
  });

  it('should return a token when signing in with correct username and password', async () => {
    const res = await request(app).post('/api/signin').send({
      email: 'testscriptuser@test.no',
      password: '12345',
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
  });

  it('should return an error when trying to access a protected page with an invalid token', async () => {
    const res = await request(app)
      .get('/api/validate')
      .set('Authorization', `Basic ASDFGHJKL`);
    expect(res.statusCode).toEqual(401);
  });

  it('should return a successful message when trying to access a protected page with a token', async () => {
    const res = await request(app)
      .get('/api/validate')
      .set('Authorization', `Basic ${token}`);
    expect(res.statusCode).toEqual(200);
  });
});

describe('Post endpoints', () => {
  it('should return Unauthorized when trying to post a request without a token', async () => {
    for (const endpoint of endPoints) {
      const res = await request(app).post('/api/' + endpoint);
      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toEqual('Unauthorized');
    }
  });

  it('should return a positive response when inserting an object using a post request with a token', async () => {
    for (const endpoint of endPoints) {
      let object = {};
      switch (endpoint) {
        case 'users':
          object = {
            first_name: 'testuserfirstname',
            last_name: 'testuserlastname',
            password: 'testuserpassword',
            email: 'testuser@email.test',
            user_level: 'Bruker',
            phone_number: '81549300',
          };
          break;
        case 'items':
          object = {
            name: 'testitem',
            amount: 1,
          };
          break;
        case 'itemtypes':
          object = {
            item_type_name: 'testitemtype',
            description: 'testdescription',
          };
          break;
        case 'projects':
          object = {
            project_number: 9999,
            project_description: 'descriptionToDelete',
            project_name: 'nameToDelete',
          };
          break;
      }
      const res = await request(app)
        .post('/api/' + endpoint)
        .set('Authorization', `Basic ${token}`)
        .send(object);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('result');
      testDataToDelete.push(res.body.result[0]);
    }
  });
});

describe('Get endpoints', () => {
  it('should return Unauthorized when accessing an get endpoint without a token', async () => {
    for (const endpoint of endPoints) {
      const res = await request(app).get('/api/' + endpoint);
      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toEqual('Unauthorized');
    }
  });

  it('should return an array of objects when a token is submitted', async () => {
    for (const endpoint of endPoints) {
      const res = await request(app)
        .get('/api/' + endpoint)
        .set('Authorization', `Basic ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('result');
    }
  });

  it('should return an array of my info when using endpoint /api/me with a token', async () => {
    const res = await request(app)
      .get('/api/me')
      .set('Authorization', `Basic ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.result.first_name).toEqual('test');
  });

  it('should return an object when provided with an id', async () => {
    for (const endpoint of endPoints) {
      let id = findID(endpoint);
      const res = await request(app)
        .get('/api/' + endpoint + '/' + id)
        .set('Authorization', `Basic ${token}`);
      expect(res.statusCode).toEqual(200);
    }
  });
});

describe('Put endpoints', () => {
  it('should return Unauthorized when trying to make a put request without a token', async () => {
    for (const endpoint of endPoints) {
      let id = findID(endpoint);
      const res = await request(app).put('/api/' + endpoint + '/' + id);
      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toEqual('Unauthorized');
    }
  });

  it('should return a positive response when making a put request to an endpoint', async () => {
    for (const endpoint of endPoints) {
      let object = {};
      let id = findID(endpoint);
      switch (endpoint) {
        case 'users':
          object = {
            first_name: 'putTestFirstName',
          };
          break;
        case 'items':
          object = {
            name: 'putTestTtem',
          };
          break;
        case 'itemtypes':
          object = {
            item_type_name: 'putTestItemType',
          };
          break;
        case 'projects':
          object = {
            project_description: 'putProjectDescription',
          };
          break;
      }
      const res = await request(app)
        .put('/api/' + endpoint + '/' + id)
        .set('Authorization', `Basic ${token}`)
        .send(object);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('result');
    }
  });
});

describe('DEL endpoints', () => {
  it('should return Unauthorized when trying to make a del request without a token', async () => {
    for (const endpoint of endPoints) {
      let id = findID(endpoint);
      const res = await request(app).delete('/api/' + endpoint + '/' + id);
      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toEqual('Unauthorized');
    }
  });

  it('should return a positive response when trying to make a del request with a token', async () => {
    for (const endpoint of endPoints) {
      let id = findID(endpoint);
      const res = await request(app)
        .delete('/api/' + endpoint + '/' + id)
        .set('Authorization', `Basic ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message');
    }
  });
});

describe('Image detection', () => {
  it('should predict objects in images containing classes in the object detector', async () => {
    for (const image of images) {
      let encodedImage = base64_encode(image);
      let imageObject = { imageData: encodedImage };
      const res = await request(app)
        .post('/api/images')
        .set('Authorization', `Basic ${token}`)
        .send(imageObject);
      expect(res.body[0]).toHaveProperty('score');
    }
  });
});
describe('Cleanup', () => {
  it('should clean up after creating test user', async () => {
    const userDeleted = await db.oneOrNone(
      'DELETE FROM users WHERE email = $1 RETURNING user_id',
      'testscriptuser@test.no'
    );
    expect(userDeleted).toHaveProperty('user_id');
  });
  it('should clean up after creating test company', async () => {
    const companyDeleted = await db.oneOrNone(
      'DELETE from company WHERE name = $1 RETURNING company_id',
      'testscriptcompany'
    );
    expect(companyDeleted).toHaveProperty('company_id');
  });
});
