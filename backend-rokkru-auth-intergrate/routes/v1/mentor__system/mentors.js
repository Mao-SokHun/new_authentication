import { Router } from 'express';
import { protect } from '../../../middleware/auth/auth.js';
import * as mentorController from '../../../controllers/mentor_system/mentorController.js';
import * as skillsController from '../../../controllers/mentor_system/mentorSkillsController.js';
import * as portfolioController from '../../../controllers/mentor_system/mentorPortfolioController.js';
import * as postsController from '../../../controllers/mentor_system/mentorPostsController.js';
import * as analyticsController from '../../../controllers/mentor_system/mentorAnalyticsController.js';

const router = Router();

// Public reads
router.get('/mentors', mentorController.listMentors);
router.get('/mentors/search', mentorController.searchMentors);
router.get('/mentors/skill/listAllSkill', skillsController.listSkill);
router.get('/mentors/posts/:postId', postsController.getPostById);
router.get('/mentors/posts/:postId/legacy', postsController.getPostByIdLegacy);
router.get('/mentors/:userId', mentorController.getMentorById);
router.get('/mentors/:userId/skills', skillsController.listMentorSkills);
router.get('/mentors/:userId/portfolio', portfolioController.listPortfolio);
router.get('/mentors/:userId/posts', postsController.listPost);

// Authenticated — cookie session from auth middleware
router.get('/mentors/me', protect, mentorController.getMyMentor);
router.get('/mentors/me/analytics', protect, analyticsController.getMyAnalytics);
router.post('/mentors', protect, mentorController.createMentor);

router.put('/mentors/:userId', protect, mentorController.updateMentor);
router.delete('/mentors/:userId', protect, mentorController.deleteMentor);

router.post('/mentors/:userId/skills', protect, skillsController.addMentorSkill);
router.delete('/mentors/:userId/skills/:subSkillId', protect, skillsController.deleteMentorSkill);

router.post('/mentors/:userId/portfolio', protect, portfolioController.creatPortfolio);
router.patch('/mentors/:userId/portfolio/:link', protect, portfolioController.updatePortfolio);
router.delete('/mentors/:userId/portfolio/:link', protect, portfolioController.deletePortfolio);

router.post('/mentors/:userId/posts', protect, postsController.createPost);
router.patch('/mentors/posts/:postId', protect, postsController.updatePost);
router.delete('/mentors/posts/:postId', protect, postsController.deletePost);

export default router;
