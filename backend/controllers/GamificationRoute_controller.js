import User from "../models/User.js";
import Reptile from "../models/Reptile.js";
import Feeding from "../models/Feeding.js"; // Usato per misurare l'attività

export const getLeaderboards = async (req, res) => {
    try {
        // 1. Top 5 Allevatori (Reptile.user)
        const topKeepers = await Reptile.aggregate([
            { $group: { _id: "$user", count: { $sum: 1 } } }, // Corretto: "user" invece di "owner"
            { $sort: { count: -1 } },
            { $limit: 5 },
            { 
                $lookup: {
                    from: "User", // Assicurati che su MongoDB la collezione si chiami esattamente "User"
                    localField: "_id",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            { $unwind: "$userDetails" },
            { $project: { name: "$userDetails.name", count: 1 } }
        ]);

        // 2. Top 5 Allevatori più attivi (Feeding -> Reptile -> User)
const topActive = await User.aggregate([
            {
                $project: {
                    name: 1,
                    // Calcoliamo la dimensione dell'array loginHistory
                    // Usiamo $ifNull per evitare errori se l'array non esiste
                    activityCount: { $size: { $ifNull: ["$loginHistory", []] } }
                }
            },
            { $sort: { activityCount: -1 } },
            { $limit: 5 }
        ]);
        // 3. Top 5 Referrers (Funziona già perché interroga direttamente User)
        const topReferrers = await User.find()
            .sort({ referralCount: -1 })
            .limit(5)
            .select("name referralCount");

        res.status(200).json({ topKeepers, topActive, topReferrers });
    } catch (error) {
        console.error(error); // Logga l'errore per il debug
        res.status(500).json({ message: "Errore nel caricamento delle classifiche", error });
    }
};