const QRCode = require('qrcode');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

/**
 * Genera un token QR firmado para un socio.
 * El token dura 24h y contiene solo el ID del socio.
 * @param {number} socioId
 * @returns {{ token: string, expiracion: string, codigoQR: string }}
 */
const generateQRCode = async (socioId) => {
  const expiracion = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

  const token = jwt.sign(
    { socioId, tipo: 'acceso_qr' },
    config.qr.secret,
    { expiresIn: '24h' }
  );

  // Genera imagen QR en base64 (Data URL lista para mostrar en <img src="...">)
  const codigoQR = await QRCode.toDataURL(token, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: 300,
  });

  return { token, expiracion: expiracion.toISOString(), codigoQR };
};

/**
 * Verifica y decodifica un token QR.
 * @param {string} token
 * @returns {{ socioId: number } | null}
 */
const verifyQRToken = (token) => {
  try {
    const payload = jwt.verify(token, config.qr.secret);
    if (payload.tipo !== 'acceso_qr') return null;
    return payload;
  } catch {
    return null;
  }
};

module.exports = { generateQRCode, verifyQRToken };
