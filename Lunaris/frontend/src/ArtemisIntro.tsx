type ArtemisIntroProps = {
  onContinue: () => void
}

function ArtemisIntro({ onContinue }: ArtemisIntroProps) {
  return (
    <div className="quiz-overlay">
      <section
        className="quiz-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="artemis-intro-title"
      >
        <p className="quiz-eyebrow">NUEVA ETAPA · ARTEMIS</p>
        <h2 id="artemis-intro-title">De Apolo a Artemis: el regreso a la Luna</h2>
        <div className="artemis-intro-copy">
          <p>
            Más de 50 años después del último alunizaje tripulado del programa Apolo,
            la NASA prepara el regreso de astronautas a la Luna.
          </p>
          <p>
            <strong>Artemis III</strong>, prevista para 2027, probará sistemas y maniobras
            en órbita terrestre. <strong>Artemis IV</strong>, prevista para 2028,
            buscará llevar astronautas a la superficie lunar por primera vez desde 1972.
          </p>
          <p>
            El destino será el <strong>polo sur lunar</strong>. Algunos cráteres están
            siempre en sombra y podrían guardar hielo de agua. En cambio, ciertas zonas
            elevadas reciben luz solar durante más tiempo y podrían ayudar a generar energía.
          </p>
          <p>
            Elegir un lugar seguro no es fácil: hay temperaturas extremas, terrenos
            irregulares y grandes cambios entre luz y sombra.
          </p>
          <p className="artemis-intro-prompt">
            <strong>Tu misión:</strong> explorá los 17 sitios candidatos. Tocá los
            marcadores para comparar la luz, la inclinación del terreno y la posibilidad
            de comunicarse con la Tierra.
          </p>
        </div>
        <button className="quiz-action" type="button" onClick={onContinue}>
          ENTENDIDO · EXPLORAR SITIOS →
        </button>
      </section>
    </div>
  )
}

export default ArtemisIntro
