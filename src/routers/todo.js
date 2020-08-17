const express = require('express');
const passport = require('passport');
const TodoController = require('../controllers/TodoController');

const router = express.Router();
const jwtAuth = passport.authenticate('jwt', { session: false });

router.use(jwtAuth);

router.get('/', TodoController.list);
router.get('/:id', TodoController.find);
router.post('/', TodoController.create);
router.put('/:id', TodoController.update);
router.delete('/:id', TodoController.delete);

module.exports = router;
