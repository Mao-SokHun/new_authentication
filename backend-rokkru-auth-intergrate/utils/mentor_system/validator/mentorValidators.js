import {
  validate,
  nonEmptyString,
  optionalNonEmptyString,
  optionalPositiveInt,
  pickBodyFields,
} from './validate.js';

const MENTOR_CREATE_FIELDS = ['firstname', 'lastname'];
const MENTOR_UPDATE_FIELDS = [
  'firstname',
  'lastname',
  'gender',
  'phone_number',
  'address',
  'experience_years',
  'description',
  'profile_picture',
];

function validateCreateMentor(req, res) {
  return validate(req, res, {
    required: MENTOR_CREATE_FIELDS,
    custom: (body) => {
      const firstErr = nonEmptyString(body.firstname, 'firstname', 100);
      if (firstErr) return firstErr;

      const lastErr = nonEmptyString(body.lastname, 'lastname', 100);
      if (lastErr) return lastErr;

      const genderErr = optionalNonEmptyString(body.gender, 'gender', 20);
      if (genderErr) return genderErr;

      const phoneErr = optionalNonEmptyString(body.phone_number, 'phone_number', 100);
      if (phoneErr) return phoneErr;

      const addressErr = optionalNonEmptyString(body.address, 'address', 255);
      if (addressErr) return addressErr;

      const expErr = optionalPositiveInt(body.experience_years, 'experience_years');
      if (expErr) return expErr;

      return null;
    },
  });
}

function validateUpdateMentor(req, res) {
  return validate(req, res, {
    custom: (body) => {
      const updates = pickBodyFields(body, MENTOR_UPDATE_FIELDS);
      if (Object.keys(updates).length === 0) {
        return 'No fields to update';
      }

      if (updates.firstname !== undefined) {
        const err = nonEmptyString(updates.firstname, 'firstname', 100);
        if (err) return err;
      }

      if (updates.lastname !== undefined) {
        const err = nonEmptyString(updates.lastname, 'lastname', 100);
        if (err) return err;
      }

      if (updates.gender !== undefined) {
        const err = optionalNonEmptyString(updates.gender, 'gender', 20);
        if (err) return err;
      }

      if (updates.phone_number !== undefined) {
        const err = optionalNonEmptyString(updates.phone_number, 'phone_number', 100);
        if (err) return err;
      }

      if (updates.address !== undefined) {
        const err = optionalNonEmptyString(updates.address, 'address', 255);
        if (err) return err;
      }

      if (updates.experience_years !== undefined) {
        const err = optionalPositiveInt(updates.experience_years, 'experience_years');
        if (err) return err;
      }

      return null;
    },
  });
}

export {
  validateCreateMentor,
  validateUpdateMentor,
  MENTOR_CREATE_FIELDS,
  MENTOR_UPDATE_FIELDS,
};
