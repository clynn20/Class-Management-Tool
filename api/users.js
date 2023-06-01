const { Router } = require('express');

const router = Router();

router.get('/', (req, res, next) => {
    res.sendStatus(200);
});

router.post('/', (req, res, next) => {
    res.sendStatus(200);
});

module.exports = router;
