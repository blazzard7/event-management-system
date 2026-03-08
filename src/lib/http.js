function ok(res, data, status = 200) {
  return res.status(status).json({ success: true, data });
}

function fail(res, status, error, details = null) {
  return res.status(status).json({ success: false, error, ...(details ? { details } : {}) });
}

module.exports = { ok, fail };
