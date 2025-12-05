import './rapport.css';


type RapportProps = {
    results: string[];
    onBack: () => void;
};

const Rapport = ({ results, onBack }: RapportProps) => {
    return (
        <div className={"rapport_container"}>
            <h2 className={"rapport_title"}>Rapport de diagnostic</h2>

            <div className={"rapport_container_diagnostic"}>
                <h2 className={"rapport_container_diagnostic_title"}>Nos propositions</h2>
                {results.length > 0 ? (
                    <ul>
                        {results.map((result, index) => (
                            <li key={index} className={"diagnostic_text_base"}>{result}</li>
                        ))}
                    </ul>
                ) : (
                    <p className={"rapport_container_diagnostic_title"}>Aucune recommandation spécifique trouvée pour vos réponses.</p>
                )}
                <button className={"diagnostic_button"} onClick={onBack}>
                    Retour aux questions
                </button>
            </div>
        </div>

    );
};

export default Rapport;