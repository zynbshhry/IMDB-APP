import { useEffect, useState } from "react";

const genres = [
  {
    id: 28,
    name: "Action",
  },
  {
    id: 12,
    name: "Adventure",
  },
  {
    id: 16,
    name: "Animation",
  },
  {
    id: 35,
    name: "Comedy",
  },
  {
    id: 80,
    name: "Crime",
  },
  {
    id: 99,
    name: "Documentary",
  },
  {
    id: 18,
    name: "Drama",
  },
  {
    id: 10751,
    name: "Family",
  },
  {
    id: 14,
    name: "Fantasy",
  },
  {
    id: 36,
    name: "History",
  },
  {
    id: 27,
    name: "Horror",
  },
  {
    id: 10402,
    name: "Music",
  },
  {
    id: 9648,
    name: "Mystery",
  },
  {
    id: 10749,
    name: "Romance",
  },
  {
    id: 878,
    name: "Science Fiction",
  },
  {
    id: 10770,
    name: "TV Movie",
  },
  {
    id: 53,
    name: "Thriller",
  },
  {
    id: 10752,
    name: "War",
  },
  {
    id: 37,
    name: "Western",
  },
];
const KEY = "05d2f51130e7290d6533acda129b993f";

export default function App() {
  const [movieDetail, setMovieDetail] = useState({});
  const [openWatchedBox, setOpenWatchedBox] = useState(false);
  const [openFavBox, setOpenFavBox] = useState(false);
  const [openSearchBox, setOpenSearchBox] = useState(false);
  const [favMovies, setFavMovies] = useState(function () {
    const localStored = localStorage.getItem("favorite");
    return localStored ? JSON.parse(localStored) : [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [searchMovie, setSearchMovie] = useState([]);
  function resetAsideBox() {
    setOpenWatchedBox(false);
    setOpenFavBox(false);
    setOpenSearchBox(false);
    setError("");
  }
  function handleMoviesDetail(movie) {
    resetAsideBox();
    setOpenWatchedBox(true);
    setMovieDetail(movie);
  }

  function handleAddToFav(movie) {
    const id = movie.id;
    const isFav = favMovies.map((movie) => movie.id).includes(id);
    resetAsideBox();
    setOpenFavBox(true);
    if (!isFav) {
      setFavMovies((favMovies) => [...favMovies, movie]);
    }
  }
  function handleDeleteFav(id) {
    setFavMovies(favMovies.filter((movie) => movie.id !== id));
  }
  useEffect(
    function () {
      localStorage.setItem("favorite", JSON.stringify(favMovies));
    },
    [favMovies]
  );
  useEffect(
    function () {
      const controller = new AbortController();
      if (query.length < 3) {
        setSearchMovie([]);
        setError("");
        setOpenSearchBox(false);
      } else {
        async function getMovie() {
          try {
            setError("");
            resetAsideBox();
            setOpenSearchBox(true);
            setLoading(true);
            const res = await fetch(
              `https://api.themoviedb.org/3/search/movie?api_key=${KEY}&query=${query}`,
              { signal: controller.signal }
            );
            if (!res.ok) throw new Error("failed to fetch movie");
            const data = await res.json();

            setSearchMovie(data.results);
            if (data.total_results === 0) throw new Error("movies not found");
            setError("");
            setLoading(false);
          } catch (err) {
            if (err.name !== "AbortError") {
              setError(err.message);
            }
          } finally {
            setLoading(false);
          }
        }

        getMovie();

        return function () {
          controller.abort();
        };
      }
    },
    [query]
  );

  return (
    <>
      <Header
        setQuery={setQuery}
        query={query}
        setOpenFavBox={setOpenFavBox}
        resetAsideBox={resetAsideBox}
      />
      <Main>
        <Boxes handleMoviesDetail={handleMoviesDetail} />
        {!(openFavBox || openWatchedBox || openSearchBox || error) ? null : (
          <div className="aside">
            <button className="btn-closeWatched" onClick={resetAsideBox}>
              X
            </button>
            <div>
              {openWatchedBox && (
                <WatchedBox
                  handleAddToFav={handleAddToFav}
                  movieDetail={movieDetail}
                />
              )}
              {openFavBox &&
                (favMovies.length === 0 ? (
                  <div className="error">
                    Nothing on the list<span>😴</span>
                  </div>
                ) : (
                  <ListedBox
                    list={favMovies}
                    handleMoviesDetail={handleMoviesDetail}
                    handleDeleteFav={handleDeleteFav}
                    showButton={true}
                  ></ListedBox>
                ))}
              {openSearchBox && (
                <ListedBox
                  list={searchMovie}
                  handleMoviesDetail={handleMoviesDetail}
                  showButton={false}
                  loading={loading}
                ></ListedBox>
              )}
              {error && <ErrorMassege message={error} />}
            </div>
          </div>
        )}
      </Main>
    </>
  );
}
function Header({ setQuery, query, setOpenFavBox, resetAsideBox }) {
  return (
    <nav className="nav-bar">
      <div className="logo">
        <span role="img">🎥</span>
        <h1>IMDB APP</h1>
      </div>
      <div>
        <input
          className="search"
          type="text"
          placeholder="search here..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
          }}
        />
      </div>
      <div
        className="fav"
        onClick={() => {
          resetAsideBox();
          setOpenFavBox(true);
        }}
      >
        ❤
      </div>
    </nav>
  );
}
function Main({ children }) {
  return <main className="main">{children}</main>;
}
function Boxes({ handleMoviesDetail }) {
  return (
    <section className="boxes">
      {genres?.map((genre) => (
        <MoviesList
          handleMoviesDetail={handleMoviesDetail}
          genre={genre}
          key={genre.id}
        />
      ))}
    </section>
  );
}

function MoviesList({ handleMoviesDetail, genre }) {
  const [movie, setMovie] = useState([]);

  useEffect(
    function () {
      const controller = new AbortController();
      async function getMovie() {
        try {
          const res = await fetch(
            `https://api.themoviedb.org/3/discover/movie?api_key=${KEY}&with_genres=${genre.id}&vote_average.gte=7&vote_count.gte=1000&page=1`,
            { signal: controller.signal }
          );
          if (!res.ok) throw new Error("failed to fetch movie");
          const data = await res.json();
          setMovie(data.results);
        } catch (err) {
          if (err.name !== "AbortError") {
            alert("something wrong");
          }
        }
      }
      getMovie();
      return function () {
        controller.abort();
      };
    },
    [genre]
  );
  return (
    <div>
      <h3>{genre.name}</h3>
      <ul className="movies-list">
        {movie?.map((movie) => (
          <li
            key={movie.id}
            className="movie"
            onClick={() => handleMoviesDetail(movie)}
          >
            <Movie movie={movie} key={movie.id} />
          </li>
        ))}
      </ul>
    </div>
  );
}
function Movie({ movie }) {
  return (
    <div>
      <img
        src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
        alt={movie.title}
      />
      <p>{movie.title}</p>
      <h6>
        {movie.vote_average.toFixed(1)}
        <span>⭐</span>
      </h6>
    </div>
  );
}
function WatchedBox({ handleAddToFav, movieDetail }) {
  return (
    <div style={{ paddingTop: "16px" }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          className="btn-closeWatched"
          onClick={() => handleAddToFav(movieDetail)}
        >
          ❤
        </button>
      </div>
      <WatchedMovie movie={movieDetail} />
    </div>
  );
}
function WatchedMovie({ movie }) {
  return (
    <div className="movieDetail">
      <img
        className="backdrop"
        src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
        alt={movie.title}
      />
      <div>
        <h1>{movie.title}</h1>
        <h2>{movie.release_date}</h2>
        <p>{movie.overview}</p>
      </div>
    </div>
  );
}
function ListedBox({
  list,
  handleMoviesDetail,
  handleDeleteFav,
  showButton,
  loading,
}) {
  return loading ? (
    <Loader />
  ) : (
    <ul className="list">
      {list?.map((item) => (
        <li key={item.id} className="item">
          <div
            className="item-details"
            onClick={() => handleMoviesDetail(item)}
          >
            <img
              src={`https://image.tmdb.org/t/p/w500/${item.poster_path}`}
              alt={item.title}
            />

            <h2 style={{ width: "60%" }}>{item.title}</h2>
            {showButton ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteFav(item.id);
                }}
                className="btn-closeWatched"
                style={{ backgroundColor: "#e03131", borderColor: "#e03131" }}
              >
                X
              </button>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
function Loader() {
  return (
    <div className="sk-chase">
      <div className="sk-chase-dot"></div>
      <div className="sk-chase-dot"></div>
      <div className="sk-chase-dot"></div>
      <div className="sk-chase-dot"></div>
      <div className="sk-chase-dot"></div>
      <div className="sk-chase-dot"></div>
    </div>
  );
}
function ErrorMassege({ message }) {
  return (
    <div className="error">
      {message}
      <span>😓</span>
    </div>
  );
}
