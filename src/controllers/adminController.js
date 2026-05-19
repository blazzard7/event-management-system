const userRepository = require('../repositories/userRepository');
const eventRepository = require('../repositories/eventRepository');

const AVAILABLE_ROLES = ['user', 'admin'];

async function usersPage(req, res) {
  const users = await userRepository.findAll();

  res.render('pages/admin-users', {
    title: 'Админ панель',
    currentUser: req.currentUser,
    users,
    roles: AVAILABLE_ROLES
  });
}

async function updateUserRole(req, res) {
  const userId = Number(req.params.id);
  const { role } = req.body;

  if (!AVAILABLE_ROLES.includes(role)) {
    req.flash('error', 'Недопустимая роль');
    return res.redirect('/admin/users');
  }

  if (userId === req.currentUser.id && role !== 'admin') {
    req.flash('error', 'Нельзя снять права администратора с себя');
    return res.redirect('/admin/users');
  }

  await userRepository.updateRole(userId, role);

  req.flash('success', 'Роль обновлена');
  res.redirect('/admin/users');
}

async function categoriesPage(req, res) {
  const categories = await eventRepository.listCategories();
  res.render('pages/admin-categories', {
    title: 'Категории',
    currentUser: req.currentUser,
    categories
  });
}

async function createCategory(req, res) {
  const name = String(req.body.name || '').trim();
  if (!name) {
    req.flash('error', 'Название категории не может быть пустым');
    return res.redirect('/admin/categories');
  }
  await eventRepository.createCategory(name);
  req.flash('success', 'Категория создана');
  res.redirect('/admin/categories');
}

async function deleteCategory(req, res) {
  await eventRepository.deleteCategory(Number(req.params.id));
  req.flash('success', 'Категория удалена');
  res.redirect('/admin/categories');
}

async function locationsPage(req, res) {
  const locations = await eventRepository.listLocations();
  res.render('pages/admin-locations', {
    title: 'Локации',
    currentUser: req.currentUser,
    locations
  });
}

async function createLocation(req, res) {
  const { name, address, city, capacity } = req.body;
  if (!name || !address || !city) {
    req.flash('error', 'Название, адрес и город обязательны');
    return res.redirect('/admin/locations');
  }
  await eventRepository.createLocation({
    name: String(name).trim(),
    address: String(address).trim(),
    city: String(city).trim(),
    capacity: Number(capacity) || 0
  });
  req.flash('success', 'Локация создана');
  res.redirect('/admin/locations');
}

async function deleteLocation(req, res) {
  await eventRepository.deleteLocation(Number(req.params.id));
  req.flash('success', 'Локация удалена');
  res.redirect('/admin/locations');
}

module.exports = {
  usersPage,
  updateUserRole,
  categoriesPage,
  createCategory,
  deleteCategory,
  locationsPage,
  createLocation,
  deleteLocation
};
