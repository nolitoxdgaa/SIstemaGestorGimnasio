const request = require('supertest');
const app = require('../src/app');

// Nota: estos tests requieren la BD corriendo con los seeds cargados.
// Para correr: npm test

describe('Auth - POST /api/v1/auth/login', () => {
  it('debería devolver 400 si faltan campos', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('debería devolver 401 con credenciales incorrectas', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'noexiste@test.com', password: 'wrongpassword' });
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('debería devolver 200 y un token con credenciales correctas', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@olympuscore.com', password: 'Demo1234' });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.usuario).toHaveProperty('rol', 'administrador');
  });
});

describe('Auth - GET /api/v1/auth/me', () => {
  let token;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@olympuscore.com', password: 'Demo1234' });
    token = res.body.data?.token;
  });

  it('debería devolver 401 sin token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.statusCode).toBe(401);
  });

  it('debería devolver los datos del usuario autenticado', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.usuario).toHaveProperty('email', 'admin@olympuscore.com');
  });
});
