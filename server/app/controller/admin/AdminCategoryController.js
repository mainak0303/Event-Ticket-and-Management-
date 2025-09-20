// controllers/admin/CategoryController.js
const Category = require('../../model/category');

class CategoryController {
  static async listCategories(req, res) {
    try {
      const categories = await Category.find().lean();
      res.render('admin/category/list', { admin: req.user, categories, success: req.flash('success'), error: req.flash('error'), activePage: 'categories' });
    } catch (err) {
      req.flash('error', 'Failed to load categories');
      res.redirect('/admin/dashboard');
    }
  }

  static async addCategoryForm(req, res) {
    res.render('admin/category/add', { admin: req.user, success: req.flash('success'), error: req.flash('error'), activePage: 'categories' });
  }

  static async addCategorySubmit(req, res) {
    try {
      const { name, description } = req.body;
      if (!name || name.trim() === '') {
        req.flash('error', 'Category name required');
        return res.redirect('/admin/categories/add');
      }
      const exists = await Category.findOne({ name: name.trim() });
      if (exists) {
        req.flash('error', 'Category name already exists');
        return res.redirect('/admin/categories/add');
      }

      const category = new Category({ name: name.trim(), description });
      await category.save();
      req.flash('success', 'Category added successfully');
      res.redirect('/admin/categories');
    } catch (err) {
      req.flash('error', 'Failed to add category');
      res.redirect('/admin/categories/add');
    }
  }

  static async editCategoryForm(req, res) {
    try {
      const category = await Category.findById(req.params.id).lean();
      if (!category) {
        req.flash('error', 'Category not found');
        return res.redirect('/admin/categories');
      }
      res.render('admin/category/edit', { admin: req.user, category, success: req.flash('success'), error: req.flash('error'), activePage: 'categories' });
    } catch (err) {
      req.flash('error', 'Failed to load edit form');
      res.redirect('/admin/categories');
    }
  }

  static async editCategorySubmit(req, res) {
    try {
      const { name, description } = req.body;
      const categoryId = req.params.id;
      if (!name || name.trim() === '') {
        req.flash('error', 'Category name required');
        return res.redirect(`/admin/categories/edit/${categoryId}`);
      }
      const exists = await Category.findOne({ name: name.trim(), _id: { $ne: categoryId } });
      if (exists) {
        req.flash('error', 'Another category with the same name exists');
        return res.redirect(`/admin/categories/edit/${categoryId}`);
      }
      await Category.findByIdAndUpdate(categoryId, { name: name.trim(), description });
      req.flash('success', 'Category updated successfully');
      res.redirect('/admin/categories');
    } catch (err) {
      req.flash('error', 'Failed to update category');
      res.redirect(`/admin/categories/edit/${req.params.id}`);
    }
  }

  static async deleteCategory(req, res) {
    try {
      await Category.findByIdAndDelete(req.params.id);
      req.flash('success', 'Category deleted successfully');
      res.redirect('/admin/categories');
    } catch (err) {
      req.flash('error', 'Failed to delete category');
      res.redirect('/admin/categories');
    }
  }
}

module.exports = CategoryController;
