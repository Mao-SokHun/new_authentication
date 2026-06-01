import { fail } from './api-response.js';

function parseUserID(value) {
  const userID = parseInt(value, 10);
  return Number.isNaN(userID) ? null : userID;
}

/** Read authenticated user id from existing auth middleware (user_id on Sequelize User). */
function getAuthUserId(req) {
  if (!req.user) return null;
  return parseUserID(req.user.user_id ?? req.user.userID ?? req.user.id);
}

function assertOwner(req, res, targetUserID) {
  const target = parseUserID(targetUserID);
  if (target === null) {
    fail(res, 'Invalid user id', 400);
    return false;
  }

  const authUserId = getAuthUserId(req);
  if (authUserId === null) {
    fail(res, 'Unauthorized', 401);
    return false;
  }

  if (authUserId !== target) {
    fail(res, 'Forbidden', 403);
    return false;
  }

  return true;
}

function assertAuthenticated(req, res) {
  if (getAuthUserId(req) !== null) return true;
  fail(res, 'Unauthorized', 401);
  return false;
}

export { parseUserID, getAuthUserId, assertOwner, assertAuthenticated };
