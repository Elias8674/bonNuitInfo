// Définition des types pour les règles et les réponses
type Rule = {
  conditions: Record<string, string>;
  result: string;
};

type Answers = Record<string, string>;

/**
 * Évalue les réponses d'un diagnostic par rapport à un ensemble de règles.
 * @param answers - Un objet où les clés sont les ID de question et les valeurs sont les ID de réponse.
 * @param rules - Un tableau de règles à évaluer.
 * @returns Un tableau de chaînes de caractères contenant les résultats correspondants.
 */
export default function ServiceDiagnostic(answers: Answers, rules: Rule[]): string[] {
  const results: string[] = [];

  for (const rule of rules) {
    const matches = Object.entries(rule.conditions).every(([questionId, expectedValue]) => {
      const userAnswer = answers[questionId];
      return userAnswer === expectedValue;
    });

    if (matches) {
      results.push(rule.result);
    }
  }

  return results;
}