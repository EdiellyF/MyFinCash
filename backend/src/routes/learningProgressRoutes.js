import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { show, update } from '../controllers/learningProgressController.js';

const router = Router();
router.use(authMiddleware);

/**
 * @swagger
 * /api/learning-progress:
 *   get:
 *     summary: Get the current user's financial education progress
 *     tags: [Learning Progress]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Progress data (returns an empty progress when none exists yet)
 *   patch:
 *     summary: Record a progress action
 *     tags: [Learning Progress]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [action, id]
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [completePill, passQuiz, skipModule, toggleChecklist]
 *               id:
 *                 type: string
 *                 description: Pill id, module id or checklist item id, defined on the frontend
 *             examples:
 *               completePill: { action: completePill, id: m1-p1 }
 *               passQuiz: { action: passQuiz, id: m1 }
 *               skipModule: { action: skipModule, id: m1 }
 *               toggleChecklist: { action: toggleChecklist, id: food-ru }
 *     responses:
 *       200:
 *         description: Updated progress
 *       400:
 *         description: Invalid action or missing id
 */

router.get('/', show);
router.patch('/', update);

export default router;
