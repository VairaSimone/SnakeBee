// backend/controllers/GeneticCalculatorController.js
import { BALL_PYTHON_GENES, COMPLEX_COMBOS } from "../config/ballPythonGenetics.js";

const getAlleles = (geneStatus, geneType) => {
  if (geneStatus === 'super') return ['M', 'M'];
  if (geneStatus === 'het') return ['M', 'N'];
  
  if (geneStatus === 'visual') {
    if (geneType === 'recessive') return ['M', 'M'];
    return ['M', 'N']; 
  }
  return ['N', 'N'];
};

export const calculateBreedingOutputs = async (req, res) => {
  try {
    const { fatherGenes, motherGenes } = req.body; 

    if (!fatherGenes || !motherGenes) {
      return res.status(400).json({ success: false, message: "Dati dei genitori mancanti." });
    }

    const MAX_GENES = 6;
    if (fatherGenes.length > MAX_GENES || motherGenes.length > MAX_GENES) {
      return res.status(400).json({ 
        success: false, 
        message: `Limite massimo superato: puoi selezionare fino a ${MAX_GENES} geni per genitore.` 
      });
    }

    const allActiveGenes = Array.from(new Set([...fatherGenes.map(g => g.geneId), ...motherGenes.map(g => g.geneId)]));
    let genePools = {};

    allActiveGenes.forEach(geneId => {
      const geneInfo = BALL_PYTHON_GENES[geneId];
      if (!geneInfo) return;

      const fGene = fatherGenes.find(g => g.geneId === geneId);
      const fatherAlleles = fGene ? getAlleles(fGene.status, geneInfo.type) : ['N', 'N'];

      const mGene = motherGenes.find(g => g.geneId === geneId);
      const motherAlleles = mGene ? getAlleles(mGene.status, geneInfo.type) : ['N', 'N'];

      let outcomes = [];
      for (let f of fatherAlleles) {
        for (let m of motherAlleles) {
          outcomes.push([f, m].sort().join('')); 
        }
      }
      genePools[geneId] = outcomes;
    });

    let combinations = [{}];
    for (let geneId in genePools) {
      let nextCombinations = [];
      for (let current of combinations) {
        for (let outcome of genePools[geneId]) {
          nextCombinations.push({ ...current, [geneId]: outcome });
        }
      }
      combinations = nextCombinations;
    }

    const totalCombinations = combinations.length;
    
    // Raggruppamento per Fenotipo Visivo
    const visualGroups = {}; 

    combinations.forEach(combo => {
      let morphNameParts = [];
      let hiddenGenes = []; // Portatori eterozigoti (es. Het Albino)
      let activeComplexes = {}; 
      let isLethal = false;

      for (let geneId in combo) {
        const allele = combo[geneId];
        const geneInfo = BALL_PYTHON_GENES[geneId];
        if (!geneInfo) continue;

        // Controllo letalità in omozigosi
        if (allele === 'MM' && geneInfo.lethal) {
          isLethal = true;
        }

        if (geneInfo.type === 'recessive') {
          if (allele === 'MM') morphNameParts.push(geneInfo.name);
          else if (allele === 'MN') hiddenGenes.push(geneInfo.name);
        } 
        else if (geneInfo.type === 'dominant') {
          // I dominanti puri mostrano lo stesso fenotipo sia singoli che super
          if (allele === 'MM' || allele === 'MN') {
            morphNameParts.push(geneInfo.name);
          }
        }
        else if (geneInfo.type === 'co-dominant') {
          if (geneInfo.complex) {
            if (allele === 'MM' || allele === 'MN') {
              if (!activeComplexes[geneInfo.complex]) activeComplexes[geneInfo.complex] = [];
              activeComplexes[geneInfo.complex].push({ geneId, allele });
            }
          } else {
            if (allele === 'MM') morphNameParts.push(geneInfo.superName || `Super ${geneInfo.name}`);
            else if (allele === 'MN') morphNameParts.push(geneInfo.name);
          }
        }
      }

      // Elaborazione complessi
      for (let complexId in activeComplexes) {
        const complexGroup = activeComplexes[complexId];
        if (complexGroup.length === 1 && complexGroup[0].allele === 'MN') {
          morphNameParts.push(BALL_PYTHON_GENES[complexGroup[0].geneId].name);
        } else {
          let complexKeys = [];
          complexGroup.forEach(b => {
            complexKeys.push(b.geneId);
            if (b.allele === 'MM') complexKeys.push(b.geneId); 
          });
if (complexKeys.length > 2) {
  // In natura impossibile: significa che i genitori avevano alleli impossibili 
  // o l'utente ha inserito troppi geni dello stesso complesso per un singolo genitore.
  morphNameParts.push(`⚠️ Errore Locus: Troppi alleli nel complesso ${complexId}`);
}
          const comboKey = complexKeys.sort().join('+');
          const specialComboName = COMPLEX_COMBOS[complexId] && COMPLEX_COMBOS[complexId][comboKey];
          
          if (specialComboName) {
            morphNameParts.push(specialComboName);

            if (specialComboName.includes('Letale')) {
    isLethal = true;
  }
           } else {
            complexGroup.forEach(b => {
              if (b.allele === 'MM') morphNameParts.push(`Super ${BALL_PYTHON_GENES[b.geneId].name}`);
              else morphNameParts.push(BALL_PYTHON_GENES[b.geneId].name);
            });
          }
        }
      }

      // Creazione della chiave visiva (ignora i geni nascosti)
      let visualPhenotype = morphNameParts.length === 0 ? 'Normal (Wildtype)' : morphNameParts.sort().join(' ');
      
      if (!visualGroups[visualPhenotype]) {
        visualGroups[visualPhenotype] = { count: 0, hiddenCounts: {}, isLethal: false };
      }
      
      visualGroups[visualPhenotype].count++;
      if (isLethal) visualGroups[visualPhenotype].isLethal = true; // Se almeno un set è letale, marca il gruppo
      
      // Conta quante volte compare il gene nascosto all'interno di questo specifico fenotipo
      hiddenGenes.forEach(hg => {
        visualGroups[visualPhenotype].hiddenCounts[hg] = (visualGroups[visualPhenotype].hiddenCounts[hg] || 0) + 1;
      });
    });

    // Costruzione risultati finali calcolando i "Possible Hets"
    const finalCalculatedResults = [];

    for (let vp in visualGroups) {
      const group = visualGroups[vp];
      const prob = (group.count / totalCombinations) * 100;
      
      let formattedHets = [];
      for (let hg in group.hiddenCounts) {
        let pct = Math.round((group.hiddenCounts[hg] / group.count) * 100);
        // Standardizzazione per il gergo da allevatori
        if (pct === 67) pct = 66; 
        
        if (pct > 0) {
          formattedHets.push(`${pct}% Het ${hg}`);
        }
      }

      let finalName = vp;
      if (formattedHets.length > 0) {
        if (finalName === 'Normal (Wildtype)') finalName = 'Normal';
        finalName += ` ${formattedHets.join(', ')}`;
      }
      
      if (group.isLethal) {
        finalName += ' ☠️ (Omozigosi Letale)';
      }

      finalCalculatedResults.push({
        phenotype: finalName,
        probability: prob.toFixed(2) + '%',
        isLethal: group.isLethal
      });
    }

    finalCalculatedResults.sort((a, b) => parseFloat(b.probability) - parseFloat(a.probability));

    return res.status(200).json({ success: true, results: finalCalculatedResults });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Aggiungi questo controller per restituire la lista dei geni al frontend
export const getGeneticOptions = async (req, res) => {
  try {
    // Trasformiamo l'oggetto BALL_PYTHON_GENES in un array compatibile con il frontend
    const options = Object.keys(BALL_PYTHON_GENES).map(id => ({
      id,
      ...BALL_PYTHON_GENES[id]
    }));
    
    return res.status(200).json({ success: true, options });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};