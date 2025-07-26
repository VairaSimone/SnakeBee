export const isAdmin = (req, res, next) => {
    if (req.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({ message: 'Access denied. Admins only.' });
};

export const isOwnerOrAdmin = (model, idField = 'userId') => async (req, res, next) => {
    try {
        const resourceId = req.params[idField] || req.params.id;

        if (!resourceId) {
            if (req.user && req.user.role === 'admin') {
                return next();
            } else {
                return res.status(403).json({ message: 'Access denied. No resource ID provided.' });
            }
        }
        const resource = model.modelName === 'User'
            ? await model.findById(resourceId)
            : await model.findById(resourceId).populate('user');

        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized. No user information.' });
        }

        if (model.modelName === 'User' || resource.user._id.toString() === req.user.userid || req.user.role === 'admin') {
            return next();
        } else {
            return res.status(403).json({ message: 'Access denied. You are not the owner or admin.' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
};
