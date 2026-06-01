import { validate, positiveInt, parseRouteId } from './validate.js';

function validateAddMentorSkill(req, res) {
  return validate(req, res, {
    required: ['sub_skill_id'],
    custom: (body) => positiveInt(body.sub_skill_id, 'sub_skill_id'),
  });
}

function validateDeleteMentorSkillParams(req, res) {
  const userResult = parseRouteId(req.params.userId, 'user id');
  if (userResult.error) {
    validate(req, res, { custom: () => userResult.error });
    return false;
  }

  const subSkillResult = parseRouteId(req.params.subSkillId, 'sub skill id');
  if (subSkillResult.error) {
    validate(req, res, { custom: () => subSkillResult.error });
    return false;
  }

  return true;
}

export { validateAddMentorSkill, validateDeleteMentorSkillParams };
