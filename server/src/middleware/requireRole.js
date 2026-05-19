export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.auth?.role || !roles.includes(req.auth.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}
