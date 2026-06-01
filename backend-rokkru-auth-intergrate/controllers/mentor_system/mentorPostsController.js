import { MentorPost, SubSkill, Province } from '../../models/index.js';
import { ok, fail } from '../../utils/mentor_system/api-response.js';
import { parseUserID as parseUserId, assertOwner } from '../../utils/mentor_system/assert-owner.js';

const postInclude = [
    {model: SubSkill},
    {model: Province},
];

const listPost = async(req, res)=>{
    try{
        const userId = parseUserId(req.params.userId);
        if(userId === null){
            return fail(res, 'Invalid user id',400);
        }
        const where = {user_id: userId};
        if(req.query.status) {
            where.status = req.query.status;
        }
        const item = await MentorPost.findAll({
            where,
            include: postInclude,
            order: [['create_date', 'DESC']],
        });
        return ok(res, item);

    }catch(error){
        return fail(res, error.message, 500);
    }
}

const getPostById = async (req, res) =>{
    try{
        const postId = parseInt(req.params.postId,10);
        if(Number.isNaN(postId)){
            return fail(res, 'Invalid post id',400);
        }
        const post = await MentorPost.findByPk(postId, {include: postInclude});
        if(!post) {
            return fail(res, 'Post not found', 404);
        }
        return ok(res, post);

    }catch(error){
        return fail(res, error.message, 500);
    }
}

const getPostByIdLegacy = async(req, res)=>{
    try{
        const postId = parseInt(req.params.postId,10);
        if(Number.isNaN(postId)){
            return fail(res, 'Invalid post id',400);
        }
        const post = await MentorPost.findByPk(postId, {include: postInclude});
        if(!post) {
            return fail(res, 'Post not found',404);
        }
        return ok(res, post);

    }catch(error){
        return fail(res, error.message, 500);
    }
}

const createPost = async (req, res) => {
  try {
    if (!assertOwner(req, res, req.params.userId)) return;

    const userId = parseUserId(req.params.userId);
    const { title, description, province_id, sub_skill_id, status } = req.body;

    if (!title || !province_id || !sub_skill_id) {
      return fail(res, 'title, province_id, and sub_skill_id are required', 400);
    }

    const post = await MentorPost.create({
      user_id: userId,
      title,
      description,
      province_id,
      sub_skill_id,
      status: status || 'draft',
      create_date: new Date(),
    });

    const full = await MentorPost.findByPk(post.post_id, { include: postInclude });
    return ok(res, full, 201);
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

const updatePost = async (req, res) => {
  try {
    const postId = parseInt(req.params.postId, 10);
    if (Number.isNaN(postId)) return fail(res, 'Invalid post id', 400);

    const post = await MentorPost.findByPk(postId);
    if (!post) return fail(res, 'Post not found', 404);
    if (!assertOwner(req, res, post.user_id)) return;

    const allowedFields = ['title', 'description', 'province_id', 'sub_skill_id', 'status'];
    const updates = {};
    allowedFields.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });
    if (Object.keys(updates).length === 0) {
      return fail(res, 'No fields to update', 400);
    }
    updates.update_date = new Date();

    await post.update(updates);
    const full = await MentorPost.findByPk(post.post_id, { include: postInclude });
    return ok(res, full);
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

const deletePost = async (req, res) => {
  try {
    const postId = parseInt(req.params.postId, 10);
    if (Number.isNaN(postId)) return fail(res, 'Invalid post id', 400);

    const post = await MentorPost.findByPk(postId);
    if (!post) return fail(res, 'Post not found', 404);
    if (!assertOwner(req, res, post.user_id)) return;

    await post.destroy();
    return ok(res, { deleted: true });
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

export {
  listPost,
  getPostById,
  getPostByIdLegacy,
  createPost,
  updatePost,
  deletePost,
};
