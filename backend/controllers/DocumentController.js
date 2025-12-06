// backend/controllers/DocumentController.js
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios'; // Assicurati di avere axios installato nel backend
import Reptile from '../models/Reptile.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const downloadCites = async (req, res) => {
    try {
        const { reptileId } = req.params;
        
        // Dati inviati manualmente dal form frontend
        const { 
            receiverDetails, // { name, surname, address, city, etc. }
            signerDetails,   // { name, surname, address, city, etc. } (Il cedente/utente)
            extraDetails,    // { place, date, originCountry }
            options          // { includeProfilePic: true/false }
        } = req.body;

        const reptile = await Reptile.findById(reptileId);
        const owner = await User.findById(req.user.userid);

        if (!reptile) return res.status(404).json({ message: "Reptile not found" });

        // 1. Carica il Template
        const templatePath = path.join(__dirname, '../assets/cites_template.pdf');
        if (!fs.existsSync(templatePath)) {
            return res.status(500).json({ message: "Template PDF missing" });
        }

        const existingPdfBytes = fs.readFileSync(templatePath);
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const page = pdfDoc.getPages()[0];
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const fontSize = 10;

        // Helper per disegnare testo
        const drawText = (text, x, y, isBold = false) => {
            if (text) {
                page.drawText(String(text), { 
                    x, 
                    y, 
                    size: fontSize, 
                    font: isBold ? fontBold : font, 
                    color: rgb(0, 0, 0) 
                });
            }
        };

        // ==========================================
        // 📸 GESTIONE FOTO PROFILO
        // ==========================================
        if (options?.includeProfilePic && owner.avatar) {
            try {
                let imageBuffer;
                // Se è un URL remoto (es. Google, NounProject)
                if (owner.avatar.startsWith('http')) {
                    const response = await axios.get(owner.avatar, { responseType: 'arraybuffer' });
                    imageBuffer = response.data;
                } 
                // Se è un file locale caricato sul server (es. /uploads/...)
                else if (owner.avatar.startsWith('/uploads')) {
                    const localPath = path.join(__dirname, '..', owner.avatar);
                    if (fs.existsSync(localPath)) {
                        imageBuffer = fs.readFileSync(localPath);
                    }
                }

                if (imageBuffer) {
                    // Tenta di embeddare come PNG o JPG
                    let profileImage;
                    try {
                        profileImage = await pdfDoc.embedPng(imageBuffer);
                    } catch (e) {
                        profileImage = await pdfDoc.embedJpg(imageBuffer);
                    }

                    // Disegna la foto (Esempio: in alto a destra o vicino ai dati cedente)
                    // Coordinate: X=450, Y=680 (Aggiusta a piacere)
                    const imgDims = profileImage.scale(0.30); // Scala l'immagine (0.15 = 15% grandezza originale)
                    page.drawImage(profileImage, {
                        x: 480,
                        y: 760,
                        width: imgDims.width > 50 ? 50 : imgDims.width, // Limita larghezza max
                        height: imgDims.height > 50 ? 50 : imgDims.height,
                    });
                }
            } catch (imgErr) {
                console.error("Errore caricamento immagine profilo:", imgErr);
                // Continua senza immagine, non bloccare il PDF
            }
        }

        // ==========================================
        // 📝 COMPILAZIONE DATI (Prende dal BODY, non dal DB se possibile)
        // ==========================================
        
        // --- CEDENTE (Proprietario) ---
        // Usa i dati arrivati dal form (signerDetails) che l'utente ha potuto correggere
        const cedenteY =670; // Aggiusta in base al template
        drawText(signerDetails?.name, 100, cedenteY);
        drawText(signerDetails?.surname, 350, cedenteY);
        
        drawText(signerDetails?.address, 80, cedenteY - 21); // Via
        drawText(signerDetails?.city, 80, cedenteY - 40);    // Comune
        drawText(signerDetails?.province, 295, cedenteY - 40);

        drawText(signerDetails?.phoneNumber, 350, cedenteY - 21);
        drawText(signerDetails?.email, 346, cedenteY - 40);

        // --- RICEVENTE (Acquirente) ---
        // Questi dati spesso mancano nel DB, quindi arrivano dal form
        const riceventeY = 553; // Aggiusta Y guardando il PDF
        drawText(receiverDetails?.name, 100, riceventeY);
        drawText(receiverDetails?.surname, 280, riceventeY);
        
        drawText(receiverDetails?.address, 100, riceventeY - 20);
        drawText(receiverDetails?.city, 100, riceventeY - 46);
        drawText(receiverDetails?.province, 300, riceventeY - 46);
                drawText(receiverDetails?.cap, 320, riceventeY - 20);
        drawText(receiverDetails?.email, 100, riceventeY - 72);
        drawText(receiverDetails?.phone, 360, riceventeY - 46);

        
        // --- TABELLA RETTILE ---
        const tabellaY = 402;
        drawText(reptile.species, 30, tabellaY, true); // Grassetto
        drawText(reptile.sex, 155, tabellaY);
// Calcola il valore corretto del microchip prima di disegnarlo
let microchipValue = '';

if (typeof reptile.documents?.microchip === 'string') {
    // Caso dati vecchi: se è una stringa semplice
    microchipValue = reptile.documents.microchip;
} else if (reptile.documents?.microchip?.code) {
    // Caso dati nuovi: prende la proprietà .code
    microchipValue = reptile.documents.microchip.code;
}

// Disegna solo la stringa risultante
drawText(microchipValue, 200, tabellaY);   

const citesNumber = reptile.documents?.cites?.number || '';
        drawText(citesNumber, 330, tabellaY);
        // Anno nascita
        const anno = reptile.birthDate ? new Date(reptile.birthDate).getFullYear() : '';
        drawText(anno, 420, tabellaY);

        // Paese origine (Dato extra richiesto manualmente)
        drawText(extraDetails?.originCountry || 'IT', 500, tabellaY);
drawText("1", 550, tabellaY); // X=550 è un'ipotesi per l'ultima colonna

        // --- FIRME E DATA ---
        // In fondo alla pagina
        drawText(extraDetails?.place || '', 117, 177); // Luogo
        
        // Formatta data
        let dateStr = '';
        if (extraDetails?.date) {
            dateStr = new Date(extraDetails.date).toLocaleDateString('it-IT');
        } else {
            dateStr = new Date().toLocaleDateString('it-IT');
        }
        drawText(dateStr, 177, 177); // Data
        // Salva
        const pdfBytes = await pdfDoc.save();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=CITES_${encodeURIComponent(reptile.name)}.pdf`);
        res.send(Buffer.from(pdfBytes));

    } catch (error) {
        console.error("PDF Error:", error);
        res.status(500).json({ message: "Error creating PDF", error: error.message });
    }
};