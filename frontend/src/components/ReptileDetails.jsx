import React, { useEffect, useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { getEvents } from '../services/api';
import { InfoCard, InfoItem } from './InfoCard';
import { EventSection } from './EventSection';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { selectUser } from '../features/userSlice.jsx';
import CitesModal from './CitesModal';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer, YAxis } from 'recharts';

const CarouselArrow = ({ direction, onClick }) => (
    <button
        onClick={onClick}
        className={`absolute top-1/2 -translate-y-1/2 h-full w-12 bg-black/30 flex items-center justify-center z-10 hover:bg-black/50 transition-colors duration-200 ${direction === 'left' ? 'left-0' : 'right-0'}`}
    >
        {direction === 'left' ? '‹' : '›'}
    </button>
);

const EmptyState = ({ message }) => (
    <div className="flex items-center justify-center p-6 mt-2 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
        <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">{message}</span>
    </div>
);

const ReptileDetails = () => {
    const { reptileId } = useParams();
    const [reptile, setReptile] = useState(null);
    const [owner, setOwner] = useState(null);
    const [showCitesModal, setShowCitesModal] = useState(false);
    const [feedings, setFeedings] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pdfError, setPdfError] = useState('');
    const carouselRef = useRef(null);
    const defaultImage = "https://res.cloudinary.com/dg2wcqflh/image/upload/v1757791253/Logo_duqbig.png"
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
        if (kg < 1) return `${weightInGrams}g`; 
        return `${kg.toFixed(2)}kg`; 
    };

    const handleDownloadCites = async () => {
        try {
            const response = await api.get(`/reptile/download-cites/${reptile._id}`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `CITES_${reptile.name}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Failed to download CITES:", error);
        }
    };

    useEffect(() => {
        const fetchAll = async () => {
            try {
                if (isPublic) {
                    const language = navigator.language.split('-')[0] || "it";
                    const reptileResponse = await fetch(
                        `${process.env.REACT_APP_BACKEND_URL}/reptile/public/reptile/${reptileId}`,
                        {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept-Language': language
                            }
                        }
                    ); 
                    if (!reptileResponse.ok) throw new Error("Errore caricamento rettile pubblico");
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
    }, [reptileId, isPublic]);

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

    const handleDownloadOriginalCites = async () => {
        try {
            const fileUrl = `${baseUrl}${reptile.documents.cites.fileUrl}`;
            const response = await fetch(fileUrl);
            if (!response.ok) throw new Error("Errore nel recupero del file");
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            
            const ext = fileUrl.split('.').pop() || 'pdf';
            link.setAttribute('download', `CITES_${reptile.name}_Originale.${ext}`);
            
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to download original CITES:", error);
            window.open(`${baseUrl}${reptile.documents.cites.fileUrl}`, '_blank');
        }
    };

    const translateFoodType = (foodType) => {
        if (!foodType) return t('ReptileDetails.notSpecified', 'N/D');
        return t(`ReptileDetails.foodTypeList.${foodType}`, foodType);
    };

    const scrollCarousel = (direction) => {
        if (carouselRef.current) {
            const scrollAmount = carouselRef.current.offsetWidth;
            carouselRef.current.scrollBy({ left: scrollAmount * direction, behavior: 'smooth' });
        }
    };

    const getNextMealStatus = () => {
        if (!reptile?.nextFeedingDate) return null;
        const nextDate = new Date(reptile.nextFeedingDate);
        const today = new Date();
        today.setHours(0,0,0,0);
        nextDate.setHours(0,0,0,0);
        const diffTime = nextDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return { text: "OGGI", color: "bg-amber-100 text-amber-800 border-amber-300" };
        if (diffDays === 1) return { text: "DOMANI", color: "bg-blue-100 text-blue-800 border-blue-300" };
        if (diffDays < 0) return { text: `In ritardo di ${Math.abs(diffDays)} giorni`, color: "bg-red-100 text-red-800 border-red-300" };
        return { text: `Fra ${diffDays} giorni`, color: "bg-emerald-100 text-emerald-800 border-emerald-300" };
    };

    if (loading) return <div className="text-center mt-10 text-gray-500">🌀 {t('ReptileDetails.loading', 'Caricamento...')}</div>;
    if (!reptile) return <div className="text-red-500 text-center mt-10">❌ {t('ReptileDetails.notFound', 'Rettile non trovato')}</div>;

    // Configurazione Colonne 3 (Storico ed Eventi Salutari)
    const eventSectionsConfig = [
        { type: 'shed', title: t('ReptileDetails.shed', 'Mute'), icon: '🐍' },
        { type: 'feces', title: t('ReptileDetails.feces', 'Feci'), icon: '💩' },
        { type: 'vet', title: t('ReptileDetails.vet', 'Visite Veterinarie'), icon: '🩺' },
    ];

    const weightEvents = events.filter(e => e.type === 'weight').sort((a,b) => new Date(b.date) - new Date(a.date));
    const chartData = [...weightEvents].reverse().map(e => ({
        date: new Date(e.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' }),
        peso: e.weight
    }));

    const nextMeal = getNextMealStatus();

    return (
        <div className="green:bg-slate-900 min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {!isPublic && (
                    <Link to="/dashboard" className="text-emerald-600 dark:text-emerald-400 hover:underline mb-6 inline-block font-medium">
                        ← {t('ReptileDetails.backToDashboard', 'Torna alla Dashboard')}
                    </Link>
                )}
                
                {/* LAYOUT A 3 COLONNE */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 xl:gap-8">
                    
                    {/* COLONNA 1: Sinistra - Dati Fissi, Foto, Documenti, Azioni */}
                    <div className="space-y-6">
                        <InfoCard>
                            <div className="relative h-64 w-full overflow-hidden rounded-lg group">
                                <div className="flex h-full overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar" ref={carouselRef}>
                                    {(reptile.image?.filter(Boolean).length ? reptile.image.filter(Boolean) : [defaultImage]).map((img, idx) => {
                                        const imageUrl = img === defaultImage ? img : `${baseUrl}${img}`;
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
                            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                                <h1 className="text-3xl font-bold text-black dark:text-black">{reptile.name}</h1>
                                <p className="text-lg text-slate-600 dark:text-slate-800">{reptile.species}</p>
                                {reptile.price?.amount && reptile.price?.currency && (
                                    <p className="text-md text-emerald-600 dark:text-emerald-700 font-medium mt-1">
                                        {t('ReptileDetails.price', 'Prezzo')}: {reptile.price.amount} {reptile.price.currency}
                                    </p>
                                )}
                            </div>
                        </InfoCard>

                        {isPublic && (
                            <InfoCard title={t('ReptileDetails.owner', 'Proprietario')}>
                                <InfoItem label={t('ReptileDetails.ownerName', 'Nome')} value={owner.name || t('ReptileDetails.notSpecified')} />
                                <InfoItem label={t('ReptileDetails.ownerEmail', 'Email')} value={owner.email || t('ReptileDetails.notSpecified')} />
                                <InfoItem label={t('ReptileDetails.ownerAddress', 'Indirizzo')} value={owner.address || t('ReptileDetails.notSpecified')} />
                                <InfoItem label={t('ReptileDetails.ownerPhone', 'Telefono')} value={owner.phoneNumber || t('ReptileDetails.notSpecified')} />
                            </InfoCard>
                        )}

                        <InfoCard title={t('ReptileDetails.details', 'Dettagli')}>
                            <InfoItem label="Morph" value={reptile.morph || 'N/D'} />
                            <InfoItem label={t('ReptileDetails.birthDate', 'Data di Nascita')} value={new Date(reptile.birthDate).toLocaleDateString()} />
                            <InfoItem label={t('ReptileDetails.sex', 'Sesso')}>
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${reptile.sex === 'M' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}`}>
                                    {reptile.sex === 'M' ? t('ReptileDetails.male', 'Maschio') : reptile.sex === 'F' ? t('ReptileDetails.female', 'Femmina') : 'N/D'}
                                </span>
                            </InfoItem>
                            <InfoItem label={t('ReptileDetails.breeder', 'Riproduttore')}>
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${reptile.isBreeder ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                                    {reptile.isBreeder ? 'Sì' : 'No'}
                                </span>
                            </InfoItem>
                            <InfoItem label={t('ReptileDetails.previousOwner', 'Proprietario Precedente')} value={reptile.previousOwner || 'N/D'} />
                        </InfoCard>

                        <InfoCard title={t('ReptileDetails.parents', 'Genitori')}>
                            <InfoItem label={t('ReptileDetails.father', 'Padre')} value={reptile.parents?.father || 'N/D'} />
                            <InfoItem label={t('ReptileDetails.mother', 'Madre')} value={reptile.parents?.mother || 'N/D'} />
                        </InfoCard>

                        <InfoCard title={t('ReptileDetails.documents', 'Documenti')}>
                            <h4 className="font-semibold text-black dark:text-black mb-2">CITES</h4>
                            <InfoItem label={t('ReptileDetails.number', 'Numero')} value={reptile.documents?.cites?.number || 'N/D'} />
                            <InfoItem label={t('ReptileDetails.issueDate', 'Data di Rilascio')} value={reptile.documents?.cites?.issueDate?.split('T')[0] || 'N/D'} />
                            <hr className="my-3 border-slate-200 dark:border-slate-700" />
                            <h4 className="font-semibold text-black dark:text-black mb-2">{t('ReptileDetails.microchip', 'Microchip')}</h4>
                            <InfoItem label={t('ReptileDetails.code', 'Codice')} value={reptile.documents?.microchip?.code || 'N/D'} />
                            <InfoItem label={t('ReptileDetails.implantDate', 'Data Impianto')} value={reptile.documents?.microchip?.implantDate?.split('T')[0] || 'N/D'} />
                        </InfoCard>

                        {/* Raggruppamento Bottoni CTA */}
                        {!isPublic && (
                            <InfoCard title="Azioni Rapide">
                                <div className="flex flex-col gap-2 mt-2">
                                    <button onClick={downloadPDF} className="w-full bg-emerald-600 text-black px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors duration-200 shadow-sm">
                                        {t('ReptileDetails.downloadPdf', 'Scarica Scheda PDF')}
                                    </button>
                                    <div className="flex gap-2">
                                        <button onClick={() => setShowCitesModal(true)} className="flex-1 bg-green-600 text-black px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm shadow-sm">
                                            Crea CITES
                                        </button>
                                        {reptile.documents?.cites?.fileUrl && (
                                            <button onClick={handleDownloadOriginalCites} className="flex-1 bg-blue-600 text-black px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm shadow-sm">
                                                File CITES
                                            </button>
                                        )}
                                    </div>
                                    {pdfError && <p className="mt-2 text-sm text-red-500 font-medium">{pdfError}</p>}
                                </div>
                                {showCitesModal && (
                                    <CitesModal reptile={reptile} user={user} onClose={() => setShowCitesModal(false)} />
                                )}
                            </InfoCard>
                        )}

                        {!isPublic && reptile.qrCodeUrl && user.subscription.plan == "BREEDER" && (
                            <InfoCard title={t('ReptileDetails.qrCode', 'QR Code')}>
                                <div className="flex flex-col items-center space-y-3">
                                    <img src={reptile.qrCodeUrl} alt="QR Code" className="w-48 h-48 object-contain border rounded-lg shadow-sm" />
                                    <a href={reptile.qrCodeUrl} download={`${reptile.name || 'reptile'}-qrcode.png`} className="bg-emerald-600 text-black px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors duration-200 w-full text-center shadow-sm">
                                        {t('ReptileDetails.downloadQr', 'Scarica QR')}
                                    </a>
                                    {navigator.share && (
                                        <button onClick={() => navigator.share({ title: reptile.name || 'Reptile', text: t('ReptileDetails.shareQrText', 'Guarda questo rettile!'), url: `${window.location.origin}/public/reptile/${reptile._id}` })} className="bg-slate-200 text-black px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors duration-200 w-full shadow-sm">
                                            {t('ReptileDetails.shareQr', 'Condividi QR')}
                                        </button>
                                    )}
                                </div>
                            </InfoCard>
                        )}
                        
                        {reptile.notes && (
                            <InfoCard title={t('ReptileDetails.notes', 'Note')}>
                                <p className="text-black dark:text-black whitespace-pre-wrap text-sm">{reptile.notes}</p>
                            </InfoCard>
                        )}
                    </div>

                    {/* COLONNA 2: Centrale - Eventi Correnti (Alimentazione e Peso) */}
                    <div className="space-y-6">
                        
                        {/* Sezione Alimentazione */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5">
                            <div className="flex items-center gap-2 mb-4 border-b pb-3 border-slate-100 dark:border-slate-700">
                                <span className="text-xl">🍖</span>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-black">
                                    {t('ReptileDetails.feeding', 'Alimentazione')}
                                </h3>
                            </div>
                            
                            {/* Widget Prossimo Pasto */}
                            {nextMeal && (
                                <div className={`flex justify-between items-center px-4 py-3 rounded-lg border mb-5 ${nextMeal.color}`}>
                                    <span className="font-semibold text-sm">Prossimo pasto previsto:</span>
                                    <span className="font-bold uppercase tracking-wide">{nextMeal.text}</span>
                                </div>
                            )}

                            <EventSection
                                items={feedings}
                                visibleCount={visibleCounts.feedings}
                                onToggleVisibility={(showMore) => handleToggleVisibility('feedings', showMore)}
                                emptyMessage={<EmptyState message={t('ReptileDetails.noFeedings', 'Nessun pasto registrato')} />}
                                renderItem={(item) => (
                                    <div key={item._id} className="relative pl-6 py-2 border-l-2 border-slate-200 dark:border-slate-600 mb-2 last:mb-0 group hover:border-emerald-400 transition-colors">
                                        <div className="absolute left-[-5px] top-4 w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-500 group-hover:bg-emerald-500 transition-colors"></div>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                                                    {new Date(item.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </span>
                                                <div className="text-slate-600 dark:text-slate-400 text-sm mt-0.5">
                                                    {translateFoodType(item.foodType)} {item.weightPerUnit ? <span className="font-medium text-emerald-600 dark:text-emerald-400 ml-1">({item.weightPerUnit}g)</span> : ''}
                                                </div>
                                            </div>
                                            {item.wasEaten ? (
                                                <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-1 rounded-full uppercase tracking-wider">Mangiato</span>
                                            ) : (
                                                <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-1 rounded-full uppercase tracking-wider">Rifiutato</span>
                                            )}
                                        </div>
                                        {(item.supplements?.length > 0 || item.medication?.name) && (
                                            <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-lg text-xs flex flex-col gap-1">
                                                {item.supplements?.length > 0 && (
                                                    <p className="text-stone-700 dark:text-stone-300">
                                                        <span className="font-semibold mr-1">💊 Integratori:</span> {item.supplements.join(', ')}
                                                    </p>
                                                )}
                                                {item.medication?.name && (
                                                    <p className="text-stone-700 dark:text-stone-300">
                                                        <span className="font-semibold mr-1">🏥 Terapia:</span> {item.medication.name} {item.medication.dosage && `(${item.medication.dosage})`}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            />
                        </div>

                        {/* Sezione Peso */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5">
                            <div className="flex items-center gap-2 mb-4 border-b pb-3 border-slate-100 dark:border-slate-700">
                                <span className="text-xl">⚖️</span>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-black">
                                    {t('ReptileDetails.weight', 'Storico Peso')}
                                </h3>
                            </div>
                            
                            {/* Grafico della Crescita */}
                            {chartData.length > 1 && (
                                <div className="h-48 w-full mt-2 mb-6 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData}>
                                            <XAxis dataKey="date" fontSize={11} tickMargin={10} axisLine={false} tickLine={false} />
                                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                            <Line type="monotone" dataKey="peso" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            )}

                            <EventSection
                                items={weightEvents}
                                visibleCount={visibleCounts.weight}
                                onToggleVisibility={(showMore) => handleToggleVisibility('weight', showMore)}
                                emptyMessage={<EmptyState message={t('ReptileDetails.noEvent', { event: 'Peso' })} />}
                                renderItem={(item, index) => (
                                    <div key={item._id} className="flex justify-between items-center p-3 border-b border-slate-100 dark:border-slate-700/50 text-slate-800 dark:text-slate-200 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm">{new Date(item.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                            {index === 0 && <span className="px-2 py-0.5 text-[10px] bg-emerald-100 text-emerald-700 rounded-full font-bold uppercase tracking-wider">Ultimo</span>}
                                        </div>
                                        <strong className="text-base">{formatWeight(item.weight)}</strong>
                                    </div>
                                )}
                            />
                        </div>
                    </div>

                    {/* COLONNA 3: Destra - Storico Salute (Mute, Feci, Vet, PCR) */}
                    <div className="space-y-6">
                        
                        {/* Sezione Test PCR */}
                        {reptile.pcrTests && reptile.pcrTests.length > 0 && (
                            <InfoCard title={t('ReptileDetails.pcrTests', 'Test Sanitari (PCR)')}>
                                <div className="space-y-4 mt-2">
                                    {reptile.pcrTests.map((test, index) => (
                                        <div key={index} className="flex flex-col p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-700/50 shadow-sm hover:border-emerald-200 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-emerald-600/80">🧬</span>
                                                    <span className="font-semibold text-slate-900 dark:text-black text-sm">{test.disease}</span>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide
                                                    ${test.result === 'Negativo' ? 'bg-emerald-100 text-emerald-800' : 
                                                    test.result === 'Positivo' ? 'bg-rose-100 text-rose-800' : 
                                                    'bg-amber-100 text-amber-800'}`}
                                                >
                                                    {test.result === 'In attesa' && <span className="mr-1">⏳</span>}{test.result}
                                                </span>
                                            </div>
                                            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                                {new Date(test.testDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </span>
                                            {test.notes && (
                                                <div className="mt-2 py-1.5 px-2.5 bg-white dark:bg-slate-800 rounded border-l-2 border-slate-200">
                                                    <p className="text-xs text-slate-600 italic">"{test.notes}"</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </InfoCard>
                        )}

                        {/* Mute, Feci, Vet */}
                        {eventSectionsConfig.map(section => {
                            const filteredEvents = events.filter(e => e.type === section.type);
                            return (
                                <div key={section.type} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5">
                                    <div className="flex items-center gap-2 mb-4 border-b pb-3 border-slate-100 dark:border-slate-700">
                                        <span className="text-xl">{section.icon}</span>
                                        <h3 className="font-bold text-lg text-slate-900 dark:text-black">{section.title}</h3>
                                    </div>
                                    <EventSection
                                        items={filteredEvents}
                                        visibleCount={visibleCounts[section.type]}
                                        onToggleVisibility={(showMore) => handleToggleVisibility(section.type, showMore)}
                                        emptyMessage={<EmptyState message={t('ReptileDetails.noEvent', { event: section.title })} />}
                                        renderItem={(item) => (
                                            <div key={item._id} className="p-3 border-b border-slate-100 dark:border-slate-700/50 text-slate-800 dark:text-slate-200 last:border-0 text-sm">
                                                <span className="font-semibold text-slate-600 dark:text-slate-400 mr-2">
                                                    {new Date(item.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </span>
                                                <br/>
                                                <span className="mt-1 inline-block">{item.notes || <span className="text-slate-400 italic">Nessuna nota</span>}</span>
                                            </div>
                                        )}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReptileDetails;