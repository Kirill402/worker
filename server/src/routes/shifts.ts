import { Router } from 'express';
import { manualShiftSchema, updateShiftSchema, updateShiftSegmentSchema } from 'shared';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import {
  startShift,
  startSegment,
  endSegment,
  closeShift,
} from '../controllers/shifts/active.js';
import {
  getShifts,
  logManual,
  deleteShift,
  updateShift,
  updateSegment,
} from '../controllers/shifts/history.js';

const router = Router();

router.get('/', requireAuth, getShifts);
router.post('/start', requireAuth, startShift);
router.post('/segment/start', requireAuth, startSegment);
router.post('/segment/end', requireAuth, endSegment);
router.post('/close', requireAuth, closeShift);
router.post('/manual', requireAuth, validate(manualShiftSchema), logManual);
router.delete('/:id', requireAuth, deleteShift);

router.put('/:id', requireAuth, validate(updateShiftSchema), updateShift);
router.put('/segment/:segmentId', requireAuth, validate(updateShiftSegmentSchema), updateSegment);

export { router as shiftsRouter };
