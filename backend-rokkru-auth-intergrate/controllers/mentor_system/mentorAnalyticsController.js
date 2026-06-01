import { Mentor, MentorPortfolio, MentorSkill, MentorPost } from '../../models/index.js';
import { ok, fail } from '../../utils/mentor_system/api-response.js';
import { getAuthUserId } from '../../utils/mentor_system/assert-owner.js';

const getMyAnalytics = async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return fail(res, 'Unauthorized', 401);
    } 

    const mentor = await Mentor.findByPk(userId);
    if (!mentor) return fail(res, 'Mentor profile not found', 404);

    const [portfolioCount, skillsCount, postsCount, publishedPostsCount] = await Promise.all([
      MentorPortfolio.count({ where: { mentor_id: userId } }),
      MentorSkill.count({ where: { user_id: userId } }),
      MentorPost.count({ where: { user_id: userId } }),
      MentorPost.count({ where: { user_id: userId, status: 'published' } }),
    ]);

    return ok(res, {
      user_id: userId,
      portfolio_count: portfolioCount,
      skills_count: skillsCount,
      posts_count: postsCount,
      published_posts_count: publishedPostsCount,
      profile_views: null,
      sessions_count: null,
      earnings: null,
      note: 'Wire views/sessions/earnings once source tables are connected.',
    });
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

export { getMyAnalytics };
