import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating"
// const tempMovieData = [
//   {
//     imdbID: "tt1375666",
//     Title: "Inception",
//     Year: "2010",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
//   },
//   {
//     imdbID: "tt0133093",
//     Title: "The Matrix",
//     Year: "1999",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
//   },
//   {
//     imdbID: "tt6751668",
//     Title: "Parasite",
//     Year: "2019",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
//   },
// ];

// const tempWatchedData = [
//   {
//     imdbID: "tt1375666",
//     Title: "Inception",
//     Year: "2010",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
//     runtime: 148,
//     imdbRating: 8.8,
//     userRating: 10,
//   },
//   {
//     imdbID: "tt0088763",
//     Title: "Back to the Future",
//     Year: "1985",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
//     runtime: 116,
//     imdbRating: 8.5,
//     userRating: 9,
//   },
// ];

const KEY = "572a1e14"

const average = (arr) =>
  arr?.reduce((acc, cur, i, arr) => acc + cur / arr?.length, 0);

export default function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState(() => {
    const storedValue = localStorage.getItem("watched");
    return JSON.parse(storedValue) || [];
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedId, setSelectedId] = useState(null)

  // useEffect(
  //   function () {
  //     setIsLoading(true)
  //     async function fetchMovies() {
  //       const res = await fetch(`https://www.omdbapi.com/?i=tt3896198&apikey=${KEY}&s=${query}`)
  //       const data = await res.json();
  //       setMovies(data.Search);
  //       setIsLoading(false)
  //     }
  //     fetchMovies()
  //   }, [query])

  function handleSelectMovie(id) {
    setSelectedId((selectedId) => selectedId === id ? null : id)
  }

  function handleAddWached(movie) {
    setWatched(watched => [...watched, movie])
  }

  function handleCloseMovie() {
    setSelectedId(null)
  }

  function handleDeleteWatched(id) {
    setWatched(watched => watched.filter(movie => movie.imdbID !== id))
  }


  useEffect(
    function () {
      localStorage.setItem("watched", JSON.stringify(watched))
    },
    [watched])


  useEffect(
    function () {
      const controller = new AbortController();

      async function fetchMovies() {
        try {
          setIsLoading(true)
          setError("")
          const res = await fetch(`https://www.omdbapi.com/?apikey=${KEY}&s=${query}`, {
            signal: controller.signal,
          })

          if (!res.ok) throw new Error("Something went wrong with fetching movies")

          const data = await res.json();
          if (data.Response === "False") throw new Error("Movie not found")
          setMovies(data.Search);
        }
        catch (err) {
          if (err.name !== "AbortError") {
            setError(err.message)
          }
        }
        finally {
          setIsLoading(false)
        }
      }

      if (query?.length < 3) {
        setMovies([])
        return
      }
      handleCloseMovie()
      fetchMovies()
      return function () {
        controller.abort()
      }
    }, [query])



  return (
    <>
      <NavBar>
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {/* {isLoading ? <Loader /> : <MovieList movies={movies} />} */}
          {isLoading && <Loader />}
          {!isLoading && !error && <MovieList onSelectMovie={handleSelectMovie} movies={movies} />}
          {error && <Error error={error} />}
        </Box>
        <Box>
          {
            selectedId ? <MovieDeatils watched={watched} onAddWatched={handleAddWached} onCloseMovie={handleCloseMovie} selectedId={selectedId} /> :
              <>
                <WatchedSummary watched={watched} />
                <WatchedMovieList watched={watched} onDelete={handleDeleteWatched} />
              </>
          }

        </Box>
      </Main>
    </>
  );
}

function Error({ error }) {
  return <div className="error">
    {error}
  </div>
}

function Loader() {
  return <div className="loader">
    Loading...
  </div>
}

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      {children}
    </nav>
  )
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  )
}

function Search({ query, setQuery }) {
  const inputEl = useRef(null);

  useEffect(() => {
    function callback(e) {
      if (document.activeElement === inputEl.current) return
      if (e.code === "Enter") {
        inputEl.current.focus()
        setQuery("")
      }
    }
    document.addEventListener("keydown", callback)
    return function () {
      document.removeEventListener("keydown", callback)
    }
  }, [setQuery])

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  )
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies?.length}</strong> results
    </p>
  )
}

function Main({ children }) {
  return (
    <main className="main">
      {children}
    </main>
  )
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  )
}

function MovieList({ movies, onSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} onSelectMovie={onSelectMovie} key={movie.imdbID} />
      ))}
    </ul>
  )
}

function Movie({ movie, onSelectMovie }) {
  return (
    <li style={{ cursor: "pointer" }} key={movie.imdbID} onClick={() => onSelectMovie(movie.imdbID)} >
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </ li>
  )
}

function MovieDeatils({ selectedId, onCloseMovie, onAddWatched, watched }) {
  const [movie, setMovie] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [userRating, setUserRating] = useState("")
  const countRef = useRef(0)

  const isWatched = watched?.map(movie => movie.imdbID).includes(selectedId)
  const watchedRating = watched?.find(movie => movie.imdbID == selectedId)?.userRating

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      runtime: Number(runtime.split(" ").at(0)),
      imdbRating: Number(imdbRating),
      userRating,
      countRatingDecisions: countRef.current
    }

    onAddWatched(newWatchedMovie)
    onCloseMovie()
  }

  useEffect(() => {
    if (!title) return
    document.title = `Movie | ${title}`
    return function () {
      document.title = "UsePopcorn";
    }
  }, [title])


  useEffect(function () {
    async function getMovieDetails() {
      setIsLoading(true)
      const res = await fetch(`https://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`)
      const data = await res.json();
      setMovie(data)
      setIsLoading(false)
    }
    getMovieDetails()
  }, [selectedId])

  useEffect(() => {

    function callback(e) {
      if (e.code === "Escape") {
        onCloseMovie()
      }
    }
    document.addEventListener("keydown", callback)

    return function () {
      document.removeEventListener("keydown", callback)
    }
  }, [onCloseMovie])

  useEffect(() => {
    if (userRating) countRef.current++
  }, [userRating])

  return <div className="details">
    {isLoading ? <Loader /> :
      <>
        <header>
          <button className="btn-back" onClick={onCloseMovie}>&larr;</button>
          <img src={poster} alt={`Poster of ${movie} movie`} />
          <div className="details-overview">
            <h2>{title}</h2>
            <p>{released} &bull; {runtime}</p>
            <p>{genre}</p>
            <p><span>⭐</span>{imdbRating} IMDb rating</p>
          </div>
        </header>
        <section>
          <div className="rating">
            {!isWatched ? <>
              <StarRating maxRaiting={10} size={24} onSetRating={setUserRating} />
              {userRating > 0 && <button onClick={handleAdd} className="btn-add">+ Add to list</button>}
            </> : <p>You rated with movie {watchedRating} ⭐️</p>}

          </div>
          <p><em>{plot}</em></p>
          <p>Starring {actors}</p>
          <p>Directed by {director}</p>
        </section>
      </>
    }


  </div>
}


function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched?.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched?.map((movie) => movie.userRating));
  const avgRuntime = average(watched?.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched?.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating?.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating?.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  )
}

function WatchedMovieList({ watched, onDelete }) {
  return (
    <ul className="list">
      {watched?.map((movie) => (
        <WatchedMovie movie={movie} key={movie.imdbID} onDelete={onDelete} />
      ))}
    </ul>
  )
}

function WatchedMovie({ movie, onDelete }) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button className="btn-delete" onClick={() => onDelete(movie.imdbID)}>X</button>
      </div>
    </li>
  )
}


