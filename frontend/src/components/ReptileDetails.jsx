import React, { useEffect, useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { getEvents } from '../services/api';
import { InfoCard, InfoItem } from './InfoCard';
import { EventSection } from './EventSection';
import { FeedingCard } from './FeedingCard';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { selectUser } from '../features/userSlice.jsx';

const CarouselArrow = ({ direction, onClick }) => (
    <button
        onClick={onClick}
        className={`absolute top-1/2 -translate-y-1/2 h-full w-12 bg-black/30 flex items-center justify-center z-10 hover:bg-black/50 transition-colors duration-200 ${direction === 'left' ? 'left-0' : 'right-0'}`}
    >
        {direction === 'left' ? '‹' : '›'}
    </button>
);


const ReptileDetails = () => {
    const { reptileId } = useParams();
    const [reptile, setReptile] = useState(null);
    const [owner, setOwner] = useState(null);

    const [feedings, setFeedings] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pdfError, setPdfError] = useState('');
    const carouselRef = useRef(null);
    const defaultImage = "https://res.cloudinary.com/dg2wcqflh/image/upload/v1753088270/sq1upmjw7xgrvpkghotk.png"
    const { t } = useTranslation();
    const user = useSelector(selectUser);

    const [visibleCounts, setVisibleCounts] = useState({
        feedings: 5,
        shed: 5,
        feces: 5,
        vet: 5,
        weight: 5,
    });

    const baseUrl = process.env.REACT_APP_BACKEND_URL_IMAGE || '';
    const isPublic = window.location.pathname.includes("/public/");
    const formatWeight = (weightInGrams) => {
        if (!weightInGrams && weightInGrams !== 0) return '';
        const kg = weightInGrams / 1000;
        if (kg < 1) return t(`${weightInGrams}g`); // es. "500 g"
        return t(`${kg.toFixed(2)}kg`); // es. "1.25 kg"
    };


    useEffect(() => {
        const fetchAll = async () => {
            try {

                if (isPublic) {
                    const language = navigator.language.split('-')[0] || "it";

                    // --- caso pubblico: fetch nativo ---
                    const reptileResponse = await fetch(
                        `${process.env.REACT_APP_BACKEND_URL}/reptile/public/reptile/${reptileId}`,
                        {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept-Language': language
                            }
                        }
                    ); if (!reptileResponse.ok) throw new Error("Errore caricamento rettile pubblico");
                    const reptileData = await reptileResponse.json();
                    setOwner(reptileData.owner);
                    setReptile(reptileData.reptile);
                    setFeedings(reptileData.feedings || []);
                    setEvents(reptileData.events || []);
                } else {
                    const { data: reptileData } = await api.get(`/reptile/${reptileId}`);
                    setReptile(reptileData);

                    const { data: feedingData } = await api.get(`/feedings/${reptileId}?page=1`);
                    setFeedings(feedingData.dati || []);

                    const { data: eventData } = await getEvents(reptileId);
                    setEvents(eventData || []);
                }
            } catch (err) {
                console.error("Errore fetch:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [reptileId]);

    const handleToggleVisibility = (type, showMore) => {
        setVisibleCounts(prev => ({
            ...prev,
            [type]: showMore ? prev[type] + 5 : 5,
        }));
    };

    const downloadPDF = async () => {
        try {
            setPdfError('');
            const response = await api.get(`/reptile/${reptileId}/pdf`, { responseType: 'blob' });

            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const text = reader.result;
                    const json = JSON.parse(text);

                    if (json.message) {
                        setPdfError(`⚠️ ${json.message}`);
                        return;
                    }
                } catch {
                    const url = window.URL.createObjectURL(response.data);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${reptile.name || 'reptile'}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    window.URL.revokeObjectURL(url);
                }
            };
            reader.onerror = () => {
                setPdfError(t('ReptileDetails.errorPDF'));
            };
            reader.readAsText(response.data);

        } catch (error) {
            if (error.response?.data) {
                const reader = new FileReader();
                reader.onload = () => {
                    try {
                        const json = JSON.parse(reader.result);
                        if (json.message) {
                            setPdfError(`⚠️ ${json.message}`);
                            return;
                        }
                    } catch {
                        setPdfError(t('ReptileDetails.serverError'));
                    }
                };
                reader.readAsText(error.response.data);
            } else {
                setPdfError(t('ReptileDetails.downloadError'));
            }
        }
    };

    const scrollCarousel = (direction) => {
        if (carouselRef.current) {
            const scrollAmount = carouselRef.current.offsetWidth;
            carouselRef.current.scrollBy({ left: scrollAmount * direction, behavior: 'smooth' });
        }
    };

    if (loading) return <div className="text-center mt-10 text-gray-500">🌀 {t('ReptileDetails.loading')}</div>;
    if (!reptile) return <div className="text-red-500 text-center mt-10">❌ {t('ReptileDetails.notFound')}</div>;

    // Definiamo le sezioni degli eventi per non ripeterci nel JSX
    const eventSectionsConfig = [
        { type: 'shed', title: t('ReptileDetails.shed'), icon: '🐍' },
        { type: 'feces', title: t('ReptileDetails.feces'), icon: '💩' },
        { type: 'weight', title: t('ReptileDetails.weight'), icon: '⚖️' },
        { type: 'vet', title: t('ReptileDetails.vet'), icon: '🩺' },
    ];

    return (
        <div className=" green:bg-slate-900 min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {!isPublic && (
                    <Link to="/dashboard" className="text-emerald-600 dark:text-emerald-400 hover:underline mb-6 inline-block">
                        {t('ReptileDetails.backToDashboard')}
                    </Link>
                )}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                        <InfoCard>
                            <div className="relative h-64 w-full overflow-hidden rounded-lg group">
                                <div className="relative h-64 w-full overflow-hidden rounded-lg group">
                                    <div className="flex h-full overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar" ref={carouselRef}>
                                        {(reptile.image?.filter(Boolean).length ? reptile.image.filter(Boolean) : [defaultImage]).map((img, idx) => {
                                            const imageUrl = img === defaultImage ? img : `${baseUrl}${img}`; // Applica BaseURL solo alle immagini dell'utente
                                            return (
                                                <img
                                                    key={idx}
                                                    src={imageUrl}
                                                    alt={`${reptile.name || 'reptile'} - ${idx + 1}`}
                                                    className="object-cover w-full h-full flex-shrink-0 snap-center"
                                                />
                                            );
                                        })}
                                    </div>

                                    {(reptile.image?.filter(Boolean)?.length || 0) > 1 && (
                                        <>
                                            <CarouselArrow direction="left" onClick={() => scrollCarousel(-1)} />
                                            <CarouselArrow direction="right" onClick={() => scrollCarousel(1)} />
                                        </>
                                    )}
                                </div>



                                {reptile.image?.length > 1 && (
                                    <>
                                        <CarouselArrow direction="left" onClick={() => scrollCarousel(-1)} />
                                        <CarouselArrow direction="right" onClick={() => scrollCarousel(1)} />
                                    </>
                                )}
                            </div>
                            <div className="p-4">
                                <h1 className="text-3xl font-bold text-black dark:text-black">{reptile.name}</h1>
                                <p className="text-lg text-black dark:text-black">{reptile.species}</p>
                                {reptile.price?.amount && reptile.price?.currency && (
                                    <p className="text-md text-gray-700 dark:text-gray-900 mt-1">
                                        {t('ReptileDetails.price')}: {reptile.price.amount} {reptile.price.currency}
                                    </p>
                                )}
                            </div>
                        </InfoCard>
                        {isPublic && (
                            <InfoCard title={t('ReptileDetails.owner')}>
                                <InfoItem label={t('ReptileDetails.ownerName')} value={owner.name || t('ReptileDetails.notSpecified')} />
                                <InfoItem label={t('ReptileDetails.ownerEmail')} value={owner.email || t('ReptileDetails.notSpecified')} />
                                <InfoItem label={t('ReptileDetails.ownerAddress')} value={owner.address || t('ReptileDetails.notSpecified')} />
                                <InfoItem label={t('ReptileDetails.ownerPhone')} value={owner.phoneNumber || t('ReptileDetails.notSpecified')} />

                            </InfoCard>
                        )}

                        <InfoCard title={t('ReptileDetails.details')}>
                            <InfoItem label="Morph" value={reptile.morph || 'N/D'} />
                            <InfoItem label={t('ReptileDetails.birthDate')} value={new Date(reptile.birthDate).toLocaleDateString()} />
                            <InfoItem label={t('ReptileDetails.sex')}>
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${reptile.sex === 'M' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'}`}>
                                    {reptile.sex === 'M'
                                        ? t('ReptileDetails.male')
                                        : reptile.sex === 'F'
                                            ? t('ReptileDetails.female')
                                            : t('ReptileDetails.unknown')}
                                </span>
                            </InfoItem>
                            <InfoItem label={t('ReptileDetails.breeder')}>
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${reptile.isBreeder ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-slate-100 text-black dark:bg-slate-700 dark:text-black'}`}>
                                    {reptile.isBreeder ? t('ReptileDetails.yes') : t('ReptileDetails.no')}
                                </span>
                            </InfoItem>
                        </InfoCard>

                        {reptile.notes && (
                            <InfoCard title={t('ReptileDetails.notes')}>
                                <p className="text-black dark:text-black whitespace-pre-wrap">{reptile.notes}</p>
                            </InfoCard>
                        )}

                        <InfoCard title={t('ReptileDetails.parents')}>
                            <InfoItem label={t('ReptileDetails.father')} value={reptile.parents?.father || t('ReptileDetails.notSpecified')} />
                            <InfoItem label={t('ReptileDetails.mother')} value={reptile.parents?.mother || t('ReptileDetails.notSpecified')} />
                        </InfoCard>
                        <InfoCard title={t('ReptileDetails.documents')}>
                            <h4 className="font-semibold text-black dark:text-black mb-2">CITES</h4>
                            <InfoItem label={t('ReptileDetails.number')} value={reptile.documents?.cites?.number || 'N/D'} />
                            <InfoItem label={t('ReptileDetails.issueDate')} value={reptile.documents?.cites?.issueDate?.split('T')[0] || 'N/D'} />
                            <hr className="my-3 border-slate-200 dark:border-slate-700" />
                            <h4 className="font-semibold text-black dark:text-black mb-2">{t('ReptileDetails.microchip')}</h4>
                            <InfoItem label={t('ReptileDetails.code')} value={reptile.documents?.microchip?.code || 'N/D'} />
                            <InfoItem label={t('ReptileDetails.implantDate')} value={reptile.documents?.microchip?.implantDate?.split('T')[0] || 'N/D'} />
                        </InfoCard>
                        {!isPublic && (

                            <div>
                                <button onClick={downloadPDF} className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors duration-200">
                                    {t('ReptileDetails.downloadPdf')}
                                </button>
                                {pdfError && <p className="mt-2 text-sm text-red-500">{pdfError}</p>}
                            </div>)}


                        {!isPublic && reptile.qrCodeUrl && user.subscription.plan == "BREEDER" && (
                            <InfoCard title={t('ReptileDetails.qrCode')}>
                                <div className="flex flex-col items-center space-y-3">
                                    {/* Mostra QR */}
                                    <img
                                        src={reptile.qrCodeUrl}
                                        alt="QR Code"
                                        className="w-48 h-48 object-contain border rounded-lg shadow"
                                    />

                                    {/* Pulsante scarica */}
                                    <a
                                        href={reptile.qrCodeUrl}
                                        download={`${reptile.name || 'reptile'}-qrcode.png`}
                                        className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors duration-200 w-full text-center"
                                    >
                                        {t('ReptileDetails.downloadQr')}
                                    </a>

                                    {/* Pulsante condividi (solo se supportato) */}
                                    {navigator.share && (
                                        <button
                                            onClick={() =>
                                                navigator.share({
                                                    title: reptile.name || 'Reptile',
                                                    text: t('ReptileDetails.shareQrText'),
                                                    url: `${window.location.origin}/public/reptile/${reptile._id}`,
                                                })
                                            }
                                            className="bg-slate-200 text-black px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors duration-200 w-full"
                                        >
                                            {t('ReptileDetails.shareQr')}
                                        </button>
                                    )}
                                </div>
                            </InfoCard>
                        )}

                    </div>

                    {/* COLONNA DESTRA */}
                    <div className="lg:col-span-2 space-y-6">
                        <EventSection
                            title={t('ReptileDetails.feeding')}
                            icon="🍖"
                            items={feedings}
                            visibleCount={visibleCounts.feedings}
                            onToggleVisibility={(showMore) => handleToggleVisibility('feedings', showMore)}
                            renderItem={(item) => <FeedingCard key={item._id} feeding={item} />}
                            emptyMessage={t('ReptileDetails.noFeedings')}
                        />

                        {eventSectionsConfig.map(section => {
                            const filteredEvents = events.filter(e => e.type === section.type);
                            return (
                                <EventSection
                                    key={section.type}
                                    title={section.title}
                                    icon={section.icon}
                                    items={filteredEvents}
                                    visibleCount={visibleCounts[section.type]}
                                    onToggleVisibility={(showMore) => handleToggleVisibility(section.type, showMore)}
                                    emptyMessage={t('ReptileDetails.noEvent', { event: section.title })}
                                    renderItem={(item) => {
                                        switch (section.type) {
                                            case 'weight':
                                                return (
                                                    <div key={item._id} className="p-2 border-b text-black">
                                                        <span>{new Date(item.date).toLocaleDateString()}</span> - <strong>{formatWeight(item.weight)}</strong>
                                                    </div>
                                                );
                                            case 'vet':
                                                return (
                                                    <div key={item._id} className="p-2 border-b text-black">
                                                        <span>{new Date(item.date).toLocaleDateString()}</span> - 🩺 {item.notes || t('ReptileDetails.noNotes')}
                                                    </div>
                                                );
                                            case 'feces':
                                                return (
                                                    <div key={item._id} className="p-2 border-b text-black">
                                                        <span>{new Date(item.date).toLocaleDateString()}</span> - 💩 {item.notes || t('ReptileDetails.noNotes')}
                                                    </div>
                                                );
                                            case 'shed':
                                                return (
                                                    <div key={item._id} className="p-2 border-b text-black">
                                                        <span>{new Date(item.date).toLocaleDateString()}</span> - 🐍 {item.notes || t('ReptileDetails.noNotes')}
                                                    </div>
                                                );
                                            default:
                                                return null;
                                        }
                                    }}
                                />
                            );
                        })}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReptileDetails;