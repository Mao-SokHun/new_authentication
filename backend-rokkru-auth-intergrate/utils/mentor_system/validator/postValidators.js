import {
  validate,
  nonEmptyString,
  positiveInt,
  optionalNonEmptyString,
  isAllowedPostStatus,
  pickBodyFields,
} from './validate.js';

const POST_UPDATE_FIELDS = [
  'title',
  'description',
  'province_id',
  'sub_skill_id',
  'status',
];

function validateCreatePost(req, res) {
  return validate(req, res, {
    required: ['title', 'province_id', 'sub_skill_id'],
    custom: (body) => {
      const titleErr = nonEmptyString(body.title, 'title', 200);
      if (titleErr) return titleErr;

      const provinceErr = positiveInt(body.province_id, 'province_id');
      if (provinceErr) return provinceErr;

      const subSkillErr = positiveInt(body.sub_skill_id, 'sub_skill_id');
      if (subSkillErr) return subSkillErr;

      if (body.description !== undefined && body.description !== null) {
        const descErr = optionalNonEmptyString(body.description, 'description');
        if (descErr) return descErr;
      }

      if (body.status !== undefined && body.status !== null && !isAllowedPostStatus(body.status)) {
        return 'status must be draft or published';
      }

      return null;
    },
  });
}

function validateUpdatePost(req, res) {
  return validate(req, res, {
    custom: (body) => {
      const updates = pickBodyFields(body, POST_UPDATE_FIELDS);
      if (Object.keys(updates).length === 0) {
        return 'No fields to update';
      }

      if (updates.title !== undefined) {
        const err = nonEmptyString(updates.title, 'title', 200);
        if (err) return err;
      }

      if (updates.province_id !== undefined) {
        const err = positiveInt(updates.province_id, 'province_id');
        if (err) return err;
      }

      if (updates.sub_skill_id !== undefined) {
        const err = positiveInt(updates.sub_skill_id, 'sub_skill_id');
        if (err) return err;
      }

      if (updates.status !== undefined && !isAllowedPostStatus(updates.status)) {
        return 'status must be draft or published';
      }

      return null;
    },
  });
}

export { validateCreatePost, validateUpdatePost, POST_UPDATE_FIELDS };
