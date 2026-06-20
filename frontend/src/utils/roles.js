/**
 * roles.js
 * Constantes de roles del sistema compartidas por todo el frontend.
 * Nunca escribir los strings de roles directamente en los componentes.
 *
 * Uso: import { ROLES } from '../utils/roles';
 *      if (usuario.rol === ROLES.ADMIN) { ... }
 */
export const ROLES = {
  ADMIN:         'administrador',
  RECEPCIONISTA: 'recepcionista',
  ENTRENADOR:    'entrenador',
  SOCIO:         'socio',
};

/**
 * Verifica si un rol tiene acceso a una lista de roles permitidos.
 * @param {string} rolUsuario
 * @param {string[]} rolesPermitidos
 * @returns {boolean}
 */
export const tieneRol = (rolUsuario, rolesPermitidos) =>
  rolesPermitidos.includes(rolUsuario);

/**
 * Roles que tienen acceso al panel de administración.
 */
export const ROLES_ADMIN_PANEL = [ROLES.ADMIN, ROLES.RECEPCIONISTA];

/**
 * Roles que tienen acceso a módulos de entrenamiento.
 */
export const ROLES_ENTRENAMIENTO = [ROLES.ADMIN, ROLES.ENTRENADOR];
