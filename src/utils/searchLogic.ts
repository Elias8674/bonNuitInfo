// src/utils/searchLogic.ts

export interface OpenSourceTool {
  name: string;
  description: string;
  category: string;
}

// Liste d'outils open source avec leurs descriptions
export const OPEN_SOURCE_TOOLS: OpenSourceTool[] = [
  { name: 'LibreOffice', description: 'Suite bureautique complète alternative à Microsoft Office', category: 'Bureautique' },
  { name: 'Firefox', description: 'Navigateur web respectueux de la vie privée', category: 'Navigateur' },
  { name: 'Linux', description: 'Système d\'exploitation libre et open source', category: 'OS' },
  { name: 'Ubuntu', description: 'Distribution Linux conviviale et populaire', category: 'OS' },
  { name: 'GIMP', description: 'Éditeur d\'images professionnel gratuit', category: 'Graphisme' },
  { name: 'Blender', description: 'Logiciel de modélisation 3D et animation', category: 'Graphisme' },
  { name: 'VLC', description: 'Lecteur multimédia universel', category: 'Multimédia' },
  { name: 'Audacity', description: 'Éditeur audio gratuit et open source', category: 'Audio' },
  { name: 'OBS Studio', description: 'Logiciel de streaming et enregistrement vidéo', category: 'Multimédia' },
  { name: 'Thunderbird', description: 'Client de messagerie électronique', category: 'Communication' },
  { name: 'VS Code', description: 'Éditeur de code source développé par Microsoft (open source)', category: 'Développement' },
  { name: 'Git', description: 'Système de contrôle de version distribué', category: 'Développement' },
  { name: 'Inkscape', description: 'Éditeur de graphiques vectoriels', category: 'Graphisme' },
  { name: 'Krita', description: 'Application de peinture numérique', category: 'Graphisme' },
  { name: 'Mozilla', description: 'Organisation à but non lucratif pour un web libre', category: 'Organisation' },
  { name: 'WordPress', description: 'Système de gestion de contenu (CMS) open source', category: 'Web' },
  { name: 'Nextcloud', description: 'Solution de stockage cloud auto-hébergée', category: 'Cloud' },
  { name: 'Jitsi', description: 'Plateforme de visioconférence open source', category: 'Communication' },
  { name: 'Mattermost', description: 'Plateforme de collaboration en équipe', category: 'Communication' },
  { name: 'Gitea', description: 'Forge logicielle auto-hébergée', category: 'Développement' },
];
  
  // Retourne les 3 outils les plus proches avec leurs descriptions
  export const findMatches = (input: string): OpenSourceTool[] => {
    if (!input) return [];
    
    const query = input.toLowerCase();
    
    // Calcul de distance pour chaque outil (sur le nom et la catégorie)
    const ranked = OPEN_SOURCE_TOOLS.map(tool => {
      const nameDistance = levenshteinDistance(query, tool.name.toLowerCase());
      const categoryDistance = levenshteinDistance(query, tool.category.toLowerCase());
      const descriptionMatch = tool.description.toLowerCase().includes(query) ? -5 : 0;
      
      // Score combiné (priorité au nom, puis catégorie, bonus si description match)
      const score = nameDistance * 0.5 + categoryDistance * 0.3 + descriptionMatch;
      
      return { tool, score };
    });
  
    // Tri par pertinence (score le plus faible)
    ranked.sort((a, b) => a.score - b.score);
  
    // On retourne le top 3
    return ranked.slice(0, 3).map(item => item.tool);
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