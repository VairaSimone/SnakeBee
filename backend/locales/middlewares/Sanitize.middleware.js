import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

const { window } = new JSDOM('');
const dompurify = DOMPurify(window);

export const sanitizeContent = (req, res, next) => {
    if (req.body.content) {
        for (const lang in req.body.content) {
            if (Object.hasOwnProperty.call(req.body.content, lang)) {
                req.body.content[lang] = dompurify.sanitize(req.body.content[lang], {
                    ADD_TAGS: ['table', 'thead', 'tbody', 'tr', 'th', 'td'],
                    ADD_ATTR: ['style', 'class'] 
                });
            }
        }
    }
    next();
};
