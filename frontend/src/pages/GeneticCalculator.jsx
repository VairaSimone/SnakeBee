import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api'; 

export default function GeneticCalculator() {
  const { t } = useTranslation();
  const [geneOptions, setGeneOptions] = useState([]);
  const [fatherGenes, setFatherGenes] = useState([]);
  const [motherGenes, setMotherGenes] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const MAX_GENES = 6;

  useEffect(() => {
    const fetchGeneticOptions = async () => {
      try {
        const response = await api.get('/breeding/genetic/options');
        if (response.data.success) {
          setGeneOptions(response.data.options);
        }
      } catch (error) {
        console.error(t('GeneticCalculator.errorLoadingOptions'), error);
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchGeneticOptions();
  }, [t]);

  const addGene = (sex, geneId, status) => {
    if (!geneId || !status) return;

    const currentGene = geneOptions.find(g => g.id === geneId);
    const currentGenesList = sex === 'male' ? fatherGenes : motherGenes;

    // 1. Controllo duplicati standard
    if (currentGenesList.some(g => g.geneId === geneId)) return;

    // 2. Controllo del Locus (Massimo 2 alleli per complesso sullo stesso animale)
    if (currentGene?.complex) {
      let allelicCount = 0;

      // Conta gli alleli già occupati dai geni di questo complesso su questo genitore
      currentGenesList.forEach(g => {
        const existingGeneInfo = geneOptions.find(opt => opt.id === g.geneId);
        if (existingGeneInfo?.complex === currentGene.complex) {
          // Se è "super" occupa 2 alleli, altrimenti 1
          allelicCount += g.status === 'super' ? 2 : 1;
        }
      });

      // Aggiungi il peso del gene che l'utente sta cercando di inserire ora
      const newGeneWeight = status === 'super' ? 2 : 1;

      if (allelicCount + newGeneWeight > 2) {
        alert(t('GeneticCalculator.locusErrorAlert', { complex: currentGene.complex.replace('_', ' ').toUpperCase() }));
        return; // Blocca l'inserimento
      }
    }

    // 3. Se supera i controlli, aggiungi il gene
    const newGene = { geneId, status };
    if (sex === 'male') {
      setFatherGenes([...fatherGenes, newGene]);
    } else {
      setMotherGenes([...motherGenes, newGene]);
    }
  };

  const removeGene = (sex, geneId) => {
    if (sex === 'male') {
      setFatherGenes(fatherGenes.filter(g => g.geneId !== geneId));
    } else {
      setMotherGenes(motherGenes.filter(g => g.geneId !== geneId));
    }
  };

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const response = await api.post('/breeding/genetic', {
        fatherGenes,
        motherGenes
      });
      if (response.data.success) {
        setResults(response.data.results);
      }
    } catch (error) {
      console.error(t('GeneticCalculator.errorCalculation'), error);
    } finally {
      setLoading(false);
    }
  };

  const hasLethals = results.some(r => r.isLethal);

  if (loadingOptions) {
    return (
      <div className="p-12 text-center max-w-xl mx-auto dynamic-pulse">
        <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600 font-medium">{t('GeneticCalculator.loadingDatabase')}</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto bg-slate-50/50 rounded-2xl shadow-xl border border-slate-100 mt-6 backdrop-blur-sm">
      <div className="text-center mb-8">
        <span className="bg-amber-100 text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">{t('GeneticCalculator.versionBadge')}</span>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">{t('GeneticCalculator.mainTitle')}</h1>
        <p className="text-slate-500 mt-2 max-w-md mx-auto text-sm">{t('GeneticCalculator.mainDescription')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* PADRE */}
        <div className="p-5 bg-gradient-to-br from-blue-50/70 to-indigo-50/30 rounded-2xl border border-blue-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-blue-800 flex items-center gap-2">{t('GeneticCalculator.maleSpecimen')}</h2>
              <span className={`text-xs font-bold px-2 py-1 rounded-md ${fatherGenes.length >= MAX_GENES ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                {t('GeneticCalculator.genesOccupied', { count: fatherGenes.length, max: MAX_GENES })}
              </span>
            </div>
            <GeneSelectorForm 
              geneOptions={geneOptions}
              onAdd={(id, status) => addGene('male', id, status)} 
              disabled={fatherGenes.length >= MAX_GENES} 
            />
          </div>
          <SelectedGenesList geneOptions={geneOptions} genes={fatherGenes} onRemove={(id) => removeGene('male', id)} />
        </div>

        {/* MADRE */}
        <div className="p-5 bg-gradient-to-br from-pink-50/70 to-rose-50/30 rounded-2xl border border-pink-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-pink-800 flex items-center gap-2">{t('GeneticCalculator.femaleSpecimen')}</h2>
              <span className={`text-xs font-bold px-2 py-1 rounded-md ${motherGenes.length >= MAX_GENES ? 'bg-red-100 text-red-700' : 'bg-pink-100 text-pink-700'}`}>
                {t('GeneticCalculator.genesOccupied', { count: motherGenes.length, max: MAX_GENES })}
              </span>
            </div>
            <GeneSelectorForm 
              geneOptions={geneOptions}
              onAdd={(id, status) => addGene('female', id, status)} 
              disabled={motherGenes.length >= MAX_GENES} 
            />
          </div>
          <SelectedGenesList geneOptions={geneOptions} genes={motherGenes} onRemove={(id) => removeGene('female', id)} />
        </div>
      </div>

      <div className="text-center mb-10">
        <button
          onClick={handleCalculate}
          disabled={loading || (fatherGenes.length === 0 && motherGenes.length === 0)}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-10 rounded-xl shadow-lg hover:shadow-xl transition-all duration-150 transform hover:-translate-y-0.5 disabled:opacity-40 disabled:pointer-events-none text-sm tracking-wide"
        >
          {loading ? t('GeneticCalculator.processing') : t('GeneticCalculator.generateButton')}
        </button>
      </div>

      {results.length > 0 && (
        <div className="mt-8 border-t border-slate-200 pt-8 animate-fadeIn">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">{t('GeneticCalculator.outcomesTitle')}</h3>
          
          {hasLethals && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-xl shadow-sm">
              <div className="flex gap-2">
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="font-bold text-red-800 text-sm">{t('GeneticCalculator.lethalRiskTitle')}</p>
                  <p className="text-xs text-red-700 mt-1 leading-relaxed">{t('GeneticCalculator.lethalRiskDesc')}</p>
                </div>
              </div>
            </div>
          )}

          <div className="overflow-hidden bg-white rounded-xl border border-slate-200 shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-6 py-3 text-left font-bold text-slate-600 uppercase tracking-wider text-xs w-1/4">{t('GeneticCalculator.frequencyTable')}</th>
                  <th className="px-6 py-3 text-left font-bold text-slate-600 uppercase tracking-wider text-xs">{t('GeneticCalculator.phenotypeTable')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {results.map((res, index) => (
                  <tr key={index} className={`transition-colors ${res.isLethal ? 'bg-red-50/60 hover:bg-red-100/50' : 'hover:bg-slate-50/80'}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <span className={`font-mono font-bold text-sm ${res.isLethal ? 'text-red-600' : 'text-slate-800'}`}>
                          {res.probability}
                        </span>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 max-w-[100px] hidden sm:block">
                          <div 
                            className={`h-1.5 rounded-full ${res.isLethal ? 'bg-red-500' : 'bg-amber-500'}`} 
                            style={{ width: res.probability }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className={`px-6 py-4 font-medium ${res.isLethal ? 'text-red-900' : 'text-slate-800'}`}>
                      <div className="flex items-center gap-2 flex-wrap">
                        {res.phenotype}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function GeneSelectorForm({ geneOptions, onAdd, disabled }) {
  const { t } = useTranslation();
  const [selectedGene, setSelectedGene] = useState('');
  const [status, setStatus] = useState('visual');

  const currentGeneInfo = geneOptions.find(g => g.id === selectedGene);

  const handleAddClick = (e) => {
    e.preventDefault();
    onAdd(selectedGene, status);
    setSelectedGene('');
    setStatus('visual');
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 mb-4">
      <div className="sm:col-span-6">
        <select 
          className="w-full border border-slate-200 p-2.5 rounded-xl bg-white text-black text-sm focus:ring-2 focus:ring-slate-400 focus:outline-none transition disabled:bg-slate-100 disabled:text-slate-400 shadow-sm"
          value={selectedGene} 
          onChange={e => { setSelectedGene(e.target.value); setStatus('visual'); }}
          disabled={disabled}
        >
          <option value="">{t('GeneticCalculator.selectTrait')}</option>
          
          <optgroup label={t('GeneticCalculator.groupRecessive')}>
            {geneOptions.filter(g => g.type === 'recessive').map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </optgroup>

          <optgroup label={t('GeneticCalculator.groupDominant')}>
            {geneOptions.filter(g => (g.type === 'co-dominant' || g.type === 'dominant') && !g.complex).map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </optgroup>

          <optgroup label={t('GeneticCalculator.groupSpider')}>
            {geneOptions.filter(g => g.complex === 'spider_complex').map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </optgroup>

          <optgroup label={t('GeneticCalculator.groupLeopard')}>
            {geneOptions.filter(g => g.complex === 'leopard_blackhead').map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </optgroup>

          <optgroup label={t('GeneticCalculator.groupMahogany')}>
            {geneOptions.filter(g => g.complex === 'mahogany_complex').map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </optgroup>

          <optgroup label={t('GeneticCalculator.groupAcid')}>
            {geneOptions.filter(g => g.complex === 'acid_red_stripe').map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </optgroup>

          <optgroup label={t('GeneticCalculator.groupFire')}>
            {geneOptions.filter(g => g.complex === 'black_eyed_lucy').map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </optgroup>

          <optgroup label={t('GeneticCalculator.groupBEL')}>
            {geneOptions.filter(g => g.complex === 'bel').map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </optgroup>

          <optgroup label={t('GeneticCalculator.groupYellowBelly')}>
            {geneOptions.filter(g => g.complex === 'yellow_belly').map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </optgroup>

          <optgroup label={t('GeneticCalculator.groupEightBall')}>
            {geneOptions.filter(g => g.complex === 'eight_ball').map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </optgroup>
        </select>
      </div>

      <div className="sm:col-span-4">
        <select 
          className="w-full border border-slate-200 p-2.5 rounded-xl bg-white text-black text-sm focus:ring-2 focus:ring-slate-400 focus:outline-none transition disabled:bg-slate-100 disabled:text-slate-400 shadow-sm"
          value={status} 
          onChange={e => setStatus(e.target.value)}
          disabled={disabled || !selectedGene}
        >
          <option value="visual">{t('GeneticCalculator.statusVisual')}</option>
          {selectedGene && ['co-dominant', 'dominant'].includes(currentGeneInfo?.type) && (
            <option value="super">{t('GeneticCalculator.statusSuper')}</option>
          )}
          {selectedGene && currentGeneInfo?.type === 'recessive' && (
            <option value="het">{t('GeneticCalculator.statusHet')}</option>
          )}
        </select>
      </div>

      <div className="sm:col-span-2">
        <button 
          onClick={handleAddClick}
          disabled={disabled || !selectedGene}
          className="w-full h-full bg-slate-800 hover:bg-slate-900 disabled:bg-slate-200 disabled:text-slate-400 text-white p-2.5 rounded-xl text-sm font-bold transition shadow-sm"
        >
          {t('GeneticCalculator.insertButton')}
        </button>
      </div>
    </div>
  );
}

function SelectedGenesList({ geneOptions, genes, onRemove }) {
  const { t } = useTranslation();

  if (genes.length === 0) {
    return (
      <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl mt-2">
        <p className="text-xs text-slate-400 italic">{t('GeneticCalculator.noGenesSelected')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 mt-4 min-h-[42px] items-center bg-white/50 p-2 rounded-xl border border-slate-100">
      {genes.map(g => {
        const name = geneOptions.find(opt => opt.id === g.geneId)?.name || g.geneId;
        
        let badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
        if (g.status === 'super') badgeColor = "bg-purple-50 text-purple-700 border-purple-200";
        if (g.status === 'het') badgeColor = "bg-amber-50 text-amber-700 border-amber-200";

        return (
          <span key={g.geneId} className={`inline-flex items-center gap-1.5 border px-3 py-1 rounded-lg text-xs font-semibold shadow-sm animate-scaleIn ${badgeColor}`}>
            <span>{name}</span> 
            <span className="opacity-60 font-normal uppercase text-[10px]">({g.status})</span>
            <button 
              onClick={() => onRemove(g.geneId)} 
              className="text-slate-400 font-bold ml-1 hover:text-red-500 transition-colors text-sm leading-none"
            >
              ×
            </button>
          </span>
        );
      })}
    </div>
  );
}