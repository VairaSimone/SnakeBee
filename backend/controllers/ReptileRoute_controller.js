import Reptile from "../models/Reptile.js";
import mongoose from 'mongoose';
import Feeding from "../models/Feeding.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { getUserPlan } from '../utils/getUserPlans.js'
import { parseDateOrNull } from '../utils/parseReptileHelpers.js';
import { deleteFileIfExists } from "../utils/deleteFileIfExists.js";
import { logAction } from "../utils/logAction.js";
import QRCode from 'qrcode';
import Event from "../models/Event.js";

async function checkPublicReptileLimit(user, limits, plan, t) {
    const publicLimit = limits.publicReptiles;

    // Breeder (null) ha limiti infiniti
    if (publicLimit === null) {
        return { allowed: true };
    }

    const currentPublicCount = await Reptile.countDocuments({
        user: user._id,
        status: 'active',
        isPublic: true
    });

    if (currentPublicCount >= publicLimit) {
        return {
            allowed: false,
            message: t('public_reptile_limit', { count: publicLimit, plan: plan })
        };
    }

    return { allowed: true };
}

export const GetAllReptile = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const perPage = parseInt(req.query.perPage) || 20;

        const reptile = await Reptile.find({ status: 'active' })
            .sort({ species: 1 })
            .skip((page - 1) * perPage)
            .limit(perPage);

        const totalResults = await Reptile.countDocuments({ status: 'active' });
        const totalPages = Math.ceil(totalResults / perPage);

        res.send({
            dati: reptile,
            totalPages,
            totalResults,
            page,
        });
    } catch (err) {
        res.status(500).send();
    }
};


export const GetIDReptile = async (req, res) => {
    try {
        const id = req.params.reptileId;
        const reptile = await Reptile.findById(id)

        if (!reptile) res.status(404).send();
        if (reptile.status !== 'active' && reptile.user.toString() !== req.user.userid) {
            return res.status(404).send({ message: req.t('reptile_notFound') });
        }
        else res.send(reptile);
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: req.t('reptile_notFound') });
    }
};

export const GetAllReptileByUser = async (req, res) => {
    try {
        const userId = req.user.userid;
        const reptile = await Reptile.find({ user: userId, status: 'active' })
            .sort({ species: 1 })
        if (!reptile || reptile.length === 0) {
            return res.status(404).send({ message: req.t('reptile_notFoundID') });
        }

        res.send({
            dati: reptile,
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: req.t('server_error') });
    }
};

// Localizzazione: controllers/ReptileRoute_controller.js

export const GetReptileByUser = async (req, res) => {
    try {
        const userId = req.user.userid;
        const page = parseInt(req.query.page) || 1;
        const perPage = parseInt(req.query.perPage) || 24;
        const { filterMorph, filterSpecies, filterSex, filterBreeder, filterName, filterFeedingSoon } = req.query;

        const sortKey = req.query.sortKey || 'name';
        const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;

        const matchQuery = { user: userId, status: 'active' };

        if (filterName) matchQuery.name = { $regex: filterName, $options: 'i' };
        if (filterMorph) matchQuery.morph = { $regex: filterMorph, $options: 'i' };
        if (filterSpecies) matchQuery.species = { $regex: filterSpecies, $options: 'i' };
        if (filterSex) matchQuery.sex = filterSex;
        if (filterBreeder) matchQuery.isBreeder = filterBreeder === 'true';

        // MIGLIORAMENTO: Parsing booleano più sicuro
        if (String(filterFeedingSoon) === 'true') {
            const today = new Date();
            // Impostiamo alla fine della giornata per includere chi deve mangiare oggi
            today.setHours(23, 59, 59, 999);

            // Filtro: data prossima alimentazione <= oggi (scaduti o oggi)
            // Usiamo $lte (less than or equal)
            matchQuery.nextFeedingDate = { $ne: null, $lte: today };
        }

        let sortOptions = {};
        sortOptions[sortKey] = sortOrder;

        const reptiles = await Reptile.find(matchQuery)
            .collation({ locale: "en", strength: 2 })
            .sort(sortOptions)
            .skip((page - 1) * perPage)
            .limit(perPage);

        const totalResults = await Reptile.countDocuments(matchQuery);
        const totalPages = Math.ceil(totalResults / perPage);

        res.send({
            dati: reptiles,
            totalPages,
            totalResults,
            page,
        });

    } catch (err) {
        console.error("Errore GetReptileByUser:", err);
        res.status(500).send({ message: req.t('server_error') });
    }
};// NUOVO: Controller per animali archiviati (ceduti/deceduti)
export const GetArchivedReptileByUser = async (req, res) => {
    try {
        const userId = req.user?.userid; // Accesso sicuro a userid
        if (!userId) { // Controllo aggiunto per userId valido
            console.error("GetArchivedReptileByUser Error: Missing userId");
            // Usiamo req.t se disponibile, altrimenti stringa di default
            const message = req.t ? req.t('auth_required') : 'Authentication required';
            return res.status(401).send({ message });
        }

        const page = parseInt(req.query.page) || 1;
        const perPage = parseInt(req.query.perPage) || 24;
        const { filterSpecies, filterStatus } = req.query;
        const sortKey = req.query.sortKey || 'species';
        const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;

        let matchQuery;
        try {
            matchQuery = {
                user: new mongoose.Types.ObjectId(userId), // Assicurati che ObjectId sia valido
                // status: { $in: ['ceded', 'deceased'] } // Rimosso temporaneamente per applicare logica sotto
            };
        } catch (idError) {
            console.error("GetArchivedReptileByUser Error: Invalid userId format", idError);
            const message = req.t ? req.t('invalid_user_id') : 'Invalid user ID format';
            return res.status(400).send({ message });
        }


        if (filterSpecies) {
            matchQuery.species = { $regex: filterSpecies, $options: 'i' };
        }

        // Logica raffinata per filterStatus
        if (filterStatus && ['ceded', 'deceased'].includes(filterStatus)) {
            matchQuery.status = filterStatus; // Sovrascrive $in se uno stato specifico è richiesto
        } else {
            // Se non specificato filterStatus o se non valido, prendi entrambi
            matchQuery.status = { $in: ['ceded', 'deceased'] };
        }

        const aggregationPipeline = [
            { $match: matchQuery },
            {
                $addFields: {
                    // Campo statusDate calcolato in modo più robusto
                    statusDate: {
                        $ifNull: [ // Gestisce il caso in cui il campo data sia assente/null
                            {
                                $cond: {
                                    if: { $eq: ["$status", "ceded"] },
                                    then: "$cededTo.date",
                                    else: { // Accedi a deceasedDetails solo se lo status è deceased
                                        $cond: {
                                            if: { $eq: ["$status", "deceased"] },
                                            then: "$deceasedDetails.date",
                                            else: null // Esplicitamente null per altri status (se mai inclusi)
                                        }
                                    }
                                }
                            },
                            null // Fallback se il campo data è mancante/null
                        ]
                    }
                }
            }
        ];

        // Validazione e aggiunta dello stage di ordinamento
        const validSortKeys = ['species', 'name', 'morph', 'statusDate', 'status', 'birthDate']; // Aggiungi chiavi valide
        const effectiveSortKey = validSortKeys.includes(sortKey) ? sortKey : 'statusDate'; // Default a statusDate se chiave non valida
        const sortStage = { $sort: { [effectiveSortKey]: sortOrder } };
        aggregationPipeline.push(sortStage);

        // Aggiungi paginazione
        aggregationPipeline.push(
            {
                $facet: {
                    metadata: [{ $count: 'totalResults' }],
                    dati: [
                        { $skip: (page - 1) * perPage },
                        { $limit: perPage }
                    ]
                }
            }
        );

        // Log della pipeline per debugging (puoi rimuoverlo in produzione)
        // console.log("GetArchivedReptileByUser Pipeline:", JSON.stringify(aggregationPipeline, null, 2));

        const results = await Reptile.aggregate(aggregationPipeline).collation({ locale: "en", strength: 2 });

        // Accesso sicuro ai risultati dell'aggregazione
        const dati = results[0]?.dati || [];
        const totalResults = results[0]?.metadata[0]?.totalResults || 0;
        const totalPages = Math.ceil(totalResults / perPage);

        res.send({
            dati,
            totalPages,
            totalResults,
            page,
        });

    } catch (err) {
        // Log dettagliato dell'errore sul server
        console.error("Error in GetArchivedReptileByUser execution:", err);

        // Invia una risposta di errore più informativa (utile per il debug)
        const message = req.t ? req.t('server_error') : 'Internal Server Error';
        res.status(500).send({
            message: message,
            // Includi il messaggio di errore specifico solo se sei in ambiente di sviluppo
            error: process.env.NODE_ENV === 'development' ? err.message : undefined,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined // Opzionale: stack trace in sviluppo
        });
    }
};
export const PostReptile = async (req, res) => {
    try {
        // MODIFICA: Aggiunto previousOwner
        const { name, species, morph, birthDate, sex, isBreeder, notes, parents, documents, foodType, weightPerUnit, nextMealDay, previousOwner, isPublic, pcrTests, purchasePrice } = req.body;
        const userId = req.user.userid;

        let parsedParents = typeof parents === 'string' ? JSON.parse(parents) : parents;
        let parsedDocuments = typeof documents === 'string' ? JSON.parse(documents) : documents;
        let parsedPcrTests = typeof pcrTests === 'string' ? JSON.parse(pcrTests) : (pcrTests || []);
        let parsedPurchasePrice = undefined;
        if (purchasePrice) {
            parsedPurchasePrice = typeof purchasePrice === 'string' ? JSON.parse(purchasePrice) : purchasePrice;
        }
        const user = await User.findById(userId);
        const { plan: userPlan, limits } = getUserPlan(user);
        const reptileCount = await Reptile.countDocuments({ user: userId, status: 'active' });
        const normalizedFoodType = foodType && foodType.trim() !== '' ? foodType : 'Altro';


        if (reptileCount >= limits.reptiles) {
            return res.status(400).json({
                message: req.t('reptile_limit', { reptiles: limits.reptiles, plan: userPlan })
            });

        }
        const isPublicBool = isPublic === 'true' || isPublic === true;
        if (isPublicBool) {
            const limitCheck = await checkPublicReptileLimit(user, limits, userPlan, req.t);
            if (!limitCheck.allowed) {
                return res.status(400).json({ message: limitCheck.message });
            }
        }

        let imageUrls = [];
        let citesFileUrl = null;

        if (req.files) {
            // Gestione Immagini
            if (req.files['image'] && req.files['image'].length > 0) {
                if (req.files['image'].length > limits.imagesPerReptile) {
                    return res.status(400).json({
                        message: req.t('reptile_limit_image', { imagesPerReptile: limits.imagesPerReptile, plan: userPlan })
                    });
                }
                imageUrls = req.files['image'].map(file => `/uploads/${file.filename}`);
            }

            // Gestione File CITES
            if (req.files['citesFile'] && req.files['citesFile'].length > 0) {
                citesFileUrl = `/uploads/${req.files['citesFile'][0].filename}`;
            }
        }

        if (citesFileUrl) {
            if (!parsedDocuments) parsedDocuments = {};
            if (!parsedDocuments.cites) parsedDocuments.cites = {};
            parsedDocuments.cites.fileUrl = citesFileUrl;
        }
        const birthDateObject = parseDateOrNull(birthDate);
        const newReptile = new Reptile({
            _id: new mongoose.Types.ObjectId(),
            name,
            species,
            morph,
            user: userId,
            image: imageUrls,
            birthDate: birthDateObject,
            sex,
            isBreeder,
            purchasePrice: parsedPurchasePrice, // Aggiunto
            notes,
            previousOwner, // MODIFICA: Aggiunto campo
            weightPerUnit,
            foodType: normalizedFoodType,
            pcrTests: parsedPcrTests,
            nextMealDay,
            parents: parsedParents,
            documents: parsedDocuments, // Questo salva già i dati CITES (load/unload)
            status: 'active',
            isPublic: isPublicBool
        });

        const createdReptile = await newReptile.save();
        const publicUrl = `${process.env.FRONTEND_URL}/public/reptile/${createdReptile._id}`;

        const qrCodeDataUrl = await QRCode.toDataURL(publicUrl);
        createdReptile.qrCodeUrl = qrCodeDataUrl;
        await createdReptile.save();
        await logAction(req.user.userid, "Create reptile");

        res.status(201).send(createdReptile);
    } catch (error) {
        console.error(error);
        res.status(400).send({ message: req.t('reptileCreation_error') });
    }
};

export const PutReptile = async (req, res) => {
    try {

        const id = req.params.reptileId;
        const user = await User.findById(req.user.userid);
        const { plan: userPlan, limits } = getUserPlan(user);

        const { name, species, morph, sex, notes, birthDate, isBreeder, price, label, parents, documents, foodType, weightPerUnit, nextMealDay, status, cededTo, deceasedDetails, previousOwner, isPublic, pcrTests } = req.body;
        let parsedParents, parsedDocuments, parsedCededTo, parsedDeceasedDetails, parsedPcrTests; // Aggiungi la variabile
        if ('parents' in req.body) {
            parsedParents = typeof req.body.parents === 'string'
                ? JSON.parse(req.body.parents)
                : req.body.parents;
        }
        if ('pcrTests' in req.body) {
            parsedPcrTests = typeof req.body.pcrTests === 'string' ? JSON.parse(req.body.pcrTests) : req.body.pcrTests;
        }
        if ('documents' in req.body) {
            parsedDocuments = typeof req.body.documents === 'string'
                ? JSON.parse(req.body.documents)
                : req.body.documents;
        }

        if ('cededTo' in req.body) {
            parsedCededTo = typeof req.body.cededTo === 'string'
                ? JSON.parse(req.body.cededTo)
                : req.body.cededTo;
        }
        if ('deceasedDetails' in req.body) {
            parsedDeceasedDetails = typeof req.body.deceasedDetails === 'string'
                ? JSON.parse(req.body.deceasedDetails)
                : req.body.deceasedDetails;
        }

        let reptile = await Reptile.findById(id);

        if (!reptile) {
            return res.status(404).send({ message: req.t('reptile_notFound') });
        }

        if ('isPublic' in req.body) {
            const isPublicBool = isPublic === 'true' || isPublic === true;

            // Controlla solo se l'utente sta cercando di impostarlo a true
            // e prima era false (per non bloccare se lo sta togliendo)
            if (isPublicBool === true && reptile.isPublic === false) {
                const limitCheck = await checkPublicReptileLimit(user, limits, userPlan, req.t);
                if (!limitCheck.allowed) {
                    return res.status(400).json({ message: limitCheck.message });
                }
            }
            reptile.isPublic = isPublicBool; // Applica la modifica
        }

        let imageUrls = reptile.image || [];

        if (req.files) {
            // 1. Gestione Immagini
            if (req.files['image'] && req.files['image'].length > 0) {
                const currentImageCount = imageUrls.length;
                const newImageCount = req.files['image'].length;
                const totalImages = currentImageCount + newImageCount;

                if (totalImages > limits.imagesPerReptile) {
                    return res.status(400).json({
                        message: req.t('reptile_limit_image', { imagesPerReptile: limits.imagesPerReptile, plan: userPlan })
                    });
                }
                const newImages = req.files['image'].map(file => `/uploads/${file.filename}`);
                imageUrls = [...imageUrls, ...newImages];
            }

            // 2. Gestione Aggiornamento CITES File
            if (req.files['citesFile'] && req.files['citesFile'].length > 0) {
                const newCitesUrl = `/uploads/${req.files['citesFile'][0].filename}`;

                // Se esiste già un vecchio file CITES, eliminiamolo per non occupare spazio
                if (reptile.documents?.cites?.fileUrl) {
                    await deleteFileIfExists(reptile.documents.cites.fileUrl);
                }

                if (!parsedDocuments) parsedDocuments = reptile.documents || {};
                if (!parsedDocuments.cites) parsedDocuments.cites = {};
                parsedDocuments.cites.fileUrl = newCitesUrl;
            }
        }

        // Se non è stato caricato un nuovo file CITES, mantieni quello vecchio
        if (parsedDocuments && reptile.documents?.cites?.fileUrl && !req.files?.['citesFile']) {
            if (!parsedDocuments.cites) parsedDocuments.cites = {};
            parsedDocuments.cites.fileUrl = reptile.documents.cites.fileUrl;
        }
        if ('price' in req.body) {
            let parsedPrice = req.body.price;

            try {
                if (typeof parsedPrice === 'string') {
                    parsedPrice = JSON.parse(parsedPrice);
                }

                if (parsedPrice === null) {
                    reptile.price = undefined;
                } else if (typeof parsedPrice === 'object' && parsedPrice.amount !== undefined) {
                    const amount = Number(parsedPrice.amount);

                    if (!isNaN(amount) && amount >= 0) {
                        reptile.price = {
                            amount,
                            currency: parsedPrice.currency && ['EUR', 'USD', 'GBP', 'JPY', 'CHF'].includes(parsedPrice.currency)
                                ? parsedPrice.currency
                                : reptile.price?.currency || 'EUR'
                        };
                    }
                }
            } catch (err) {
                console.warn('Invalid price format:', req.body.price);
            }
        }

        if ('purchasePrice' in req.body) {
            let parsedPurchasePrice = req.body.purchasePrice;
            try {
                if (typeof parsedPurchasePrice === 'string') {
                    parsedPurchasePrice = JSON.parse(parsedPurchasePrice);
                }
                if (parsedPurchasePrice === null) {
                    reptile.purchasePrice = undefined;
                } else if (typeof parsedPurchasePrice === 'object' && parsedPurchasePrice.amount !== undefined) {
                    const amount = Number(parsedPurchasePrice.amount);
                    if (!isNaN(amount) && amount >= 0) {
                        reptile.purchasePrice = {
                            amount,
                            currency: parsedPurchasePrice.currency && ['EUR', 'USD', 'GBP', 'JPY', 'CHF'].includes(parsedPurchasePrice.currency)
                                ? parsedPurchasePrice.currency
                                : reptile.purchasePrice?.currency || 'EUR'
                        };
                    }
                }
            } catch (err) {
                console.warn('Invalid purchasePrice format:', req.body.purchasePrice);
            }
        }
        // MODIFICA 1: Usa parseDateOrNull per birthDate
        const birthDateObject = parseDateOrNull(birthDate);
        await logAction(req.user.userid, "Modify reptile");

        if ('name' in req.body) reptile.name = name;
        reptile.species = species || reptile.species;
        reptile.morph = morph !== undefined ? morph : reptile.morph;
        // Applica la data di nascita solo se è stata effettivamente inviata nel body
        // (Altrimenti birthDateObject sarebbe null e cancellerebbe la data esistente)
        if ('birthDate' in req.body) {
            reptile.birthDate = birthDateObject;
        }

        reptile.image = imageUrls;
        reptile.sex = sex || reptile.sex;
        reptile.foodType = foodType;
        reptile.weightPerUnit = weightPerUnit;
        reptile.nextMealDay = nextMealDay;

        if ('label' in req.body) {
            try {
                reptile.label = typeof req.body.label === 'string'
                    ? JSON.parse(req.body.label)
                    : req.body.label;
            } catch (err) {
                console.warn('Non-parsable label:', req.body.label);
            }
        }

        reptile.isBreeder = isBreeder === 'true' || isBreeder === true;
        if ('notes' in req.body) reptile.notes = notes;
        if ('previousOwner' in req.body) reptile.previousOwner = previousOwner;
        if ('parents' in req.body) reptile.parents = parsedParents;
        if ('documents' in req.body) reptile.documents = parsedDocuments;
        if ('pcrTests' in req.body) reptile.pcrTests = parsedPcrTests;
        if ('status' in req.body && ['active', 'ceded', 'deceased', 'other'].includes(status)) {
            reptile.status = status;
            if (status !== 'active') {
                reptile.isPublic = false;
            }
            if (status === 'ceded' && parsedCededTo) {
                reptile.cededTo = {
                    name: parsedCededTo.name,
                    surname: parsedCededTo.surname,
                    notes: parsedCededTo.notes,
                    // MODIFICA 2: Usa parseDateOrNull
                    date: parseDateOrNull(parsedCededTo.date)
                };
                reptile.deceasedDetails = undefined; // Pulisce l'altro stato
            } else if (status === 'deceased' && parsedDeceasedDetails) {
                reptile.deceasedDetails = {
                    notes: parsedDeceasedDetails.notes,
                    // MODIFICA 3: Usa parseDateOrNull
                    date: parseDateOrNull(parsedDeceasedDetails.date)
                };
                reptile.cededTo = undefined; // Pulisce l'altro stato
            } else if (status === 'active') {
                // Se l'animale torna attivo, puliamo i dettagli
                reptile.cededTo = undefined;
                reptile.deceasedDetails = undefined;
            }
        }
        const updatedReptile = await reptile.save();

        res.send(updatedReptile);
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: req.t('reptileUpdate_error') });
    }
};

export const DeleteReptileImage = async (req, res) => {
    try {
        const { reptileId, imageIndex } = req.params;

        const reptile = await Reptile.findById(reptileId);
        if (!reptile) return res.status(404).json({ message: req.t('reptile_notFound') });

        const index = parseInt(imageIndex);
        if (isNaN(index) || index < 0 || index >= reptile.image.length) {
            return res.status(400).json({ message: req.t('invalid_value') });
        }

        const imageToRemove = reptile.image[index];
        await deleteFileIfExists(imageToRemove);
        reptile.image.splice(index, 1);
        await reptile.save();

        await logAction(req.user.userid, `Delete reptile image at index ${index}`);

        res.status(200).json({
            message: req.t('imageDelete'),
            remainingImages: reptile.image
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: req.t('imageDelete_error') });
    }
};


export const DeleteReptile = async (req, res) => {
    try {
        const reptileId = req.params.reptileId;
        const reptile = await Reptile.findById(reptileId);
        if (!reptile) return res.status(404).send({ message: req.t('reptile_notFound') });
        if (reptile.image && reptile.image.length > 0) {
            for (const imgPath of reptile.image) {
                await deleteFileIfExists(imgPath);
            }
        }
        if (reptile.documents?.cites?.fileUrl) {
            await deleteFileIfExists(reptile.documents.cites.fileUrl);
        }
        await Feeding.deleteMany({ reptile: reptileId });

        await Notification.deleteMany({ reptile: reptileId });
        await Event.deleteMany({ reptile: reptileId });
        await Reptile.findByIdAndDelete(reptileId);
        await logAction(req.user.userid, "Delete reptile");

        res.send({ message: req.t('reptile_delete') });
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: req.t('server_error') });
    }
};


export const GetReptilePublic = async (req, res) => {
    try {
        const reptileId = req.params.reptileId;
        const reptile = await Reptile.findById(reptileId)
            .populate("user", "subscription name email address phoneNumber");

        if (!reptile) {
            return res.status(404).send({ message: req.t("reptile_notFound") });
        }
        if (reptile.status !== 'active') {
            return res.status(404).send({ message: req.t("reptile_notFound") });
        }
        if (!reptile.qrCodeUrl) {
            return res.status(404).send({ message: req.t("reptile_notFound") });
        }
        const { plan, status } = reptile.user.subscription;

        const isPremiumActive =
            plan !== "NEOPHYTE" &&
            ["active", "processing", "incomplete"].includes(status);

        if (!isPremiumActive) {
            return res.status(404).send({ message: req.t("reptile_notFound") });
        }
        const feedings = await Feeding.find({ reptile: reptileId })
            .sort({ date: -1 })
            .lean();

        const events = await Event.find({ reptile: reptileId })
            .sort({ date: -1 })
            .lean();

        const reptileData = reptile.toObject();

        const owner = {
            name: reptile.user.name,
            email: reptile.user.email,
            phoneNumber: reptile.user.phoneNumber,
            address: reptile.user.address

        };

        delete reptileData.user;

        res.send({
            reptile: reptileData,
            owner,
            feedings,
            events,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: req.t("server_error") });
    }
};

import XLSX from 'xlsx';

const setNestedProperty = (obj, path, value) => {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
};

export const ImportReptiles = async (req, res) => {
    try {
        if (!req.file) return res.status(400).send({ message: "Nessun file caricato" });

        const userId = req.user.userid;
        const user = await User.findById(userId);
        const { plan: userPlan, limits } = getUserPlan(user);

        // 1. Controllo Limiti Attuali
        const currentCount = await Reptile.countDocuments({ user: userId, status: 'active' });
        const remainingSlots = limits.reptiles - currentCount;

        if (remainingSlots <= 0) {
            return res.status(400).json({
                message: req.t('reptile_limit', { reptiles: limits.reptiles, plan: userPlan })
            });
        }

        // 2. Lettura File
        const workbook = XLSX.readFile(req.file.path, { cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const rawData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        if (rawData.length === 0) return res.status(400).send({ message: "File vuoto" });

        // 3. Limitiamo i dati al numero di slot rimanenti
        const dataToImport = rawData.slice(0, remainingSlots);
        const skippedCount = rawData.length - dataToImport.length;

        // 4. Mapping Dinamico Esteso
        const fieldMapping = {
            'name': ['nome', 'name', 'identificativo', 'id'],
            'species': ['specie', 'species', 'scientific name', 'specie scientifica'],
            'morph': ['morph', 'morfo', 'colorazione', 'mutazione'],
            'sex': ['sesso', 'sex', 'gender'],
            'birthDate': ['nascita', 'birth', 'data nascita', 'dob', 'birthdate'],
            'notes': ['note', 'notes', 'descrizione', 'description'],
            'status': ['stato', 'status', 'condizione'],
            'isBreeder': ['riproduttore', 'breeder', 'isbreeder'],
            'previousOwner': ['proprietario precedente', 'allevatore', 'previous owner'],
            'foodType': ['tipo cibo', 'food type', 'alimentazione'],
            'weightPerUnit': ['peso cibo', 'food weight', 'peso preda'],
            'nextMealDay': ['giorno pasto', 'meal day', 'intervallo pasto'],

            // Nested Fields
            'price.amount': ['prezzo', 'price', 'prezzo vendita', 'sale price'],
            'price.currency': ['valuta prezzo', 'price currency', 'valuta vendita'],
            'purchasePrice.amount': ['prezzo acquisto', 'purchase price', 'costo', 'costo iniziale'],
            'purchasePrice.currency': ['valuta acquisto', 'purchase currency', 'valuta costo'],
            'parents.father': ['padre', 'father', 'sire'],
            'parents.mother': ['madre', 'mother', 'dam'],
            'documents.cites.number': ['numero cites', 'cites', 'cites number'],
            'documents.cites.issueDate': ['data cites', 'cites date', 'emissione cites'],
            'documents.microchip.code': ['microchip', 'numero microchip', 'chip']
        };

        const blacklist = [
            'isPublic',
            'isSold',
            'lastFeedingDate',
            'nextFeedingDate',
            'qrCodeUrl',
            'label.text',
            'label.color'
        ];

        const validSchemaPaths = Object.keys(Reptile.schema.paths);

        // MODIFICA: Passiamo l'index per tracciare il numero di riga reale del file Excel
        const reptilesToInsert = await Promise.all(dataToImport.map(async (row, index) => {
            const newId = new mongoose.Types.ObjectId();
            const mappedReptile = { _id: newId, user: userId, status: 'active' };

            // Calcolo riga Excel (index 0 corrisponde alla riga 2 del file, dato che la riga 1 ha i testi delle colonne)
            const excelRowNumber = index + 2;

            Object.keys(row).forEach(userHeader => {
                const cleanHeader = userHeader.toLowerCase().trim();
                const cellValue = row[userHeader];

                if (cellValue === undefined || cellValue === null || cellValue === '') return;

                let targetField = null;

                for (const [dbField, aliases] of Object.entries(fieldMapping)) {
                    if (aliases.includes(cleanHeader)) {
                        targetField = dbField;
                        break;
                    }
                }

                if (!targetField && validSchemaPaths.includes(userHeader)) {
                    targetField = userHeader;
                }

                if (targetField && blacklist.includes(targetField)) {
                    return;
                }

                if (targetField) {
                    let finalValue = cellValue;

                    if (['isBreeder'].includes(targetField)) {
                        const strVal = String(cellValue).toLowerCase().trim();
                        finalValue = ['si', 'sì', 'yes', 'true', '1', 'v', 'vero'].includes(strVal);
                    }
                    if (targetField === 'status') {
                        const strVal = String(cellValue).toLowerCase().trim();
                        if (['attivo', 'active', 'vivo', 'in allevamento'].includes(strVal)) {
                            finalValue = 'active';
                        } else if (['ceduto', 'venduto', 'ceded', 'sold'].includes(strVal)) {
                            finalValue = 'ceded';
                        } else if (['deceduto', 'morto', 'deceased', 'dead'].includes(strVal)) {
                            finalValue = 'deceased';
                        } else {
                            finalValue = 'other';
                        }
                    }

                    // MODIFICA CRITICA: Gestione e Blocco immediato su Date Invalide
// GESTIONE E VALIDAZIONE RIGIDA DELLE DATE
if (targetField.toLowerCase().includes('date') || targetField === 'birthDate' || targetField.endsWith('.issueDate')) {
    let validatedDate = null;

    if (cellValue instanceof Date) {
        validatedDate = cellValue;
    } else {
        // Se è una stringa (es. "15/05/2023"), proviamo a fare il parsing manuale standard italiano
        const dateStr = String(cellValue).trim();
        
        // Verifica formato GG/MM/AAAA o GG-MM-AAAA
        const parts = dateStr.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
        if (parts) {
            const day = parseInt(parts[1], 10);
            const month = parseInt(parts[2], 10) - 1; // I mesi in JS vanno da 0 a 11
            const year = parseInt(parts[3], 10);
            const d = new Date(year, month, day, 12, 0, 0); // impostiamo a mezzogiorno per evitare problemi di fuso orario
            
            if (!isNaN(d.getTime()) && d.getDate() === day && d.getMonth() === month) {
                validatedDate = d;
            }
        } else {
            // Se non corrisponde al pattern italiano, prova il parser di fallback del tuo sistema
            validatedDate = typeof parseDateOrNull === 'function' ? parseDateOrNull(cellValue) : new Date(cellValue);
        }
    }

    // Controllo finale: se la data è invalida o l'oggetto Date non è corretto, blocca prima di Mongoose
    if (!validatedDate || isNaN(validatedDate.getTime()) || validatedDate.toString() === "Invalid Date") {
        throw new Error(`Riga ${excelRowNumber}: Il formato o il valore della data nel campo "${userHeader}" ("${cellValue}") non è valido. Usa il formato GG/MM/AAAA.`);
    }

    finalValue = validatedDate;
}

                    setNestedProperty(mappedReptile, targetField, finalValue);
                }
            });

            // MODIFICA CRITICA: Validazione rigida dei dati obbligatori
            if (!mappedReptile.species || mappedReptile.species.trim() === '') {
                throw new Error(`Riga ${excelRowNumber}: Il campo 'Specie' è obbligatorio e manca nel file.`);
            }

            if (!mappedReptile.sex) {
                throw new Error(`Riga ${excelRowNumber}: Il campo 'Sesso' è obbligatorio.`);
            } else {
                const s = mappedReptile.sex.toString().toUpperCase().trim();
                if (s.startsWith('M')) mappedReptile.sex = 'M';
                else if (s.startsWith('F')) mappedReptile.sex = 'F';
                else if (['UNKNOWN', 'SCONOSCIUTO', 'U'].includes(s)) mappedReptile.sex = 'Unknown';
                else {
                    throw new Error(`Riga ${excelRowNumber}: Il sesso inserito ("${mappedReptile.sex}") non è valido. Usa M, F o Unknown.`);
                }
            }

            // GENERAZIONE QR CODE
            try {
                const publicUrl = `${process.env.FRONTEND_URL}/public/reptile/${newId}`;
                mappedReptile.qrCodeUrl = await QRCode.toDataURL(publicUrl);
            } catch (err) {
                console.error("Errore generazione QR Code durante import:", err);
                mappedReptile.qrCodeUrl = null;
            }

            return mappedReptile;
        }));

        // 5. Inserimento Massivo
        await Reptile.insertMany(reptilesToInsert);

        // Pulizia file temporaneo
        if (req.file.path) {
            await deleteFileIfExists(req.file.path);
        }

        res.status(201).send({
            message: `Importati con successo ${reptilesToInsert.length} animali.`,
            skipped: skippedCount > 0 ? `Saltati ${skippedCount} per limite abbonamento.` : 0
        });

    } catch (error) {
        console.error("Import Error:", error);

        // Pulizia file temporaneo anche in caso di errore
        if (req?.file?.path) {
            await deleteFileIfExists(req.file.path).catch(() => { });
        }

        // MODIFICA: Rispondiamo con un 400 Bad Request inviando l'esatto messaggio di errore calcolato sopra
        res.status(400).send({
            message: error.message || "Errore imprevisto durante l'importazione. Verifica il formato del file."
            // Includi lo stack trace solo in development se necessario
        });
    }
};

export const GetReptileValuation = async (req, res) => {
    try {
        const reptileId = req.params.reptileId;
        const reptile = await Reptile.findById(reptileId).lean();

        if (!reptile) {
            return res.status(404).send({ message: req.t('reptile_notFound') });
        }

        // Cerca tutti gli eventi che hanno un costo associato maggiore di 0
        const events = await Event.find({
            reptile: reptileId,
            'cost.amount': { $exists: true, $gt: 0 }
        }).sort({ date: 1 }).lean();

        let totalValue = reptile.purchasePrice?.amount || 0;
        const currency = reptile.purchasePrice?.currency || 'EUR';
        const history = [];

        // 1. Voce iniziale: Acquisto
        if (reptile.purchasePrice?.amount) {
            history.push({
                date: reptile.createdAt || new Date(),
                type: 'purchase',
                description: 'Costo Iniziale Acquisto',
                addedValue: reptile.purchasePrice.amount,
                totalAccumulated: totalValue,
                currency: currency
            });
        }

        // 2. Voci aggiunte: Eventi (Veterinario, ecc.)
        for (const ev of events) {
            totalValue += ev.cost.amount;
            history.push({
                date: ev.date,
                type: 'event',
                eventType: ev.type,
                description: ev.cost.description || `Evento: ${ev.type}`,
                addedValue: ev.cost.amount,
                totalAccumulated: totalValue,
                currency: ev.cost.currency || currency
            });
        }

        res.send({
            initialPrice: reptile.purchasePrice,
            resalePrice: reptile.price, // Il vecchio campo "price" (prezzo di vendita)
            currentEstimatedValue: { amount: totalValue, currency }, // Valore totale investito
            history // Tabella storica da mostrare al frontend
        });

    } catch (err) {
        console.error("Valuation Error:", err);
        res.status(500).send({ message: req.t('server_error') });
    }
};