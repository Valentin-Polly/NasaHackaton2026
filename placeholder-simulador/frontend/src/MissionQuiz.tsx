import { useState } from 'react'

const placeholderOptions = [
  'Opción placeholder A',
  'Opción placeholder B',
  'Opción placeholder C',
  'Opción placeholder D',
] as const

type QuizQuestion = {
  prompt: string
  options: typeof placeholderOptions
  correctOptionIndex: number
}

const quizQuestions: QuizQuestion[] = Array.from({ length: 6 }, (_, index) => ({
  prompt: `Pregunta placeholder ${String(index + 1).padStart(2, '0')}`,
  options: placeholderOptions,
  correctOptionIndex: 0,
}))

type QuizPhase = 'answering' | 'complete'

function MissionQuiz() {
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
          Preguntas y respuestas placeholder; el contenido definitivo se agregará más adelante.
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
                : 'Terminaste todas las preguntas placeholder.'}
            </p>
            {wrongQuestionIndices.length > 0 && (
              <button className="quiz-action" type="button" onClick={retryIncorrectAnswers}>
                REINTENTAR INCORRECTAS
              </button>
            )}
            <button className="quiz-action quiz-action--final" type="button">
              SITIOS DEL ARTEMIS 3 Y 4
            </button>
          </div>
        )}
      </section>
    </div>
  )
}

export default MissionQuiz
