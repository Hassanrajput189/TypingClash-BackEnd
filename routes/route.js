import express from 'express';

import 
{ 
  register, 
  login, 
  logout,
  apiMessage,
  sendText,
  getLoginInfo
} from '../controllers/controller.js';
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/',apiMessage);
router.get("/loginInfo",getLoginInfo);
router.get('/text', sendText)
router.get('/logout', logout);

export default router;