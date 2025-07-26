export const checkSeasonOpen = (docGetter) => async (req, res, next) => {
  const item = await docGetter(req);
  if (!item) return res.status(404).json({ message: "Non trovato" });
  if (item.seasonYear < new Date().getFullYear())
    return res.status(403).json({ message: "Stagione chiusa" });
  req.breeding = item;
  next();
};
