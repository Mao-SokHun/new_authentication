import { fail } from '../api-response.js';

function requireFields(body, fields) {
  const missing = fields.filter(
    (f) => body[f] === undefined || body[f] === null || body[f] === ''
  );
  if (missing.length) {
    return `Missing required fields: ${missing.join(', ')}`;
  }
  return null;
}

function validate(req, res, { required = [], custom } = {}) {
  const msg = requireFields(req.body, required);
  if (msg) {
    fail(res, msg, 400);
    return false;
  }

  if (custom) {
    const customMsg = custom(req.body, req.params, req.query);
    if (customMsg) {
      fail(res, customMsg, 400);
      return false;
    }
  }

  return true;
}

function positiveInt(value, fieldName) {
  const n = parseInt(value, 10);
  if (Number.isNaN(n) || n < 1) {
    return `${fieldName} must be a positive integer`;
  }
  return null;
}

function nonEmptyString(value, fieldName, maxLength) {
  if (typeof value !== 'string' || !value.trim()) {
    return `${fieldName} must be a non-empty string`;
  }
  if (maxLength && value.length > maxLength) {
    return `${fieldName} must be at most ${maxLength} characters`;
  }
  return null;
}

function optionalNonEmptyString(value, fieldName, maxLength) {
  if (value === undefined || value === null) return null;
  return nonEmptyString(value, fieldName, maxLength);
}

function optionalPositiveInt(value, fieldName) {
  if (value === undefined || value === null) return null;
  return positiveInt(value, fieldName);
}

function parseRouteId(value, fieldName = 'id') {
  const id = parseInt(value, 10);
  if (Number.isNaN(id) || id < 1) {
    return { id: null, error: `Invalid ${fieldName}` };
  }
  return { id, error: null };
}

function isValidHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function pickBodyFields(body, allowedFields) {
  const picked = {};
  allowedFields.forEach((key) => {
    if (body[key] !== undefined) {
      picked[key] = body[key];
    }
  });
  return picked;
}

const POST_STATUSES = ['draft', 'published'];

function isAllowedPostStatus(status) {
  return POST_STATUSES.includes(status);
}

export {
  validate,
  requireFields,
  positiveInt,
  nonEmptyString,
  optionalNonEmptyString,
  optionalPositiveInt,
  parseRouteId,
  isValidHttpUrl,
  pickBodyFields,
  isAllowedPostStatus,
  POST_STATUSES,
};
