type Props = {
  onRandom: () => void
  loading: boolean
}

export function MainMenu({ onRandom, loading }: Props) {
  return (
    <div className="menu">
      <h1>POKÉDEX</h1>
      <p>KANTO</p>
      <p className="blink">PRESS START</p>
      <button className="lcd-btn" type="button" data-gb-nav onClick={onRandom} disabled={loading}>
        {loading ? 'Cargando...' : 'Pokémon aleatorio'}
      </button>
      <button className="lcd-btn" type="button" disabled>
        Equipo aleatorio
      </button>
      <p className="soon">próximamente</p>
    </div>
  )
}
