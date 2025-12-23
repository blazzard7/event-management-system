// src/controllers/AttachmentController.js
const AttachmentService = require('../services/AttachmentService');
const logger = require('../utils/logger');
const fs = require('fs').promises;
const path = require('path');

class AttachmentController {
  async getEventAttachments(req, res) {
    try {
      const eventId = parseInt(req.params.eventId);
      const attachments = await AttachmentService.getEventAttachments(eventId);
      res.json({ success: true, data: attachments });
    } catch (error) {
      logger.error(`Ошибка получения вложений: ${error.message}`);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async uploadAttachment(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          error: 'Файл не загружен' 
        });
      }

      const { eventId } = req.body;
      
      if (!eventId) {
        // Удаляем загруженный файл, если нет eventId
        await fs.unlink(req.file.path);
        return res.status(400).json({ 
          success: false, 
          error: 'ID события обязателен' 
        });
      }

      // Проверяем права (организатор события или админ)
      // TODO: Добавить проверку прав

      const attachment = await AttachmentService.createAttachment(
        parseInt(eventId),
        req.file.originalname,
        req.file.path,
        req.file.size,
        req.file.mimetype
      );

      logger.info(`Загружено вложение для события ${eventId}: ${req.file.originalname}`);
      res.status(201).json({ success: true, data: attachment });
    } catch (error) {
      logger.error(`Ошибка загрузки вложения: ${error.message}`);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async downloadAttachment(req, res) {
    try {
      const attachmentId = parseInt(req.params.id);
      const attachment = await AttachmentService.getAttachmentById(attachmentId);
      
      if (!attachment) {
        return res.status(404).json({ 
          success: false, 
          error: 'Вложение не найдено' 
        });
      }

      // Проверяем права (участник события, организатор или админ)
      // TODO: Добавить проверку прав

      if (!await fs.access(attachment.file_path).then(() => true).catch(() => false)) {
        return res.status(404).json({ 
          success: false, 
          error: 'Файл не найден на сервере' 
        });
      }

      res.download(attachment.file_path, attachment.file_name);
    } catch (error) {
      logger.error(`Ошибка скачивания вложения: ${error.message}`);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async deleteAttachment(req, res) {
    try {
      const attachmentId = parseInt(req.params.id);
      const attachment = await AttachmentService.getAttachmentById(attachmentId);
      
      if (!attachment) {
        return res.status(404).json({ 
          success: false, 
          error: 'Вложение не найдено' 
        });
      }

      // Проверяем права (организатор события или админ)
      // TODO: Добавить проверку прав

      const result = await AttachmentService.deleteAttachment(attachmentId);
      
      if (result.success) {
        // Удаляем файл с диска
        try {
          await fs.unlink(result.attachment.file_path);
        } catch (fsError) {
          logger.warn(`Не удалось удалить файл с диска: ${fsError.message}`);
        }
        
        res.json({ success: true, message: 'Вложение успешно удалено' });
      } else {
        res.status(400).json({ success: false, error: 'Не удалось удалить вложение' });
      }
    } catch (error) {
      logger.error(`Ошибка удаления вложения: ${error.message}`);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getAttachmentInfo(req, res) {
    try {
      const attachmentId = parseInt(req.params.id);
      const attachment = await AttachmentService.getAttachmentById(attachmentId);
      
      if (!attachment) {
        return res.status(404).json({ 
          success: false, 
          error: 'Вложение не найдено' 
        });
      }

      res.json({ success: true, data: attachment });
    } catch (error) {
      logger.error(`Ошибка получения информации о вложении: ${error.message}`);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new AttachmentController();