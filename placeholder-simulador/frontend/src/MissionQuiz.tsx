import { useState } from 'react'

type QuizQuestion = {
  prompt: string
  options: string[]
  correctOptionIndex: number
}

const quizQuestions: QuizQuestion[] = [
  {
    prompt: '¿Por qué era importante que el Sol estuviera bajo sobre el horizonte durante los alunizajes?',
    options: [
      'Para que los astronautas no tuvieran calor.',
      'Para observar mejor los cráteres y las formaciones del terreno.',
      'Para que la Luna tuviera menos gravedad.',
      'Para evitar que los meteoritos impactaran en la superficie.',
    ],
    correctOptionIndex: 1,
  },
  {
    prompt: '¿Para qué se utilizaba una trayectoria híbrida en las misiones Apolo?',
    options: [
      'Para viajar más rápido que la luz.',
      'Para evitar por completo el uso de combustible.',
      'Para comenzar con una trayectoria de retorno libre y luego modificarla, permitiendo mayor flexibilidad para llegar a la Luna.',
      'Para que la nave pudiera aterrizar sin utilizar sus motores.',
    ],
    correctOptionIndex: 2,
  },
  {
    prompt: '¿Cómo se llama la capa de polvo y fragmentos de roca que cubre la superficie lunar?',
    options: [
      'Regalito.',
      'Basalto.',
      'Regolito.',
      'Sedimento atmosférico.',
    ],
    correctOptionIndex: 2,
  },
  {
    prompt: '¿Cuál de los siguientes NO es un recurso necesario para planificar una misión lunar?',
    options: [
      'Agua en forma de hielo.',
      'Energía solar.',
      'Oxígeno.',
      'Sanguches de milanesa.',
    ],
    correctOptionIndex: 3,
  },
  {
    prompt: '¿Qué fenómeno fue uno de los principales responsables de darle forma a la superficie lunar?',
    options: [
      'Las lluvias y los vientos.',
      'Los impactos de asteroides y meteoritos.',
      'Las corrientes oceánicas.',
      'Las tormentas atmosféricas.',
    ],
    correctOptionIndex: 1,
  },
  {
    prompt: '¿Cómo se llaman las pequeñas diferencias en la intensidad de la gravedad que existen entre distintas regiones de la Luna?',
    options: [
      'Fluctuaciones atmosféricas.',
      'Ondas gravitacionales.',
      'Anomalías gravitatorias.',
      'Variaciones magnéticas.',
    ],
    correctOptionIndex: 2,
  },
]

type QuizPhase = 'answering' | 'complete'

type MissionQuizProps = {
  onOpenArtemis: () => void
}

function MissionQuiz({ onOpenArtemis }: MissionQuizProps) {
  const [phase, setPhase] = useState<QuizPhase>('answering')
  const [questionIndices, setQuestionIndices] = useState(() =>
    quizQuestions.map((_, index) => index),
  )
  const [questionPosition, setQuestionPosition] = useState(0)
  const [wrongQuestionIndices, setWrongQuestionIndices] = useState<number[]>([])
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [answerResult, setAnswerResult] = useState<boolean | null>(null)
  const [isRetryRound, setIsRetryRound] = useState(false)

  const questionIndex = questionIndices[questionPosition]
  const question = quizQuestions[questionIndex]

  const submitAnswer = () => {
    if (selectedOption === null || answerResult !== null) return

    const isCorrect = selectedOption === question.correctOptionIndex
    setAnswerResult(isCorrect)
    setWrongQuestionIndices((current) => {
      if (isCorrect) {
        return current.filter((index) => index !== questionIndex)
      }

      return current.includes(questionIndex) ? current : [...current, questionIndex]
    })
  }

  const continueQuiz = () => {
    if (answerResult === null) return

    if (questionPosition < questionIndices.length - 1) {
      setQuestionPosition((position) => position + 1)
      setSelectedOption(null)
      setAnswerResult(null)
      return
    }

    setPhase('complete')
  }

  const retryIncorrectAnswers = () => {
    const retryIndices = [...wrongQuestionIndices].sort((first, second) => first - second)
    setQuestionIndices(retryIndices)
    setQuestionPosition(0)
    setSelectedOption(null)
    setAnswerResult(null)
    setIsRetryRound(true)
    setPhase('answering')
  }

  return (
    <div className="quiz-overlay">
      <section
        className="quiz-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mission-quiz-title"
      >
        <p className="quiz-eyebrow">CIERRE DE LA EXPLORACIÓN</p>
        <h2 id="mission-quiz-title">Quiz final</h2>
        <p className="quiz-description">
          Poné a prueba lo aprendido durante las misiones Apolo.
        </p>

        {phase === 'answering' && (
          <>
            <div className="quiz-progress">
              <span>
                {isRetryRound ? 'REINTENTO' : 'PREGUNTA'} · {questionPosition + 1} / {questionIndices.length}
              </span>
              <div
                role="progressbar"
                aria-label="Progreso del quiz"
                aria-valuemin={1}
                aria-valuemax={questionIndices.length}
                aria-valuenow={questionPosition + 1}
              >
                <span style={{ width: `${((questionPosition + 1) / questionIndices.length) * 100}%` }} />
              </div>
            </div>

            <fieldset className="quiz-question">
              <legend>{question.prompt}</legend>
              <div className="quiz-options">
                {question.options.map((option, optionIndex) => (
                  <button
                    className={`quiz-option${selectedOption === optionIndex ? ' quiz-option--selected' : ''}`}
                    type="button"
                    key={option}
                    aria-pressed={selectedOption === optionIndex}
                    disabled={answerResult !== null}
                    onClick={() => setSelectedOption(optionIndex)}
                  >
                    <span className="quiz-option-letter">{String.fromCharCode(65 + optionIndex)}</span>
                    {option}
                  </button>
                ))}
              </div>
            </fieldset>

            {answerResult !== null && (
              <p
                className={`quiz-feedback${answerResult ? ' quiz-feedback--correct' : ' quiz-feedback--incorrect'}`}
                role="status"
              >
                {answerResult
                  ? 'Respuesta correcta.'
                  : 'Respuesta incorrecta. Podrás reintentarla al terminar.'}
              </p>
            )}

            {answerResult === null ? (
              <button
                className="quiz-action"
                type="button"
                disabled={selectedOption === null}
                onClick={submitAnswer}
              >
                COMPROBAR RESPUESTA
              </button>
            ) : (
              <button className="quiz-action" type="button" onClick={continueQuiz}>
                {questionPosition === questionIndices.length - 1 ? 'VER RESULTADOS →' : 'CONTINUAR →'}
              </button>
            )}
          </>
        )}

        {phase === 'complete' && (
          <div className="quiz-result">
            <h3>{wrongQuestionIndices.length > 0 ? 'Quiz finalizado' : '¡Quiz completado!'}</h3>
            <p>
              {wrongQuestionIndices.length > 0
                ? `Quedan ${wrongQuestionIndices.length} pregunta${wrongQuestionIndices.length === 1 ? '' : 's'} incorrecta${wrongQuestionIndices.length === 1 ? '' : 's'}. Podés reintentarlas o continuar.`
                : 'Respondiste correctamente todas las preguntas.'}
            </p>
            {wrongQuestionIndices.length > 0 && (
              <button className="quiz-action" type="button" onClick={retryIncorrectAnswers}>
                REINTENTAR INCORRECTAS
              </button>
            )}
            <button className="quiz-action quiz-action--final" type="button" onClick={onOpenArtemis}>
              SITIOS ARTEMIS III Y IV →
            </button>
          </div>
        )}
      </section>
    </div>
  )
}

export default MissionQuiz
