import Reptile from "../models/Reptile.js";
import mongoose from 'mongoose';
import cloudinary from '../config/CloudinaryConfig.js';
import Feeding from "../models/Feeding.js";
import Notification from "../models/Notification.js";
import fs from 'fs/promises';
import streamifier from 'streamifier';

import { parseDateOrNull } from '../utils/parseReptileHelpers.js';

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
        res.status(500).send({ message: 'Not Found' });
    }
};

export const GetAllReptileByUser = async (req, res) => {
    try {
        const userId = req.params.userId;

        const page = parseInt(req.query.page) || 1;
        const perPage = parseInt(req.query.perPage) || 10;

        const reptile = await Reptile.find({ user: userId })
            .sort({ species: 1 })
            .skip((page - 1) * perPage)
            .limit(perPage);

        const totalResults = await Reptile.countDocuments({ user: userId });
        const totalPages = Math.ceil(totalResults / perPage);

        if (!reptile || reptile.length === 0) {
            return res.status(404).send({ message: `No reptiles found for this person ${userId}` });
        }

        res.send({
            dati: reptile,
            totalPages,
            totalResults,
            page,
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: 'Server error' });
    }
};


export const PostReptile = async (req, res) => {
    try {
        const { name, species, morph, birthDate, sex, isBreeder, notes, parents, documents } = req.body;
        const userId = req.user.userid;
const parsedParents = typeof parents === 'string' ? JSON.parse(parents) : parents;
const parsedDocuments = typeof documents === 'string' ? JSON.parse(documents) : documents;

        // Controllo limite massimo
        const reptileCount = await Reptile.countDocuments({ user: userId });
        if (reptileCount >= 10) {
            return res.status(400).json({ message: 'Hai raggiunto il limite massimo di animali, contatta il supporto per aggiornamenti su un piano più elevato' });
        }
        let imageUrl = '';

        if (req.file) {
                  imageUrl = `/uploads/${req.file.filename}`;

        }

        const birthDateObject = parseDateOrNull(birthDate);
        const newReptile = new Reptile({
            _id: new mongoose.Types.ObjectId(),
            name,
            species,
            morph,
            user: userId,
            image: imageUrl,
            birthDate: birthDateObject,
            sex,
            isBreeder,
            notes,
              parents: parsedParents,
  documents: parsedDocuments,
        });

        const createdReptile = await newReptile.save();

        res.status(201).send(createdReptile);
    } catch (error) {
        console.error(error);
        res.status(400).send({ message: 'Error creating reptile' });
    }
};

export const PutReptile = async (req, res) => {
    try {
        const id = req.params.reptileId;
        const { name, species, morph, sex, notes, birthDate, isBreeder, label,parents, documents } = req.body;
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
            return res.status(404).send({ message: 'Reptile not found' });
        }

        let imageUrl = reptile.image;

        if (req.file) {
            // Carica buffer su Cloudinary
              imageUrl = `/uploads/${req.file.filename}`;

        }
        const parseDateOrNull = (value) => {
            if (!value || value === 'null') return null;
            return new Date(value);
        };

        const parseNumberOrNull = (value) => {
            if (!value || value === 'null') return null;
            return Number(value);
        };

        const birthDateObject = birthDate ? new Date(birthDate) : reptile.birthDate;

        if ('name' in req.body) reptile.name = name;
        reptile.species = species || reptile.species;
        reptile.morph = morph || reptile.morph;
        reptile.birthDate = birthDateObject;
        reptile.image = imageUrl;
        reptile.sex = sex || reptile.sex;
        if ('label' in req.body) {
            try {
                reptile.label = typeof req.body.label === 'string'
                    ? JSON.parse(req.body.label)
                    : req.body.label;
            } catch (err) {
                console.warn('Label non parsabile:', req.body.label);
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
        res.status(500).send({ message: 'Error updating reptile' });
    }
};

export const DeleteReptile = async (req, res) => {
    try {
        const reptileId = req.params.reptileId;
        const reptile = await Reptile.findById(reptileId);
        if (!reptile) return res.status(404).send({ message: 'Reptile not found' });

        await Feeding.deleteMany({ reptile: reptileId });

        await Notification.deleteMany({ reptile: reptileId });

        await Reptile.findByIdAndDelete(reptileId);

        res.send({ message: 'Reptile and associated data successfully deleted' });
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: 'Server error' });
    }
};
