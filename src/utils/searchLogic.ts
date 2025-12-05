// src/utils/searchLogic.ts

// Liste élargie de cibles potentielles pour la démo
export const SEARCH_TARGETS = [
    'linux', 'windows', 'macOS', 
    'ubuntu', 'debian', 'arch', 
    'android', 'ios', 'chromeos',
    'firefox', 'chrome', 'safari'
  ];
  
  // Retourne les 3 résultats les plus proches
  export const findMatches = (input: string): string[] => {
    if (!input) return [];
    
    // Calcul de distance pour chaque cible
    const ranked = SEARCH_TARGETS.map(target => ({
      target,
      distance: levenshteinDistance(input.toLowerCase(), target.toLowerCase())
    }));
  
    // Tri par pertinence (distance la plus faible)
    ranked.sort((a, b) => a.distance - b.distance);
  
    // On retourne le top 3
    return ranked.slice(0, 3).map(item => item.target);
  };
  
  // Algorithme de distance de Levenshtein (standard)
  const levenshteinDistance = (a: string, b: string): number => {
    const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
  
    for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
  
    for (let j = 1; j <= b.length; j++) {
      for (let i = 1; i <= a.length; i++) {
        const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    return matrix[b.length][a.length];
  };