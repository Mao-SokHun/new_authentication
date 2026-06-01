//==============Start Mentors Portfolio Controller===============

import { MentorPortfolio } from '../../models/index.js';
import { ok, fail } from '../../utils/mentor_system/api-response.js';
import { parseUserID as parseUserId, assertOwner } from '../../utils/mentor_system/assert-owner.js';

// start GET /motors/userId/portfolio

const listPortfolio = async (req, res) => {
    try{
        const mentorId = parseUserId(req.params.userId);
        if(mentorId === null){
            return fail(res, 'Invalid user id', 400);
        }
        const items = await MentorPortfolio.findAll({
            where: {mentor_id: mentorId},
            order: [['link', 'ASC']],
        });
        return ok(res, items, 200);

    }catch(error){
        return fail(res, error.message, 500);
    }
};

// end GET /motors/userId/portfolio 
//..................................

// start POST /motors/userId/portfolio - JSON body

const creatPortfolio = async (req, res) => {
    try{
        if(!assertOwner(req, res, req.params.userId)){
            return;
        }
        const mentorId = parseUserId(req.params.userId);
        const { link, link_tag } = req.body;
        const item = await MentorPortfolio.create({
            mentor_id: mentorId,
            link,
            link_tag: link_tag || null,

        });
        return ok(res, item , 201)

    }catch(error){
        return fail(res, error.message, 500);
    }

}

// end GET /motors/userId/portfolio
//..................................

// start PATCH /mentors/:userId/portfolio/:link
const updatePortfolio = async (req, res) => {
  try {
    if (!assertOwner(req, res, req.params.userId)) {
      return;
    }
    const mentorId = parseUserId(req.params.userId);
    if (mentorId === null) {
      return fail(res, 'Invalid user id', 400);
    }

    const link = decodeURIComponent(req.params.link);
    const item = await MentorPortfolio.findOne({
      where: { mentor_id: mentorId, link },
    });
    if (!item) {
      return fail(res, 'Portfolio item not found', 404);
    }

    if (req.body.link !== undefined && req.body.link !== link) {
      return fail(res,
        'To change the URL, delete this item and create a new one',
        400
      );
    }

    if (req.body.link_tag === undefined) {
      return fail(res, 'No fields to update', 400);
    }

    await item.update({ link_tag: req.body.link_tag });
    return ok(res, item);
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

// end GET /motors/userId/portfolio
//..................................

// start DELETE /motors/userId/portfolio/link

const deletePortfolio = async (req, res) => {
    try{
        if(!assertOwner(req, res, req.params.userId)){
            return;
        }
        const mentorId = parseUserId(req.params.userId);
        const link = decodeURIComponent(req.params.link);
        const deleted = await MentorPortfolio.destroy({
            where: {
                mentor_id: mentorId, link
            },
        });
        if(!deleted){
            return fail(res, 'Portfolio item not found', 404);
        }
        return ok(res, {deleted: true});
        
    }catch(error){
        return fail(res, error.message, 500);
    }
}

// end DELETE /motors/userId/portfolio/link
//.........................................
//==============End Mentors Portfolio Controller===============

export { listPortfolio, creatPortfolio, updatePortfolio, deletePortfolio };
