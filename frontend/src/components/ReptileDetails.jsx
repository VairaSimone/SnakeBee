import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Link, useParams } from 'react-router-dom';
import { getEvents, deleteEvent } from '../services/api';
const ReptileDetails = () => {
  const { reptileId } = useParams();
  const [reptile, setReptile] = useState(null);
  const [feedings, setFeedings] = useState([]);
  const [breeding, setBreeding] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleFeedings, setVisibleFeedings] = useState(0);
  const [events, setEvents] = useState([]);
  const [visibleShed, setVisibleShed] = useState(5);
  const [visibleFeces, setVisibleFeces] = useState(5);
  const [visibleVet, setVisibleVet] = useState(5);
  const [visibleWeight, setVisibleWeight] = useState(5);

  const handleShowMore = () => {
    setVisibleFeedings(prev => prev + 5);
  };
const downloadPDF = async () => {
  try {
    const response = await api.get(`/reptile/${reptileId}/pdf`, {
      responseType: 'blob', // fondamentale per scaricare i file
    });

    const blob = response.data;
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${reptile.name || 'reptile'}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Errore nel download del PDF:', error);
    alert('Errore durante il download del PDF. Riprova più tardi.');
  }
};


  const handleShowLess = () => {
    setVisibleFeedings(5);
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Dati del rettile
        const { data: reptileData } = await api.get(`/reptile/${reptileId}`);
        setReptile(reptileData);

        // Alimentazione
        const { data: feedingData } = await api.get(`/feedings/${reptileId}?page=1`);
        setFeedings(feedingData.dati || []);
        // Riproduzione (nuovo endpoint specifico)
        const { data: breedingData } = await api.get(`/breeding/reptile/${reptileId}`);
        setBreeding(breedingData || []);
        const ev = await getEvents(reptileId).then(r => r.data);
        setEvents(ev);
        setLoading(false);
      } catch (err) {
        console.error('Errore nel caricamento:', err);
        setLoading(false);
      }
    };

    fetchAll();
  }, [reptileId]);
  useEffect(() => {
    // Ogni volta che cambia la lista dei feedings, resetta il conteggio visibile
    if (feedings.length > 0) {
      setVisibleFeedings(5);
    }
  }, [feedings]);
  const handleDeleteEvent = async (id) => {
    await deleteEvent(id);
    setEvents(events.filter(e => e._id !== id));
  };

  if (loading) return <div className="text-center mt-10">🌀 Caricamento...</div>;
  if (!reptile) return <div className="text-red-600 text-center mt-10">❌ Rettile non trovato</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 bg-[#FAF3E0] min-h-screen text-[#2B2B2B] font-sans fade-in-up">
      <Link to="/dashboard" className="text-green-700 hover:underline mb-4 inline-block">← Torna indietro</Link>

      <div className="grid md:grid-cols-2 gap-6 bg-white p-6 rounded-lg shadow-lg">
        {/* LEFT COLUMN */}
        <div>
          <img src={reptile.image || 'https://res.cloudinary.com/dg2wcqflh/image/upload/v1753088270/sq1upmjw7xgrvpkghotk.png'}

            className="w-full h-auto object-cover rounded-md border border-[#EDE7D6] avatar-animated" />
<button
  onClick={downloadPDF}
  className="mt-4 inline-block bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 transition-all duration-200"
>
  📄 Scarica PDF informazioni
</button>

          <h2 className="text-3xl font-bold mt-4 text-[#228B22]">{reptile.name}</h2>

          <div className="mt-2 space-y-2">
            <p><strong>Specie:</strong> {reptile.species}</p>
            <p><strong>Morph:</strong> {reptile.morph || 'Non specificato'}</p>
            <p><strong>Data di nascita:</strong> {new Date(reptile.birthDate).toLocaleDateString()}</p>
            <p><strong>Sesso:</strong>
              <span className={`ml-2 px-2 py-1 rounded-full text-white text-sm ${reptile.sex === 'M' ? 'bg-blue-600' : 'bg-pink-500'}`}>
                {reptile.sex === 'M' ? 'Maschio' : 'Femmina'}
              </span>
            </p>
            <p><strong>Riproduttore:</strong>
              <span className={`ml-2 px-2 py-1 rounded-full text-white text-sm ${reptile.isBreeder ? 'bg-yellow-500' : 'bg-gray-400'}`}>
                {reptile.isBreeder ? 'Sì' : 'No'}
              </span>
            </p>
            {reptile.notes && (
              <div className="mt-4">
                <h4 className="text-md font-semibold text-[#228B22] mb-1">📝 Note</h4>
                <div className="bg-[#FFF8DC] border border-yellow-300 text-sm text-gray-800 p-3 rounded shadow-inner whitespace-pre-wrap">
                  {reptile.notes}
                </div>
              </div>
            )}

             <h3 className="mt-4 font-semibold text-gray-700">Genitori</h3>
      <ul className="list-disc ml-6 text-gray-800">
        <li>
          <strong>Padre:</strong>{' '}
       {reptile.parents?.father || 'Non specificato'}
        </li>
        <li>
          <strong>Madre:</strong>{' '}
          { reptile.parents?.mother || 'Non specificato'}
        </li>
      </ul>

      <h3 className="mt-4 font-semibold text-gray-700">Documenti</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-800">
        <div>
          <strong>CITES:</strong><br />
          Numero: {reptile.documents?.cites?.number || 'N/D'}<br />
          Data rilascio: {reptile.documents?.cites?.issueDate?.split('T')[0] || 'N/D'}<br />
          Ente: {reptile.documents?.cites?.issuer || 'N/D'}
        </div>
        <div>
          <strong>Microchip:</strong><br />
          Codice: {reptile.documents?.microchip?.code || 'N/D'}<br />
          Impiantato il: {reptile.documents?.microchip?.implantDate?.split('T')[0] || 'N/D'}
        </div>
      </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">

          {/* Feedings */}

          <div>
            <h3 className="text-xl font-semibold mb-2 border-b border-gray-300 pb-1">🍖 Alimentazione</h3>

            {feedings.length > 0 ? (
              <>
                <ul className="space-y-2">
                  {feedings.slice(0, visibleFeedings).map((feed, i) => (
                    <li key={i} className={`p-3 rounded glow-hover fade-in-up ${feed.wasEaten ? 'bg-[#EDE7D6]' : 'bg-red-100 border border-red-300'}`}>
                      <p><strong>Data:</strong> {new Date(feed.date).toLocaleDateString()}</p>
                      <p><strong>Tipo cibo:</strong> {feed.foodType}</p>
                      <p><strong>Quantità:</strong> {feed.quantity || 'N/A'}</p>

                      {feed.wasEaten ? (
                        <>
                          <p><strong>✅ Ha mangiato</strong></p>
                          <p><strong>Prossimo pasto:</strong> {new Date(feed.nextFeedingDate).toLocaleDateString()}</p>
                        </>
                      ) : (
                        <>
                          <p><strong>❌ Non ha mangiato</strong></p>
                          <p><strong>Ritenta tra:</strong> {feed.retryAfterDays || '—'} giorni</p>
                          <p><strong>Prossimo tentativo:</strong> {new Date(feed.nextFeedingDate).toLocaleDateString()}</p>
                        </>
                      )}

                      {feed.notes && (
                        <p><strong>Note:</strong> {feed.notes}</p>
                      )}
                    </li>
                  ))}


                </ul>

                {/* Bottoni paginazione */}
                <div className="mt-3 space-x-2">
                  {visibleFeedings < feedings.length && (
                    <button
                      onClick={handleShowMore}
                      className="btn-animated px-4 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Carica altri
                    </button>
                  )}
                  {visibleFeedings > 5 && (
                    <button
                      onClick={handleShowLess}
                      className="btn-animated px-4 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      Mostra meno
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-[#FDF6E3] p-3 rounded shadow-inner text-sm text-gray-600 border border-dashed border-yellow-300">
                Nessun pasto registrato per ora. Puoi aggiungerne uno dalla sezione <strong>Alimentazione</strong>.
              </div>
            )}

            <div>
              <h3 className="text-xl font-semibold mb-2 border-b border-gray-300 pb-1">📅 Eventi</h3>

              {/* Muta */}
              <div className="mb-6">
                <h4 className="text-lg font-bold text-[#228B22] mb-2">Muta</h4>

                {events.filter(e => e.type === 'shed').length > 0 ? (
                  events.filter(e => e.type === 'shed').slice(0, visibleShed).map(ev => (
                    <div key={ev._id} className="bg-[#EDE7D6] p-3 rounded shadow-sm mb-2 glow-hover fade-in-up">
                      <p><strong>Data:</strong> {new Date(ev.date).toLocaleDateString()}</p>
                      {ev.notes && <p><strong>Note:</strong> {ev.notes}</p>}
                    </div>
                  ))
                ) : (
                  <div className="bg-[#FDF6E3] p-3 rounded shadow-inner text-sm text-gray-600 border border-dashed border-yellow-300">
                    📭 Nessuna muta registrata al momento.
                  </div>
                )}


                {events.filter(e => e.type === 'shed').length > 5 && (
                  <div className="space-x-2">
                    {visibleShed < events.filter(e => e.type === 'shed').length && (
                      <button onClick={() => setVisibleShed(visibleShed + 5)} className="btn-animated btn-sm bg-green-600 text-white px-3 py-1 rounded">Carica altri</button>
                    )}
                    {visibleShed > 5 && (
                      <button onClick={() => setVisibleShed(5)} className="btn-animated btn-sm bg-gray-600 text-white px-3 py-1 rounded">Mostra meno</button>
                    )}
                  </div>
                )}
              </div>

              {/* Feci */}
              <div className="mb-6">
                <h4 className="text-lg font-bold text-[#228B22] mb-2">Feci</h4>
                {events.filter(e => e.type === 'feces').length > 0 ? (
                  events.filter(e => e.type === 'feces').slice(0, visibleFeces).map(ev => (
                    <div key={ev._id} className="bg-[#EDE7D6] p-3 rounded shadow-sm mb-2">
                      <p><strong>Data:</strong> {new Date(ev.date).toLocaleDateString()}</p>
                      {ev.notes && <p><strong>Note:</strong> {ev.notes}</p>}
                    </div>
                  ))
                ) : (
                  <div className="bg-[#FDF6E3] p-3 rounded shadow-inner text-sm text-gray-600 border border-dashed border-yellow-300">
                    💩 Nessuna registrazione di feci per ora.
                  </div>
                )}


                {events.filter(e => e.type === 'feces').length > 5 && (
                  <div className="space-x-2">
                    {visibleFeces < events.filter(e => e.type === 'feces').length && (
                      <button onClick={() => setVisibleFeces(visibleFeces + 5)} className="btn-animated btn-sm bg-green-600 text-white px-3 py-1 rounded">Carica altri</button>
                    )}
                    {visibleFeces > 5 && (
                      <button onClick={() => setVisibleFeces(5)} className="btn-animated btn-sm bg-gray-600 text-white px-3 py-1 rounded">Mostra meno</button>
                    )}
                  </div>
                )}
              </div>
              {/* Peso */}
              <div className="mb-6">
                <h4 className="text-lg font-bold text-[#228B22] mb-2">Peso</h4>
                {events.filter(e => e.type === 'weight').length > 0 ? (
                  events
                    .filter(e => e.type === 'weight')
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, visibleWeight)
                    .map(ev => (
                      <div key={ev._id} className="bg-[#EDE7D6] p-3 rounded shadow-sm mb-2">
                        <p><strong>Data:</strong> {new Date(ev.date).toLocaleDateString()}</p>
                        <p><strong>Peso:</strong> {ev.weight} g</p>
                        {ev.notes && <p><strong>Note:</strong> {ev.notes}</p>}
                      </div>
                    ))
                ) : (
                  <div className="bg-[#FDF6E3] p-3 rounded shadow-inner text-sm text-gray-600 border border-dashed border-yellow-300">
                    ⚖️ Nessun peso registrato.
                  </div>
                )}

                {events.filter(e => e.type === 'weight').length > 5 && (
                  <div className="space-x-2">
                    {visibleWeight < events.filter(e => e.type === 'weight').length && (
                      <button onClick={() => setVisibleWeight(visibleWeight + 5)} className="btn-animated btn-sm bg-green-600 text-white px-3 py-1 rounded">Carica altri</button>
                    )}
                    {visibleWeight > 5 && (
                      <button onClick={() => setVisibleWeight(5)} className="btn-animated btn-sm bg-gray-600 text-white px-3 py-1 rounded">Mostra meno</button>
                    )}
                  </div>
                )}
              </div>

              {/* Visita veterinaria */}
              <div className="mb-6">
                <h4 className="text-lg font-bold text-[#228B22] mb-2">Visita Veterinaria</h4>
                {events.filter(e => e.type === 'vet').length > 0 ? (
                  events.filter(e => e.type === 'vet').slice(0, visibleVet).map(ev => (
                    <div key={ev._id} className="bg-[#EDE7D6] p-3 rounded shadow-sm mb-2">
                      <p><strong>Data:</strong> {new Date(ev.date).toLocaleDateString()}</p>
                      {ev.notes && <p><strong>Note:</strong> {ev.notes}</p>}
                    </div>
                  ))
                ) : (
                  <div className="bg-[#FDF6E3] p-3 rounded shadow-inner text-sm text-gray-600 border border-dashed border-yellow-300">
                    🩺 Nessuna visita veterinaria registrata.
                  </div>
                )}

                {events.filter(e => e.type === 'vet').length > 5 && (
                  <div className="space-x-2">
                    {visibleVet < events.filter(e => e.type === 'vet').length && (
                      <button onClick={() => setVisibleVet(visibleVet + 5)} className="btn-animated btn-sm bg-green-600 text-white px-3 py-1 rounded">Carica altri</button>
                    )}
                    {visibleVet > 5 && (
                      <button onClick={() => setVisibleVet(5)} className="btn-animated btn-sm bg-gray-600 text-white px-3 py-1 rounded">Mostra meno</button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ReptileDetails;
