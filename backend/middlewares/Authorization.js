export const isAdmin = (req, res, next) => {
    if (req.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({ message: req.t('blocked_access')  });
};
export const blockIfBanned = (req, res, next) => {
    if (req.user?.role === 'banned') {
        return res.status(403).json({ message: req.t('account_ban') });
    }
    next();
};

export const isOwnerOrAdmin = (model, idField = 'userId') => async (req, res, next) => {
    try {
        const resourceId = req.params[idField] || req.params.id;

        if (!resourceId) {
            if (req.user && req.user.role === 'admin') {
                return next();
            } else {
                return res.status(403).json({ message: req.t('access_id')  });
            }
        }
        const resource = model.modelName === 'User'
            ? await model.findById(resourceId)
            : await model.findById(resourceId).populate('user');

        if (!resource) {
            return res.status(404).json({ message: req.t('resource_error') });
        }

        if (!req.user) {
            return res.status(401).json({ message: req.t('access_id') });
        }

        if (model.modelName === 'User' || resource.user._id.toString() === req.user.userid || req.user.role === 'admin') {
            return next();
        } else {
            return res.status(403).json({ message: req.t('NoOwner') });
        }
    } catch (error) {
        return res.status(500).json({ message: req.t('server_error') });
    }
};
