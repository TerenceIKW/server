// Simple admin key check.
// Send header: x-admin-key: <your-key>
// Or query string: ?key=<your-key>
module.exports = function adminAuth(req, res, next) {
  const key = req.headers['x-admin-key'] || req.query.key;

  if (!key || key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  next();
};