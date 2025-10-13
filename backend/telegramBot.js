import TelegramBot from "node-telegram-bot-api";
import axios from "axios";

// --- Costanti per una migliore manutenibilità ---
const CALLBACK_PREFIX = {
    REPTILE_SELECTED: 'reptile_',
    ADD_FEEDING: 'add_feeding_',
    ADD_EVENT: 'add_event_',
    VIEW_FEEDINGS: 'feedings_',
    VIEW_EVENTS: 'events_',
    SET_EVENT_TYPE: 'set_event_type_',
    BACK_TO_LIST: 'back_to_reptiles',
    SELECT_INVENTORY_ITEM: 'inv_item_', // Selezione articolo inventario
    OTHER_FOOD_TYPE: 'other_food'
};

let bot;
const userState = {}; // Stato conversazione in memoria

// --- Funzioni Helper ---
function escapeMarkdown(text) {
    if (!text) return '';
    return text.toString().replace(/([_*[\]()~`>#+-=|{}.!])/g, "\\$1");
}

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// --- Funzioni API ---
// Un unico punto per gestire le chiamate axios, aggiungendo l'header e la gestione errori
async function apiRequest(method, url, chatId, data = {}) {
    try {
        const config = {
            method,
            url: `${process.env.BACKEND_URL}/api/telegram${url}`,
            headers: { "x-telegram-id": chatId },
        };
        if (method.toLowerCase() === 'post') {
            config.data = data;
        }
        const response = await axios(config);
        return response.data;
    } catch (err) {
        console.error(`API Error on ${method} ${url}:`, err.response?.data || err.message);
        // Rilancia l'errore per gestirlo nel chiamante
        throw new Error(err.response?.data?.message || "Si è verificato un errore di comunicazione con il server.");
    }
}


// --- Inizializzazione e Comandi Principali ---
if (!global.bot) {
    bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
    global.bot = bot;

    // Imposta i comandi del bot nel menu di Telegram
    bot.setMyCommands([
        { command: '/start', description: 'Avvia il bot e collega il tuo account' },
        { command: '/reptiles', description: 'Mostra la lista dei tuoi rettili' },
        { command: '/inventory', description: 'Visualizza il tuo inventario (Breeder)' },
        { command: '/cancel', description: 'Annulla l\'operazione corrente' }
    ]);

    // Comando /start
    bot.onText(/\/start/, async (msg) => {
        const chatId = msg.chat.id;
        bot.sendMessage(chatId, `Ciao ${msg.from.first_name}! 👋\nTi sto generando un link per collegare il tuo account SnakeBee...`);
        bot.sendChatAction(chatId, 'typing');
        try {
            const data = await apiRequest('get', `/link?telegramId=${chatId}`, chatId);
            bot.sendMessage(chatId, `Per collegare il tuo account, clicca qui: ${data.url}\n\nUna volta fatto, usa /reptiles per iniziare!`);
        } catch (err) {
            bot.sendMessage(chatId, `❌ Errore nel generare il link: ${err.message}. Riprova più tardi.`);
        }
    });

    // Comando /reptiles
    bot.onText(/\/reptiles/, (msg) => showReptileList(msg.chat.id));

    // Comando /inventory
    bot.onText(/\/inventory/, async (msg) => {
        const chatId = msg.chat.id;
        bot.sendChatAction(chatId, 'typing');
        try {
            const { inventory } = await apiRequest('get', '/inventory', chatId);
            if (!inventory || inventory.length === 0) {
                return bot.sendMessage(chatId, "Il tuo inventario è vuoto. 텅 빈");
            }
            let text = "📦 *Il tuo inventario:*\n\n";
            inventory.forEach(item => {
                text += `• *${escapeMarkdown(item.foodType)}* (${item.weightPerUnit}g): ${item.quantity} unità\n`;
            });
            bot.sendMessage(chatId, text, { parse_mode: "Markdown" });
        } catch (err) {
            bot.sendMessage(chatId, `❌ ${err.message}`);
        }
    });

    // Comando /cancel
    bot.onText(/\/cancel/, (msg) => {
        const chatId = msg.chat.id;
        if (userState[chatId]) {
            delete userState[chatId];
            bot.sendMessage(chatId, "👍 Operazione annullata.");
        } else {
            bot.sendMessage(chatId, "Nessuna operazione in corso da annullare.");
        }
    });

    // --- Gestori di Callback e Messaggi ---
    bot.on("callback_query", handleCallbackQuery);
    bot.on("message", handleMessage);

} else {
    bot = global.bot;
}

// --- Logica di Visualizzazione ---

async function showReptileList(chatId, messageId = null) {
    const text = "Sto caricando i tuoi rettili...";

    // Se messageId è presente, modifica il messaggio esistente, altrimenti ne invia uno nuovo
    if (messageId) {
        bot.editMessageText(text, { chat_id: chatId, message_id: messageId });
    } else {
        bot.sendMessage(chatId, text);
    }

    bot.sendChatAction(chatId, 'typing');

    try {
        const { reptiles } = await apiRequest('get', '/reptiles', chatId);
        if (!reptiles || reptiles.length === 0) {
            const noReptilesText = "Non hai ancora registrato rettili 🦎. Aggiungine uno dal sito!";
            if (messageId) {
                return bot.editMessageText(noReptilesText, { chat_id: chatId, message_id: messageId });
            }
            return bot.sendMessage(chatId, noReptilesText);
        }

        const inlineKeyboard = reptiles.map(r => ([{
            text: r.name || r.morph || "Senza nome",
            callback_data: `${CALLBACK_PREFIX.REPTILE_SELECTED}${r._id}`
        }]));

        const options = {
            chat_id: chatId,
            text: "Seleziona un rettile:",
            reply_markup: { inline_keyboard: inlineKeyboard }
        };

        if (messageId) {
            options.message_id = messageId;
            bot.editMessageText(options.text, options);
        } else {
            bot.sendMessage(chatId, options.text, { reply_markup: options.reply_markup });
        }

    } catch (err) {
        if (err.message.includes("Abbonamento non valido")) {
            bot.sendMessage(chatId, "⚠️ Per usare il bot devi avere un abbonamento attivo.");
        } else {
            const errorText = `❌ Errore nel recuperare la lista: ${err.message}`;
            if (messageId) {
                bot.editMessageText(errorText, { chat_id: chatId, message_id: messageId });
            } else {
                bot.sendMessage(chatId, errorText);
            }
        }
    }
}

async function showReptileDetails(chatId, reptileId, messageId) {
    bot.editMessageText("Caricamento dettagli...", { chat_id: chatId, message_id: messageId });
    bot.sendChatAction(chatId, 'typing');

    try {
        const { reptile: r } = await apiRequest('get', `/reptile/${reptileId}`, chatId);

        let text = `📋 *${escapeMarkdown(r.name || "Senza nome")}*\n\n` +
            `🐍 Specie: ${escapeMarkdown(r.species || "-")}\n` +
            `🎨 Morph: ${escapeMarkdown(r.morph || "-")}\n` +
            `젠더 Sesso: ${r.sex || "-"}\n` +
            (r.birthDate ? `🎂 Nascita: ${new Date(r.birthDate).toLocaleDateString("it-IT")}\n` : '') +
            (r.foodType ? `🍗 Dieta: ${escapeMarkdown(r.foodType)}\n` : '');

        const keyboard = [
            [{ text: "Aggiungi Alimentazione 🥩", callback_data: `${CALLBACK_PREFIX.ADD_FEEDING}${r._id}` }],
            [{ text: "Aggiungi Evento 📅", callback_data: `${CALLBACK_PREFIX.ADD_EVENT}${r._id}` }],
            [{ text: "Storico Alimentazioni 🍽️", callback_data: `${CALLBACK_PREFIX.VIEW_FEEDINGS}${r._id}` }, { text: "Storico Eventi 📜", callback_data: `${CALLBACK_PREFIX.VIEW_EVENTS}${r._id}` }],
            [{ text: "⬅️ Torna alla lista", callback_data: CALLBACK_PREFIX.BACK_TO_LIST }]
        ];

        // Se ci sono foto, le invia prima del messaggio con la tastiera
        if (r.image?.length) {
            const imageUrl = r.image[0].startsWith('http')
                ? r.image[0]
                : `${process.env.BACKEND_URL}/upload/${r.image[0]}`;
            await bot.sendPhoto(chatId, imageUrl);
        }

        bot.editMessageText(text, {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: "Markdown",
            reply_markup: { inline_keyboard: keyboard }
        });

    } catch (err) {
        bot.editMessageText(`❌ Errore: ${err.message}`, { chat_id: chatId, message_id: messageId });
    }
}

async function showHistory(chatId, reptileId, type) {
    bot.sendChatAction(chatId, 'typing');
    try {
        if (type === 'feedings') {
            const { feedings } = await apiRequest('get', `/reptile/${reptileId}/feedings`, chatId);
            if (!feedings?.length) return bot.sendMessage(chatId, "Nessun feeding registrato per questo rettile.");

            let text = "🍽 *Ultimi 5 feedings:*\n\n";
            feedings.forEach(f => {
                text += `• ${new Date(f.date).toLocaleDateString("it-IT")}: ${f.foodType}, qty: ${f.quantity || "-"} - ${f.wasEaten ? 'Mangiato ✅' : 'Non mangiato ❌'}\n`;
            });
            bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });

        } else if (type === 'events') {
            const { events } = await apiRequest('get', `/reptile/${reptileId}/events`, chatId);
            if (!events?.length) return bot.sendMessage(chatId, "Nessun evento registrato per questo rettile.");

            let text = "📜 *Ultimi eventi:*\n\n";
            events.slice(0, 5).forEach(ev => {
                const date = new Date(ev.date).toLocaleDateString("it-IT");
                const extra = ev.weight ? ` - Peso: ${ev.weight}g` : "";
                text += `• *${capitalize(ev.type)}* (${date})${extra} ${ev.notes ? `- ${escapeMarkdown(ev.notes)}` : ""}\n`;
            });
            bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
        }
    } catch (err) {
        bot.sendMessage(chatId, `❌ Errore nel recuperare lo storico: ${err.message}`);
    }
}

// --- Gestori di Azioni e Conversazioni ---

async function handleCallbackQuery(callbackQuery) {
    const chatId = callbackQuery.message.chat.id;
    const messageId = callbackQuery.message.message_id;
    const data = callbackQuery.data;

    // Risponde subito al callback per far sparire l'icona di caricamento sul client
    bot.answerCallbackQuery(callbackQuery.id);

    if (data.startsWith(CALLBACK_PREFIX.REPTILE_SELECTED)) {
        const reptileId = data.substring(CALLBACK_PREFIX.REPTILE_SELECTED.length);
        showReptileDetails(chatId, reptileId, messageId);
    } else if (data === CALLBACK_PREFIX.BACK_TO_LIST) {
        showReptileList(chatId, messageId);
    } else if (data.startsWith(CALLBACK_PREFIX.VIEW_FEEDINGS)) {
        const reptileId = data.substring(CALLBACK_PREFIX.VIEW_FEEDINGS.length);
        showHistory(chatId, reptileId, 'feedings');
    } else if (data.startsWith(CALLBACK_PREFIX.VIEW_EVENTS)) {
        const reptileId = data.substring(CALLBACK_PREFIX.VIEW_EVENTS.length);
        showHistory(chatId, reptileId, 'events');
    } else if (data.startsWith(CALLBACK_PREFIX.ADD_FEEDING)) {
        const reptileId = data.substring(CALLBACK_PREFIX.ADD_FEEDING.length);
        startFeedingConversation(chatId, reptileId);
    } else if (data.startsWith(CALLBACK_PREFIX.ADD_EVENT)) {
        const reptileId = data.substring(CALLBACK_PREFIX.ADD_EVENT.length);
        startEventConversation(chatId, reptileId);
    } else if (data.startsWith(CALLBACK_PREFIX.SET_EVENT_TYPE)) {
        const eventType = data.substring(CALLBACK_PREFIX.SET_EVENT_TYPE.length);
        handleEventConversation(chatId, eventType, true);
        // --- BLOCCO CORRETTO DELL'INVENTARIO/EATEN ---
    } else if (data.startsWith(CALLBACK_PREFIX.SELECT_INVENTORY_ITEM)) { // <-- OK
        const inventoryItemId = data.substring(CALLBACK_PREFIX.SELECT_INVENTORY_ITEM.length);
        await selectInventoryItem(chatId, inventoryItemId, messageId);
    } else if (data === CALLBACK_PREFIX.OTHER_FOOD_TYPE) { // <-- OK
        await startManualFeeding(chatId, messageId);
    } else if (data === 'feeding_eaten_yes' || data === 'feeding_eaten_no') { // <-- OK
        const wasEaten = data === 'feeding_eaten_yes';
        await advanceFeedingConversationAfterEaten(chatId, wasEaten, messageId);
    }
}

async function startManualFeeding(chatId, messageId) {
    const state = userState[chatId];
    if (!state || state.step !== 'select_food') {
        return bot.sendMessage(chatId, "⚠️ Sessione scaduta o non valida. Riprova con /reptiles.");
    }
    state.data.manual = true;

    // Modifica il messaggio precedente e avanza allo step manuale
    await bot.editMessageText("Hai scelto *Altro*.", { chat_id: chatId, message_id: messageId, parse_mode: "Markdown" });

    state.step = 'manual_foodType';
    bot.sendMessage(chatId, "🥩 Inserisci il *tipo* di cibo (es. Insetto, Verdura).", { parse_mode: "Markdown" });
}
async function selectInventoryItem(chatId, inventoryItemId, messageId) {
    const state = userState[chatId];
    if (!state || state.step !== 'select_food') {
        return bot.sendMessage(chatId, "⚠️ Sessione scaduta o non valida. Riprova con /reptiles.");
    }

    try {
        // Recupera l'inventario per trovare l'oggetto selezionato (potrebbe essere ottimizzato memorizzando l'inventario)
        const { inventory } = await apiRequest('get', '/inventory', chatId);
        const selectedItem = inventory.find(item => item._id === inventoryItemId);

        if (!selectedItem) {
            return bot.sendMessage(chatId, "⚠️ Articolo non trovato. Riprova.");
        }

        // Auto-popola i dati
        state.data.foodType = selectedItem.foodType;
        state.data.weightPerUnit = selectedItem.weightPerUnit;

        // Conferma e passa a 'quantity'
        await bot.editMessageText(`Hai selezionato: *${escapeMarkdown(selectedItem.foodType)}* (${selectedItem.weightPerUnit}g).\n\nProcedi con la quantità.`,
            { chat_id: chatId, message_id: messageId, parse_mode: "Markdown" });

        state.step = 'quantity'; // Usa lo step esistente
        bot.sendMessage(chatId, `🔢 Inserisci la *quantità* di unità da somministrare (max ${selectedItem.quantity} disponibili):`, { parse_mode: "Markdown" });

    } catch (err) {
        bot.sendMessage(chatId, `❌ Errore nella selezione dell'inventario: ${err.message}\nOperazione annullata.`);
        delete userState[chatId];
    }
}
async function advanceFeedingConversationAfterEaten(chatId, wasEaten, messageId) {
    const state = userState[chatId];
    if (!state || state.step !== 'wasEaten') {
        return bot.sendMessage(chatId, "⚠️ Sessione scaduta o non valida. Riprova con /reptiles.");
    }

    state.data.wasEaten = wasEaten;

    if (wasEaten) {
        state.step = 'nextMealDays';
        bot.sendMessage(chatId, "⏳ Quanti giorni fino al prossimo pasto? (numero intero)");
    } else {
        state.step = 'notes';
        bot.sendMessage(chatId, "📝 Aggiungi delle note (o scrivi 'no'):");
    }

    await bot.editMessageText(
        wasEaten ? "✅ Pasto segnato come *Mangiato*." : "❌ Pasto segnato come *Non mangiato*.",
        { chat_id: chatId, message_id: messageId, parse_mode: "Markdown" }
    );
}
async function handleMessage(msg) {
    const chatId = msg.chat.id;
    // Ignora i messaggi se non c'è una conversazione attiva o se è un comando
    if (!userState[chatId] || msg.text.startsWith('/')) return;

    const state = userState[chatId];
    if (state.action === 'add_feeding') {
        await handleFeedingConversation(chatId, msg.text);
    } else if (state.action === 'add_event') {
        await handleEventConversation(chatId, msg.text);
    }
}

// --- Logica delle Conversazioni ---

async function startFeedingConversation(chatId, reptileId) {
    userState[chatId] = { action: 'add_feeding', reptileId, step: 'check_inventory', data: {} };
    bot.sendChatAction(chatId, 'typing');

    try {
        // Tentativo di recuperare l'inventario per gli utenti BREEDER
        const { inventory } = await apiRequest('get', '/inventory', chatId);

        if (inventory?.length) {
            userState[chatId].step = 'select_food'; // Passa allo step di selezione

            let text = "📦 Seleziona il cibo dal tuo *inventario* o scegli *Altro*:\n\n";
            const inventoryButtons = inventory.map((item, index) => {
                // Genera un ID compatto per il callback: inv_item_<index>_<foodType>_<weightPerUnit>
                // L'indice serve per recuperare velocemente l'oggetto dall'array memorizzato nello stato temporaneo.
                // In questo caso, passiamo i dati completi nel callback per la comodità di recupero.
                const dataString = `${item.foodType}|${item.weightPerUnit}|${item._id}`;
                text += `• *${escapeMarkdown(item.foodType)}* (${item.weightPerUnit}g): ${item.quantity} unità\n`;
                // Utilizzo dell'ID di inventario per la callback per risalire all'oggetto.
                return [{
                    text: `${item.foodType} (${item.weightPerUnit}g) [${item.quantity}]`,
                    callback_data: `${CALLBACK_PREFIX.SELECT_INVENTORY_ITEM}${item._id}`
                }];
            });

            inventoryButtons.push([{ text: "➡️ Altro (Inserimento manuale)", callback_data: CALLBACK_PREFIX.OTHER_FOOD_TYPE }]);

            bot.sendMessage(chatId, text, {
                parse_mode: "Markdown",
                reply_markup: { inline_keyboard: inventoryButtons }
            });

        } else {
            // Inventario non disponibile o vuoto, procedi con l'inserimento manuale
            userState[chatId].step = 'manual_foodType'; // Nuovo step per distinguere l'inserimento manuale
            bot.sendMessage(chatId, "🥩 Inserisci il *tipo* di cibo (es. Topo, Ratto). \nUsa /cancel per annullare.", { parse_mode: "Markdown" });
        }
    } catch (err) {
        // Probabilmente errore 403, quindi utente non BREEDER o altro errore, procedi con l'inserimento manuale
        if (err.message.includes("BREEDER")) {
            bot.sendMessage(chatId, "⚠️ La funzionalità inventario è solo per gli utenti BREEDER. Procedi con l'inserimento manuale.");
        } else {
            console.error("Errore nel recupero inventario:", err.message);
        }
        userState[chatId].step = 'manual_foodType';
        bot.sendMessage(chatId, "🥩 Inserisci il *tipo* di cibo (es. Topo, Ratto). \nUsa /cancel per annullare.", { parse_mode: "Markdown" });
    }
}
async function handleFeedingConversation(chatId, text) {
    const state = userState[chatId];
    if (!state) return;

    try {
        switch (state.step) {
            case 'manual_foodType': // NUOVO STEP per l'opzione 'Altro' o per non-BREEDER
                state.data.foodType = text;
                state.step = 'quantity';
                bot.sendMessage(chatId, "🔢 Inserisci la *quantità*:", { parse_mode: "Markdown" });
                break;

            case 'quantity':
                state.data.quantity = parseInt(text, 10);
                if (isNaN(state.data.quantity) || state.data.quantity <= 0) return bot.sendMessage(chatId, "Per favore, inserisci un numero valido e maggiore di zero.");

                // Se weightPerUnit non è stato pre-popolato (quindi non è stato selezionato dall'inventario)
                if (!state.data.weightPerUnit) {
                    state.step = 'weightPerUnit';
                    bot.sendMessage(chatId, "⚖️ Inserisci il *peso per unità* in grammi:", { parse_mode: "Markdown" });
                } else {
                    // Se weightPerUnit è già presente (dal prelievo inventario), salta allo step 'wasEaten'
                    state.step = 'wasEaten';
                    bot.sendMessage(chatId, `✅ Dati precaricati: Tipo: *${escapeMarkdown(state.data.foodType)}*, Peso/Unità: *${state.data.weightPerUnit}g*.\n\nIl pasto è stato mangiato?`, {
                        parse_mode: "Markdown",
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: "Sì", callback_data: "feeding_eaten_yes" }],
                                [{ text: "No", callback_data: "feeding_eaten_no" }]
                            ]
                        }
                    });
                }
                break;
            case 'weightPerUnit':
                state.data.weightPerUnit = parseInt(text, 10);
                if (isNaN(state.data.weightPerUnit) || state.data.weightPerUnit <= 0) return bot.sendMessage(chatId, "Per favore, inserisci un numero valido e maggiore di zero.");
                state.step = 'wasEaten';
                bot.sendMessage(chatId, "✅ Il pasto è stato mangiato?", {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "Sì", callback_data: "feeding_eaten_yes" }],
                            [{ text: "No", callback_data: "feeding_eaten_no" }]
                        ]
                    }
                });
                break;
            case 'notes':
                state.data.notes = (text.toLowerCase() === 'no') ? '' : text;
                bot.sendMessage(chatId, "Salvataggio in corso...");
                await apiRequest('post', `/reptile/${state.reptileId}/feedings`, chatId, state.data);
                bot.sendMessage(chatId, "✅ Alimentazione registrata con successo!");
                delete userState[chatId];
                break;
            case 'nextMealDays':
                state.data.nextMealDayManual = parseInt(text, 10);
                if (isNaN(state.data.nextMealDayManual) || state.data.nextMealDayManual <= 0) {
                    return bot.sendMessage(chatId, "Per favore inserisci un numero valido di giorni.");
                }
                state.step = 'notes';
                bot.sendMessage(chatId, "📝 Aggiungi delle note (o scrivi 'no'):");
                break;
        }
    } catch (err) {
        bot.sendMessage(chatId, `❌ Errore: ${err.message}\nOperazione annullata.`);
        delete userState[chatId];
    }
}

function startEventConversation(chatId, reptileId) {
    userState[chatId] = { action: 'add_event', reptileId, step: 'type', data: {} };
    bot.sendMessage(chatId, "📅 Seleziona il *tipo* di evento o scrivilo. \nUsa /cancel per annullare.", {
        parse_mode: "Markdown",
        reply_markup: {
            inline_keyboard: [
                [{ text: "Muta", callback_data: `${CALLBACK_PREFIX.SET_EVENT_TYPE}shed` }, { text: "Feci", callback_data: `${CALLBACK_PREFIX.SET_EVENT_TYPE}feces` }],
                [{ text: "Veterinario", callback_data: `${CALLBACK_PREFIX.SET_EVENT_TYPE}vet` }, { text: "Pesata", callback_data: `${CALLBACK_PREFIX.SET_EVENT_TYPE}weight` }]
            ]
        }
    });
}

async function handleEventConversation(chatId, text, fromCallback = false) {
    const state = userState[chatId];
    if (!state) return;

    try {
        switch (state.step) {
            case 'type':
                state.data.type = text;
                state.step = 'notes';
                bot.sendMessage(chatId, `Tipo impostato: *${text}*.\n📝 Aggiungi delle note (o scrivi 'no'):`, { parse_mode: "Markdown" });
                break;
            case 'notes':
                state.data.notes = (text.toLowerCase() === 'no') ? '' : text;
                if (state.data.type === 'weight') {
                    state.step = 'weight';
                    bot.sendMessage(chatId, "⚖️ Inserisci il *peso* in grammi:");
                } else {
                    await saveEvent(chatId, state);
                }
                break;
            case 'weight':
                state.data.weight = parseInt(text, 10);
                if (isNaN(state.data.weight)) return bot.sendMessage(chatId, "Per favore, inserisci un numero valido.");
                await saveEvent(chatId, state);
                break;
        }
    } catch (err) {
        bot.sendMessage(chatId, `❌ Errore: ${err.message}\nOperazione annullata.`);
        delete userState[chatId];
    }
}

async function saveEvent(chatId, state) {
    bot.sendMessage(chatId, "Salvataggio evento in corso...");
    await apiRequest('post', `/reptile/${state.reptileId}/events`, chatId, state.data);
    bot.sendMessage(chatId, "✅ Evento registrato con successo!");
    delete userState[chatId];
}


export default bot;