import { useEffect, useMemo, useState } from "react"

function getFocusIndex(word: string) {
  const length = word.length

  if (length <= 2) return 0
  if (length <= 4) return 1

  return Math.floor(length * 0.4)
}

function cleanText(text: string) {
  return text
    // Remove numeric references such as [4], [6,7] and [1–3]
    .replace(/\[\s*\d+(?:\s*[-–,]\s*\d+)*\s*\]/g, "")

    // Clean each paragraph separately
    .split(/\n\s*\n/)
    .map((paragraph) =>
      paragraph
        // Join lines within the same paragraph
        .replace(/\s*\n\s*/g, " ")

        // Normalize spaces
        .replace(/\s+/g, " ")

        // Clean spaces around punctuation
        .replace(/\s+([,.!?;:])/g, "$1")
        .replace(/\(\s+/g, "(")
        .replace(/\s+\)/g, ")")

        .trim()
    )

    // Put the paragraphs back
    .filter(Boolean)
    .join("\n\n")
}

function App() {
  const [text, setText] = useState("")
  const [currentWord, setCurrentWord] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isReadingMode, setIsReadingMode] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [wpm, setWpm] = useState(200)
  const [showControls, setShowControls] = useState(false)

  const words = useMemo(() => {
    return text.trim() ? text.trim().split(/\s+/) : []
  }, [text])

  const interval = 60000 / wpm

  const word = words[currentWord] || ""
  const focusIndex = getFocusIndex(word)

  const before = word.slice(0, focusIndex)
  const focus = word[focusIndex]
  const after = word.slice(focusIndex + 1)

  const progress =
    words.length > 0 ? (currentWord / (words.length - 1)) * 100 : 0

  useEffect(() => {
  function handleKeyDown(event: KeyboardEvent) {
    const target = event.target as HTMLElement

    // Don't trigger shortcuts while typing
    if (
      target.tagName === "TEXTAREA" ||
      target.tagName === "INPUT" ||
      target.isContentEditable
    ) {
      return
    }

    if (event.code === "Space") {
      event.preventDefault()

      if (!words.length) return

      if (!isReadingMode) {
        setIsReadingMode(true)
        setIsPlaying(true)
      } else {
        setIsPlaying((playing) => !playing)
      }
    }

    if (event.key === "ArrowRight") {
      event.preventDefault()

      if (!words.length) return

      setIsPlaying(false)
      setCurrentWord((current) =>
        Math.min(current + 1, words.length - 1)
      )
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault()

      if (!words.length) return

      setIsPlaying(false)
      setCurrentWord((current) => Math.max(current - 1, 0))
    }

    if (event.key.toLowerCase() === "r") {
      event.preventDefault()
      setCurrentWord(0)
      setIsPlaying(false)
    }

    if (event.key === "Escape") {
      setIsPlaying(false)
      setIsReadingMode(false)
    }
  }

  window.addEventListener("keydown", handleKeyDown)

  return () => {
    window.removeEventListener("keydown", handleKeyDown)
  }
}, [words.length, isReadingMode])

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

  const startReading = () => {
    if (words.length === 0) return

    setIsReadingMode(true)
    setIsPlaying(true)
  }

  const toggleReading = () => {
    if (isPlaying) {
      setIsPlaying(false)
    } else {
      if (words.length === 0) return
      setIsReadingMode(true)
      setIsPlaying(true)
    }
  }

  const resetReading = () => {
    setCurrentWord(0)
    setIsPlaying(false)
  }

  const exitReadingMode = () => {
    setIsPlaying(false)
    setIsReadingMode(false)
  }

  return (
    <main className={isDarkMode ? "dark" : ""}>
      <button
      className="theme-button"
      onClick={() => setIsDarkMode(!isDarkMode)}
      aria-label="Toggle dark mode"
    >
      {isDarkMode ? "☀" : "☾"}
    </button>
    <button
      className="controls-button"
      onClick={() => setShowControls((show) => !show)}
      aria-label="Show keyboard controls">?</button>

    {showControls && (
      <div className="controls-panel">
        <strong>Keyboard shortcuts</strong>
        <div>
          <span>Space</span>
          <span>Play / Pause</span>
        </div>
        <div>
          <span>← →</span>
          <span>Previous / Next word</span>
        </div>
        <div>
          <span>R</span>
          <span>Reset</span>
        </div>
        <div>
          <span>Esc</span>
          <span>Exit reading mode</span>
        </div>
      </div>
    )}
      {isReadingMode ? (
        <section className="reader fullscreen">
          <button
            className="edit-button"
            onClick={exitReadingMode}
            aria-label="Edit text"
          >
            ✎
          </button>

          <div className="word">
            <span className="before">{before}</span>
            <span className="focus">{focus}</span>
            <span className="after">{after}</span>
          </div>

          <div className="controls">
            <div className="buttons">
              <button
                className="control-button primary"
                onClick={toggleReading}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? "Ⅱ" : "▶"}
              </button>

              <button
                className="control-button"
                onClick={resetReading}
                aria-label="Reset"
              >
                ↻
              </button>
            </div>

            <div className="wpm-control">
              <label htmlFor="wpm">WPM</label>

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

          <div className="progress">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </section>
      ) : (
        <>
          <section className="reader">
            <div className="word">
              <span className="before">{before}</span>
              <span className="focus">{focus}</span>
              <span className="after">{after}</span>
            </div>

            <div className="controls">
              <div className="buttons">
                <button
                  className="control-button primary"
                  onClick={startReading}
                  aria-label="Start reading"
                >
                  ▶
                </button>

                <button
                  className="control-button"
                  onClick={resetReading}
                  aria-label="Reset"
                >
                  ↻
                </button>
              </div>

              <div className="wpm-control">
                <label htmlFor="wpm">WPM</label>

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
            <div className="input-header">
              <h1>Paste your text here</h1>
            </div>

            <textarea
              placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc placerat ligula vitae pulvinar condimentum. Pellentesque feugiat velit ut lectus egestas fermentum. Integer vitae massa tincidunt, rhoncus enim non, viverra justo. Proin sodales enim arcu, consequat scelerisque velit porttitor a. Donec pulvinar a purus non dapibus."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <div className="input-footer">
              <div className="text-actions">
                <button onClick={() => setText("")}>Clear</button>
                <button onClick={() => setText(cleanText(text))}>
                  Clean up formatting
                </button>
                <p className="help-text">
                  Removes citation numbers and fixes formatting from copied text.
                </p>
              </div>

              <p>Word Count: {words.length}</p>
            </div>
          </section>
        </>
      )}
    </main>
  )
}

export default App