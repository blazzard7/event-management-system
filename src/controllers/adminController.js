const userRepository = require('../repositories/userRepository');

const AVAILABLE_ROLES = ['user', 'admin'];

async function usersPage(req, res) {
  const users = await userRepository.findAll();

  res.render('pages/admin-users', {
    title: 'Admin panel',
    currentUser: req.currentUser,
    users,
    roles: AVAILABLE_ROLES,
    error: req.query.error || null,
    success: req.query.success || null
  });
}

async function updateUserRole(req, res) {
  const userId = Number(req.params.id);
  const { role } = req.body;

  if (!AVAILABLE_ROLES.includes(role)) {
    return res.redirect('/admin/users?error=Invalid role');
  }

  if (userId === req.currentUser.id && role !== 'admin') {
    return res.redirect('/admin/users?error=You cannot remove admin role from yourself');
  }

  await userRepository.updateRole(userId, role);

  res.redirect('/admin/users?success=Role updated');
}

module.exports = {
  usersPage,
  updateUserRole
};