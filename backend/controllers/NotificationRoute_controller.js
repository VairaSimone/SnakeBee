import Notification from '../models/Notification.js';

export const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const unreadNotifications = await Notification.find({ user: userId, read: false })
      .sort({ date: -1 });

    const readNotifications = await Notification.find({ user: userId, read: true })
      .sort({ date: -1 })
      .limit(5);

    await Notification.deleteMany({ user: userId, read: true, _id: { $nin: readNotifications.map(n => n._id) } });

    res.json({
      unreadNotifications,
      readNotifications
    });
  } catch (error) {
    res.status(500).json({ message: req.t('notification_error') });
  }
};

export const createNotification = async (req, res) => {
  const { reptileId } = req.params;
  const { user, type, message, date } = req.body;

  try {
    const newNotification = new Notification({
      reptile: reptileId,
      user,
      type,
      message,
      date: date || new Date(),
      status: 'pending'
    });

    const savedNotification = await newNotification.save();
    res.status(201).json(savedNotification);
  } catch (error) {
    res.status(500).json({ message: req.t('notification_error') });
  }
};

export const updateNotification = async (req, res) => {
  const { notificationId } = req.params;
  const { message, status, read } = req.body;

  try {
    const updatedNotification = await Notification.findByIdAndUpdate(
      notificationId,
      { message, status, read },
      { new: true }
    );

    if (!updatedNotification) {
      return res.status(404).json({ message: req.t('notification_notFound') });
    }

    res.json(updatedNotification);
  } catch (error) {
    res.status(500).json({ message: req.t('notification_error') });
  }
};

export const deleteNotification = async (req, res) => {
  const { notificationId } = req.params;

  try {
    const notification = await Notification.findByIdAndDelete(notificationId);
    if (!notification) {
      return res.status(404).json({ message: req.t('notification_notFound') });
    }
    res.json({ message:  req.t('notification_delete')  });
  } catch (error) {
    res.status(500).json({ message: req.t('notification_error') });
  }
};

export const getUnreadNotificationCount = async (req, res) => {
  try {
    const userId = req.user.userid;

    const unreadCount = await Notification.countDocuments({ user: userId, read: false });
    res.json({ unreadCount });
  } catch (error) {
    res.status(500).json({ message: req.t('notification_error') });
  }
};