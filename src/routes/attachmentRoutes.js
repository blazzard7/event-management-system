// src/routes/attachmentRoutes.js
const express = require('express');
const router = express.Router();
const AttachmentController = require('../controllers/AttachmentController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Все маршруты требуют аутентификации
router.use(authMiddleware);

// Вложения события
router.get('/event/:eventId', AttachmentController.getEventAttachments);

// Загрузка и управление вложениями
router.post('/upload', upload.single('file'), AttachmentController.uploadAttachment);
router.get('/:id/download', AttachmentController.downloadAttachment);
router.get('/:id/info', AttachmentController.getAttachmentInfo);
router.delete('/:id', AttachmentController.deleteAttachment);

module.exports = router;