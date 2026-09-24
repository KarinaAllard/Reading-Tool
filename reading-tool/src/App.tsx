import { useEffect, useMemo, useState } from "react"

function App() {
  const [text, setText] = useState("")

  const words = useMemo(() => {
    return text.trim() ? text.trim().split(/\s+/) : []
  }, [text])

  const [currentWord, setCurrentWord] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const [wpm, setWpm] = useState(200)

  const interval = 60000 / wpm

  useEffect(() => {
    if (!isPlaying) return

    const timer = setInterval(() => {
      setCurrentWord((current) => {
        if (current < words.length - 1) {
          return current + 1
        } else {
          setIsPlaying(false)
          return current
        }
      })
    }, interval)

    return () => clearInterval(timer)
  }, [isPlaying, words, interval])

  return (
    <main>
      <section className="reader">
        <div className="word">
          {words[currentWord] || ""}
        </div>

        <div className="controls">
          <div className="buttons">
            <button onClick={() => setIsPlaying(!isPlaying)}>
              {isPlaying ? "Pause" : "Start"}
            </button>

            <button
              onClick={() => {
                setCurrentWord(0)
                setIsPlaying(false)
              }}
            >
              Reset
            </button>
          </div>

          <div className="wpm-control">
            <label htmlFor="wpm">WPM:</label>

            <input
              id="wpm"
              type="number"
              min="50"
              max="1000"
              value={wpm}
              onChange={(e) => setWpm(Number(e.target.value))}
            />
          </div>
        </div>
      </section>

      <section className="input">
        <h1>Reading Tool</h1>

        <textarea
          placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc placerat ligula vitae pulvinar condimentum. Pellentesque feugiat velit ut lectus egestas fermentum. Integer vitae massa tincidunt, rhoncus enim non, viverra justo. Proin sodales enim arcu, consequat scelerisque velit porttitor a. Donec pulvinar a purus non dapibus."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button onClick={() => setText("")}>Clear</button>

        <p>Word Count: {words.length}</p>
      </section>
    </main>
  )
}

export default App