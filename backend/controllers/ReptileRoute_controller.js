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

export const GetAllReptile = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const perPage = parseInt(req.query.perPage) || 20;

        const reptile = await Reptile.find({})
            .sort({ species: 1 })
            .skip((page - 1) * perPage)
            .limit(perPage);

        const totalResults = await Reptile.countDocuments();
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
        else res.send(reptile);
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: req.t('reptile_notFound') });
    }
};

export const GetAllReptileByUser = async (req, res) => {
    try {
        const userId = req.user.userid;

        const page = parseInt(req.query.page) || 1;
        const perPage = parseInt(req.query.perPage) || 10;

        const reptile = await Reptile.find({ user: userId })
            .sort({ species: 1 })
            .skip((page - 1) * perPage)
            .limit(perPage);

        const totalResults = await Reptile.countDocuments({ user: userId });
        const totalPages = Math.ceil(totalResults / perPage);

        if (!reptile || reptile.length === 0) {
            return res.status(404).send({ message: req.t('reptile_notFoundID') });
        }

        res.send({
            dati: reptile,
            totalPages,
            totalResults,
            page,
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: req.t('server_error') });
    }
};


export const PostReptile = async (req, res) => {
    try {
        const { name, species, morph, birthDate, sex, isBreeder, notes, parents, documents } = req.body;
        const userId = req.user.userid;
        const parsedParents = typeof parents === 'string' ? JSON.parse(parents) : parents;
        const parsedDocuments = typeof documents === 'string' ? JSON.parse(documents) : documents;

        // Maximum limit check
        const user = await User.findById(userId);
        const { plan: userPlan, limits } = getUserPlan(user);
        const reptileCount = await Reptile.countDocuments({ user: userId });


        if (reptileCount >= limits.reptiles) {
            return res.status(400).json({
                message: req.t('reptile_limit', { reptiles: limits.reptiles, plan: userPlan })
            });

        }

        let imageUrls = [];

        if (req.files && req.files.length > 0) {
            if (req.files?.length > limits.imagesPerReptile) {
                return res.status(400).json({
                    message: req.t('reptile_limit_image', { imagesPerReptile: limits.imagesPerReptile, plan: userPlan })
                });
            }

            imageUrls = req.files.map(file => `/uploads/${file.filename}`);
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
            notes,
            parents: parsedParents,
            documents: parsedDocuments,
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
        const { name, species, morph, sex, notes, birthDate, isBreeder, price, label, parents, documents } = req.body;
        let parsedParents, parsedDocuments;
        if ('parents' in req.body) {
            parsedParents = typeof req.body.parents === 'string'
                ? JSON.parse(req.body.parents)
                : req.body.parents;
        }

        if ('documents' in req.body) {
            parsedDocuments = typeof req.body.documents === 'string'
                ? JSON.parse(req.body.documents)
                : req.body.documents;
        }


        let reptile = await Reptile.findById(id);

        if (!reptile) {
            return res.status(404).send({ message: req.t('reptile_notFound') });
        }

        let imageUrls = reptile.image || [];
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
        if (req.files && req.files.length > 0) {
            const currentImageCount = imageUrls.length;
            const newImageCount = req.files.length;
            const totalImages = currentImageCount + newImageCount;

            if (totalImages > limits.imagesPerReptile) {
                return res.status(400).json({
                    message: req.t('reptile_limit_image', { imagesPerReptile: limits.imagesPerReptile, plan: userPlan })
                });
            }

            const newImages = req.files.map(file => `/uploads/${file.filename}`);
            imageUrls = [...imageUrls, ...newImages];
        }

        const birthDateObject = birthDate ? new Date(birthDate) : reptile.birthDate;
        await logAction(req.user.userid, "Modify reptile");

        if ('name' in req.body) reptile.name = name;
        reptile.species = species || reptile.species;
        reptile.morph = morph || reptile.morph;
        reptile.birthDate = birthDateObject;
        reptile.image = imageUrls;
        reptile.sex = sex || reptile.sex;

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
        if ('parents' in req.body) reptile.parents = parsedParents;
        if ('documents' in req.body) reptile.documents = parsedDocuments;
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

        // Remove files from the filesystem
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
        if (reptile.image) {
            await deleteFileIfExists(reptile.image);
        }
        await Feeding.deleteMany({ reptile: reptileId });

        await Notification.deleteMany({ reptile: reptileId });

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

        // Recupero il rettile con riferimento all'utente
        const reptile = await Reptile.findById(reptileId)
            .populate("user", "subscription name email address phoneNumber");

        if (!reptile) {
            return res.status(404).send({ message: req.t("reptile_notFound") });
        }

        // 1. Controllo se ha QRCode
        if (!reptile.qrCodeUrl) {
            return res.status(404).send({ message: req.t("reptile_notFound") });
        }

        // 2. Controllo piano dell'utente
        const { plan, status } = reptile.user.subscription;

        const isPremiumActive =
            plan === "premium" &&
            ["active", "processing", "incomplete"].includes(status);

        if (!isPremiumActive) {
            return res.status(404).send({ message: req.t("reptile_notFound") });
        }

        // 3. Recupero feedings ed eventi
        const feedings = await Feeding.find({ reptile: reptileId })
            .sort({ date: -1 })
            .lean();

        const events = await Event.find({ reptile: reptileId })
            .sort({ date: -1 })
            .lean();

        // 4. Costruisco il payload
        const reptileData = reptile.toObject();

        // dati utente limitati (solo name + email, niente subscription interna completa)
        const owner = {
            name: reptile.user.name,
            email: reptile.user.email,
            phoneNumber: reptile.user.phoneNumber,
            address: reptile.user.address

        };

        delete reptileData.user; // rimuovo l’intero oggetto user popolato

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