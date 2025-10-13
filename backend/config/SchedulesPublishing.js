import cron from 'node-cron';
import Article from '../models/Article.model.js';
import { notifyNewsletterAboutArticle, notifyUsersAboutArticle } from '../utils/notifyNewsLetter.js';

console.log('Scheduled publishing job initialized.');

// Esegui il controllo ogni minuto
cron.schedule('* * * * *', async () => {
    try {
        const now = new Date();
        
        // Trova tutti gli articoli con status 'scheduled' la cui data di pubblicazione è passata
        const articlesToPublish = await Article.find({
            status: 'scheduled',
            publishedAt: { $lte: now }
        });

        if (articlesToPublish.length > 0) {
            const articleIds = articlesToPublish.map(a => a._id);
            
            // Aggiorna lo stato a 'published' per tutti gli articoli trovati
            await Article.updateMany(
                { _id: { $in: articleIds } },
                { $set: { status: 'published' } }
            );
for (const article of articlesToPublish) {
    notifyNewsletterAboutArticle(article);
}
for (const article of articlesToPublish) {
    await notifyUsersAboutArticle(article);
}
            console.log(`Successfully published ${articlesToPublish.length} scheduled article(s).`);
        }
    } catch (error) {
        console.error('Error during scheduled publishing job:', error);
    }
});
