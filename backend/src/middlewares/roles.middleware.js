const { sendForbidden } = require('../utils/response.utils');

/**
 * Middleware de autorización por roles (RBAC).
 * Se usa DESPUÉS de authenticate.
 *
 * Uso: router.get('/ruta', authenticate, authorize('administrador'), controller)
 * Uso múltiple: router.get('/ruta', authenticate, authorize('administrador', 'recepcionista'), controller)
 *
 * Roles disponibles: 'administrador' | 'recepcionista' | 'entrenador' | 'socio'
 */
const authorize = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return sendForbidden(res, 'No autenticado.');
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return sendForbidden(
        res,
        `Acceso denegado. Se requiere uno de los siguientes roles: ${rolesPermitidos.join(', ')}.`
      );
    }

    next();
  };
};

/**
 * Middleware que permite acceso solo al propio recurso O a roles con privilegio.
 * Útil para rutas como GET /socios/:id donde el socio solo puede ver su propio perfil,
 * pero el admin/recepcionista puede ver cualquiera.
 *
 * Uso: router.get('/socios/:id', authenticate, authorizeSelfOrRoles('id', 'administrador', 'recepcionista'), controller)
 *
 * @param {string} paramName - Nombre del param de la ruta que contiene el ID del recurso (ej. 'id').
 * @param {...string} rolesPrivilegiados - Roles que pueden acceder a cualquier recurso.
 */
const authorizeSelfOrRoles = (paramName, ...rolesPrivilegiados) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return sendForbidden(res, 'No autenticado.');
    }

    const esRolPrivilegiado = rolesPrivilegiados.includes(req.usuario.rol);
    const esPropioRecurso = String(req.usuario.id) === String(req.params[paramName]);

    if (!esRolPrivilegiado && !esPropioRecurso) {
      return sendForbidden(res, 'No tienes permisos para acceder a este recurso.');
    }

    next();
  };
};

module.exports = { authorize, authorizeSelfOrRoles };
