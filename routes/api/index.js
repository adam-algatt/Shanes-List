const router = require('express').Router();

const userRoutes = require('./user-routes.js');
const productRoutes = require('./product-routes.js');
const commentRoutes = require('./comment-routes.js');

router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/comments', commentRoutes);



















module.exports = router;

