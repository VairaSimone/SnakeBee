import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import Reptile from '../models/Reptile.js';
import User from '../models/User.js';

export const generateCustomCitesDocument = async (req, res) => {
    try {
        const { signerDetails, receiverDetails, extraDetails, options } = req.body;
       const { reptileId } = req.params;

       const reptile = await Reptile.findById(reptileId);
       if (!reptile) {
            return res.status(404).json({ message: 'Rettile non trovato nel database.' });
        }
const userId = req.user?.userid || req.user?._id;
        const user = await User.findById(userId);
        const sellerInfo = {
            name: `${signerDetails?.name || ''} ${signerDetails?.surname || ''}`.trim(),
            address: `${signerDetails?.address || ''}, ${signerDetails?.city || ''} (${signerDetails?.province || ''})`,
            email: signerDetails?.email,
            PhoneNumber: signerDetails?.phoneNumber // Nota: il frontend passa phoneNumber
        };

        const buyerInfo = {
            name: `${receiverDetails?.name || ''} ${receiverDetails?.surname || ''}`.trim(),
            address: `${receiverDetails?.address || ''}, ${receiverDetails?.city || ''} (${receiverDetails?.province || ''})`,
            email: receiverDetails?.email,
            PhoneNumber: receiverDetails?.phone // Nota: il frontend passa phone
        };
        const date = extraDetails?.date;

const animalInfo = {
            species: reptile.species || '',
            morph: reptile.morph || '',
            sex: reptile.sex || '',
            // Formattiamo la data se è presente nel DB
            birthDate: reptile.birthDate ? new Date(reptile.birthDate).toLocaleDateString('it-IT') : '',
            state: extraDetails?.originCountry || '', // Il paese di origine arriva ancora dal form
            microchip: reptile.documents?.microchip?.code || '',
            protocolNumber: reptile.documents?.cites?.number || ''
        };

        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([595.28, 841.89]); // A4
        const { width, height } = page.getSize();

        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

        const drawText = (text, x, y, size = 10, font = fontRegular, color = rgb(0, 0, 0)) => {
            page.drawText(text, { x, y, size, font, color });
        };

        // --- HEADER ---
        page.drawRectangle({
            x: 0, y: height - 85,
            width: width, height: 85,
            color: rgb(250 / 255, 243 / 255, 224 / 255) // CORRETTO: conversione in scala 0-1
        });

        // Testo Header (Ho riaggiunto un nero o grigio molto scuro per contrastare lo sfondo chiaro)
        drawText('DOCUMENTO DI CESSIONE AI FINI CITES', 50, height - 50, 14, fontBold, rgb(0.2, 0.2, 0.2));

        if (options?.includeProfilePic && user?.avatar) {
            try {
                let imageBuffer;
                
                // Fetch URL remoto (VPN / Google)
                if (user.avatar.startsWith('http')) {
                    const response = await axios.get(user.avatar, { responseType: 'arraybuffer' });
                    imageBuffer = response.data;
                } 
                // Fallback per file locali
                else if (user.avatar.startsWith('/uploads')) {
                    const localPath = path.join(process.cwd(), user.avatar); // Usa process.cwd() invece di __dirname per sicurezza
                    if (fs.existsSync(localPath)) {
                        imageBuffer = fs.readFileSync(localPath);
                    }
                }

                if (imageBuffer) {
                    let profileImage;
                    // Prova a embeddarlo come PNG, altrimenti tenta come JPG
                    try {
                        profileImage = await pdfDoc.embedPng(imageBuffer);
                    } catch (e) {
                        try {
                            profileImage = await pdfDoc.embedJpg(imageBuffer);
                        } catch (err) {
                            console.error("Formato immagine non supportato (né PNG né JPG)");
                        }
                    }

                    if (profileImage) {
                        const imgSize = 50; // Dimensione finale in PDF (50x50 px)
                        
                        // Disegna l'immagine in alto a destra, nell'header
                        page.drawImage(profileImage, {
                            x: width - imgSize - 30, // 30px di margine da destra
                            y: height - imgSize - 17, // Centraggio verticale rispetto all'header
                            width: imgSize,
                            height: imgSize,
                        });
                    }
                }
            } catch (imgErr) {
                console.error("Errore durante il caricamento dell'immagine profilo:", imgErr.message);
                // Non blocchiamo il PDF se fallisce l'immagine, andiamo avanti
            }
        }
        // --- RIFERIMENTI NORMATIVI ---
        drawText('Dichiarazione di cessione gratuita/vendita di esemplari inclusi nell\'Allegato B/C del Regolamento (CE) n. 338/97', 50, height - 120, 9, fontBold);
        drawText('e successive modifiche ed integrazioni.', 50, height - 135, 9, fontBold);

        let currentY = height - 170;

        const drawSection = (title, items) => {
            page.drawRectangle({
                x: 45, y: currentY - 15,
                width: width - 90, height: 22,
                color: rgb(0.92, 0.92, 0.92)
            });
            drawText(title, 50, currentY - 10, 11, fontBold);

            currentY -= 35;

            items.forEach(item => {
                drawText(`${item.label}:`, 50, currentY, 10, fontBold);
                drawText(`${item.value || '_______________________'}`, 180, currentY, 10, fontRegular);
                currentY -= 20;
            });
            currentY -= 15;
        };


        
        // --- SEZIONE 1: CEDENTE ---
        drawSection('1. DATI DEL CEDENTE (Allevatore / Proprietario attuale)', [
            { label: 'Nome e Cognome', value: sellerInfo?.name },
            { label: 'Indirizzo e Città', value: sellerInfo?.address },
            { label: 'Indirizzo Email', value: sellerInfo?.email },
            { label: 'Numero di telefono', value: sellerInfo?.PhoneNumber }
        ]);

        // --- SEZIONE 2: CESSIONARIO ---
        drawSection('2. DATI DEL CESSIONARIO (Nuovo Proprietario)', [
            { label: 'Nome e Cognome', value: buyerInfo?.name },
            { label: 'Indirizzo e Città', value: buyerInfo?.address },
            { label: 'Indirizzo Email', value: buyerInfo?.email },
            { label: 'Numero di telefono', value: buyerInfo?.PhoneNumber }
        ]);

        // --- SEZIONE 3: ESEMPLARE ---
        drawSection('3. DATI DELL\'ESEMPLARE', [
            { label: 'Specie (Nome Sci.)', value: animalInfo?.species },
            { label: 'Morph / Mutazione', value: animalInfo?.morph },
            { label: 'Sesso', value: animalInfo?.sex },
            { label: 'Data di Nascita', value: animalInfo?.birthDate },
            { label: 'Paese di origine', value: animalInfo?.state },
            { label: 'Estremi marcaggio', value: animalInfo?.microchip },
            { label: 'Num. Protocollo CITES', value: animalInfo?.protocolNumber }
        ]);

        // --- SEZIONE 4: DICHIARAZIONE ---
        currentY -= 10;
        const todayDate = date || new Date().toLocaleDateString('it-IT');
        const cedenteName = sellerInfo?.name || '_______________________';

        const declarationText = `Il sottoscritto ${cedenteName} dichiara sotto la propria responsabilità che ` +
            `l'esemplare\nsopra descritto è nato in cattività ed è stato regolarmente ceduto nel pieno\n` +
            `rispetto della normativa CITES vigente in materia fornendo tutte le informazioni necessarie\n` +
            `al ricevente sulle operazione richieste per garantire una corretta assistenza degli esemplari.`;

        drawText('DICHIARAZIONE:', 50, currentY, 10, fontBold);
        currentY -= 20;

        const lines = declarationText.split('\n');
        lines.forEach(line => {
            drawText(line, 50, currentY, 10, fontRegular);
            currentY -= 15;
        });

        // --- FIRME E DATA ---
        currentY -= 50;

        // Data
        drawText('Data: __________________', 50, currentY, 10, fontBold);

        currentY -= 40; // Spazio per le firme

        // Firma Cedente
        drawText('Firma del Cedente', 70, currentY, 10, fontBold);
        page.drawLine({ start: { x: 50, y: currentY - 20 }, end: { x: 220, y: currentY - 20 }, thickness: 1 });

        // Firma Cessionario
        drawText('Firma del Cessionario', 370, currentY, 10, fontBold);
        page.drawLine({ start: { x: 350, y: currentY - 20 }, end: { x: 520, y: currentY - 20 }, thickness: 1 });

        // 3. Serializza e Salva
        const pdfBytes = await pdfDoc.save();

        // 4. Invia il PDF al client
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=SnakeBee_CITES_Document.pdf');
        res.send(Buffer.from(pdfBytes));

    } catch (error) {
        console.error("Errore nella generazione del CITES dinamico:", error);
        res.status(500).json({ message: 'Errore durante la generazione del documento CITES' });
    }
};