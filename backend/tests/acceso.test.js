const request = require('supertest');
const app = require('../src/app');

// Nota: estos tests requieren la BD corriendo con los seeds cargados.

describe('Acceso QR - POST /api/v1/acceso/validar', () => {
  let tokenAdmin;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'recepcion@olympuscore.com', password: 'Demo1234' });
    tokenAdmin = res.body.data?.token;
  });

  it('debería devolver 400 si no se envía tokenQR', async () => {
    const res = await request(app)
      .post('/api/v1/acceso/validar')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({});
    expect(res.statusCode).toBe(400);
  });

  it('debería devolver DENEGADO con un token QR inválido', async () => {
    const res = await request(app)
      .post('/api/v1/acceso/validar')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ tokenQR: 'token-invalido-123' });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.resultado).toBe('DENEGADO');
    expect(res.body.data.motivo).toBe('QR_INVALIDO');
  });

  it('debería devolver 401 sin token de recepcionista', async () => {
    const res = await request(app)
      .post('/api/v1/acceso/validar')
      .send({ tokenQR: 'cualquier-token' });
    expect(res.statusCode).toBe(401);
  });
});

describe('Acceso QR - GET /api/v1/acceso/logs', () => {
  let tokenAdmin;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@olympuscore.com', password: 'Demo1234' });
    tokenAdmin = res.body.data?.token;
  });

  it('debería devolver los logs de acceso', async () => {
    const res = await request(app)
      .get('/api/v1/acceso/logs')
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('logs');
    expect(Array.isArray(res.body.data.logs)).toBe(true);
  });
});
