//==============Start Mentors Skill Controller===============

import { MentorSkill, Skill, SubSkill } from '../../models/index.js';
import { ok, fail } from '../../utils/mentor_system/api-response.js';
import { parseUserID as parseUserId, assertOwner } from '../../utils/mentor_system/assert-owner.js';

// start include skill and subskill name in response
const skillInclude = [
    {
      model: SubSkill,
      attributes: ['sub_skill_id', 'skill_id', 'skill_name'],
      include: [
        {
          model: Skill,
          attributes: ['skill_id', 'skill_name'],
        },
      ],
    },
  ];
// end include skill and subskill name in response
//................................................

// start GET /mentors/skill/listAllSkill
const listSkill = async (req, res) => {
    try{
        const skill = await Skill.findAll({
            include: [{model: SubSkill}],
            order: [['skill_name','ASC']],
        });
        return ok(res, skill);

    }catch(error){
        return fail(res, error.message, 500);
    }
}
// start GET /mentors/skill/listAllSkill
//......................................

// start GET /mentors/skill/listbyMentor

const listMentorSkills = async (req, res) => {
  try {
    const userId = parseUserId(req.params.userId);
    if (userId === null) {
        return fail(res, 'Invalid user id', 400);
    }
    const items = await MentorSkill.findAll({
      where: { user_id: userId },
      include: skillInclude,
      order: [['ms_id', 'ASC']],
    });

    return ok(res, items);
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

// end GET /mentors/skill/listbyMentor
//....................................

// start​ POST /mentors/skill/addskill

const addMentorSkill = async (req, res) => {
  try {
    if (!assertOwner(req, res, req.params.userId)) return;

    const userId = parseUserId(req.params.userId);
    const subSkillId = parseInt(req.body.sub_skill_id, 10);
    if (Number.isNaN(subSkillId)) {
        return fail(res, 'sub_skill_id is required', 400);
    }

    const subSkill = await SubSkill.findByPk(subSkillId);
    if (!subSkill) {
        return fail(res, 'Sub-skill not found', 404);
    }

    const item = await MentorSkill.create({ user_id: userId, sub_skill_id: subSkillId });
    const withNames = await MentorSkill.findByPk(item.ms_id, { include: skillInclude });

    return ok(res, withNames, 201);
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

// end POST /mentors/skill/addskill
//..................................

// start DELETE /mentors/skill/deleteskill

const deleteMentorSkill = async (req, res) => {
    try {
      if (!assertOwner(req, res, req.params.userId)) return;
  
      const userId = parseUserId(req.params.userId);
      const subSkillId = parseInt(req.params.subSkillId, 10);
      if (Number.isNaN(subSkillId)) {
        return fail(res, 'Invalid sub skill id', 400);
      }

      const deleted = await MentorSkill.destroy({
        where: { user_id: userId, sub_skill_id: subSkillId },
      });
      if (!deleted) {
        return fail(res, 'Skill not found', 404);
      }
      return ok(res, { deleted: true });
    } catch (error) {
      return fail(res, error.message, 500);
    }
  };

// end DELETE /mentors/skill/deleteskill
//..................................
//==============End Mentors Skill Controller===============

export { listSkill, listMentorSkills, addMentorSkill, deleteMentorSkill };
