import { useTranslation } from "react-i18next";
import {
    ChevronRight,
    PawPrint,
    Egg,
    CalendarDays,
    BarChart3,
    QrCode,
    Send,
    FileText,
    Warehouse,
    hoppingCart,
    ShoppingCart,
    Printer
} from "lucide-react";

// Componente per le card delle funzionalità
const FeatureCard = ({ icon, title, description }) => (
    <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-amber-400 text-slate-800 mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
);

const Home = () => {
    const { t } = useTranslation();

    const features = [
        { icon: <PawPrint size={24} />, title: t('home.features.management.title'), description: t('home.features.management.desc') },
        { icon: <Egg size={24} />, title: t('home.features.breeding.title'), description: t('home.features.breeding.desc') },
        { icon: <Warehouse size={24} />, title: t('home.features.inventory.title'), description: t('home.features.inventory.desc') },
        { icon: <ShoppingCart size={24} />, title: t('home.features.shop.title'), description: t('home.features.shop.desc') },
        { icon: <CalendarDays size={24} />, title: t('home.features.calendar.title'), description: t('home.features.calendar.desc') },
        { icon: <BarChart3 size={24} />, title: t('home.features.stats.title'), description: t('home.features.stats.desc') },
        { icon: <Printer size={24} />, title: t('home.features.citesGen.title'), description: t('home.features.citesGen.desc') },
        { icon: <FileText size={24} />, title: t('home.features.docs.title'), description: t('home.features.docs.desc') },
        { icon: <Send size={24} />, title: t('home.features.telegram.title'), description: t('home.features.telegram.desc') },
        { icon: <QrCode size={24} />, title: t('home.features.qr.title'), description: t('home.features.qr.desc') },
    ];

    return (
        <div className="min-h-screen text-slate-800 font-sans">
            {/* Sezione Hero */}
            <main className="relative overflow-hidden">
                <section className="bg-gradient-to-br from-amber-50 to-yellow-100">
                    <div className="container mx-auto px-6 pt-24 pb-16 sm:pt-32 sm:pb-24 text-center">
                        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
                            {t('home.hero.title')}
                        </h1>
                        <p className="text-lg text-slate-700 max-w-3xl mx-auto mb-10">
                            {t('home.hero.subtitle')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="/register"
                                className="group bg-amber-400 text-slate-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-amber-500 transition-transform duration-300 hover:scale-105 shadow-lg"
                            >
                                {t('home.hero.ctaStart')}
                                <ChevronRight className="inline-block ml-2 group-hover:translate-x-1 transition-transform" />
                            </a>
                        </div>
                    </div>
                </section>

                {/* Sezione Anteprima Dashboard */}
                <section className="relative py-16 sm:py-24">
                    <div className="container mx-auto px-6">
                        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl p-4 border border-slate-200">
                            {/* Mockup della barra del browser */}
                            <div className="flex items-center gap-2 mb-3 px-2">
                                <span className="w-3 h-3 bg-red-400 rounded-full"></span>
                                <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
                                <span className="w-3 h-3 bg-green-400 rounded-full"></span>
                            </div>
                            {/* Immagine */}
                            <img
                                src="https://res.cloudinary.com/dg2wcqflh/image/upload/v1760704915/dashboard_b3addu.png"
                                alt={t('home.dashboard.alt')}
                                className="w-full h-auto rounded-lg"
                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/1200x800/cccccc/334155?text=Image+Not+Found'; }}
                            />
                        </div>
                    </div>
                </section>


                {/* Sezione Funzionalità */}
                <section id="funzionalita" className="py-16 sm:py-24 bg-gradient-to-br from-amber-50 to-yellow-100">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{t('home.features.title')}</h2>
                        <p className="text-lg text-slate-700 max-w-3xl mx-auto mb-12">{t('home.features.subtitle')}</p>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
{features.map((feature) => (
    <FeatureCard
        key={feature.title}
        icon={feature.icon}
        title={feature.title}
        description={feature.description} // <-- qui va la prop
    />
))}
                        </div>
                    </div>
                </section>

                {/* Sezione "Chi Siamo" */}
                <section id="chi-siamo" className="py-16 sm:py-24">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{t('home.about.title')}</h2>
                        <p className="max-w-3xl mx-auto text-slate-700 text-lg leading-relaxed">
                           {t('home.about.desc')}
                        </p>
                    </div>
                </section>
                
                {/* Sezione CTA Finale */}
                <section className="bg-amber-400">
                     <div className="container mx-auto px-6 py-16 sm:py-24 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{t('home.ctaEnd.title')}</h2>
                        <p className="text-lg text-slate-800 max-w-2xl mx-auto mb-8">
                            {t('home.ctaEnd.desc')}
                        </p>
                        <a
                            href="/register"
                            className="bg-slate-900 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-800 transition-transform duration-300 hover:scale-105 shadow-lg"
                        >
                           {t('home.ctaEnd.cta')}
                        </a>
                    </div>
                </section>

                {/* Footer Contatti */}
                <footer id="contatti" className=" text-slate-300 py-12">
                     <div className="container mx-auto px-6 text-center">
                        <h3 className="text-2xl font-semibold mb-4 text-black">{t('home.contact.title')}</h3>
                        <p className="text-slate-800">
                            {t('home.contact.desc')}{" "}
                            <a href="mailto:support@snakebee.it" className="text-amber-400 underline hover:text-amber-300 transition">support@snakebee.it</a>
                            {" "}{t('home.contact.or')}{" "}
                            <a href="https://www.instagram.com/snakebeeofficial/" className="text-amber-400 underline hover:text-amber-300" target="_blank" rel="noopener noreferrer">
                                {t('home.contact.instagram')}
                            </a>.
                        </p>
                     </div>
                </footer>
            </main>
        </div>
    );
};

export default Home;

