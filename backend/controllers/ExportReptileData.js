
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import Reptile from '../models/Reptile.js';
import Event from '../models/Event.js';
import Feeding from '../models/Feeding.js';
import Breeding from '../models/Breeding.js';
import { logAction } from '../utils/logAction.js';
import User from '../models/User.js';
import { getUserPlan } from '../utils/getUserPlans.js'

// --- Funzioni Helper per traduzioni e formattazione ---

const foodTypeMap = {
  Topo: 'mouse',
  Ratto: 'rat',
  Coniglio: 'rabbit',
  Pulcino: 'chick',
  Altro: 'other'
};

const translateFoodType = (foodType, t) => {
  if (!foodType) return t('not_specified');
  const key = foodTypeMap[foodType] || 'other';
  return t(key);
};

const translateEventType = (type, t) => {
  const map = {
    shed: t('shed'),
    feces: t('feces'),
    vet: t('vet_visit'),
    weight: t('weight'),
  };
  return map[type] || type;
};

const breedingEventMap = (t) => ({
  Mating: t('mating'),
  Ovulation: t('ovulation'),
  'Prelay Shed': t('prelay_shed'),
  'Egg Laid': t('egg_laid'),
  Birth: t('birth'),
  Hatching: t('hatching'),
  Failed: t('failed')
});

const applyHeaderStyle = (sheet, t) => {
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2E8B57' }, // Verde SnakeBee
  };
  sheet.views = [{ state: 'frozen', ySplit: 1 }];

  sheet.columns.forEach(col => {
    let maxLength = col.header.length;
    col.eachCell?.({ includeEmpty: true }, cell => {
      maxLength = Math.max(maxLength, (cell.value || '').toString().length);
    });
    col.width = maxLength + 2;
  });
};

// --- Controller Principale ---

export const exportReptileData = async (req, res) => {
  const t = req.t; // Helper per le traduzioni

  // --- Helpers di Traduzione ---
  const val = (v) => v || '';
  const date = (d) => d ? new Date(d).toLocaleDateString(t('date_locale') || 'it-IT') : '';
  const sex = (s) => s === 'M' ? t('male_morph') : s === 'F' ? t('female_morph') : t('unknown');
  const bool = (b) => b ? t('yes') : t('no');
  const status = (s) => {
    const statusMap = {
      active: t('status_active'),
      ceded: t('status_ceded'),
      deceased: t('status_deceased'),
      other: t('status_other'),
    };
    return statusMap[s] || val(s);
  };
  const outcome = (o) => {
    const outcomeMap = {
      Success: t('Success'),
      Partial: t('Partial'),
      Failed: t('failed'),
      Unknown: t('Unfinished')
    };
    return outcomeMap[o] || val(o);
  }

  try {
    const userId = req.user.userid;
    const user = await User.findById(userId);
    const { plan } = getUserPlan(user);

    if (plan === 'APPRENTICE' || plan === 'NEOPHYTE') {
      return res.status(403).json({
        message: t('basic_plan')
      });
    }

    // --- Fetch Dati ---
    const reptiles = await Reptile.find({ user: userId }).lean();
    const reptileIds = reptiles.map(r => r._id);

    const reptileMap = reptiles.reduce((acc, r) => {
      acc[r._id] = {
        name: r.name || '',
        morph: r.morph || t('no_morph'),
        sex: sex(r.sex)
      };
      return acc;
    }, {});

    const feedings = await Feeding.find({ reptile: { $in: reptileIds } }).sort({ date: -1 }).lean();
    const events = await Event.find({ reptile: { $in: reptileIds } }).sort({ date: -1 }).lean();
    const breedings = await Breeding.find({ user: userId }).populate('male female').sort({ year: -1 }).lean();

    const workbook = new ExcelJS.Workbook();

    // --- Foglio: Rettili ---
    const reptileSheet = workbook.addWorksheet(t('reptiles'));
    reptileSheet.columns = [
      { header: t('name'), key: 'name' },
      { header: t('species'), key: 'species' },
      { header: t('morph'), key: 'morph' },
      { header: t('sex'), key: 'sex' },
      { header: t('birth_date'), key: 'birthDate' },
      { header: t('status'), key: 'status' },
      { header: t('breeder'), key: 'isBreeder' },
      { header: t('public_profile'), key: 'isPublic' },
      { header: t('sold'), key: 'isSold' },
      { header: t('price'), key: 'price' },
      { header: t('priceCurrency'), key: 'priceCurrency' },
      { header: t('previous_owner'), key: 'previousOwner' },
      { header: t('ceded_to_name'), key: 'cededToName' },
      { header: t('ceded_to_surname'), key: 'cededToSurname' },
      { header: t('ceded_date'), key: 'cededToDate' },
      { header: t('ceded_notes'), key: 'cededToNotes' },
      { header: t('date_of_death'), key: 'deceasedDate' },
      { header: t('deceased_notes'), key: 'deceasedNotes' },
      { header: t('father'), key: 'father' },
      { header: t('mother'), key: 'mother' },
      { header: t('stats_breedings'), key: 'statsBreedings' },
      { header: t('stats_success'), key: 'statsSuccess' },
      { header: t('stats_offspring'), key: 'statsOffspring' },
      { header: t('cites_number'), key: 'citesNumber' },
      { header: t('cites_issuer'), key: 'citesIssuer' },
      { header: t('issue_date'), key: 'citesIssueDate' },
      { header: t('cites_load_n'), key: 'citesLoad' },
      { header: t('cites_unload_n'), key: 'citesUnload' },
      { header: t('microchip_code'), key: 'microchipCode' },
      { header: t('implant_date'), key: 'microchipImplantDate' },
      { header: t('food_type'), key: 'foodType' },
      { header: t('weight_per_unit_g'), key: 'weightPerUnit' },
      { header: t('next_meal_day'), key: 'nextMealDay' },
      { header: t('label'), key: 'labelText' },
      { header: t('label_color'), key: 'labelColor' },
      { header: t('notes'), key: 'notes' },
    ];

    reptileSheet.addRows(reptiles.map(r => ({
      name: val(r.name),
      species: val(r.species),
      morph: val(r.morph),
      sex: sex(r.sex),
      birthDate: date(r.birthDate),
      status: status(r.status),
      isBreeder: bool(r.isBreeder),
      isPublic: bool(r.isPublic),
      isSold: bool(r.isSold),
      price: r.price?.amount || '',
      priceCurrency: r.price?.currency || '',
      previousOwner: val(r.previousOwner),
      cededToName: r.status === 'ceded' ? val(r.cededTo?.name) : '',
      cededToSurname: r.status === 'ceded' ? val(r.cededTo?.surname) : '',
      cededToDate: r.status === 'ceded' ? date(r.cededTo?.date) : '',
      cededToNotes: r.status === 'ceded' ? val(r.cededTo?.notes) : '',
      deceasedDate: r.status === 'deceased' ? date(r.deceasedDetails?.date) : '',
      deceasedNotes: r.status === 'deceased' ? val(r.deceasedDetails?.notes) : '',
      father: val(r.parents?.father),
      mother: val(r.parents?.mother),
      statsBreedings: r.stats?.breedings || 0,
      statsSuccess: r.stats?.successCount || 0,
      statsOffspring: r.stats?.offspringCount || 0,
      citesNumber: val(r.documents?.cites?.number),
      citesIssuer: val(r.documents?.cites?.issuer),
      citesIssueDate: date(r.documents?.cites?.issueDate),
      citesLoad: val(r.documents?.cites?.load),
      citesUnload: val(r.documents?.cites?.unload),
      microchipCode: val(r.documents?.microchip?.code),
      microchipImplantDate: date(r.documents?.microchip?.implantDate),
      foodType: translateFoodType(r.foodType, t),
      weightPerUnit: r.weightPerUnit ?? '',
      nextMealDay: r.nextMealDay ?? '',
      labelText: val(r.label?.text),
      labelColor: val(r.label?.color),
      notes: val(r.notes),
    })));

    applyHeaderStyle(reptileSheet, t);

    // --- Foglio: Pasti ---
    const feedingSheet = workbook.addWorksheet(t('feedings'));
    feedingSheet.columns = [
      { header: t('reptile_name'), key: 'reptileName' },
      { header: t('reptile_morph'), key: 'reptileMorph' },
      { header: t('date'), key: 'date' },
      { header: t('food_type'), key: 'foodType' },
      { header: t('quantity'), key: 'quantity' },
      { header: t('weight_per_unit_g'), key: 'weightPerUnit' },
      { header: t('next_feeding'), key: 'nextFeedingDate' },
      { header: t('eaten'), key: 'wasEaten' },
      { header: t('retry_after_days'), key: 'retryAfterDays' },
      { header: t('notes'), key: 'notes' },
    ];
    feedingSheet.addRows(feedings.map(f => ({
      reptileName: reptileMap[f.reptile]?.name || t('reptile_not_found'),
      reptileMorph: reptileMap[f.reptile]?.morph || '',
      date: date(f.date),
      foodType: val(f.foodType),
      quantity: f.quantity,
      weightPerUnit: f.weightPerUnit ?? '',
      nextFeedingDate: date(f.nextFeedingDate),
      wasEaten: bool(f.wasEaten),
      retryAfterDays: f.retryAfterDays ?? '',
      notes: val(f.notes)
    })));

    applyHeaderStyle(feedingSheet, t);

    // --- Foglio: Eventi ---
    const eventSheet = workbook.addWorksheet(t('events'));
    eventSheet.columns = [
      { header: t('reptile_name'), key: 'reptileName' },
      { header: t('reptile_morph'), key: 'reptileMorph' },
      { header: t('type'), key: 'type' },
      { header: t('date'), key: 'date' },
      { header: t('notes'), key: 'notes' },
      { header: t('weight_g'), key: 'weight' },
    ];

    eventSheet.addRows(events.map(e => ({
      reptileName: reptileMap[e.reptile]?.name || t('reptile_not_found'),
      reptileMorph: reptileMap[e.reptile]?.morph || '',
      type: translateEventType(e.type, t),
      date: date(e.date),
      notes: val(e.notes),
      weight: e.type === 'weight' ? e.weight : '',
    })));

    applyHeaderStyle(eventSheet, t);

    // --- Foglio: Accoppiamenti ---
    const breedingSheet = workbook.addWorksheet(t('breeding'));
    breedingSheet.columns = [
      { header: t('year'), key: 'year' },
      { header: t('species'), key: 'species' },
      { header: t('morph_combo'), key: 'morphCombo' },
      { header: t('male_morph'), key: 'male' },
      { header: t('female_morph'), key: 'female' },
      { header: t('live_birth'), key: 'isLiveBirth' },
      { header: t('total_eggs_babies'), key: 'clutchTotal' },
      { header: t('fertile_eggs'), key: 'clutchFertile' },
      { header: t('hatched_or_born'), key: 'clutchHatchedOrBorn' },
      { header: t('outcome'), key: 'outcome' },
      { header: t('events'), key: 'events' },
      { header: t('notes'), key: 'notes' }
    ];

    const eventMap = breedingEventMap(t);

    breedingSheet.addRows(breedings.map(b => ({
      year: b.year,
      species: val(b.species),
      morphCombo: val(b.morphCombo),
      male: b.male?.morph || t('n_a'),
      female: b.female?.morph || t('n_a'),
      isLiveBirth: bool(b.isLiveBirth),
      clutchTotal: b.clutchSize?.total ?? '',
      clutchFertile: b.clutchSize?.fertile ?? '',
      clutchHatchedOrBorn: b.clutchSize?.hatchedOrBorn ?? '',
      outcome: outcome(b.outcome),
      events: b.events?.map(ev =>
        `${eventMap[ev.type] || ev.type} - ${date(ev.date)}`
      ).join(', ') || '',
      notes: val(b.notes)
    })));

    applyHeaderStyle(breedingSheet, t);

    // --- FOGLIO: Nati (Hatchlings) - NUOVO ---
    const hatchlingSheet = workbook.addWorksheet(t('hatchlings'));
    hatchlingSheet.columns = [
      { header: t('breeding_year'), key: 'year' },
      { header: t('breeding_combo'), key: 'morphCombo' },
      { header: t('morph'), key: 'morph' },
      { header: t('sex'), key: 'sex' },
      { header: t('weight_g'), key: 'weight' },
    ];

    const allHatchlings = breedings.flatMap(b =>
      (b.hatchlings || []).map(h => ({
        year: b.year,
        morphCombo: val(b.morphCombo),
        morph: val(h.morph),
        sex: val(h.sex), // Qui usiamo 'val' perché M/F/Unknown non necessita traduzione
        weight: h.weight ?? '',
      }))
    );

    hatchlingSheet.addRows(allHatchlings);
    applyHeaderStyle(hatchlingSheet, t);

    // --- Invio del file Excel ---
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=SnakeBee_Export.xlsx');

    // Ordina i fogli
    workbook.worksheets.sort((a, b) => {
      const order = [t('reptiles'), t('feedings'), t('events'), t('breeding'), t('hatchlings')];
      return order.indexOf(a.name) - order.indexOf(b.name);
    });

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error('Excel export error:', err);
    if (!res.headersSent) {
      res.status(500).send({ message: t('export_error') });
    }
  }
};

// --- Controller Principale ---

const PAGE_WIDTH = 595.28; // A4 width
const PAGE_HEIGHT = 841.89; // A4 height
const MARGIN = 40;

/**
 * Disegna l'intestazione del documento
 */
function drawHeader(doc, t, reptile) {
  doc
    .font('Helvetica-Bold')
    .fontSize(22)
    .fillColor('#2E8B57') // Verde SnakeBee
    .text(
      `${t('reptile_sheet_title')} ${reptile.name || ''}`,
      MARGIN,
      MARGIN,
      { align: 'center' }
    );

  doc
    .fontSize(14)
    .fillColor('black')
    .text(reptile.morph || '', MARGIN, MARGIN + 30, { align: 'center' });

  doc.moveDown(3);
}

/**
 * Disegna il piè di pagina con numero di pagina
 */
function drawFooter(doc, t) {
  const range = doc.bufferedPageRange();
  for (
    let i = range.start;
    i < range.start + range.count;
    i++
  ) {
    doc.switchToPage(i);

    // Testo generato da
    doc
      .fontSize(8)
      .fillColor('grey')
      .text(
        t('generated_by_snakebee'),
        MARGIN,
        PAGE_HEIGHT - MARGIN + 10,
        {
          align: 'left',
          lineBreak: false,
        }
      );

    // Numero di pagina
    doc
      .fontSize(8)
      .fillColor('grey')
      .text(
        `${t('page')} ${i + 1} ${t('of')} ${range.count}`,
        PAGE_WIDTH - MARGIN - 100,
        PAGE_HEIGHT - MARGIN + 10,
        {
          align: 'right',
          lineBreak: false,
        }
      );
  }
}

/**
 * Disegna un'intestazione di sezione standard
 */
function drawSectionHeader(doc, text, y) {
  if (y > PAGE_HEIGHT - MARGIN * 3) {
    doc.addPage();
    y = MARGIN;
  }
  doc
    .font('Helvetica-Bold')
    .fontSize(16)
    .fillColor('#2E8B57')
    .text(text, MARGIN, y, { underline: true });
  doc.moveDown(0.5);
  return doc.y;
}

/**
 * Disegna una riga di informazioni (Etichetta: Valore)
 * @returns {number} Nuova posizione Y
 */
function drawInfoRow(doc, y, label, value, options = {}) {
  const labelWidth = options.labelWidth || 160;
  const valueWidth = options.valueWidth || 350;
  const colGap = 10;
  const startX = MARGIN;

  if (y > PAGE_HEIGHT - MARGIN * 2) {
    doc.addPage();
    y = MARGIN;
  }

  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor('black')
    .text(`${label}:`, startX, y, { width: labelWidth });

  doc
    .font('Helvetica-Bold')
    .text(value || '', startX + labelWidth + colGap, y, {
      width: valueWidth,
    });

  const rowHeight = Math.max(
    doc.heightOfString(`${label}:`, { width: labelWidth }),
    doc.heightOfString(value || '', { width: valueWidth })
  );
  return y + rowHeight + 4; // Aggiunge un piccolo padding
}

/**
 * Mappa per tradurre i tipi di cibo

/**
 * Controlla se è necessaria una nuova pagina e aggiorna la Y
 * @returns {number} Nuova posizione Y
 */
function checkPageBreak(doc, y, requiredSpace = 20) {
  if (y + requiredSpace > PAGE_HEIGHT - MARGIN) {
    doc.addPage();
    return MARGIN;
  }
  return y;
}

/**
 * Disegna una riga di tabella con colonne definite
 */
function drawTableRow(doc, y, columns, isHeader = false) {
  y = checkPageBreak(doc, y, 30);
  const startX = MARGIN;
  let currentX = startX;

  doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica').fontSize(9);

  columns.forEach(col => {
    doc.text(col.text, currentX, y, { width: col.width });
    currentX += col.width + 10; // 10px gap
  });

  const rowHeight = doc.heightOfString(columns[0].text, { width: columns[0].width }) + 8;
  y += rowHeight;

  // Linea separatrice
  doc
    .strokeColor(isHeader ? 'black' : '#DDDDDD')
    .lineWidth(0.5)
    .moveTo(startX, y)
    .lineTo(PAGE_WIDTH - MARGIN, y)
    .stroke();

  return y + 2;
}

// --- Controller Principale ---

export async function generateReptilePDF(req, res) {
  const doc = new PDFDocument({
    margin: MARGIN,
    size: 'A4',
    bufferPages: true, // Necessario per i numeri di pagina
  });
  const reptileId = req.params.id;
  const t = req.t; // Helper per le traduzioni

  try {
    const userId = req.user.userid;
    const user = await User.findById(userId);
    const { plan } = getUserPlan(user);

    if (plan === 'APPRENTICE' || plan === 'NEOPHYTE') {
      return res.status(403).json({
        message: t('basic_plan')
      });
    }

    // --- Helpers di Traduzione ---
    const val = (v) => v || t('n_a');
    const date = (d) => d ? new Date(d).toLocaleDateString(t('date_locale') || 'it-IT') : t('n_a');
    const sex = (s) => s === 'M' ? t('male_morph') : s === 'F' ? t('female_morph') : t('unknown');
    const bool = (b) => b ? t('yes') : t('no');
    const status = (s) => {
      const statusMap = {
        active: t('status_active'),
        ceded: t('status_ceded'),
        deceased: t('status_deceased'),
        other: t('status_other'),
      };
      return statusMap[s] || val(s);
    };

    // --- Fetch Dati ---
    const reptile = await Reptile.findById(reptileId).lean();
    if (!reptile) {
      return res.status(404).send(t('reptile_not_found'));
    }

    const events = await Event.find({ reptile: reptileId }).sort({ date: -1 }).lean();
    const feedings = await Feeding.find({ reptile: reptileId }).sort({ date: -1 }).lean();
    const breedings = await Breeding.find({
      $or: [{ male: reptileId }, { female: reptileId }]
    }).populate('male female').lean();

    // --- Setup Documento ---
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${(reptile.morph || t('reptiles')).replace(/\s+/g, '_')}.pdf`
    );
    doc.pipe(res);

    // --- Inizio Disegno PDF ---

    drawHeader(doc, t, reptile);
    let currentY = doc.y;

    // --- Informazioni Base ---
    currentY = drawSectionHeader(doc, t('Information'), currentY);

    currentY = drawInfoRow(doc, currentY, t('species'), val(reptile.species));
    currentY = drawInfoRow(doc, currentY, t('morph'), val(reptile.morph));
    currentY = drawInfoRow(doc, currentY, t('sex'), sex(reptile.sex));
    currentY = drawInfoRow(doc, currentY, t('birth_date'), date(reptile.birthDate));
    currentY = drawInfoRow(doc, currentY, t('status'), status(reptile.status));
    currentY = drawInfoRow(doc, currentY, t('previous_owner'), val(reptile.previousOwner));
    currentY = drawInfoRow(doc, currentY, t('breeder'), bool(reptile.isBreeder));
    currentY = drawInfoRow(doc, currentY, t('public_profile'), bool(reptile.isPublic));
    currentY = drawInfoRow(doc, currentY, t('sold'), bool(reptile.isSold));
    currentY = drawInfoRow(doc, currentY, t('price'), reptile.price?.amount ? `${reptile.price.amount} ${reptile.price.currency}` : t('n_a'));
    currentY = drawInfoRow(doc, currentY, t('label'), reptile.label?.text ? `${reptile.label.text} (${reptile.label.color})` : t('n_a'));

    // Dettagli Status
    if (reptile.status === 'ceded' && reptile.cededTo) {
      currentY = drawInfoRow(doc, currentY, t('ceded_to_name'), val(reptile.cededTo.name));
      currentY = drawInfoRow(doc, currentY, t('ceded_to_surname'), val(reptile.cededTo.surname));
      currentY = drawInfoRow(doc, currentY, t('ceded_date'), date(reptile.cededTo.date));
      currentY = drawInfoRow(doc, currentY, t('notes'), val(reptile.cededTo.notes));
    }
    if (reptile.status === 'deceased' && reptile.deceasedDetails) {
      currentY = drawInfoRow(doc, currentY, t('date_of_death'), date(reptile.deceasedDetails.date));
      currentY = drawInfoRow(doc, currentY, t('notes'), val(reptile.deceasedDetails.notes));
    }

    // Cibo
    currentY = drawInfoRow(doc, currentY, t('food_type'), translateFoodType(reptile.foodType, t));
    currentY = drawInfoRow(doc, currentY, t('weight_per_unit_g'), reptile.weightPerUnit ? `${reptile.weightPerUnit}g` : t('n_a'));
    currentY = drawInfoRow(doc, currentY, t('next_meal_day'), reptile.nextMealDay ? `${reptile.nextMealDay} ${t('days')}` : t('n_a'));

    // Genitori
    currentY = drawInfoRow(doc, currentY, t('father'), val(reptile.parents?.father));
    currentY = drawInfoRow(doc, currentY, t('mother'), val(reptile.parents?.mother));

    // Stats
    currentY = drawInfoRow(doc, currentY, t('stats_breedings'), String(reptile.stats?.breedings || 0));
    currentY = drawInfoRow(doc, currentY, t('stats_success'), String(reptile.stats?.successCount || 0));
    currentY = drawInfoRow(doc, currentY, t('stats_offspring'), String(reptile.stats?.offspringCount || 0));

    // Note
    currentY = drawInfoRow(doc, currentY, t('notes'), val(reptile.notes), { valueWidth: 350 });
    doc.y = currentY;

    // --- Documentazione ---
    currentY = checkPageBreak(doc, doc.y, 50);
    currentY = drawSectionHeader(doc, t('Documentazione'), currentY);

    if (!reptile.documents?.cites?.number && !reptile.documents?.microchip?.code) {
      doc.font('Helvetica').fontSize(10).fillColor('black').text(t('No_documentation_available'));
      currentY = doc.y;
    } else {
      if (reptile.documents?.cites?.number) {
        doc.font('Helvetica-Bold').fontSize(10).text(t('cites_document'));
        currentY = doc.y;
        currentY = drawInfoRow(doc, currentY, `  ${t('cites_number')}`, val(reptile.documents.cites.number));
        currentY = drawInfoRow(doc, currentY, `  ${t('cites_issuer')}`, val(reptile.documents.cites.issuer)); // NUOVO
        currentY = drawInfoRow(doc, currentY, `  ${t('issue_date')}`, date(reptile.documents.cites.issueDate));
        currentY = drawInfoRow(doc, currentY, `  ${t('cites_load_n')}`, val(reptile.documents.cites.load)); // NUOVO
        currentY = drawInfoRow(doc, currentY, `  ${t('cites_unload_n')}`, val(reptile.documents.cites.unload)); // NUOVO
        doc.y = currentY;
      }
      if (reptile.documents?.microchip?.code) {
        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').fontSize(10).text(t('microchip'));
        currentY = doc.y;
        currentY = drawInfoRow(doc, currentY, `  ${t('microchip_code')}`, val(reptile.documents.microchip.code));
        currentY = drawInfoRow(doc, currentY, `  ${t('implant_date')}`, date(reptile.documents.microchip.implantDate));
        doc.y = currentY;
      }
    }
    doc.moveDown(2);
    currentY = doc.y;

    // --- Eventi Registrati (Tabella) ---
    currentY = checkPageBreak(doc, currentY, 80);
    currentY = drawSectionHeader(doc, t('events'), currentY);

    if (events.length === 0) {
      doc.font('Helvetica').fontSize(10).text(t('Nessun evento registrato.'));
      currentY = doc.y;
    } else {
      const eventCols = [
        { text: t('date'), width: 70 },
        { text: t('type'), width: 80 },
        { text: t('weight'), width: 50 },
        { text: t('notes'), width: 300 },
      ];
      currentY = drawTableRow(doc, currentY, eventCols, true);

      const labelMap = {
        shed: t('shed'),
        feces: t('feces'),
        vet: t('vet_visit'),
        weight: t('weight'),
      };

      for (const event of events) {
        const row = [
          { text: date(event.date) },
          { text: labelMap[event.type] || event.type },
          { text: event.type === 'weight' && event.weight ? `${event.weight}g` : '-' },
          { text: val(event.notes) },
        ];
        // Mappa la larghezza dalle intestazioni
        const rowData = row.map((col, i) => ({ text: col.text, width: eventCols[i].width }));
        currentY = drawTableRow(doc, currentY, rowData);
      }
    }
    doc.moveDown(2);
    currentY = doc.y;

    // --- Pasti (Tabella) ---
    currentY = checkPageBreak(doc, currentY, 80);
    currentY = drawSectionHeader(doc, t('feedings'), currentY);

    if (feedings.length === 0) {
      doc.font('Helvetica').fontSize(10).text(t('No_meals_recorded'));
      currentY = doc.y;
    } else {
      const feedingCols = [
        { text: t('date'), width: 70 },
        { text: t('food_type'), width: 80 },
        { text: t('quantity'), width: 40 },
        { text: t('weight_g'), width: 50 },
        { text: t('eaten'), width: 40 },
        { text: t('notes'), width: 220 },
      ];
      currentY = drawTableRow(doc, currentY, feedingCols, true);

      for (const feed of feedings) {
        let notes = val(feed.notes);
        if (!feed.wasEaten && feed.retryAfterDays) {
          notes = `(${t('retry_after_days')}: ${feed.retryAfterDays}) ${notes}`;
        }
        const row = [
          { text: date(feed.date) },
          { text: val(feed.foodType) },
          { text: String(feed.quantity || 1) },
          { text: `${feed.weightPerUnit}g` },
          { text: bool(feed.wasEaten) },
          { text: notes },
        ];
        const rowData = row.map((col, i) => ({ text: col.text, width: feedingCols[i].width }));
        currentY = drawTableRow(doc, currentY, rowData);
      }
    }
    doc.moveDown(2);
    currentY = doc.y;

    // --- Accoppiamenti (Lista Migliorata) ---
    currentY = checkPageBreak(doc, currentY, 80);
    currentY = drawSectionHeader(doc, t('breeding'), currentY);
    doc.font('Helvetica').fontSize(10).fillColor('black');

    if (breedings.length === 0) {
      doc.text(t('No_pairings_recorded'));
    } else {
      const outcomes = {
        Success: t('Success'),
        Partial: t('Partial'),
        Failed: t('failed'),
        Unknown: t('Unfinished')
      };
      const eventiTradotti = {
        Mating: t('mating'),
        Ovulation: t('ovulation'),
        'Prelay Shed': t('prelay_shed'),
        'Egg Laid': t('egg_laid'),
        Birth: t('birth'),
        Hatching: t('hatching'),
        Failed: t('failed')
      };

      breedings.forEach(b => {
        currentY = checkPageBreak(doc, currentY, 60);
        const maschio = b.male?.morph || t('male_morph');
        const femmina = b.female?.morph || t('female_morph');

        doc.font('Helvetica-Bold').text(`- ${t('year')}: ${b.year} | ${maschio} x ${femmina}`);
        doc.font('Helvetica').list(
          [
            `${t('outcome')}: ${outcomes[b.outcome] || b.outcome}`,
            `${t('notes')}: ${val(b.notes)}`,
          ],
          { indent: 20, textIndent: 10 }
        );

        if (b.events?.length) {
          doc.font('Helvetica-Bold').text(t('breeding_events'), { indent: 20 });
          const eventList = b.events.map(evt => {
            const nomeEvento = eventiTradotti[evt.type] || evt.type;
            return `${nomeEvento}: ${date(evt.date)} | ${t('notes')}: ${val(evt.notes)}`;
          });
          doc.font('Helvetica').list(eventList, { indent: 40, textIndent: 10 });
        }

        if (b.hatchlings?.length) {
          doc.font('Helvetica-Bold').text(t('hatchlings'), { indent: 20 });
          const hatchlingList = b.hatchlings.map(h =>
            `${t('morph')}: ${val(h.morph)} | ${t('weight')}: ${val(h.weight)}g | ${t('sex')}: ${val(h.sex)}`
          );
          doc.font('Helvetica').list(hatchlingList, { indent: 40, textIndent: 10 });
        }
        doc.moveDown(1);
        currentY = doc.y;
      });
    }

    // --- Finalizzazione ---
    drawFooter(doc, t); // Disegna il footer su tutte le pagine
    doc.end();

  } catch (error) {
    console.error('Error generating PDF:', error);
    if (!res.headersSent) {
      res.status(500).send(t('export_error'));
    }
    // Se doc non è chiuso, distruggilo per evitare memory leak
    if (doc && !doc.ended) {
      doc.end();
    }
  }
}
