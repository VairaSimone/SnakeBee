import ForumCategory from '../models/ForumCategory.js';

export const getCategories = async (req, res) => {
  try {
    const categories = await ForumCategory.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving categories' });
  }
};

export const getCategory = async (req, res) => {
  const { categoryId } = req.params;

  try {
    const category = await ForumCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving category' });
  }
};

export const createCategory = async (req, res) => {
  const { name, description } = req.body;

  try {
    const newCategory = new ForumCategory({ name, description });
    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(500).json({ message: 'Error creating category' });
  }
};

export const updateCategory = async (req, res) => {
  const { categoryId } = req.params;
  const { name, description } = req.body;

  try {
    const updatedCategory = await ForumCategory.findByIdAndUpdate(categoryId, { name, description }, { new: true });
    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: 'Error updating category' });
  }
};

export const deleteCategory = async (req, res) => {
  const { categoryId } = req.params;

  try {
    const category = await ForumCategory.findByIdAndDelete(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category' });
  }
};
