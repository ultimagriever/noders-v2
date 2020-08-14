const express = require('express');
const passport = require('passport');
const UserController = require('../controllers/UserController');

const router = express.Router();

const localAuth = passport.authenticate('local', { session: false });
const jwtAuth = passport.authenticate('jwt', { session: false });

router.post('/', UserController.create);
router.post('/authenticate', localAuth, UserController.authenticate);

router.use(jwtAuth);
router.get('/', UserController.list);
router.get('/:id', UserController.get);
router.put('/:id', UserController.update);
router.delete('/:id', UserController.delete);

module.exports = router;
