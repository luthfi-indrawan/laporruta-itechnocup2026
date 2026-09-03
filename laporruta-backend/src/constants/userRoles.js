/**
 * User Role Definitions & Permission Helpers - LaporRuta
 * Role: user | admin_wilayah | admin_pusat
 */
const ROLES = {
  USER: "user",
  ADMIN_WILAYAH: "admin_wilayah",
  ADMIN_PUSAT: "admin_pusat",
};

const ROLE_HIERARCHY = [ROLES.ADMIN_PUSAT, ROLES.ADMIN_WILAYAH, ROLES.USER];

/**
 * Check if roleA has equal or higher rank than roleB
 * @param {string} roleA
 * @param {string} roleB
 * @returns {boolean}
 */
const hasRoleAccess = (roleA, roleB) => {
  const indexA = ROLE_HIERARCHY.indexOf(roleA);
  const indexB = ROLE_HIERARCHY.indexOf(roleB);
  return indexA !== -1 && indexB !== -1 && indexA <= indexB;
};

/**
 * Get all roles at or above the given role level
 * @param {string} role
 * @returns {string[]}
 */
const getRolesAbove = (role) => {
  const index = ROLE_HIERARCHY.indexOf(role);
  if (index === -1) return [];
  return ROLE_HIERARCHY.slice(0, index + 1);
};

/**
 * Check if role is admin (wilayah or pusat)
 * @param {string} role
 * @returns {boolean}
 */
const isAdmin = (role) =>
  role === ROLES.ADMIN_WILAYAH || role === ROLES.ADMIN_PUSAT;

/**
 * Check if role is admin pusat only
 * @param {string} role
 * @returns {boolean}
 */
const isAdminPusat = (role) => role === ROLES.ADMIN_PUSAT;

/**
 * Check if role is user only
 * @param {string} role
 * @returns {boolean}
 */
const isUser = (role) => role === ROLES.USER;

module.exports = {
  ...ROLES,
  ROLE_HIERARCHY,
  hasRoleAccess,
  getRolesAbove,
  isAdmin,
  isAdminPusat,
  isUser,
};
