import Order from '../models/Order.js';

// ─── GET /api/store/orders  (utente: propri ordini) ──────────────────────────
export const getUserOrders = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);

    const filter = { user: req.user.userid };

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('items.kit', 'name images slug')
        .lean(),
      Order.countDocuments(filter),
    ]);

    res.json({ orders, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('getUserOrders error:', err);
    res.status(500).json({ message: req.t('server_error') });
  }
};

// ─── GET /api/store/orders/:id  (utente: proprio ordine) ─────────────────────
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.userid,
    }).populate('items.kit', 'name images slug').lean();

    if (!order) return res.status(404).json({ message: 'Ordine non trovato' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: req.t('server_error') });
  }
};

// ─── GET /api/store/admin/orders  (admin: tutti gli ordini) ──────────────────
export const getAllOrders = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const filter = {};

    if (req.query.status) filter.status = req.query.status;
    if (req.query.userId) filter.user = req.query.userId;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('user', 'name email')
        .populate('items.kit', 'name')
        .lean(),
      Order.countDocuments(filter),
    ]);

    res.json({ orders, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: req.t('server_error') });
  }
};

// ─── PATCH /api/store/admin/orders/:id/status  (admin) ───────────────────────
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingCode } = req.body;
    const allowed = ['PENDING', 'PAID', 'SHIPPED', 'CANCELLED'];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `Status non valido. Valori: ${allowed.join(', ')}` });
    }

    const updates = { status };
    if (trackingCode !== undefined) updates.trackingCode = trackingCode.trim() || null;

    const order = await Order.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!order) return res.status(404).json({ message: 'Ordine non trovato' });

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: req.t('server_error') });
  }
};

// ─── PATCH /api/store/admin/orders/:id/tracking  (admin) ─────────────────────
export const updateTracking = async (req, res) => {
  try {
    const { trackingCode } = req.body;
    if (!trackingCode) return res.status(400).json({ message: 'trackingCode richiesto' });

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { trackingCode: trackingCode.trim(), status: 'SHIPPED' },
      { new: true }
    ).populate('user', 'name email');

    if (!order) return res.status(404).json({ message: 'Ordine non trovato' });

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: req.t('server_error') });
  }
};