import Kit from '../models/Kit.js';
import { deleteFileIfExists } from '../utils/deleteFileIfExists.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

function sanitizePrice(raw) {
  const n = parseFloat(raw);
  if (isNaN(n) || n < 0) throw new Error('Prezzo non valido');
  return Math.round(n * 100) / 100; // max 2 decimali
}

function sanitizeQuantity(raw) {
  const n = parseInt(raw, 10);
  if (isNaN(n) || n < 0) throw new Error('Quantità non valida');
  return n;
}

// ─── GET /api/store/kits  (pubblica, solo kit attivi) ────────────────────────
export const getKits = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 12);
    const filter = { active: true };

    if (req.query.q) {
      filter.$text = { $search: req.query.q };
    }

    const [kits, total] = await Promise.all([
      Kit.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Kit.countDocuments(filter),
    ]);

    res.json({ kits, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('getKits error:', err);
    res.status(500).json({ message: req.t('server_error') });
  }
};

// ─── GET /api/store/kits/admin  (admin, tutti i kit) ─────────────────────────
export const getKitsAdmin = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);

    const filter = {};
    if (req.query.active !== undefined) filter.active = req.query.active === 'true';

    const [kits, total] = await Promise.all([
      Kit.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Kit.countDocuments(filter),
    ]);

    res.json({ kits, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: req.t('server_error') });
  }
};

// ─── GET /api/store/kits/:id ─────────────────────────────────────────────────
export const getKitById = async (req, res) => {
  try {
    const kit = await Kit.findById(req.params.id).lean();
    if (!kit || (!kit.active && req.user?.role !== 'admin')) {
      return res.status(404).json({ message: 'Kit non trovato' });
    }
    res.json(kit);
  } catch (err) {
    res.status(500).json({ message: req.t('server_error') });
  }
};

// ─── POST /api/store/kits  (admin) ───────────────────────────────────────────
export const createKit = async (req, res) => {
  try {
    let { name, description, price, quantity, active, includedProducts, vatRate } = req.body;

    if (!name || !description || price === undefined || quantity === undefined) {
      return res.status(400).json({ message: 'Campi obbligatori mancanti: name, description, price, quantity' });
    }

    price = sanitizePrice(price);
    quantity = sanitizeQuantity(quantity);

    // Immagini caricate via multer
    const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

    // Prodotti inclusi: array JSON o stringa separata da virgola
    let products = [];
    if (includedProducts) {
      try {
        products = typeof includedProducts === 'string'
          ? JSON.parse(includedProducts)
          : includedProducts;
      } catch {
        products = includedProducts.split(',').map(s => s.trim()).filter(Boolean);
      }
    }

    const baseSlug = slugify(name);
    let slug = baseSlug;
    let counter = 1;
    while (await Kit.exists({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const kit = await Kit.create({
      name: name.trim(),
      description: description.trim(),
      price,
      quantity,
      images,
      active: active !== undefined ? active === 'true' || active === true : true,
      includedProducts: products,
      vatRate: vatRate ? parseInt(vatRate) : 22,
      slug,
    });

    res.status(201).json(kit);
  } catch (err) {
    console.error('createKit error:', err);
    res.status(500).json({ message: req.t('server_error') });
  }
};

// ─── PUT /api/store/kits/:id  (admin) ────────────────────────────────────────
export const updateKit = async (req, res) => {
  try {
    const kit = await Kit.findById(req.params.id);
    if (!kit) return res.status(404).json({ message: 'Kit non trovato' });

    const allowed = ['name', 'description', 'active', 'vatRate'];
    const updates = {};

    allowed.forEach(f => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });

    if (req.body.price !== undefined) updates.price = sanitizePrice(req.body.price);
    if (req.body.quantity !== undefined) updates.quantity = sanitizeQuantity(req.body.quantity);

    if (req.body.includedProducts !== undefined) {
      try {
        updates.includedProducts = typeof req.body.includedProducts === 'string'
          ? JSON.parse(req.body.includedProducts)
          : req.body.includedProducts;
      } catch {
        updates.includedProducts = req.body.includedProducts.split(',').map(s => s.trim());
      }
    }

    // Nuove immagini
    if (req.files && req.files.length > 0) {
      updates.images = req.files.map(f => `/uploads/${f.filename}`);
    }

    // Rigenera slug se cambia il nome
    if (updates.name) {
      const baseSlug = slugify(updates.name);
      let slug = baseSlug;
      let c = 1;
      while (await Kit.exists({ slug, _id: { $ne: kit._id } })) {
        slug = `${baseSlug}-${c++}`;
      }
      updates.slug = slug;
    }

    if (typeof updates.active === 'string') {
      updates.active = updates.active === 'true';
    }

    const updated = await Kit.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(updated);
  } catch (err) {
    console.error('updateKit error:', err);
    res.status(500).json({ message: req.t('server_error') });
  }
};

// ─── DELETE /api/store/kits/:id  (admin) ─────────────────────────────────────
export const deleteKit = async (req, res) => {
  try {
    const kit = await Kit.findById(req.params.id);
    if (!kit) return res.status(404).json({ message: 'Kit non trovato' });

    // Rimuovi immagini dal disco
    for (const img of kit.images) {
      await deleteFileIfExists(img).catch(() => {});
    }

    await Kit.findByIdAndDelete(req.params.id);
    res.json({ message: 'Kit eliminato' });
  } catch (err) {
    res.status(500).json({ message: req.t('server_error') });
  }
};

// ─── PATCH /api/store/kits/:id/toggle  (admin) ───────────────────────────────
export const toggleKitStatus = async (req, res) => {
  try {
    const kit = await Kit.findById(req.params.id);
    if (!kit) return res.status(404).json({ message: 'Kit non trovato' });
    kit.active = !kit.active;
    await kit.save();
    res.json({ active: kit.active });
  } catch (err) {
    res.status(500).json({ message: req.t('server_error') });
  }
};