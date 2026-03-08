const AppError = require('../lib/AppError');

function validateEventPayload(payload, isUpdate = false) {
  const data = {
    title: String(payload.title || '').trim(),
    description: String(payload.description || '').trim(),
    startAt: payload.startAt || payload.start_at,
    endAt: payload.endAt || payload.end_at,
    status: payload.status || 'active',
    categoryId: payload.categoryId || null,
    locationId: payload.locationId || null,
    maxParticipants: Number(payload.maxParticipants || 0)
  };

  if (!data.title || !data.startAt || !data.endAt) {
    throw new AppError('Title, start time and end time are required', 400);
  }
  if (Number.isNaN(data.maxParticipants) || data.maxParticipants < 0) {
    throw new AppError('maxParticipants must be a non-negative number', 400);
  }
  if (new Date(data.startAt) >= new Date(data.endAt)) {
    throw new AppError('Event end time must be after start time', 400);
  }
  if (isUpdate && !['draft', 'active', 'completed', 'cancelled'].includes(data.status)) {
    throw new AppError('Invalid event status', 400);
  }
  return data;
}

function validateComment(body) {
  const text = String(body || '').trim();
  if (!text) {
    throw new AppError('Comment text is required', 400);
  }
  return text;
}

module.exports = { validateEventPayload, validateComment };
