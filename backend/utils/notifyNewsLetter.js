import Newsletter from '../models/Newsletter.js';
import i18next from 'i18next';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { sendBroadcastEmailToUser } from '../config/mailer.config.js';

export const notifyNewsletterAboutArticle = async (article) => {
  try {
    const users = await Newsletter.find();
    if (!users.length) return;

    const promises = users.map(user => {
      const t = i18next.getFixedT(user.language || 'it');
      const teaserLength = 200;
      const teaser = article.content[user.language]?.substring(0, teaserLength) + '...';

      const subject = t('emails.newArticle.subject', 'Nuovo articolo pubblicato!');
      const html = `
  <h2>${t('emails.newArticle.hello')}</h2>
  <p>${t('emails.newArticle.newArticlePublished')}</p>
  <p style="font-style: italic; color: #555;">"${teaser}"</p>
  <a href="${process.env.FRONTEND_URL}/blog/${article.slug}" 
     style="display:inline-block;margin-top:15px;background:#228B22;color:#FFD700;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;">
    ${t('emails.newArticle.readNow')}
  </a>
`;
      return sendBroadcastEmailToUser(user, subject, html);
    });

    const results = await Promise.allSettled(promises);
    const failed = results.filter(r => r.status === 'rejected');
    if (failed.length) console.warn(`${failed.length} newsletter emails failed`);
  } catch (err) {
    console.error('Error notifying newsletter:', err);
  }
};


export const notifyUsersAboutArticle = async (article) => {
  try {
    const users = await User.find();
    const notifications = users.map(user => {
      const message = user.lang === 'en'
        ? `New article published: ${article.title.en}`
        : `Nuovo articolo pubblicato: ${article.title.it}`;

      return {
        user: user._id,
        type: 'new_post',
        message,
        date: new Date(),
        status: 'pending'
      };
    });

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

  } catch (err) {
    console.error('Error notifying users:', err);
  }
};
