
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import Reptile from '../models/Reptile.js';
import Event from '../models/Event.js';
import Feeding from '../models/Feeding.js';
import Breeding from '../models/Breeding.js';
import { logAction } from '../utils/logAction.js';
import User from '../models/User.js';
import { getUserPlan } from '../utils/getUserPlans.js'

export const exportReptileData = async (req, res) => {
  try {
    const userId = req.params.userId;
    await logAction(req.user.userid, "ExportReptile");

    const reptiles = await Reptile.find({ user: userId }).lean();
    const reptileMap = reptiles.reduce((acc, r) => {
      acc[r._id] = {
        morph: r.morph || req.t('no_morph'),
        sex: r.sex || req.t('unknown'),
      };
      return acc;
    }, {});

    const reptileIds = Object.keys(reptileMap);

    const feedings = await Feeding.find({ reptile: { $in: reptileIds } }).lean();
    const events = await Event.find({ reptile: { $in: reptileIds } }).lean();
    const breedings = await Breeding.find({ user: userId })
      .populate('male', 'morph sex')
      .populate('female', 'morph sex')
      .lean();

    const workbook = new ExcelJS.Workbook();

    // Reptiles Sheet
    const reptileSheet = workbook.addWorksheet(req.t('reptiles'));
    reptileSheet.columns = [
      { header: req.t('name'), key: 'name' },
      { header: req.t('species'), key: 'species' },
      { header: req.t('morph'), key: 'morph' },
      { header: req.t('sex'), key: 'sex' },
      { header: req.t('birth_date'), key: 'birthDate' },
      { header: req.t('breeder'), key: 'isBreeder' },
      { header: req.t('notes'), key: 'notes' },
      { header: req.t('father'), key: 'father' },
      { header: req.t('mother'), key: 'mother' },
      { header: req.t('price'), key: 'price' },
      { header: req.t('priceCurrency'), key: 'priceCurrency' },
      { header: req.t('cites_number'), key: 'citesNumber' },
      { header: req.t('cites_issue_date'), key: 'citesIssueDate' },
      { header: req.t('cites_issuer'), key: 'citesIssuer' },
      { header: req.t('microchip_code'), key: 'microchipCode' },
      { header: req.t('microchip_implant_date'), key: 'microchipImplantDate' },
      { header: req.t('label'), key: 'labelText' },
    ];

    reptileSheet.addRows(reptiles.map(r => ({
      name: r.name || req.t('n_a'),
      species: r.species,
      morph: r.morph || req.t('no_morph'),
      sex: r.sex || req.t('unknown'),
      birthDate: r.birthDate ? new Date(r.birthDate).toLocaleDateString() : req.t('n_a'),
      isBreeder: r.isBreeder ? req.t('yes') : req.t('no'),
      notes: r.notes || '',
      father: r.parents?.father || '',
      mother: r.parents?.mother || '',
      price: r.price?.amount || '',
      priceCurrency: r.price?.currency || '',
      citesNumber: r.documents?.cites?.number || '',
      citesIssueDate: r.documents?.cites?.issueDate ? new Date(r.documents.cites.issueDate).toLocaleDateString() : '',
      citesIssuer: r.documents?.cites?.issuer || '',
      microchipCode: r.documents?.microchip?.code || '',
      microchipImplantDate: r.documents?.microchip?.implantDate ? new Date(r.documents.microchip.implantDate).toLocaleDateString() : '',
      labelText: r.label?.text || '',
    })));

    reptileSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    reptileSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4CAF50' },
    };
    reptileSheet.views = [{ state: 'frozen', ySplit: 1 }];

    reptileSheet.columns.forEach(col => {
      let maxLength = col.header.length;
      col.eachCell?.({ includeEmpty: true }, cell => {
        maxLength = Math.max(maxLength, (cell.value || '').toString().length);
      });
      col.width = maxLength + 2;
    });

    // Feedings
    const feedingSheet = workbook.addWorksheet(req.t('feedings'));
    feedingSheet.columns = [
      { header: req.t('reptile_morph_sex'), key: 'reptile' },
      { header: req.t('date'), key: 'date' },
      { header: req.t('food_type'), key: 'foodType' },
      { header: req.t('quantity'), key: 'quantity' },
      { header: req.t('weight_per_unit_g'), key: 'weightPerUnit' },
      { header: req.t('next_feeding'), key: 'nextFeedingDate' },
      { header: req.t('eaten'), key: 'wasEaten' },
      { header: req.t('retry_after_days'), key: 'retryAfterDays' },
      { header: req.t('notes'), key: 'notes' },
    ];
    feedingSheet.addRows(feedings.map(f => ({
      reptile: `${reptileMap[f.reptile]?.morph} - ${reptileMap[f.reptile]?.sex}`,
      date: f.date ? new Date(f.date).toLocaleDateString() : '',
      foodType: f.foodType,
      quantity: f.quantity,
      weightPerUnit: f.weightPerUnit ?? '',
      nextFeedingDate: f.nextFeedingDate ? new Date(f.nextFeedingDate).toLocaleDateString() : '',
      wasEaten: f.wasEaten ? req.t('yes') : req.t('no'),
      retryAfterDays: f.retryAfterDays ?? '',
      notes: f.notes || ''
    })));
    feedingSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    feedingSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4CAF50' },
    };
    feedingSheet.views = [{ state: 'frozen', ySplit: 1 }];

    feedingSheet.columns.forEach(col => {
      let maxLength = col.header.length;
      col.eachCell?.({ includeEmpty: true }, cell => {
        maxLength = Math.max(maxLength, (cell.value || '').toString().length);
      });
      col.width = maxLength + 2;
    });

    // Events
    const eventSheet = workbook.addWorksheet(req.t('events'));
    eventSheet.columns = [
      { header: req.t('reptile_morph_sex'), key: 'reptile' },
      { header: req.t('type'), key: 'type' },
      { header: req.t('date'), key: 'date' },
      { header: req.t('notes'), key: 'notes' },
      { header: req.t('weight_g'), key: 'weight' },
    ];

    const translateEventType = (type) => {
      const map = {
        shed: req.t('shed'),
        feces: req.t('feces'),
        vet: req.t('vet_visit'),
        weight: req.t('weight'),
      };
      return map[type] || type;
    };

    eventSheet.addRows(events.map(e => ({
      reptile: `${reptileMap[e.reptile]?.morph} - ${reptileMap[e.reptile]?.sex}`,
      type: translateEventType(e.type),
      date: e.date ? new Date(e.date).toLocaleDateString() : '',
      notes: e.notes || '',
      weight: e.type === 'weight' ? e.weight : '',
    })));
    eventSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    eventSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4CAF50' },
    };

    eventSheet.columns.forEach(col => {
      let maxLength = col.header.length;
      col.eachCell?.({ includeEmpty: true }, cell => {
        maxLength = Math.max(maxLength, (cell.value || '').toString().length);
      });
      col.width = maxLength + 2;
    });
    eventSheet.views = [{ state: 'frozen', ySplit: 1 }];

    // Breedings
    const breedingEventMap = {
      Mating: req.t('mating'),
      Ovulation: req.t('ovulation'),
      'Prelay Shed': req.t('prelay_shed'),
      'Egg Laid': req.t('egg_laid'),
      Birth: req.t('birth'),
      Hatching: req.t('hatching'),
      Failed: req.t('failed')
    };

    const breedingSheet = workbook.addWorksheet(req.t('breeding'));
    breedingSheet.columns = [
      { header: req.t('year'), key: 'year' },
      { header: req.t('species'), key: 'species' },
      { header: req.t('morph_combo'), key: 'morphCombo' },
      { header: req.t('male_morph'), key: 'male' },
      { header: req.t('female_morph'), key: 'female' },
      { header: req.t('live_birth'), key: 'isLiveBirth' },
      { header: req.t('total_eggs_babies'), key: 'clutchTotal' },
      { header: req.t('fertile_eggs'), key: 'clutchFertile' },
      { header: req.t('hatched_or_born'), key: 'clutchHatchedOrBorn' },
      { header: req.t('outcome'), key: 'outcome' },
      { header: req.t('events'), key: 'events' },
      { header: req.t('notes'), key: 'notes' }
    ];
    breedingSheet.addRows(breedings.map(b => ({
      year: b.year,
      species: b.species,
      morphCombo: b.morphCombo || '',
      male: `${b.male?.morph || req.t('no_morph')}`,
      female: `${b.female?.morph || req.t('no_morph')}`,
      isLiveBirth: b.isLiveBirth ? req.t('yes') : req.t('no'),
      clutchTotal: b.clutchSize?.total ?? '',
      clutchFertile: b.clutchSize?.fertile ?? '',
      clutchHatchedOrBorn: b.clutchSize?.hatchedOrBorn ?? '',
      outcome: b.outcome || '',
      events: b.events?.map(ev =>
        `${breedingEventMap[ev.type] || ev.type} - ${new Date(ev.date).toLocaleDateString()}`
      ).join(', ') || '',
      notes: b.notes || ''
    })));

    breedingSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    breedingSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4CAF50' },
    };

    breedingSheet.columns.forEach(col => {
      let maxLength = col.header.length;
      col.eachCell?.({ includeEmpty: true }, cell => {
        maxLength = Math.max(maxLength, (cell.value || '').toString().length);
      });
      col.width = maxLength + 2;
    });
    breedingSheet.views = [{ state: 'frozen', ySplit: 1 }];

    // Sending the Excel file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=reptile_data.xlsx');
    workbook.worksheets.sort((a, b) => {
      const order = [req.t('reptiles'), req.t('feedings'), req.t('events'), req.t('breeding'), req.t('hatchlings')];
      return order.indexOf(a.name) - order.indexOf(b.name);
    });

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Excel export error:', err);
    res.status(500).send({ message: req.t('export_error') });
  }
};


export async function generateReptilePDF(req, res) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  const reptileId = req.params.id;

  try {
    const userId = req.user.userid;
    const user = await User.findById(userId);
    const { plan } = getUserPlan(user);

    if (plan === 'free') {
      return res.status(403).json({
        message: req.t('basic_plan')
      });
    }

    const reptile = await Reptile.findById(reptileId).lean();

    const events = await Event.find({ reptile: reptileId }).sort({ date: -1 }).lean();
    const feedings = await Feeding.find({ reptile: reptileId }).sort({ date: -1 }).lean();
    const breedings = await Breeding.find({
      $or: [{ male: reptileId }, { female: reptileId }]
    }).populate('male female').lean();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${(reptile.morph || req.t('reptiles')).replace(/\s+/g, '_')}.pdf`
    );
    doc.pipe(res);

    // --- Header ---
    doc
      .font('Helvetica-Bold')
      .fontSize(26)
      .fillColor('#2E8B57')
      .text(`${req.t('reptiles')} ${reptile.name || ''}`, { underline: true, align: 'center' })
      .moveDown(1.5);

    // --- Basic Information ---
    doc.fontSize(14).fillColor('black').font('Helvetica');
    doc.text(req.t('Information'), { underline: true });
    doc.moveDown(0.5);

    const baseInfo = [
      `${req.t('species')}: ${reptile.species || req.t('n_a')}`,
      `${req.t('sex')}: ${reptile.sex === 'M' ? req.t('male_morph') : reptile.sex === 'F' ? req.t('female_morph') : req.t('unknown')}`,
      `${req.t('morph')}: ${reptile.morph || req.t('n_a')}`,
      `${req.t('birth_date')}: ${reptile.birthDate ? reptile.birthDate.toLocaleDateString() : req.t('n_a')}`,
      `${req.t('notes')}: ${reptile.notes || req.t('n_a')}`,
      `${req.t('mother')}: ${reptile.parents?.mother || req.t('n_a')}`,
      `${req.t('father')}: ${reptile.parents?.father || req.t('n_a')}`,
      `${req.t('price')}: ${reptile.price?.amount || req.t('n_a')}`,
      `${req.t('priceCurrency')}: ${reptile.price?.currency || req.t('n_a')}`,


    ];
    baseInfo.forEach(line => doc.text(line));
    doc.moveDown();

    // --- Documentation ---
    doc.fontSize(16).fillColor('#2E8B57').font('Helvetica-Bold').text(req.t('Documentazione'), { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(12).fillColor('black').font('Helvetica');

    if (reptile.documents?.cites?.number) {
      doc.list([
        `${req.t('cites_number')}: ${reptile.documents.cites.number} (${reptile.documents.cites.issueDate?.toLocaleDateString() || req.t('unknown')})`
      ]);
    }
    if (reptile.documents?.microchip?.code) {
      doc.list([
        `${req.t('microchip_code')}: ${reptile.documents.microchip.code} (${reptile.documents.microchip.implantDate?.toLocaleDateString() || req.t('unknown')})`
      ]);
    }
    if (!reptile.documents?.cites?.number && !reptile.documents?.microchip?.code) {
      doc.text(req.t('No_documentation_available'));
    }
    doc.moveDown();

    // --- Recorded events ---
    doc.fontSize(16).fillColor('#2E8B57').font('Helvetica-Bold').text(req.t('events'), { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(12).fillColor('black').font('Helvetica');

    if (events.length === 0) {
      doc.text(req.t('Nessun evento registrato.'));
    } else {
      const eventi = events.map(event => {
        const labelMap = {
          shed: req.t('shed'),
          feces: req.t('feces'),
          vet: req.t('vet_visit'),
          weight: req.t('weight')
        };
        const label = labelMap[event.type] || event.type;
        const pesoInfo = event.type === 'weight' && event.weight ? ` (${event.weight}g)` : '';
        return `- ${label}: ${new Date(event.date).toLocaleDateString()}${pesoInfo} | ${req.t('notes')}: ${event.notes || req.t('n_a')}`;
      });
      doc.list(eventi);
    }
    doc.moveDown();

    // --- Diet ---
    doc.fontSize(16).fillColor('#2E8B57').font('Helvetica-Bold').text(req.t('feedings'), { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(12).fillColor('black').font('Helvetica');

    if (feedings.length === 0) {
      doc.text(req.t('No_meals_recorded'));
    } else {
      const pasti = feedings.map(feed =>
        `- ${new Date(feed.date).toLocaleDateString()} | ${feed.foodType} x${feed.quantity || 1} (${feed.weightPerUnit}g ${req.t('each')}) | ${req.t('eaten')}: ${feed.wasEaten ? req.t('yes') : req.t('no')}${feed.retryAfterDays ? ` | ${req.t('retry_after_days')}: ${feed.retryAfterDays}` : ''} | ${req.t('notes')}: ${feed.notes || req.t('n_a')}`
      );
      doc.list(pasti);
    }
    doc.moveDown();

    // --- Pairings ---
    doc.fontSize(16).fillColor('#2E8B57').font('Helvetica-Bold').text(req.t('breeding'), { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(12).fillColor('black').font('Helvetica');

    if (breedings.length === 0) {
      doc.text(req.t('No_pairings_recorded'));
    } else {
      breedings.forEach(b => {
        const maschio = b.male?.morph || req.t('male_morph');
        const femmina = b.female?.morph || req.t('female_morph');

        doc.text(`- ${req.t('year')}: ${b.year} | ${req.t('male_morph')}: ${maschio} | ${req.t('female_morph')}: ${femmina}`);

        const outcomes = {
          Success: req.t('Success'),
          Partial: req.t('Partial'),
          Failed: req.t('failed'),
          Unknown: req.t('Unfinished')
        };
        doc.text(`  ${req.t('outcome')}: ${outcomes[b.outcome] || b.outcome}`);

        if (b.notes) doc.text(`  ${req.t('notes')}: ${b.notes}`);

        const eventiTradotti = {
          Mating: req.t('mating'),
          Ovulation: req.t('ovulation'),
          'Prelay Shed': req.t('prelay_shed'),
          'Egg Laid': req.t('egg_laid'),
          Birth: req.t('birth'),
          Hatching: req.t('hatching'),
          Failed: req.t('failed')
        };
        if (b.events?.length) {
          b.events.forEach(evt => {
            const nomeEvento = eventiTradotti[evt.type] || evt.type;
            doc.text(`    • ${nomeEvento}: ${new Date(evt.date).toLocaleDateString()} | ${req.t('notes')}: ${evt.notes || req.t('n_a')}`);
          });
        }

        if (b.hatchlings?.length) {
          doc.text(`   ${req.t('hatchlings')}:`);
          b.hatchlings.forEach(h => {
            doc.text(`      - ${req.t('morph')}: ${h.morph || req.t('n_a')} | ${req.t('weight')}: ${h.weight || req.t('n_a')}g | ${req.t('sex')}: ${h.sex || req.t('n_a')}`);
          });
        }

        doc.moveDown(0.8);
      });
    }

    doc.end();

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).send(req.t('export_error'));
  }
}
