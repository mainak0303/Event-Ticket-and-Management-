const express = require('express');
const router = express.Router();
const { authentication, isAdmin } = require('../../middleware/authejs');
const CategoryController = require('../../controller/admin/AdminCategoryController');


router.get('/admin/categories', authentication, isAdmin,CategoryController.listCategories);
router.get('/admin/categories/add', authentication, isAdmin,CategoryController.addCategoryForm);
router.post('/admin/categories/add',authentication, isAdmin, CategoryController.addCategorySubmit);
router.get('/admin/categories/edit/:id', authentication, isAdmin,CategoryController.editCategoryForm);
router.put('/admin/categories/edit/:id',authentication, isAdmin, CategoryController.editCategorySubmit);
router.delete('/admin/categories/delete/:id',authentication, isAdmin, CategoryController.deleteCategory);

module.exports = router;
