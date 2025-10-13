import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { reactToArticle } from '../services/blogApi';
import { useSelector } from 'react-redux';
import { selectUser } from '../features/userSlice';
import { FaThumbsUp, FaThumbsDown, FaHeart, FaFire, FaCheck } from 'react-icons/fa';

// Configurazione icone + colori
const reactionConfig = {
    like: { icon: <FaThumbsUp />, color: 'blue' },
    dislike: { icon: <FaThumbsDown />, color: 'gray' },
    love: { icon: <FaHeart />, color: 'red' },
    fire: { icon: <FaFire />, color: 'orange' },
    thumbup: { icon: <FaCheck />, color: 'green' },
};

const ArticleReactions = ({ articleId, initialCounts, initialUserReaction }) => {
    const { t } = useTranslation();
    const user = useSelector(selectUser);
    const [reactionCounts, setReactionCounts] = useState(initialCounts || {});
    const [userReaction, setUserReaction] = useState(initialUserReaction);

    const handleReaction = async (reaction) => {
        if (!user) {
            return;
        }
        try {
            const { data } = await reactToArticle(articleId, reaction);
            setReactionCounts(data.reactionCounts);
            setUserReaction(data.currentUserReaction);
        } catch (error) {
            console.error(t('blog.reaction_error'), error);
        }
    };

    return (
        <div className="flex flex-wrap justify-center gap-3 mt-4">
            {Object.entries(reactionConfig).map(([reaction, { icon }]) => {
                const isActive = userReaction === reaction;
                return (
                    <button
                        key={reaction}
                        onClick={() => handleReaction(reaction)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all duration-200 transform hover:scale-110
                            ${
                                isActive
                                ? 'bg-emerald-500 text-white shadow-md'
                                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-300'
                            }`}
                        aria-pressed={isActive}
                    >
                        {icon}
                        <span className="text-sm">{t(`blog.reactions.${reaction}`)} ({reactionCounts[reaction] || 0})</span>
                    </button>
                );
            })}
        </div>
    );
};

export default ArticleReactions;
