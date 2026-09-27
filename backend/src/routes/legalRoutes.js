import { Router } from 'express';
import { privacyPolicy } from '../content/privacyPolicy.js';
import { ok } from '../utils/response.js';

const router = Router();

router.get('/privacy-policy', (req, res) => {
  return ok(res, privacyPolicy, 'Política de privacidade carregada.');
});

export default router;
