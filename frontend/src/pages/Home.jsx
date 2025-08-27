import { Link } from "react-router-dom";
import { PlusCircle, Utensils, HeartPulse, EggFried } from "lucide-react";
import { useTranslation } from "react-i18next";


const Home = () => {
    const { t} = useTranslation();

    return (
        <div className="min-h-screen bg-[#FAF3E0] text-[#2B2B2B] font-sans">
            <main className="max-w-6xl mx-auto p-6">

                {/* Hero */}
                <section className="text-center py-16 sm:py-24">
                    <h1 className="text-4xl sm:text-5xl font-extrabold mb-6">{t('home.hero.title')}</h1>
                    <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-8">
                        {t('home.hero.subtitle')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/register"
                            className="bg-[#FFD700] text-[#2B2B2B] px-6 py-3 rounded-full font-semibold hover:bg-yellow-400 transition"
                        >
                           {t('home.hero.ctaStart')}
                        </Link>
                        <a
                            href="#come-funziona"
                            className="border border-[#2B2B2B] px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition"
                        >
                            {t('home.hero.ctaLearn')}
                        </a>
                    </div>
                </section>

                {/* How it works */}
                <section id="come-funziona" className="py-16 border-t border-gray-300">
                    <h2 className="text-3xl font-bold text-center mb-12">{t('home.howItWorks.title')}</h2>
                    <div className="grid sm:grid-cols-3 gap-8 text-center text-gray-800">
                        <div>
                            <PlusCircle className="mx-auto mb-4 h-16 w-16 text-[#228B22]" />
                            <h4 className="text-xl font-semibold mb-2">{t('home.howItWorks.steps.1.title')}</h4>
                            <p>{t('home.howItWorks.steps.1.desc')}</p>
                        </div>
                        <div>
                            <Utensils className="mx-auto mb-4 h-16 w-16 text-[#228B22]" />
                            <h4 className="text-xl font-semibold mb-2">{t('home.howItWorks.steps.2.title')}</h4>
                            <p>{t('home.howItWorks.steps.2.desc')}</p>
                        </div>
                        <div>
                            <EggFried className="mx-auto mb-4 h-16 w-16 text-[#228B22]" />
                            <h4 className="text-xl font-semibold mb-2">{t('home.howItWorks.steps.3.title')}</h4>
                            <p>{t('home.howItWorks.steps.3.desc')}</p>
                        </div>
                    </div>
                </section>
                {/* Screenshot or preview */}
                <section className="py-16 border-t border-gray-300 text-center">
                    <h2 className="text-3xl font-bold mb-6">{t('home.dataSafety.title')}</h2>
                    <p className="text-gray-700 mb-8">{t('home.dataSafety.desc')}</p>
                    <img
                        src="/dashboard.png"
                        alt={t('home.dataSafety.dashboardAlt')}
                        className="mx-auto rounded-lg shadow-lg border border-gray-200"
                    />
                </section>

                {/* Services */}
                <section id="servizi" className="py-16 border-t border-gray-300">
                    <h3 className="text-3xl font-bold mb-6">{t('home.services.title')}</h3>
                    <ul className="grid sm:grid-cols-2 gap-4 list-disc ml-6 text-gray-800">
                        <li><strong>{t('home.services.list.reptileManagement1')}</strong> {t('home.services.list.reptileManagement2')}</li>
                        <li><strong>{t('home.services.list.breeding1')}</strong> {t('home.services.list.breeding2')}</li>
                        <li><strong>{t('home.services.list.notifications1')}</strong> {t('home.services.list.notifications2')}</li>
                        <li><strong>{t('home.services.list.organizedData1')}</strong> {t('home.services.list.organizedData2')}</li>
                        <li><strong>{t('home.services.list.inventory1')}</strong> {t('home.services.list.inventory2')}</li>
                        <li><strong>{t('home.services.list.calendar1')}</strong> {t('home.services.list.calendar2')}</li>
                        <li><strong>{t('home.services.list.export1')}</strong> {t('home.services.list.export2')}</li>
                        <li><strong>{t('home.services.list.stats1')}</strong> {t('home.services.list.stats2')}</li>
                    </ul>
                </section>

                {/* In-depth Services */}
                <section className="py-16 border-t border-gray-300">
                    <h2 className="text-3xl font-bold text-center mb-12">{t('home.servicesInDepth.title')}</h2>
                    <div className="space-y-8 text-gray-800 max-w-4xl mx-auto text-lg leading-relaxed">
                        <div>
                            <h4 className="text-xl font-semibold mb-2">{t('home.servicesInDepth.details.management.title')}</h4>
                            <p>{t('home.servicesInDepth.details.management.desc')}</p>
                        </div>
                        <div>
                            <h4 className="text-xl font-semibold mb-2">{t('home.servicesInDepth.details.breeding.title')}</h4>
                            <p>{t('home.servicesInDepth.details.breeding.desc')}</p>
                        </div>
                        <div>
                            <h4 className="text-xl font-semibold mb-2">{t('home.servicesInDepth.details.notifications.title')}</h4>
                            <p>{t('home.servicesInDepth.details.notifications.desc')}</p>
                        </div>
                        <div>
                            <h4 className="text-xl font-semibold mb-2">{t('home.servicesInDepth.details.inventory.title')}</h4>
                            <p>{t('home.servicesInDepth.details.inventory.desc')}</p>
                        </div>
                        <div>
                            <h4 className="text-xl font-semibold mb-2">{t('home.servicesInDepth.details.calendar.title')}</h4>
                            <p>{t('home.servicesInDepth.details.calendar.desc')}</p>
                        </div>
                        <div>
                            <h4 className="text-xl font-semibold mb-2">{t('home.servicesInDepth.details.export.title')}</h4>
                            <p>{t('home.servicesInDepth.details.export.desc')}</p>
                        </div>
                        <div>
                            <h4 className="text-xl font-semibold mb-2">{t('home.servicesInDepth.details.stats.title')}</h4>
                            <p>{t('home.servicesInDepth.details.stats.desc')}</p>
                        </div>
                    </div>
                </section>

                {/* WHAT WE WANT TO BUILD */}
                <section className="py-16 border-t border-gray-300 text-center">
                    <h2 className="text-3xl font-bold mb-6">{t('home.futureGoals.title')}</h2>
                    <p className="text-lg text-gray-700 max-w-2xl mx-auto">
{t('home.futureGoals.desc')}
                    </p>
                </section>

                {/* WHO WE ARE */}
                <section id="chi-siamo" className="py-16 border-t border-gray-300 text-center">
                    <h2 className="text-3xl font-bold mb-6">{t('home.about.title')}</h2>
                    <p className="max-w-3xl mx-auto text-gray-700 text-lg leading-relaxed">
                        {t('home.about.desc')}
                    </p>
                </section>

                {/* CONTACTS */}
                <section id="contatti" className="py-12 border-t border-gray-300 text-center">
                    <h3 className="text-2xl font-semibold mb-4">{t('home.contact.title')}</h3>
                    <p className="text-gray-700">
                        {t('home.contact.desc')}{" "}
                        <a href="mailto:support@snakebee.it" className="text-[#228B22] underline">support@snakebee.it</a>{" "}
                        {t('home.contact.instagram')} <a href="https://www.instagram.com/snakebeeofficial/" className="underline text-[#228B22]" target="_blank" rel="noreferrer">Instagram</a>.
                    </p>
                </section>

            </main>
        </div>
    );
};

export default Home;
