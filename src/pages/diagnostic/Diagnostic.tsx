import { useEffect, useState } from 'react';
import './diagnostic.css';
import questionsData from '../../data/questions.json';
import rulesData from '../../data/rules.json';
import ServiceDiagnostic from '../../services/ServiceDiagnostic.tsx';
import Rapport from '../rapport/Rapport';

type Option = { id: string; label: string; hint?: string };
type Question = { id: string; label: string; options: Option[] };
type Rule = { conditions: Record<string, string | undefined>; result: string };

const STORAGE_KEY = 'diagnosticAnswers';

const Diagnostic = () => {
    const questions = questionsData as Question[];
    const rules = rulesData as Rule[];
    const nbQuestions = questions.length;

    const [question, setQuestion] = useState<number>(0);
    const [answers, setAnswers] = useState<Record<string, string>>(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch {
            return {};
        }
    });
    const [results, setResults] = useState<string[]>([]);
    const [showResults, setShowResults] = useState<boolean>(false);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
        } catch {
            // ignore
        }
    }, [answers]);

    const current = questions[question];

    const selectOption = (qId: string, optId: string) => {
        setAnswers(prev => ({ ...prev, [qId]: optId }));
    };

    const handleShowResults = () => {
        const diagnosticResults = ServiceDiagnostic(answers, rules as { conditions: Record<string, string>, result: string }[]);
        setResults(diagnosticResults);
        setShowResults(true);
    };

    if (showResults) {
        return <Rapport results={results} onBack={() => setShowResults(false)} />;
    }


    return (
        <div className={"diagnostic_container"}>

            <div className={"diagnostic_container_content"}>
                <div className={"diagnostic_text_base"}>Question {question + 1} / {nbQuestions}</div>

                {current ? (
                    <div>
                        <h3 className={"diagnostic_title_principal"}>{current.label}</h3>
                        <div className={"diagnostic_options_container"}>
                            {current.options.map(opt => {
                                const isSelected = answers[current.id] === opt.id;
                                const optionClasses = `diagnostic_option ${isSelected ? 'diagnostic_option--selected' : ''}`;
                                const labelClasses = `diagnostic_option_label ${opt.hint ? 'diagnostic_option_label--with-hint' : ''}`;

                                return (
                                    <div
                                        key={opt.id}
                                        onClick={() => selectOption(current.id, opt.id)}
                                        className={optionClasses}
                                    >
                                        <div className={labelClasses}>
                                            {opt.label}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                ) : (
                    <div>Chargement...</div>
                )}

                <div className={"diagnostic_navigation"}>
                    <button className={"diagnostic_button"} onClick={() => setQuestion(q => Math.max(0, q - 1))} disabled={question === 0}>
                        Précédent
                    </button>

                    {question < nbQuestions - 1 ? (
                        <button className={"diagnostic_button"} onClick={() => setQuestion(q => q + 1)}>
                            Suivant
                        </button>
                    ) : (
                        <button className={"diagnostic_button"} onClick={handleShowResults}>
                            Voir les résultats
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Diagnostic;
