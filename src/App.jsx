import { useEffect, useState } from "react";
import { adminUserId, supabase } from "./lib/supabase.js";

const godaddyAssetBase = "https://img1.wsimg.com/isteam/ip/0524fa53-f273-48a9-8b1e-fd605178a740/";

const storyCards = [
  {
    title: "Our Vision",
    image: "https://img1.wsimg.com/isteam/getty/515433638/:/cr=t:0%25,l:16.66%25,w:66.68%25,h:100%25/rs=w:730,h:730,cg:true/fx-gs",
    description: "At Filmy Brothers, our vision is to elevate Indian cinema by producing high-quality content, including engaging short films that connect with global audiences. We are dedicated to nurturing fresh talent from diverse backgrounds across the country and providing a platform for newcomers to showcase their skills and turn their dreams into reality.",
  },
  {
    title: "About Us",
    image: "/filmy-brothers-logo.png",
    description: "Filmy Brothers is a pioneering Indian film production company founded by the visionary producer and entrepreneur, Rajat Kumar. With a deep passion for storytelling and a commitment to nurturing fresh talent, we are dedicated to elevating Indian cinema to new heights. Established in 2015, we specialize in producing not only feature films but also captivating short films. Our core mission at Filmy Brothers is to discover and cultivate new talent from every corner of the country, empowering diverse voices to redefine Indian cinema with originality, creativity, and innovation.",
  },
  {
    title: "Founder",
    image: "https://img1.wsimg.com/isteam/ip/0524fa53-f273-48a9-8b1e-fd605178a740/WhatsApp%20Image%202025-08-11%20at%2015.59.40_c907fc94.jpg/:/cr=t:8.34%25,l:0%25,w:100%25,h:71.07%25/rs=w:730,h:730,cg:true",
    description: "Rajat Kumar, a first-generation filmmaker, discovered his passion for Indian cinema from a young age. Despite not having a background in the industry, his determination and enthusiasm have enabled him to carve out a unique niche within the Indian film industry. As the founder of M/S Filmy Brothers, he has been instrumental in producing critically acclaimed web series like DELHI CRIME (2022–2025) and JAMTARA: SABKA NUMBER AYEGA (2022), along with films such as FUKREY 3 (2023) and CAPTAIN MILLER (2024), as well as a variety of short films.",
    link: "https://www.imdb.com/name/nm11473645/?ref_=ext_shr_lnk",
  },
  {
    title: "CEO",
    image: "https://img1.wsimg.com/isteam/ip/0524fa53-f273-48a9-8b1e-fd605178a740/blob-52c5245.png/:/cr=t:12.5%25,l:0%25,w:100%25,h:75%25/rs=w:730,h:730,cg:true",
    description: "Mukesh Chandra Pandey is an experienced Project Head, Supervising Producer, and Head of Production with over a decade of experience in television, OTT, and digital content production. He has successfully managed and supervised numerous fiction series, mini-series, episodic shows, and large-scale productions for leading broadcasters and streaming platforms, including Star Plus, Sun TV Network, Zee TV, Zee Studios, Hotstar, Jio Studios, Hungama, Voot, Sony TV, Colors, Dangal TV, Star Bharat, MTV, and more. As part of the Filmy Brothers team, Mukesh has been instrumental in producing engaging short films that resonate with audiences of Indian cinema. With expertise in production planning, budgeting, crew management, scheduling, execution, and delivery, Mukesh has played a key role in bringing various successful television and OTT projects to viewers across India.",
  },
  {
    title: "Business Head",
    image: "https://img1.wsimg.com/isteam/ip/0524fa53-f273-48a9-8b1e-fd605178a740/1000300042.jpg/:/cr=t:0%25,l:0%25,w:100%25,h:72.25%25/rs=w:730,h:730,cg:true/fx-gs",
    description: "Payal Sharma is a dynamic professional with a strong understanding of business development, strategic planning and relationship management. With a keen interest in the entertainment industry, she brings a focused and result-oriented approach to building business opportunities and fostering long-term partnerships. As the Business Head at Filmy Brothers, Payal plays a key role in driving business growth, developing strategic collaborations and managing relationships with industry partners, brands, studios and other stakeholders. Her approach combines business acumen with an understanding of the evolving entertainment landscape, helping Filmy Brothers expand its creative and commercial opportunities.",
  },
  {
    title: "Storyteller",
    image: "https://img1.wsimg.com/isteam/getty/2207977605/:/cr=t:0%25,l:21.01%25,w:66.67%25,h:100%25/rs=w:730,h:730,cg:true/fx-gs",
    description: "Harshita Shrimali is a passionate screenwriter and storyteller with a keen interest in Indian cinema and contemporary storytelling. With a creative approach to writing, she focuses on developing engaging narratives, relatable characters and emotionally compelling stories. As part of the creative team at Filmy Brothers, she contributes to the development of stories, screenplays and dialogues across films and digital content. Her writing reflects a fresh perspective and a strong understanding of character-driven storytelling, with a focus on creating stories that connect with audiences.",
  },
];

function getYouTubeVideoId(value) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    let id = "";

    if (host === "youtu.be") {
      id = url.pathname.slice(1).split("/")[0];
    } else if (["youtube.com", "m.youtube.com", "music.youtube.com"].includes(host)) {
      if (url.pathname === "/watch") {
        id = url.searchParams.get("v") || "";
      } else {
        const match = url.pathname.match(/^\/(?:embed|shorts)\/([\w-]{11})/);
        id = match?.[1] || "";
      }
    }

    return /^[\w-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="arrow-icon">
      <path d="M4 10h11M10 4l6 6-6 6" />
    </svg>
  );
}

function AdminIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="admin-icon">
      <path d="M10 2.5 16 5v4.4c0 3.7-2.5 6.4-6 8.1-3.5-1.7-6-4.4-6-8.1V5l6-2.5Z" />
      <path d="m7.5 9.8 1.7 1.7 3.5-3.7" />
    </svg>
  );
}

function AdminWelcomeScreen() {
  return (
    <div className="admin-welcome-screen" role="status" aria-live="polite">
      <div className="welcome-screen-glow" aria-hidden="true" />
      <div className="welcome-screen-content">
        <span className="welcome-screen-mark">FB</span>
        <p className="welcome-screen-eyebrow">Admin access granted</p>
        <h2>Welcome to<br /><span>Filmy Brothers.</span></h2>
        <p className="welcome-screen-caption">Independent stories. Indian heart.</p>
      </div>
      <span className="welcome-screen-index" aria-hidden="true">MUMBAI · INDIA</span>
    </div>
  );
}

function Header({ isAdmin, onAdminClick, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <a className="brand" href="#home" onClick={closeMenu} aria-label="Filmy Brothers home">
        <img className="brand-logo" src="/filmy-brothers-logo.png" alt="" />
        <span className="brand-name">FILMY BROTHERS</span>
      </a>
      <button
        className="menu-toggle"
        type="button"
        aria-expanded={menuOpen}
        aria-controls="primary-navigation"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span>{menuOpen ? "Close" : "Menu"}</span>
        <span className={`menu-icon${menuOpen ? " is-open" : ""}`} aria-hidden="true">
          <i />
          <i />
        </span>
      </button>
      <nav
        className={`site-nav${menuOpen ? " is-open" : ""}`}
        id="primary-navigation"
        aria-label="Main navigation"
      >
        <a href="#films" onClick={closeMenu}>Short films</a>
        <a href="#story" onClick={closeMenu}>Our story</a>
        <button
          className={`admin-access${isAdmin ? " is-admin" : ""}`}
          type="button"
          onClick={() => {
            closeMenu();
            isAdmin ? onLogout() : onAdminClick();
          }}
        >
          <AdminIcon />
          {isAdmin ? "Log out" : "Admin login"}
        </button>
        <a className="nav-contact" href="#contact" onClick={closeMenu}>
          Let&apos;s talk <ArrowIcon />
        </a>
      </nav>
    </header>
  );
}

function Hero({ featuredFilm }) {
  return (
    <section className="hero" id="home">
      {featuredFilm && (
        <img
          className="hero-backdrop"
          src={`https://img.youtube.com/vi/${featuredFilm.id}/maxresdefault.jpg`}
          alt=""
          fetchPriority="high"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = `https://img.youtube.com/vi/${featuredFilm.id}/hqdefault.jpg`;
          }}
        />
      )}
      <iframe
        className="hero-video-backdrop"
        src="https://player.vimeo.com/video/1014071172?h=91c2d6b5df&autoplay=1&loop=1&autopause=0&muted=1&title=0&byline=0&portrait=0&controls=0"
        title="Filmy Brothers behind-the-scenes showreel"
        allow="autoplay; fullscreen; picture-in-picture"
        loading="eager"
        tabIndex="-1"
        aria-hidden="true"
      />
    </section>
  );
}

function SectionHeading({ eyebrow, title, number }) {
  return (
    <div className="section-heading">
      <p className="eyebrow"><span />{eyebrow}</p>
      <div className="heading-row">
        <h2>{title}</h2>
        {number && <span className="section-number">{number}</span>}
      </div>
    </div>
  );
}

function FilmCard({ film, index, onPlay, isVideoOpen }) {
  const [canPreview, setCanPreview] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [previewVideo, setPreviewVideo] = useState(false);

  useEffect(() => {
    const hoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreviewSupport = () => {
      setCanPreview(hoverQuery.matches && !motionQuery.matches && !isVideoOpen);
    };

    updatePreviewSupport();
    hoverQuery.addEventListener("change", updatePreviewSupport);
    motionQuery.addEventListener("change", updatePreviewSupport);

    return () => {
      hoverQuery.removeEventListener("change", updatePreviewSupport);
      motionQuery.removeEventListener("change", updatePreviewSupport);
    };
  }, [isVideoOpen]);

  useEffect(() => {
    if (!canPreview || !isHovered) {
      setPreviewVideo(false);
      return undefined;
    }

    const previewTimer = window.setTimeout(() => setPreviewVideo(true), 350);
    return () => window.clearTimeout(previewTimer);
  }, [canPreview, isHovered]);

  return (
    <article
      className="film-card"
      role="button"
      tabIndex={0}
      aria-label={`Play ${film.title}`}
      onClick={() => onPlay(film)}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse" || event.pointerType === "pen") {
          setIsHovered(true);
        }
      }}
      onPointerLeave={() => setIsHovered(false)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onPlay(film);
        }
      }}
    >
      <div className={`film-image${previewVideo ? " is-previewing" : ""}`}>
        <img
          src={`https://img.youtube.com/vi/${film.id}/hqdefault.jpg`}
          alt=""
          loading="lazy"
        />
        {previewVideo && (
          <iframe
            className="film-hover-preview"
            src={`https://www.youtube-nocookie.com/embed/${film.id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${film.id}&playsinline=1&rel=0`}
            title={`${film.title} muted preview`}
            allow="autoplay; encrypted-media"
            tabIndex="-1"
            aria-hidden="true"
          />
        )}
        <span className="film-play" aria-hidden="true">
          <svg viewBox="0 0 16 16"><path d="M5 3.5 12 8l-7 4.5z" /></svg>
        </span>
        <span className="film-index">{String(index + 1).padStart(2, "0")}</span>
      </div>
      <div className="film-caption">
        <div>
          <h3>{film.title}</h3>
          <p>{film.type}</p>
        </div>
        <ArrowIcon />
      </div>
      {film.description && <p className="film-description">{film.description}</p>}
    </article>
  );
}

function Films({ films, isAdmin, onAddFilm, onPlayFilm, isVideoOpen }) {
  return (
    <section className="films section-wrap" id="films">
      <div className="films-heading reveal-on-scroll" data-reveal>
        <SectionHeading eyebrow="Stories made to be shared" title="Short Films" number="01 / 03" />
        {isAdmin && (
          <button className="add-film-button" type="button" onClick={onAddFilm}>
            <span aria-hidden="true">+</span>
            Add a film
          </button>
        )}
      </div>
      <div className="film-grid">
        {films.map((film, index) => (
          <div
            className="film-reveal reveal-on-scroll"
            data-reveal
            key={film.id}
            style={{ "--reveal-delay": `${Math.min(index, 5) * 90}ms` }}
          >
            <FilmCard
              film={film}
              index={index}
              onPlay={onPlayFilm}
              isVideoOpen={isVideoOpen}
            />
          </div>
        ))}
      </div>
      {films.length === 0 && (
        <p className="films-empty" role="status">
          {isAdmin ? "Add a film to feature it here." : "Films will appear here once they are added."}
        </p>
      )}
      <a
        className="text-link"
        href="https://www.youtube.com/@FilmyBrothers"
        target="_blank"
        rel="noreferrer"
      >
        Explore our YouTube channel <ArrowIcon />
      </a>
    </section>
  );
}

function PosterGallery({ films, isLoading }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const activeFilmIndex = films.length ? activeIndex % films.length : 0;
  const visibleSlides = films.length <= 5
    ? films.map((film, index) => ({
      film,
      offset: ((index - activeFilmIndex + films.length + Math.floor(films.length / 2)) % films.length)
        - Math.floor(films.length / 2),
    }))
    : [-2, -1, 0, 1, 2].map((offset) => ({
      film: films[(activeFilmIndex + offset + films.length) % films.length],
      offset,
    }));

  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setReduceMotion(motionPreference.matches);
    updateMotionPreference();
    motionPreference.addEventListener("change", updateMotionPreference);
    return () => motionPreference.removeEventListener("change", updateMotionPreference);
  }, []);

  useEffect(() => {
    if (reduceMotion || films.length < 2) return undefined;
    const timerId = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % films.length);
    }, 2000);
    return () => window.clearInterval(timerId);
  }, [films.length, reduceMotion]);

  const moveSelection = (direction) => {
    if (!films.length) return;
    setActiveIndex((index) => (
      (index + direction + films.length) % films.length
    ));
  };

  return (
    <section
      className="poster-gallery"
      aria-label="Filmy Brothers productions"
    >
      <div className="poster-gallery-heading">
        <span />
        <h2>From Script to Screen: A Journey Through Indian Film Production With Filmy Brothers</h2>
        <span />
      </div>
      {films.length > 0 ? (
        <>
          <div className="poster-stage">
            {visibleSlides.map(({ film, offset }) => {
              const index = films.findIndex((entry) => entry.id === film.id);
              return (
                <button
                  aria-label={`${film.title}${offset === 0 ? ", selected" : ""}`}
                  aria-pressed={offset === 0}
                  className={`poster-slide${offset === 0 ? " is-active" : ""}`}
                  data-offset={offset}
                  key={film.id}
                  onClick={() => setActiveIndex(index)}
                  type="button"
                >
                  <img
                    src={`https://img.youtube.com/vi/${film.id}/hqdefault.jpg`}
                    alt={film.title}
                    loading={offset === 0 ? "eager" : "lazy"}
                  />
                </button>
              );
            })}
            <div className="poster-controls">
              <button type="button" aria-label="Previous production poster" onClick={() => moveSelection(-1)}>‹</button>
              <button type="button" aria-label="Next production poster" onClick={() => moveSelection(1)}>›</button>
            </div>
          </div>
          <div className="poster-thumbnails" aria-label="Choose a production poster">
            {films.map((film, index) => (
              <button
                aria-label={`Show poster ${index + 1}: ${film.title}`}
                aria-current={index === activeFilmIndex ? "true" : undefined}
                className={index === activeFilmIndex ? "is-active" : ""}
                key={`${film.id}-thumb`}
                onClick={() => setActiveIndex(index)}
                type="button"
              >
                <img
                  src={`https://img.youtube.com/vi/${film.id}/hqdefault.jpg`}
                  alt=""
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </>
      ) : (
        <p className="poster-gallery-empty" role="status">
          {isLoading ? "Loading films…" : "Add films as an admin to feature them here."}
        </p>
      )}
    </section>
  );
}

function StoryCard({ card, index }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article
      className="story-profile reveal-on-scroll"
      data-reveal
      style={{ "--reveal-delay": `${(index % 3) * 70}ms` }}
    >
      <img className="story-profile-image" src={card.image} alt="" loading="lazy" />
      <h3>{card.title}</h3>
      <p className={expanded ? "is-expanded" : ""}>{card.description}</p>
      {card.description.length > 230 && (
        <button
          aria-expanded={expanded}
          className="story-more"
          onClick={() => setExpanded((value) => !value)}
          type="button"
        >
          <span aria-hidden="true">{expanded ? "−" : "+"}</span>
          Show {expanded ? "Less" : "More"}
        </button>
      )}
      {card.link && (
        <a className="story-profile-link" href={card.link} rel="noreferrer" target="_blank">IMDb</a>
      )}
    </article>
  );
}

function VideoDialog({ film, onClose }) {
  if (!film) return null;

  return (
    <div
      className="dialog-backdrop video-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-labelledby="video-dialog-title"
        aria-modal="true"
        className="video-dialog"
        role="dialog"
      >
        <div className="video-dialog-heading">
          <h2 id="video-dialog-title">{film.title}</h2>
          <button className="dialog-close" type="button" onClick={onClose} aria-label="Close video">
            ×
          </button>
        </div>
        <div className="video-frame">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${film.id}?autoplay=1&rel=0`}
            title={`Play ${film.title}`}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
      </section>
    </div>
  );
}

function AdminDialog({
  mode,
  onClose,
  onModeChange,
  onLogin,
  onAddFilm,
  onRequestPasswordReset,
  onResetPassword,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [title, setTitle] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [videoType, setVideoType] = useState("Short film");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  if (!mode) return null;

  const isLogin = mode === "login";
  const isAddingFilm = mode === "add";
  const isRequestingReset = mode === "reset-request";
  const isResettingPassword = mode === "reset-password";

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      if (isLogin) {
        const loginError = await onLogin(email.trim(), password);
        if (loginError) setError(loginError);
        return;
      }

      if (isRequestingReset) {
        const resetError = await onRequestPasswordReset(email.trim());
        if (resetError) {
          setError(resetError);
        } else {
          setMessage("If an account exists for that email, a password reset link is on its way.");
        }
        return;
      }

      if (isResettingPassword) {
        if (password.length < 8) {
          setError("Choose a password with at least 8 characters.");
          return;
        }
        if (password !== confirmPassword) {
          setError("The passwords don’t match.");
          return;
        }
        const updateError = await onResetPassword(password);
        if (updateError) {
          setError(updateError);
        } else {
          setPassword("");
          setConfirmPassword("");
          setMessage("Your password has been updated.");
        }
        return;
      }

      const videoId = getYouTubeVideoId(youtubeUrl.trim());
      if (!title.trim()) {
        setError("Enter a name for the film.");
        return;
      }
      if (!videoId) {
        setError("Enter a valid YouTube video link.");
        return;
      }

      const addError = await onAddFilm({ title: title.trim(), type: videoType, id: videoId });
      if (addError) setError(addError);
    } catch (submitError) {
      console.error("The admin form could not be submitted.", submitError);
      setError(isAddingFilm
        ? "This film could not be saved. Check your connection and try again."
        : "The request could not be completed. Check your connection and try again.");
    }
  }

  const heading = isLogin
    ? "Superadmin login"
    : isAddingFilm
      ? "Add a film"
      : isRequestingReset
        ? "Reset your password"
        : "Choose a new password";
  const description = isLogin
    ? "Sign in to manage the films in our world."
    : isAddingFilm
      ? "Add a YouTube video to the films grid."
      : isRequestingReset
        ? "Enter your admin email and we’ll send you a password reset link."
        : "Enter a new password for your admin account.";

  return (
    <div
      className="dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-labelledby="admin-dialog-title"
        aria-modal="true"
        className="admin-dialog"
        role="dialog"
      >
        <button className="dialog-close" type="button" onClick={onClose} aria-label="Close dialog">
          ×
        </button>
        <p className="eyebrow"><span />{isAddingFilm ? "Film library" : "Members area"}</p>
        <h2 id="admin-dialog-title">{heading}</h2>
        <p className="dialog-description">{description}</p>
        <form onSubmit={handleSubmit}>
          {isLogin || isRequestingReset ? (
            <>
              <label>
                Email
                <input
                  autoComplete="username"
                  autoFocus
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  type="email"
                  value={email}
                />
              </label>
              {isLogin && <label>
                Password
                <input
                  autoComplete="current-password"
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  type="password"
                  value={password}
                />
              </label>}
            </>
          ) : isResettingPassword ? (
            <>
              <label>
                New password
                <input
                  autoComplete="new-password"
                  autoFocus
                  minLength={8}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  type="password"
                  value={password}
                />
              </label>
              <label>
                Confirm new password
                <input
                  autoComplete="new-password"
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  type="password"
                  value={confirmPassword}
                />
              </label>
            </>
          ) : (
            <>
              <label>
                Film name
                <input
                  autoFocus
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. A story from Mumbai"
                  required
                  value={title}
                />
              </label>
              <label>
                Video type
                <select
                  onChange={(event) => setVideoType(event.target.value)}
                  value={videoType}
                >
                  <option value="Short film">Short film</option>
                  <option value="Feature film">Feature film</option>
                  <option value="Original song">Original song</option>
                  <option value="Music video">Music video</option>
                  <option value="Teaser">Teaser</option>
                  <option value="Trailer">Trailer</option>
                  <option value="Behind the scenes">Behind the scenes</option>
                  <option value="Other">Other</option>
                </select>
              </label>
              <label>
                YouTube link
                <input
                  onChange={(event) => setYoutubeUrl(event.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                  type="url"
                  value={youtubeUrl}
                />
              </label>
            </>
          )}
          {error && <p className="form-error" role="alert">{error}</p>}
          {message && <p className="form-success" role="status">{message}</p>}
          <button className="dialog-submit" type="submit">
            {isLogin
              ? "Sign in"
              : isAddingFilm
                ? "Add to our films"
                : isRequestingReset
                  ? "Send reset link"
                  : "Update password"} <ArrowIcon />
          </button>
        </form>
        {isLogin && (
          <button
            className="dialog-text-button"
            type="button"
            onClick={() => {
              setError("");
              setMessage("");
              onModeChange("reset-request");
            }}
          >
            Forgot password?
          </button>
        )}
        {isRequestingReset && (
          <button
            className="dialog-text-button"
            type="button"
            onClick={() => {
              setError("");
              setMessage("");
              onModeChange("login");
            }}
          >
            Back to sign in
          </button>
        )}
      </section>
    </div>
  );
}

function Story() {
  return (
    <section className="story" id="story">
      <div className="story-inner section-wrap">
        <div className="story-section-heading">
          <span />
          <h2>The Filmy Brothers Story</h2>
          <span />
        </div>
        <div className="story-profile-grid">
          {storyCards.map((card, index) => (
            <StoryCard card={card} index={index} key={card.title} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact({ onSubmit, onSubscribe }) {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [fileError, setFileError] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (fileError) {
      setError(fileError);
      return;
    }
    setStatus("");
    setError("");
    setIsSubmitting(true);
    const form = event.currentTarget;
    const formData = new FormData(form);
    let result;
    try {
      result = await onSubmit({
        name: String(formData.get("name") || "").trim(),
        email: String(formData.get("email") || "").trim(),
        message: String(formData.get("message") || "").trim(),
        attachments: formData.getAll("attachments").filter((file) => file instanceof File && file.size > 0),
      });
    } catch (submitError) {
      console.error("The contact form submission failed unexpectedly.", submitError);
      result = "Your message could not be sent right now. Please try again or email us directly.";
    } finally {
      setIsSubmitting(false);
    }

    if (result) {
      setError(result);
      return;
    }

    form.reset();
    setSelectedFiles([]);
    setStatus("Thank you — your message has been received.");
  }

  return (
    <section className="contact section-wrap" id="contact">
      <div className="contact-social-section">
        <div className="compact-section-heading"><span /><h2>Social</h2><span /></div>
        <div className="social-icon-links" aria-label="Follow Filmy Brothers">
          <a aria-label="Facebook" href="https://www.facebook.com/filmybrothers" rel="noreferrer" target="_blank">f</a>
          <a aria-label="Instagram" href="https://www.instagram.com/filmybrothersofficial/" rel="noreferrer" target="_blank">◎</a>
          <a aria-label="YouTube" href="https://www.youtube.com/@filmybrothersofficial" rel="noreferrer" target="_blank">▶</a>
        </div>
      </div>
      <div className="compact-section-heading" id="contact-heading">
        <span /><h2>Contact Us</h2><span />
      </div>
      <div className="contact-layout">
        <form className="contact-form" onSubmit={handleSubmit}>
          <h3>Send Message</h3>
          <label>
            <span>Name</span>
            <input autoComplete="name" maxLength="120" name="name" placeholder="Name" required />
          </label>
          <label>
            <span>Email*</span>
            <input autoComplete="email" maxLength="254" name="email" placeholder="Email*" required type="email" />
          </label>
          <label>
            <span>Message</span>
            <textarea maxLength="5000" name="message" placeholder="Message" required rows="5" />
          </label>
          <div className="attachment-control">
            <label className="attachment-picker">
              <input
                accept="image/jpeg,image/png,application/pdf"
                multiple
                name="attachments"
                onChange={(event) => {
                  const files = Array.from(event.target.files || []);
                  const invalidFile = files.find((file) => file.size > 8 * 1024 * 1024);
                  if (files.length > 5) {
                    setFileError("Choose up to five files.");
                    event.target.value = "";
                    setSelectedFiles([]);
                  } else if (invalidFile) {
                    setFileError(`${invalidFile.name} is larger than 8 MB.`);
                    event.target.value = "";
                    setSelectedFiles([]);
                  } else {
                    setFileError("");
                    setSelectedFiles(files);
                  }
                }}
                type="file"
              />
              <span aria-hidden="true">⌁</span> Attach files
            </label>
            <span>Attachments ({selectedFiles.length})</span>
          </div>
          {fileError && <p className="form-error" role="alert">{fileError}</p>}
          {selectedFiles.length > 0 && (
            <ul className="attachment-list">
              {selectedFiles.map((file) => <li key={`${file.name}-${file.size}`}>{file.name}</li>)}
            </ul>
          )}
          <button className="contact-submit" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Sending…" : "Send"}
          </button>
          {error && <p className="form-error" role="alert">{error}</p>}
          {status && <p className="form-success" role="status">{status}</p>}
        </form>
        <div className="contact-aside">
          <section>
            <h3>Let&apos;s Get Started!</h3>
            <p>At Filmy Brothers, we are constantly on the lookout for talented individuals eager to leave their mark on Indian cinema. Our welcoming environment is designed for those with passion and potential, and we are committed to helping them conquer their fears and hesitations to realize their dreams, whether in feature films or meaningful short films.</p>
          </section>
          <section>
            <h3>Filmy Brothers</h3>
            <p>Andheri West, Mumbai, Maharashtra, India</p>
            <a href="mailto:info@filmybrothers.com">info@filmybrothers.com</a>
            <a href="mailto:filmybrothersproduction@gmail.com">filmybrothersproduction@gmail.com</a>
          </section>
        </div>
      </div>
      <Newsletter onSubmit={onSubscribe} />
    </section>
  );
}

function Newsletter({ onSubmit }) {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("");
    setError("");
    setIsSubmitting(true);
    const form = event.currentTarget;
    const email = String(new FormData(form).get("newsletter-email") || "").trim();
    let result;
    try {
      result = await onSubmit(email);
    } catch (submitError) {
      console.error("The newsletter submission failed unexpectedly.", submitError);
      result = "Sign-up failed. Please try again in a moment.";
    } finally {
      setIsSubmitting(false);
    }

    if (result) {
      setError(result);
      return;
    }

    form.reset();
    setStatus("You’re on the list. Thanks for subscribing.");
  }

  return (
    <div className="newsletter">
      <h2>Subscribe</h2>
      <form onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="newsletter-email">Email address</label>
        <input autoComplete="email" id="newsletter-email" maxLength="254" name="newsletter-email" placeholder="Email Address" required type="email" />
        <button disabled={isSubmitting} type="submit">{isSubmitting ? "Joining…" : "Sign up"}</button>
      </form>
      {error && <p className="form-error" role="alert">{error}</p>}
      {status && <p className="form-success" role="status">{status}</p>}
    </div>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <a className="brand" href="#home">
        <img className="brand-logo" src="/filmy-brothers-logo.png" alt="" />
        <span className="brand-name">FILMY BROTHERS</span>
      </a>
      <p>Independent stories. Indian heart.</p>
      <span>© {new Date().getFullYear()} Filmy Brothers</span>
    </footer>
  );
}

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminWelcome, setShowAdminWelcome] = useState(false);
  const [dialogMode, setDialogMode] = useState(null);
  const [films, setFilms] = useState([]);
  const [filmsLoading, setFilmsLoading] = useState(Boolean(supabase));
  const [appError, setAppError] = useState("");
  const [playingFilm, setPlayingFilm] = useState(null);
  useEffect(() => {
    if (!showAdminWelcome) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timeoutId = window.setTimeout(() => setShowAdminWelcome(false), 5200);
    return () => {
      window.clearTimeout(timeoutId);
      document.body.style.overflow = previousOverflow;
    };
  }, [showAdminWelcome]);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return undefined;

    document.body.classList.add("motion-ready");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -35px 0px" },
    );

    const revealElements = new Set();
    const revealVisibleElements = () => {
      revealElements.forEach((element) => {
        if (element.classList.contains("is-visible")) return;
        const bounds = element.getBoundingClientRect();
        if (bounds.top < window.innerHeight && bounds.bottom > 0) {
          element.classList.add("is-visible");
          observer.unobserve(element);
        }
      });
    };

    const observeRevealElements = (root) => {
      if (root instanceof Element && root.matches("[data-reveal]")) {
        revealElements.add(root);
        observer.observe(root);
      }
      root.querySelectorAll?.("[data-reveal]").forEach((element) => {
        revealElements.add(element);
        observer.observe(element);
      });
      revealVisibleElements();
    };

    observeRevealElements(document);
    window.addEventListener("scroll", revealVisibleElements, { passive: true });
    window.addEventListener("resize", revealVisibleElements);

    const mutationObserver = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          if (node instanceof Element) observeRevealElements(node);
        });
      });
    });
    mutationObserver.observe(document.querySelector("main"), { childList: true, subtree: true });

    revealVisibleElements();

    return () => {
      window.removeEventListener("scroll", revealVisibleElements);
      window.removeEventListener("resize", revealVisibleElements);
      mutationObserver.disconnect();
      observer.disconnect();
      document.body.classList.remove("motion-ready");
    };
  }, []);

  useEffect(() => {
    if (!supabase) return undefined;

    let active = true;
    const loadFilms = async () => {
      const { data, error } = await supabase
        .from("films")
        .select("id, title, youtube_id, type, description")
        .order("created_at", { ascending: true });

      if (!active) return;
      if (error) {
        console.error("Films could not be loaded from Supabase.", error);
        setAppError("Films could not be loaded. Re-run supabase/setup.sql to add the latest film columns, then refresh.");
      } else {
        setFilms(data.map((film) => ({
          id: film.youtube_id,
          title: film.title,
          type: film.type,
          description: film.description,
        })));
      }
      setFilmsLoading(false);
    };

    loadFilms().catch((error) => {
      if (!active) return;
      console.error("Films could not be loaded from Supabase.", error);
      setAppError("Films could not be loaded. Please refresh to try again.");
      setFilmsLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!supabase) return undefined;

    let active = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) {
        console.error("The admin session could not be restored.", error);
        setAppError("Your admin session could not be checked. Please refresh the page.");
        return;
      }
      setIsAdmin(data.session?.user.id === adminUserId);
    }).catch((error) => {
      if (!active) return;
      console.error("The admin session could not be restored.", error);
      setAppError("Your admin session could not be checked. Please refresh the page.");
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      setIsAdmin(session?.user.id === adminUserId);
      if (event === "PASSWORD_RECOVERY") setDialogMode("reset-password");
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function login(email, password) {
    if (!supabase) {
      return "Admin login is not configured yet. Add the Supabase settings to the site environment.";
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error("Admin sign-in failed.", error);
      return "Sign-in failed. Check your email and password.";
    }
    if (data.user?.id !== adminUserId) {
      await supabase.auth.signOut();
      return "This account is not authorized to manage films.";
    }

    setDialogMode(null);
    setShowAdminWelcome(true);
    return null;
  }

  async function requestPasswordReset(email) {
    if (!supabase) {
      return "Password reset is not configured. Add the Supabase settings and try again.";
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) {
      console.error("Password reset email could not be sent.", error);
      return "The reset email could not be sent. Check the email and try again.";
    }
    return null;
  }

  async function resetPassword(password) {
    if (!supabase) return "Password reset is not configured.";

    const { data, error } = await supabase.auth.updateUser({ password });
    if (error) {
      console.error("The admin password could not be updated.", error);
      return "The password could not be updated. Reopen the email link and try again.";
    }
    if (data.user?.id !== adminUserId) {
      await supabase.auth.signOut();
      return "This account is not authorized to manage films.";
    }
    return null;
  }

  async function logout() {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Admin sign-out failed.", error);
      setAppError("Sign out failed. Please try again.");
    } else {
      setAppError("");
    }
  }

  async function addFilm(film) {
    if (!supabase) return "Supabase is not configured.";

    const { data, error } = await supabase
      .from("films")
      .insert({ title: film.title, youtube_id: film.id, type: film.type, description: "" })
      .select("id, title, youtube_id, type, description")
      .single();

    if (error) {
      console.error("The film could not be saved to Supabase.", error);
      return "This film could not be saved. Check your connection and try again.";
    }

    setFilms((currentFilms) => [
      ...currentFilms,
      {
        id: data.youtube_id,
        title: data.title,
        type: data.type,
        description: data.description,
      },
    ]);
    setAppError("");
    setDialogMode(null);
    return null;
  }

  async function submitContact({ attachments, ...message }) {
    if (!supabase) {
      return "The contact form is not configured. Add the Supabase settings and run the website-forms SQL setup.";
    }

    const attachmentPaths = [];
    const requestId = crypto.randomUUID();
    for (const file of attachments) {
      const safeFileName = file.name.replace(/[^\w.-]/g, "_");
      const path = `${requestId}/${crypto.randomUUID()}-${safeFileName}`;
      const { error: uploadError } = await supabase.storage
        .from("contact-attachments")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (uploadError) {
        console.error("A contact form attachment could not be uploaded.", uploadError);
        return "An attachment could not be uploaded. Check that the file is a PNG, JPG, or PDF under 8 MB and try again.";
      }
      attachmentPaths.push(path);
    }

    const { error } = await supabase
      .from("contact_messages")
      .insert({ ...message, attachment_paths: attachmentPaths });
    if (error) {
      console.error("The contact message could not be saved.", error);
      return "Your message could not be sent right now. Please try again or email us directly.";
    }
    return null;
  }

  async function subscribeToNewsletter(email) {
    if (!supabase) {
      return "Newsletter sign-up is not configured. Add the Supabase settings and run the website-forms SQL setup.";
    }

    const { error } = await supabase
      .from("newsletter_subscriptions")
      .insert({ email: email.toLowerCase() });
    if (error?.code === "23505") {
      return "This email address is already subscribed.";
    }
    if (error) {
      console.error("The newsletter subscription could not be saved.", error);
      return "Sign-up failed. Please try again in a moment.";
    }
    return null;
  }

  return (
    <>
      <Header
        isAdmin={isAdmin}
        onAdminClick={() => setDialogMode("login")}
        onLogout={logout}
      />
      {showAdminWelcome && (
        <AdminWelcomeScreen />
      )}
      <main>
        <Hero featuredFilm={films[0]} />
        <PosterGallery films={films} isLoading={filmsLoading} />
        <Films
          films={films}
          isAdmin={isAdmin}
          isVideoOpen={Boolean(playingFilm)}
          onPlayFilm={setPlayingFilm}
          onAddFilm={() => {
            setAppError("");
            setDialogMode("add");
          }}
        />
        {filmsLoading && <p className="storage-error" role="status">Loading films…</p>}
        {appError && <p className="storage-error" role="alert">{appError}</p>}
        <Story />
        <Contact onSubmit={submitContact} onSubscribe={subscribeToNewsletter} />
      </main>
      <Footer />
      <AdminDialog
        mode={dialogMode}
        onClose={() => setDialogMode(null)}
        onModeChange={setDialogMode}
        onLogin={login}
        onAddFilm={addFilm}
        onRequestPasswordReset={requestPasswordReset}
        onResetPassword={resetPassword}
      />
      <VideoDialog film={playingFilm} onClose={() => setPlayingFilm(null)} />
    </>
  );
}
