const express = require('express');
const router = express.Router();
const AdminUserController = require('../../controller/admin/AdminUserController');
const { authentication } = require('../../middleware/authejs');


// View all users
router.get('/admin/allusers',authentication, AdminUserController.viewAllUsers);
router.delete('/admin/allusers/:id', authentication, AdminUserController.deleteUser);
router.delete('/admin/tickets/:ticketId', authentication, AdminUserController.deleteTicket);


module.exports = router;
