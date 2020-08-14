const express = require('express');
const UserController = require('../controllers/UserController');

const router = express.Router();

router.get('/', UserController.list);
router.get('/:id', UserController.get);
router.post('/', UserController.create);
router.post('/authenticate',  UserController.authenticate);
router.put('/:id', UserController.update);
router.delete('/:id', UserController.delete);

module.exports = router;
