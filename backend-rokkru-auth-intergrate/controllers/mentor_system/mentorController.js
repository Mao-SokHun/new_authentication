//==============Start Mentors Controller===============

import { Op } from 'sequelize';
import { Mentor, MentorSkill, SubSkill } from '../../models/index.js';
import { ok, fail } from '../../utils/mentor_system/api-response.js';
import { parseUserID, assertOwner, getAuthUserId } from '../../utils/mentor_system/assert-owner.js';
import { validateCreateMentor } from '../../utils/mentor_system/validator/mentorValidators.js';

// start build list and search query from query string
function buildListQuery(req) {
  // const page = Math.max(1, parseInt(req.query.page, 10)  || 1);
  // const limit = Math.max(1, parseInt(req.query.limit, 10)  || 10);
  // const offset = (page - 1) * limit;
  // const searchText = (req.query.q || '').trim();
  // const minExperience = parseInt(req.query.minExperience,10);
  // const skillId = parseInt(req.query.skillId,10);
  // const subSkillId = parseInt(req.query.subSkillId,10);

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(
    50,
    Math.max(1, parseInt(req.query.limit, 10) || 10),
  );
  const offset = (page - 1) * limit;
  const searchText = (req.query.q || "").trim();
  const skillId =
    req.query.skillId !== undefined
      ? parseInt(req.query.skillId, 10)
      : null;
  const subSkillId =
    req.query.subSkillId !== undefined
      ? parseInt(req.query.subSkillId, 10)
      : null;
  const minExperience =
    req.query.minExperience !== undefined
      ? parseInt(req.query.minExperience, 10)
      : null;

  const where = {};
  if (searchText) {
    where[Op.or] = [
      { firstname: { [Op.iLike]: `%${searchText}%` } },
      { lastname: { [Op.iLike]: `%${searchText}%` } },
      { description: { [Op.iLike]: `%${searchText}%` } },
    ];
  }
  if (minExperience !== null && !Number.isNaN(minExperience)) {
    where.experience_years = { [Op.gte]: minExperience };
  }

  const include = [];
  if (skillId !== null && !Number.isNaN(skillId)) {
    include.push({
      model: MentorSkill,
      required: true,
      attributes: [],
      include: [
        {
          model: SubSkill,
          where: { skill_id: skillId },
          required: true,
          attributes: [],
        },
      ],
    });
  } else if (subSkillId !== null && !Number.isNaN(subSkillId)) {
    include.push({
      model: MentorSkill,
      required: true,
      attributes: [],
      include: [
        {
          model: SubSkill,
          where: { sub_skill_id: subSkillId },
          required: true,
          attributes: [],
        },
      ],
    });
  }

  const order = [["user_id", "ASC"]];
  return { page, limit, offset, where, include, order };
}
// start build list and search query from query string
//....................................................

// start GET /mentors - paginated list
const listMentors = async (req, res) => {
  try {
    const { page, limit, offset, where, include, order } =
      buildListQuery(req);
    const { rows, count } = await Mentor.findAndCountAll({
      where,
      include,
      distinct: true,
      subQuery: false,
      limit,
      offset,
      order,
    });
    return ok(res, { item: rows, total: count, page, limit });
  } catch (error) {
    return fail(res, error.message, 500);
  }
};
// end GET /mentors - paginated list
//....................................................

// start GET /mentors/search -same filters list use export from listMentors

const searchMentors = async (req, res) => {
  return listMentors(req, res);
};

// end GET /mentors/search -same filters list
//............................................

// start GET /mentors/useId for one profile

const getMentorById = async (req, res) => {
  try {
    const userId = parseUserID(req.params.userId);
    if (userId === null) {
      return fail(res, "Invalid user id", 400);
    }
    const mentor = await Mentor.findByPk(userId);
    if (!mentor) {
      return fail(res, "Mentor not found", 400);
    }
    return ok(res, mentor);
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

//.........................................
// end GET /mentors/useId for one profile

// start GET /mentors/me - logged-in mentor row

const getMyMentor = async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return fail(res, 'Unauthorized', 401);
    }
    const mentor = await Mentor.findByPk(userId);
    if (!mentor) {
      return fail(res, 'Mentor profile not found', 404);
    }
    return ok(res, mentor);
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

// end GET /mentors/me - logged-in mentor row
//............................................

// start POST /mentors - CREATE profile mentor for JWT user

const createMentor = async (req, res) => {
  try {
    const userID = getAuthUserId(req);
    if (!userID) {
      return fail(res, 'Unauthorized', 401);
    }
    if (!validateCreateMentor(req, res)) {
      return;
    }
    const exists = await Mentor.findByPk(userID);
    if (exists) {
      return fail(res, 'Mentor profile already exists', 409);
    }
    const {
      firstname,
      lastname,
      gender,
      phone_number,
      address,
      experience_years,
      description,
      profile_picture,
    } = req.body;

    const mentor = await Mentor.create({
      user_id: userID,
      firstname,
      lastname,
      gender,
      phone_number,
      address,
      experience_years,
      description,
      profile_picture,
      create_date: new Date(),
    });
    return ok(res, mentor, 201);
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

// end POST /mentors - create profile mentor for JWT user
//.......................................................

// start PUT /mentors/userId owner only UPDATE

const updateMentor = async (req, res) => {
  try {
    if (!assertOwner(req, res, req.params.userId)) return;
    const userId = parseInt(req.params.userId, 10);
    const mentor = await Mentor.findByPk(userId);
    if (!mentor) {
      return fail(res, "Mentor not found", 400);
    }
    const allowedFields = [
      "firstname",
      "lastname",
      "gender",
      "phone_number",
      "address",
      "experience_years",
      "description",
      "profile_picture",
    ];

    const updates = {};
    allowedFields.forEach((key) => {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    });
    updates.update_date = new Date();

    await mentor.update(updates);
    return ok(res, mentor);
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

// start PUT /mentors/userId owner only
//.......................................................

// start DELETE /mentors/userId owner only

const deleteMentor = async (req, res) => {
  try {
    if (!assertOwner(req, res, req.params.userId)) {
      return;
    }

    const userId = parseInt(req.params.userId, 10);
    const mentor = await Mentor.findByPk(userId);
    if (!mentor) {
      return fail(res, "Mentor not found", 404);
    }
    await mentor.destroy();
    return ok(res, { delete: true });
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

// end DELETE /mentors/userId owner only
//........................................
//==============End Mentors Controller===============

export {
  listMentors,
  searchMentors,
  getMentorById,
  getMyMentor,
  createMentor,
  updateMentor,
  deleteMentor,
};
