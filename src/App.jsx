import { useEffect, useRef, useState } from "react";
import {
  FaEnvelope,
  FaFacebookF,
  FaInstagram,
  FaLocationDot,
  FaPhone,
  FaYoutube,
} from "react-icons/fa6";
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

function getCarouselPosterUrl(path) {
  if (!path || !supabase) return null;
  return supabase.storage.from("film-posters").getPublicUrl(path).data.publicUrl;
}

function getCarouselPosterThumbnailPath(path) {
  return path.replace(/-poster\.(webp|jpg)$/, "-thumb.$1");
}

function validatePosterFile(file) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    return "Choose a JPG, PNG, or WebP poster image.";
  }
  if (file.size > 8 * 1024 * 1024) {
    return "The poster must be 8 MB or smaller.";
  }
  return "";
}

function createPosterCanvas(image, width, height, scale = 1) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Poster image processing is not available in this browser.");

  context.fillStyle = "#111";
  context.fillRect(0, 0, canvas.width, canvas.height);
  const imageScale = Math.min(canvas.width / image.width, canvas.height / image.height);
  const imageWidth = Math.round(image.width * imageScale);
  const imageHeight = Math.round(image.height * imageScale);
  context.drawImage(
    image,
    (canvas.width - imageWidth) / 2,
    (canvas.height - imageHeight) / 2,
    imageWidth,
    imageHeight,
  );
  return canvas;
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("The poster image could not be compressed."))),
      type,
      quality,
    );
  });
}

async function encodePosterVariant(image, dimensions, maxBytes, type) {
  for (const scale of [1, 0.9, 0.8]) {
    const canvas = createPosterCanvas(image, dimensions.width, dimensions.height, scale);
    for (const quality of [0.82, 0.74, 0.66, 0.58]) {
      const blob = await canvasToBlob(canvas, type, quality);
      if (blob.type !== type) return null;
      if (blob.size <= maxBytes) return blob;
    }
  }
  return null;
}

async function optimizePoster(file) {
  const image = await createImageBitmap(file);
  if (image.width * image.height > 50_000_000) {
    image.close();
    throw new Error("The image dimensions are too large to process safely.");
  }

  try {
    let posterBlob;
    let type;
    for (const candidateType of ["image/webp", "image/jpeg"]) {
      posterBlob = await encodePosterVariant(
        image,
        { width: 1000, height: 1414 },
        350 * 1024,
        candidateType,
      );
      if (posterBlob) {
        type = candidateType;
        break;
      }
    }
    if (!posterBlob) {
      throw new Error("The compressed poster is still too large. Try a simpler or smaller image.");
    }

    const thumbnailBlob = await encodePosterVariant(
      image,
      { width: 240, height: 340 },
      40 * 1024,
      type,
    );
    if (!thumbnailBlob) {
      throw new Error("The poster thumbnail could not be compressed.");
    }

    const extension = type === "image/webp" ? "webp" : "jpg";
    return {
      poster: new File([posterBlob], `poster.${extension}`, { type }),
      thumbnail: new File([thumbnailBlob], `poster-thumb.${extension}`, { type }),
      extension,
    };
  } finally {
    image.close();
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

function Header() {
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
        <a href="#home" onClick={closeMenu}>Home</a>
        <a href="#story" onClick={closeMenu}>About Us</a>
        <a href="#films" onClick={closeMenu}>Films</a>
        <a href="#news-events" onClick={closeMenu}>News &amp; Events</a>
        <a href="#contact" onClick={closeMenu}>Reach Us</a>
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

function Films({ films, isAdmin, onAddFilm, onRemoveFilm, onReorderFilms, onPlayFilm, isVideoOpen }) {
  const [removingFilmId, setRemovingFilmId] = useState(null);
  const [removalError, setRemovalError] = useState("");
  const [draggedFilmId, setDraggedFilmId] = useState(null);
  const [reorderError, setReorderError] = useState("");

  async function handleRemoveFilm(film) {
    if (!window.confirm(`Remove "${film.title}" from the site and database?`)) return;

    setRemovalError("");
    setRemovingFilmId(film.id);
    try {
      const error = await onRemoveFilm(film);
      if (error) setRemovalError(error);
    } catch (error) {
      console.error("The film could not be removed.", error);
      setRemovalError("This video could not be removed. Check your connection and try again.");
    } finally {
      setRemovingFilmId(null);
    }
  }

  async function moveFilm(filmIndex, direction) {
    const destinationIndex = filmIndex + direction;
    if (destinationIndex < 0 || destinationIndex >= films.length) return;

    const reorderedFilms = [...films];
    [reorderedFilms[filmIndex], reorderedFilms[destinationIndex]] = [
      reorderedFilms[destinationIndex],
      reorderedFilms[filmIndex],
    ];
    setReorderError("");
    const error = await onReorderFilms(reorderedFilms);
    if (error) setReorderError(error);
  }

  async function dropFilm(destinationId) {
    if (!draggedFilmId || draggedFilmId === destinationId) return;
    const sourceIndex = films.findIndex((film) => film.id === draggedFilmId);
    const destinationIndex = films.findIndex((film) => film.id === destinationId);
    if (sourceIndex < 0 || destinationIndex < 0) return;

    const reorderedFilms = [...films];
    const [draggedFilm] = reorderedFilms.splice(sourceIndex, 1);
    reorderedFilms.splice(destinationIndex, 0, draggedFilm);
    setReorderError("");
    const error = await onReorderFilms(reorderedFilms);
    if (error) setReorderError(error);
  }

  return (
    <section className="films section-wrap" id="films">
      <div className="films-heading reveal-on-scroll" data-reveal>
        <SectionHeading eyebrow="Stories made to be shared" title="MOVIES" number="01 / 03" />
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
            className={`film-reveal reveal-on-scroll${draggedFilmId === film.id ? " is-dragging" : ""}`}
            data-reveal
            key={film.id}
            onDragOver={(event) => {
              if (draggedFilmId) event.preventDefault();
            }}
            onDrop={(event) => {
              event.preventDefault();
              void dropFilm(film.id);
              setDraggedFilmId(null);
            }}
            style={{ "--reveal-delay": `${Math.min(index, 5) * 90}ms` }}
          >
            {isAdmin && (
              <div className="film-admin-controls">
                <button
                  aria-label={`Drag ${film.title} to reorder`}
                  className="film-drag-handle"
                  draggable="true"
                  onDragEnd={() => setDraggedFilmId(null)}
                  onDragStart={(event) => {
                    setDraggedFilmId(film.id);
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("text/plain", film.id);
                  }}
                  title="Drag to reorder"
                  type="button"
                >⠿</button>
                <button
                  aria-label={`Move ${film.title} up`}
                  className="film-order-button"
                  disabled={index === 0}
                  onClick={() => void moveFilm(index, -1)}
                  title="Move up"
                  type="button"
                >↑</button>
                <button
                  aria-label={`Move ${film.title} down`}
                  className="film-order-button"
                  disabled={index === films.length - 1}
                  onClick={() => void moveFilm(index, 1)}
                  title="Move down"
                  type="button"
                >↓</button>
                <button
                  className="film-remove-button"
                  type="button"
                  disabled={removingFilmId === film.id}
                  onClick={() => handleRemoveFilm(film)}
                >
                  {removingFilmId === film.id ? "Removing…" : "Remove"}
                </button>
              </div>
            )}
            <FilmCard
              film={film}
              index={index}
              onPlay={onPlayFilm}
              isVideoOpen={isVideoOpen}
            />
          </div>
        ))}
      </div>
      {removalError && <p className="storage-error" role="alert">{removalError}</p>}
      {reorderError && <p className="storage-error" role="alert">{reorderError}</p>}
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

function getNewsEventDisplayDetails(link) {
  try {
    const url = new URL(link);
    const pathPart = url.pathname.split("/").filter(Boolean).pop();
    let title = url.hostname.replace(/^www\./, "");
    if (pathPart) {
      try {
        title = decodeURIComponent(pathPart);
      } catch {
        title = pathPart;
      }
      title = title.replace(/[-_]+/g, " ").replace(/\.[^.]+$/, "");
    }
    return {
      title: title.slice(0, 1).toUpperCase() + title.slice(1),
      domain: url.hostname.replace(/^www\./, ""),
    };
  } catch {
    return { title: "News & Events", domain: link };
  }
}

function NewsEventCard({ item, index, itemCount, isAdmin, isBusy, onEdit, onRemove, onMove }) {
  const [preview, setPreview] = useState(null);
  const [isNearViewport, setIsNearViewport] = useState(false);
  const cardRef = useRef(null);
  const fallback = getNewsEventDisplayDetails(item.url);

  useEffect(() => {
    const card = cardRef.current;
    if (!card || !("IntersectionObserver" in window)) {
      setIsNearViewport(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsNearViewport(true);
        observer.disconnect();
      },
      { rootMargin: "300px" },
    );
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isNearViewport) return undefined;

    const controller = new AbortController();
    const previewUrl = new URL("/.netlify/functions/link-preview", window.location.origin);
    previewUrl.searchParams.set("url", item.url);
    fetch(previewUrl, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Preview request failed with status ${response.status}.`);
        }
        return response.json();
      })
      .then((data) => {
        if (typeof data.title === "string" && data.title.trim()) setPreview(data);
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.warn("A News and Events link preview is unavailable; showing its URL fallback.", error);
        }
      });

    return () => controller.abort();
  }, [isNearViewport, item.url]);

  const displayTitle = preview?.title || fallback.title;
  const displayDescription = preview?.description || "";
  const displayDomain = preview?.siteName || fallback.domain;

  return (
    <article className="news-event-card reveal-on-scroll" data-reveal ref={cardRef}>
      {isAdmin && (
        <div className="news-event-admin-controls">
          <button
            aria-label="Move link earlier"
            disabled={isBusy || index === 0}
            onClick={() => onMove(-1)}
            type="button"
          >↑</button>
          <button
            aria-label="Move link later"
            disabled={isBusy || index === itemCount - 1}
            onClick={() => onMove(1)}
            type="button"
          >↓</button>
          <button aria-label="Edit link" disabled={isBusy} onClick={onEdit} type="button">Edit</button>
          <button aria-label="Remove link" disabled={isBusy} onClick={onRemove} type="button">×</button>
        </div>
      )}
      <a className="news-event-link" href={item.url} rel="noreferrer" target="_blank">
        {preview?.image && (
          <img
            className="news-event-image"
            src={preview.image}
            alt=""
            decoding="async"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.hidden = true;
            }}
          />
        )}
        <div className="news-event-content">
          <span className="news-event-index">{String(index + 1).padStart(2, "0")}</span>
          <span className="news-event-domain">{displayDomain}</span>
          <h3>{displayTitle}</h3>
          {displayDescription && <p className="news-event-description">{displayDescription}</p>}
          <span className="news-event-visit">View update <ArrowIcon /></span>
        </div>
      </a>
    </article>
  );
}

function NewsEvents({ items, isAdmin, isLoading, error, onAdd, onEdit, onRemove, onReorder }) {
  const [actionError, setActionError] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  async function handleRemove(item) {
    if (!window.confirm(`Remove this link from News & Events?`)) return;
    setActionError("");
    setIsBusy(true);
    try {
      const error = await onRemove(item);
      if (error) setActionError(error);
    } catch (error) {
      console.error("The news and events link could not be removed.", error);
      setActionError("This link could not be removed. Check your connection and try again.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleMove(item, direction) {
    const index = items.findIndex((entry) => entry.id === item.id);
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    setActionError("");
    setIsBusy(true);
    try {
      const error = await onReorder(item, items[targetIndex]);
      if (error) setActionError(error);
    } catch (error) {
      console.error("News and events ordering could not be saved.", error);
      setActionError("Link order could not be saved. Check your connection and try again.");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <section className="news-events section-wrap" id="news-events">
      <div className="news-events-heading">
        <SectionHeading eyebrow="What’s happening" title="News & Events" number="02 / 03" />
        {isAdmin && (
          <button className="add-film-button" type="button" onClick={onAdd}>
            <span aria-hidden="true">+</span>
            Add a link
          </button>
        )}
      </div>
      {items.length > 0 ? (
        <div className="news-events-grid">
          {items.map((item, index) => (
            <NewsEventCard
              index={index}
              itemCount={items.length}
              isAdmin={isAdmin}
              isBusy={isBusy}
              item={item}
              key={item.id}
              onEdit={() => onEdit(item)}
              onMove={(direction) => void handleMove(item, direction)}
              onRemove={() => void handleRemove(item)}
            />
          ))}
        </div>
      ) : (
        <p className="news-events-empty" role="status">
          {isLoading
            ? "Loading news and events…"
            : isAdmin
              ? "Add a link to share news and events."
              : "News and events will appear here."}
        </p>
      )}
      {actionError && <p className="storage-error" role="alert">{actionError}</p>}
      {error && <p className="storage-error" role="alert">{error}</p>}
    </section>
  );
}

function NewsEventDialog({ item, onClose, onSave }) {
  const [url, setUrl] = useState(item.url || "");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    let parsedUrl;
    try {
      parsedUrl = new URL(url.trim());
    } catch {
      setError("Enter a valid link.");
      return;
    }
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      setError("Use a link that starts with https:// or http://.");
      return;
    }

    setIsSaving(true);
    try {
      const saveError = await onSave({ ...item, url: parsedUrl.toString() });
      if (saveError) setError(saveError);
    } catch (saveError) {
      console.error("The news and events link could not be saved.", saveError);
      setError("This link could not be saved. Check your connection and try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div
      className="dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section aria-labelledby="news-event-dialog-title" aria-modal="true" className="admin-dialog" role="dialog">
        <button className="dialog-close" type="button" onClick={onClose} aria-label="Close dialog">×</button>
        <p className="eyebrow"><span />News &amp; Events</p>
        <h2 id="news-event-dialog-title">{item.id ? "Edit link" : "Add a link"}</h2>
        <p className="dialog-description">
          Add a news article or event URL. The link will open in a new tab.
        </p>
        <form onSubmit={handleSubmit}>
          <label>
            News or event link
            <input
              autoFocus
              maxLength={2048}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://example.com/news-or-event"
              required
              type="url"
              value={url}
            />
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="dialog-submit" disabled={isSaving} type="submit">
            {isSaving ? "Saving…" : item.id ? "Save changes" : "Add link"} <ArrowIcon />
          </button>
        </form>
      </section>
    </div>
  );
}

function PosterGallery({
  posters,
  isLoading,
  isAdmin,
  onAddPosters,
  onRemovePoster,
  onReplacePoster,
  onUpdatePoster,
  onReorderPoster,
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [posterError, setPosterError] = useState("");
  const inputRef = useRef(null);
  const replaceInputRef = useRef(null);
  const replacementPosterRef = useRef(null);
  const publishedPosters = posters.filter((poster) => poster.is_published);
  const activePosterIndex = publishedPosters.length ? activeIndex % publishedPosters.length : 0;
  const activePoster = publishedPosters[activePosterIndex];
  const incomingPoster = publishedPosters.length > 1
    ? publishedPosters[(activePosterIndex - 1 + publishedPosters.length) % publishedPosters.length]
    : null;
  const activeThumbnailIndex = Math.max(
    0,
    posters.findIndex((poster) => poster.id === activePoster?.id),
  );
  const thumbnailOffsets = posters.length <= 15
    ? posters.map((_, index) => (
      ((index - activeThumbnailIndex + posters.length + Math.floor(posters.length / 2)) % posters.length)
        - Math.floor(posters.length / 2)
    ))
    : Array.from({ length: 15 }, (_, index) => index - 7);
  const visibleThumbnails = thumbnailOffsets
    .map((offset) => ({
      poster: posters[(activeThumbnailIndex + offset + posters.length) % posters.length],
      offset,
    }))
    .sort((first, second) => first.offset - second.offset);
  const visibleSlides = publishedPosters.length <= 5
    ? publishedPosters.map((poster, index) => ({
      poster,
      offset: ((index - activePosterIndex + publishedPosters.length + Math.floor(publishedPosters.length / 2))
        % publishedPosters.length) - Math.floor(publishedPosters.length / 2),
    }))
    : [-2, -1, 0, 1, 2].map((offset) => ({
      poster: publishedPosters[(activePosterIndex + offset + publishedPosters.length) % publishedPosters.length],
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
    if (reduceMotion || publishedPosters.length < 2) return undefined;
    const timerId = window.setInterval(() => {
      setActiveIndex((index) => (index - 1 + publishedPosters.length) % publishedPosters.length);
    }, 2000);
    return () => window.clearInterval(timerId);
  }, [publishedPosters.length, reduceMotion]);

  useEffect(() => {
    if (!incomingPoster?.url) return undefined;
    const preload = document.createElement("link");
    preload.rel = "preload";
    preload.as = "image";
    preload.href = incomingPoster.url;
    preload.fetchPriority = "low";
    document.head.append(preload);
    return () => preload.remove();
  }, [incomingPoster?.url]);

  const moveSelection = (direction) => {
    if (!publishedPosters.length) return;
    setActiveIndex((index) => (
      (index + direction + publishedPosters.length) % publishedPosters.length
    ));
  };

  async function handleUpload(event) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;

    const invalidFile = files.find((file) => validatePosterFile(file));
    if (invalidFile) {
      setPosterError(`${invalidFile.name}: ${validatePosterFile(invalidFile)}`);
      return;
    }

    setPosterError("");
    setIsUploading(true);
    try {
      const error = await onAddPosters(files, (current, total) => {
        setUploadProgress(`Uploading ${current} of ${total}…`);
      });
      if (error) setPosterError(error);
    } catch (error) {
      console.error("Carousel posters could not be uploaded.", error);
      setPosterError("Posters could not be uploaded. Check your connection and try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress("");
    }
  }

  async function handleReplace(event) {
    const [file] = Array.from(event.target.files || []);
    event.target.value = "";
    const poster = replacementPosterRef.current;
    replacementPosterRef.current = null;
    if (!file || !poster) return;

    const validationError = validatePosterFile(file);
    if (validationError) {
      setPosterError(`${file.name}: ${validationError}`);
      return;
    }

    setPosterError("");
    setIsUploading(true);
    try {
      const error = await onReplacePoster(poster, file);
      if (error) setPosterError(error);
    } catch (error) {
      console.error("The carousel poster could not be replaced.", error);
      setPosterError("This poster could not be replaced. Check your connection and try again.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handlePosterUpdate(poster, update) {
    setPosterError("");
    try {
      const error = await onUpdatePoster(poster, update);
      if (error) setPosterError(error);
    } catch (error) {
      console.error("The carousel poster could not be updated.", error);
      setPosterError("This poster could not be updated. Check your connection and try again.");
    }
  }

  async function handleReorder(poster, direction) {
    const index = posters.findIndex((entry) => entry.id === poster.id);
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= posters.length) return;
    setPosterError("");
    try {
      const error = await onReorderPoster(poster, posters[targetIndex]);
      if (error) setPosterError(error);
    } catch (error) {
      console.error("Carousel poster ordering could not be saved.", error);
      setPosterError("Poster order could not be saved. Check your connection and try again.");
    }
  }

  async function handleRemove(poster) {
    if (!window.confirm(`Remove "${poster.title}" from the carousel?`)) return;
    setPosterError("");
    try {
      const error = await onRemovePoster(poster);
      if (error) setPosterError(error);
    } catch (error) {
      console.error("The carousel poster could not be removed.", error);
      setPosterError("This poster could not be removed. Check your connection and try again.");
    }
  }

  return (
    <section
      className="poster-gallery"
      aria-label="Filmy Brothers productions"
    >
      <div className="poster-gallery-header">
        <div className="poster-gallery-heading">
          <span />
          <h2>From Script to Screen: A Journey Through Indian Film Production With Filmy Brothers</h2>
          <span />
        </div>
        {isAdmin && (
          <>
            <input
              ref={inputRef}
              accept="image/jpeg,image/png,image/webp"
              className="poster-library-input"
              multiple
              onChange={handleUpload}
              type="file"
            />
            <input
              ref={replaceInputRef}
              accept="image/jpeg,image/png,image/webp"
              className="poster-library-input"
              onChange={handleReplace}
              type="file"
            />
            <button
              className="poster-library-add"
              disabled={isUploading}
              onClick={() => inputRef.current?.click()}
              type="button"
            >
              <span aria-hidden="true">+</span>{isUploading ? uploadProgress : "Add posters"}
            </button>
          </>
        )}
      </div>
      {publishedPosters.length > 0 && (
        <>
          <div className="poster-stage">
            {visibleSlides.map(({ poster, offset }) => {
              return (
                <button
                  aria-label={`${poster.title}${offset === 0 ? ", selected" : ""}`}
                  aria-pressed={offset === 0}
                  className={`poster-slide has-custom-poster${offset === 0 ? " is-active" : ""}`}
                  data-offset={offset}
                  key={poster.id}
                  onClick={() => setActiveIndex(publishedPosters.findIndex((entry) => entry.id === poster.id))}
                  type="button"
                >
                  <img
                    className="has-custom-poster"
                    src={poster.url}
                    alt={poster.title}
                    decoding="async"
                    fetchPriority={poster.id === publishedPosters[activePosterIndex]?.id ? "high" : "low"}
                    loading="eager"
                  />
                </button>
              );
            })}
            <div className="poster-controls">
              <button type="button" aria-label="Previous production poster" onClick={() => moveSelection(-1)}>‹</button>
              <button type="button" aria-label="Next production poster" onClick={() => moveSelection(1)}>›</button>
            </div>
          </div>
        </>
      )}
      {posters.length > 0 && (
        <div className={`poster-thumbnail-carousel${posters.length > 15 ? " has-navigation" : ""}`}>
          {posters.length > 15 && (
            <button
              aria-label="Previous production poster"
              className="poster-thumbnail-arrow"
              onClick={() => moveSelection(-1)}
              type="button"
            >‹</button>
          )}
          <div className="poster-thumbnails" role="group" aria-label="Choose a production poster">
            {visibleThumbnails.map(({ poster, offset }) => {
              const index = posters.findIndex((entry) => entry.id === poster.id);
              const publishedIndex = publishedPosters.findIndex((entry) => entry.id === poster.id);
              return (
                <div
                  className="poster-thumbnail-item"
                  key={`${poster.id}-thumb`}
                  style={{ "--thumbnail-column": offset + 8 }}
                >
                  <button
                    aria-label={`${poster.is_published ? "Show" : "Draft"} poster ${index + 1}: ${poster.title}`}
                    aria-current={publishedIndex === activePosterIndex ? "true" : undefined}
                    className={`poster-thumbnail-select${publishedIndex === activePosterIndex ? " is-active" : ""}`}
                    disabled={!poster.is_published}
                    onClick={() => setActiveIndex(publishedIndex)}
                    type="button"
                  >
                    <img
                      className="has-custom-poster"
                      src={poster.thumbnailUrl}
                      alt=""
                      decoding="async"
                      loading="lazy"
                    />
                  </button>
                  {isAdmin && (
                    <div className="poster-thumbnail-actions">
                      <button
                        aria-label={`Move ${poster.title} earlier`}
                        disabled={isUploading || index === 0}
                        onClick={() => void handleReorder(poster, -1)}
                        title="Move earlier"
                        type="button"
                      >↑</button>
                      <button
                        aria-label={`Move ${poster.title} later`}
                        disabled={isUploading || index === posters.length - 1}
                        onClick={() => void handleReorder(poster, 1)}
                        title="Move later"
                        type="button"
                      >↓</button>
                      <button
                        aria-label={`Replace ${poster.title}`}
                        disabled={isUploading}
                        onClick={() => {
                          replacementPosterRef.current = poster;
                          replaceInputRef.current?.click();
                        }}
                        title="Replace poster"
                        type="button"
                      >↻</button>
                      <button
                        aria-label={`Remove poster ${poster.title}`}
                        disabled={isUploading}
                        onClick={() => void handleRemove(poster)}
                        title="Delete poster"
                        type="button"
                      >×</button>
                      <button
                        aria-label={`${poster.is_published ? "Unpublish" : "Publish"} ${poster.title}`}
                        className={`poster-publication-toggle${poster.is_published ? " is-published" : ""}`}
                        disabled={isUploading}
                        onClick={() => void handlePosterUpdate(poster, { is_published: !poster.is_published })}
                        type="button"
                      >{poster.is_published ? "Live" : "Draft"}</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {posters.length > 15 && (
            <button
              aria-label="Next production poster"
              className="poster-thumbnail-arrow"
              onClick={() => moveSelection(1)}
              type="button"
            >›</button>
          )}
        </div>
      )}
      {publishedPosters.length === 0 && (
        <div className="poster-gallery-empty" role="status">
          <p>
            {isLoading
              ? "Loading posters…"
              : posters.length > 0
                ? "There are no published production posters yet."
                : "Production posters will appear here as you add them."}
          </p>
        </div>
      )}
      {posterError && <p className="storage-error poster-library-error" role="alert">{posterError}</p>}
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
  const [videoType, setVideoType] = useState("Movie");
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

      const addError = await onAddFilm({
        title: title.trim(),
        type: videoType,
        id: videoId,
      });
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
                  <option value="Movie">Movie</option>
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
  const [warning, setWarning] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("");
    setError("");
    setWarning("");
    setIsSubmitting(true);
    const form = event.currentTarget;
    const formData = new FormData(form);
    let result;
    try {
      result = await onSubmit({
        name: String(formData.get("name") || "").trim(),
        email: String(formData.get("email") || "").trim(),
        phone: String(formData.get("phone") || "").trim(),
        message: String(formData.get("message") || "").trim(),
      });
    } catch (submitError) {
      console.error("The contact form submission failed unexpectedly.", submitError);
      result = "Your message could not be sent right now. Please try again or email us directly.";
    } finally {
      setIsSubmitting(false);
    }

    if (result) {
      if (typeof result === "string") {
        setError(result);
        return;
      }
      setWarning(result.warning || "");
    }
    form.reset();
    form.reset();
    setStatus("Thank you — your message has been received.");
  }

  return (
    <section className="contact section-wrap" id="contact">
      <div className="contact-form-panel">
        <h2 id="contact-heading">Drop us a line,<br />get in touch with us</h2>
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="contact-form-fields">
            <label>
              <span>Full name</span>
              <input autoComplete="name" maxLength="120" name="name" placeholder="Full name" required />
            </label>
            <label>
              <span>Email address</span>
              <input autoComplete="email" maxLength="254" name="email" placeholder="Email address" required type="email" />
            </label>
            <label>
              <span>Contact number (optional)</span>
              <input autoComplete="tel" maxLength="40" name="phone" placeholder="Contact number (optional)" type="tel" />
            </label>
          </div>
          <label>
            <span>Message</span>
            <textarea maxLength="5000" name="message" placeholder="Message" required rows="5" />
          </label>
          <button className="contact-submit" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Sending…" : "Send message"}
          </button>
          {error && <p className="form-error" role="alert">{error}</p>}
          {status && <p className="form-success" role="status">{status}</p>}
          {warning && <p className="form-error" role="status">{warning}</p>}
        </form>
      </div>
      <div className="contact-newsletter">
        <Newsletter onSubmit={onSubscribe} />
      </div>
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

function Footer({ isAdmin, onAdminClick, onLogout }) {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <iframe
          className="footer-map-preview"
          title="Map preview of Andheri West, Mumbai"
          src="https://maps.google.com/maps?q=Andheri%20West%2C%20Mumbai%2C%20Maharashtra%2C%20India&output=embed"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
        <div className="footer-info">
          <div className="footer-social-links" role="group" aria-label="Follow Filmy Brothers">
            <a aria-label="Facebook" href="https://www.facebook.com/filmybrothers" rel="noreferrer" target="_blank">
              <FaFacebookF aria-hidden="true" />
            </a>
            <a aria-label="Instagram" href="https://www.instagram.com/filmybrothersofficial/" rel="noreferrer" target="_blank">
              <FaInstagram aria-hidden="true" />
            </a>
            <a aria-label="YouTube" href="https://www.youtube.com/@filmybrothersofficial" rel="noreferrer" target="_blank">
              <FaYoutube aria-hidden="true" />
            </a>
          </div>
          <div className="footer-details">
            <section>
              <h2>
                <FaLocationDot aria-hidden="true" />
                Our Location
              </h2>
              <p>Andheri West, Mumbai, Maharashtra, India</p>
            </section>
            <section>
              <h2>
                <FaPhone aria-hidden="true" />
                Contact Details
              </h2>
              <a href="mailto:filmybrothersproduction@gmail.com">filmybrothersproduction@gmail.com</a>
            </section>
            <section>
              <h2>
                <FaEnvelope aria-hidden="true" />
                Our Email
              </h2>
              <a href="mailto:info@filmybrothers.com">info@filmybrothers.com</a>
            </section>
          </div>
        </div>
      </div>
      <div className="footer-legal">
        <div className="footer-legal-brand">
          <a className="brand" href="#home" aria-label="Filmy Brothers home">
            <img className="brand-logo" src="/filmy-brothers-logo.png" alt="" />
            <span className="brand-name">FILMY BROTHERS</span>
          </a>
          <span className="footer-legal-credit">
            Website by{" "}
            <a href="https://shubhamupadhyayportfolio.netlify.app/" rel="noreferrer" target="_blank">
              Shubham Upadhyay
            </a>
          </span>
        </div>
        <div className="footer-legal-meta">
          <button
            className={`footer-admin-link${isAdmin ? " is-admin" : ""}`}
            type="button"
            onClick={isAdmin ? onLogout : onAdminClick}
          >
            {isAdmin ? "Log out" : "Admin login"}
          </button>
          <span>© {new Date().getFullYear()} Filmy Brothers. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminWelcome, setShowAdminWelcome] = useState(false);
  const [dialogMode, setDialogMode] = useState(null);
  const [films, setFilms] = useState([]);
  const [newsEvents, setNewsEvents] = useState([]);
  const [carouselPosters, setCarouselPosters] = useState([]);
  const [filmsLoading, setFilmsLoading] = useState(Boolean(supabase));
  const [newsEventsLoading, setNewsEventsLoading] = useState(Boolean(supabase));
  const [newsEventsError, setNewsEventsError] = useState("");
  const [postersLoading, setPostersLoading] = useState(Boolean(supabase));
  const [appError, setAppError] = useState("");
  const [playingFilm, setPlayingFilm] = useState(null);
  const [editingNewsEvent, setEditingNewsEvent] = useState(null);
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
        .select("id, title, youtube_id, type, description, sort_order")
        .order("sort_order", { ascending: true })
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
          sortOrder: film.sort_order,
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
    setPostersLoading(true);
    supabase
      .from("carousel_posters")
      .select("id, title, poster_path, sort_order, is_published")
      .order("sort_order", { ascending: true })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          console.error("Carousel posters could not be loaded from Supabase.", error);
          setAppError("Posters could not be loaded. Run the updated supabase/setup.sql, then refresh.");
        } else {
          setCarouselPosters(data.map((poster) => ({
            ...poster,
            url: getCarouselPosterUrl(poster.poster_path),
            thumbnailUrl: getCarouselPosterUrl(getCarouselPosterThumbnailPath(poster.poster_path)),
          })));
        }
        setPostersLoading(false);
      })
      .catch((error) => {
        if (!active) return;
        console.error("Carousel posters could not be loaded from Supabase.", error);
        setAppError("Posters could not be loaded. Please refresh to try again.");
        setPostersLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isAdmin]);

  useEffect(() => {
    if (!supabase) return undefined;

    let active = true;
    supabase
      .from("news_events")
      .select("id, url, sort_order, created_at")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          console.error("News and events could not be loaded from Supabase.", error);
          setNewsEventsError("News & Events could not be loaded. Run the updated supabase/setup.sql, then refresh.");
        } else {
          setNewsEvents(data);
          setNewsEventsError("");
        }
        setNewsEventsLoading(false);
      })
      .catch((error) => {
        if (!active) return;
        console.error("News and events could not be loaded from Supabase.", error);
        setNewsEventsError("News & Events could not be loaded. Please refresh to try again.");
        setNewsEventsLoading(false);
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

    const sortOrder = films.reduce((highest, currentFilm) => Math.max(highest, currentFilm.sortOrder ?? -1), -1) + 1;
    const { data, error } = await supabase
      .from("films")
      .insert({
        title: film.title,
        youtube_id: film.id,
        type: film.type,
        description: "",
        sort_order: sortOrder,
      })
      .select("id, title, youtube_id, type, description, sort_order")
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
        sortOrder: data.sort_order,
      },
    ]);
    setAppError("");
    setDialogMode(null);
    return null;
  }

  async function reorderFilms(reorderedFilms) {
    if (!supabase) return "Supabase is not configured.";

    setFilms(reorderedFilms);
    for (const [sortOrder, film] of reorderedFilms.entries()) {
      const { data, error } = await supabase
        .from("films")
        .update({ sort_order: sortOrder })
        .eq("youtube_id", film.id)
        .select("youtube_id")
        .maybeSingle();

      if (error || !data) {
        console.error("Film order could not be saved to Supabase.", error || "No row was updated.");
        const { data: currentFilms, error: loadError } = await supabase
          .from("films")
          .select("id, title, youtube_id, type, description, sort_order")
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: true });

        if (loadError) {
          console.error("Film order could not be reloaded after a failed update.", loadError);
          setAppError("Film order could not be saved or reloaded. Refresh the page to see the saved order.");
        } else {
          setFilms(currentFilms.map((currentFilm) => ({
            id: currentFilm.youtube_id,
            title: currentFilm.title,
            type: currentFilm.type,
            description: currentFilm.description,
            sortOrder: currentFilm.sort_order,
          })));
        }
        return "Film order could not be saved. Run the updated supabase/setup.sql, then try again.";
      }
    }

    setAppError("");
    return null;
  }

  async function saveNewsEvent(item) {
    if (!supabase) return "Supabase is not configured.";

    const isEditing = Boolean(item.id);
    const sortOrder = isEditing
      ? item.sort_order
      : newsEvents.reduce((highest, currentItem) => Math.max(highest, currentItem.sort_order), -1) + 1;
    const query = isEditing
      ? supabase.from("news_events").update({ url: item.url }).eq("id", item.id)
      : supabase.from("news_events").insert({ url: item.url, sort_order: sortOrder });
    const { data, error } = await query
      .select("id, url, sort_order, created_at")
      .single();

    if (error) {
      console.error("The news and events link could not be saved to Supabase.", error);
      return "This link could not be saved. Run the updated supabase/setup.sql and try again.";
    }

    setNewsEvents((currentItems) => {
      if (isEditing) {
        return currentItems.map((currentItem) => currentItem.id === data.id ? data : currentItem);
      }
      return [...currentItems, data].sort((left, right) => left.sort_order - right.sort_order);
    });
    setEditingNewsEvent(null);
    setNewsEventsError("");
    return null;
  }

  async function removeNewsEvent(item) {
    if (!supabase) return "Supabase is not configured.";

    const { data, error } = await supabase
      .from("news_events")
      .delete()
      .eq("id", item.id)
      .select("id")
      .maybeSingle();
    if (error || !data) {
      console.error("The news and events link could not be deleted.", error || "No matching link was deleted.");
      return "This link could not be deleted. Check the news_events delete policy.";
    }
    setNewsEvents((currentItems) => currentItems.filter((currentItem) => currentItem.id !== item.id));
    setNewsEventsError("");
    return null;
  }

  async function reorderNewsEvents(item, targetItem) {
    if (!supabase) return "Supabase is not configured.";

    const temporaryOrder = Math.min(item.sort_order, targetItem.sort_order) - 1;
    const { error: stageError } = await supabase
      .from("news_events")
      .update({ sort_order: temporaryOrder })
      .eq("id", item.id);
    if (stageError) {
      console.error("News and events ordering could not be staged.", stageError);
      return "Link order could not be saved. Check the news_events update policy.";
    }

    const { error: targetError } = await supabase
      .from("news_events")
      .update({ sort_order: item.sort_order })
      .eq("id", targetItem.id);
    if (targetError) {
      console.error("The adjacent news and events order could not be updated.", targetError);
      const { error: rollbackError } = await supabase
        .from("news_events")
        .update({ sort_order: item.sort_order })
        .eq("id", item.id);
      if (rollbackError) console.error("News and events ordering could not be rolled back.", rollbackError);
      return "Link order could not be saved. Please try again.";
    }

    const { error: finalError } = await supabase
      .from("news_events")
      .update({ sort_order: targetItem.sort_order })
      .eq("id", item.id);
    if (finalError) {
      console.error("News and events ordering could not be finalized.", finalError);
      const { error: rollbackTargetError } = await supabase
        .from("news_events")
        .update({ sort_order: targetItem.sort_order })
        .eq("id", targetItem.id);
      if (rollbackTargetError) console.error("The adjacent news and events order could not be rolled back.", rollbackTargetError);
      const { error: rollbackItemError } = await supabase
        .from("news_events")
        .update({ sort_order: item.sort_order })
        .eq("id", item.id);
      if (rollbackItemError) console.error("News and events ordering could not be rolled back.", rollbackItemError);
      return "Link order could not be saved. Please refresh and check the saved order.";
    }

    setNewsEvents((currentItems) => currentItems.map((currentItem) => {
      if (currentItem.id === item.id) return { ...currentItem, sort_order: targetItem.sort_order };
      if (currentItem.id === targetItem.id) return { ...currentItem, sort_order: item.sort_order };
      return currentItem;
    }).sort((left, right) => left.sort_order - right.sort_order));
    setNewsEventsError("");
    return null;
  }

  async function uploadCarouselPosterAssets(optimizedPoster) {
    const posterPath = `gallery/${crypto.randomUUID()}-poster.${optimizedPoster.extension}`;
    const thumbnailPath = getCarouselPosterThumbnailPath(posterPath);
    const uploadedPaths = [];
    for (const [path, file] of [
      [posterPath, optimizedPoster.poster],
      [thumbnailPath, optimizedPoster.thumbnail],
    ]) {
      const { error } = await supabase.storage
        .from("film-posters")
        .upload(path, file, {
          contentType: file.type,
          cacheControl: "31536000",
          upsert: false,
        });
      if (error) {
        console.error("A carousel poster image variant could not be uploaded.", error);
        if (uploadedPaths.length) {
          const { error: cleanupError } = await supabase.storage.from("film-posters").remove(uploadedPaths);
          if (cleanupError) console.error("An incomplete poster upload could not be cleaned up.", cleanupError);
        }
        return { error: "poster image upload failed. Run the updated supabase/setup.sql and try again." };
      }
      uploadedPaths.push(path);
    }

    return { posterPath, thumbnailPath };
  }

  async function addCarouselPosters(files, onProgress) {
    if (!supabase) return "Supabase is not configured.";

    let sortOrder = carouselPosters.reduce((highest, poster) => Math.max(highest, poster.sort_order), -1) + 1;
    for (const [index, file] of files.entries()) {
      onProgress(index + 1, files.length);
      let optimizedPoster;
      try {
        optimizedPoster = await optimizePoster(file);
      } catch (error) {
        console.error("The carousel poster could not be prepared for upload.", error);
        return `${file.name}: the poster could not be processed or compressed. Try a smaller JPG, PNG, or WebP image.`;
      }

      const id = crypto.randomUUID();
      const assets = await uploadCarouselPosterAssets(optimizedPoster);
      if (assets.error) {
        return `${file.name}: ${assets.error}`;
      }

      const title = file.name.replace(/\.[^.]+$/, "").trim().slice(0, 200) || "Production poster";
      const { data, error } = await supabase
        .from("carousel_posters")
        .insert({ id, title, poster_path: assets.posterPath, sort_order: sortOrder })
        .select("id, title, poster_path, sort_order, is_published")
        .single();

      if (error) {
        console.error("Carousel poster metadata could not be saved.", error);
        const { error: cleanupError } = await supabase.storage
          .from("film-posters")
          .remove([assets.posterPath, assets.thumbnailPath]);
        if (cleanupError) console.error("The unused carousel poster could not be cleaned up.", cleanupError);
        return `${file.name}: poster details could not be saved. Check the carousel poster table policies.`;
      }

      setCarouselPosters((currentPosters) => [
        ...currentPosters,
        {
          ...data,
          url: getCarouselPosterUrl(data.poster_path),
          thumbnailUrl: getCarouselPosterUrl(assets.thumbnailPath),
        },
      ]);
      sortOrder += 1;
    }

    setAppError("");
    return null;
  }

  async function replaceCarouselPoster(poster, file) {
    if (!supabase) return "Supabase is not configured.";

    let optimizedPoster;
    try {
      optimizedPoster = await optimizePoster(file);
    } catch (error) {
      console.error("The replacement carousel poster could not be prepared.", error);
      return "The replacement could not be compressed. Try a smaller JPG, PNG, or WebP image.";
    }

    const assets = await uploadCarouselPosterAssets(optimizedPoster);
    if (assets.error) return assets.error;

    const { data, error } = await supabase
      .from("carousel_posters")
      .update({ poster_path: assets.posterPath })
      .eq("id", poster.id)
      .select("id, title, poster_path, sort_order, is_published")
      .maybeSingle();
    if (error || !data) {
      console.error("Carousel poster metadata could not be replaced.", error || "No matching poster was updated.");
      const { error: cleanupError } = await supabase.storage
        .from("film-posters")
        .remove([assets.posterPath, assets.thumbnailPath]);
      if (cleanupError) console.error("The unused replacement poster could not be cleaned up.", cleanupError);
      return "This poster could not be replaced. Check the carousel poster update policy.";
    }

    setCarouselPosters((currentPosters) => currentPosters.map((currentPoster) => (
      currentPoster.id === poster.id
        ? {
          ...data,
          url: getCarouselPosterUrl(data.poster_path),
          thumbnailUrl: getCarouselPosterUrl(assets.thumbnailPath),
        }
        : currentPoster
    )));
    const oldPaths = [poster.poster_path, getCarouselPosterThumbnailPath(poster.poster_path)];
    const { error: cleanupError } = await supabase.storage.from("film-posters").remove(oldPaths);
    if (cleanupError) {
      console.error("The poster was replaced, but its previous image variants could not be removed.", cleanupError);
      return "The poster was replaced, but its previous image files could not be removed from storage.";
    }
    setAppError("");
    return null;
  }

  async function updateCarouselPoster(poster, update) {
    if (!supabase) return "Supabase is not configured.";

    const { data, error } = await supabase
      .from("carousel_posters")
      .update(update)
      .eq("id", poster.id)
      .select("id, title, poster_path, sort_order, is_published")
      .maybeSingle();
    if (error || !data) {
      console.error("Carousel poster settings could not be updated.", error || "No matching poster was updated.");
      return "This poster setting could not be saved. Check the carousel poster update policy.";
    }
    setCarouselPosters((currentPosters) => currentPosters.map((currentPoster) => (
      currentPoster.id === poster.id ? { ...currentPoster, ...data } : currentPoster
    )));
    setAppError("");
    return null;
  }

  async function reorderCarouselPoster(poster, targetPoster) {
    if (!supabase) return "Supabase is not configured.";

    const temporaryOrder = Math.min(poster.sort_order, targetPoster.sort_order) - 1;
    const { error: stageError } = await supabase
      .from("carousel_posters")
      .update({ sort_order: temporaryOrder })
      .eq("id", poster.id);
    if (stageError) {
      console.error("Carousel poster order could not be staged.", stageError);
      return "Poster order could not be saved. Check the carousel poster update policy.";
    }

    const { error: targetError } = await supabase
      .from("carousel_posters")
      .update({ sort_order: poster.sort_order })
      .eq("id", targetPoster.id);
    if (targetError) {
      console.error("The adjacent carousel poster order could not be updated.", targetError);
      const { error: rollbackError } = await supabase
        .from("carousel_posters")
        .update({ sort_order: poster.sort_order })
        .eq("id", poster.id);
      if (rollbackError) console.error("Carousel poster ordering could not be rolled back.", rollbackError);
      return "Poster order could not be saved. Please try again.";
    }

    const { error: finalError } = await supabase
      .from("carousel_posters")
      .update({ sort_order: targetPoster.sort_order })
      .eq("id", poster.id);
    if (finalError) {
      console.error("Carousel poster order could not be finalized.", finalError);
      const { error: rollbackTargetError } = await supabase
        .from("carousel_posters")
        .update({ sort_order: targetPoster.sort_order })
        .eq("id", targetPoster.id);
      if (rollbackTargetError) console.error("The adjacent carousel poster order could not be rolled back.", rollbackTargetError);
      const { error: rollbackPosterError } = await supabase
        .from("carousel_posters")
        .update({ sort_order: poster.sort_order })
        .eq("id", poster.id);
      if (rollbackPosterError) console.error("Carousel poster ordering could not be rolled back.", rollbackPosterError);
      return "Poster order could not be saved. Please try again.";
    }

    setCarouselPosters((currentPosters) => currentPosters.map((currentPoster) => {
      if (currentPoster.id === poster.id) return { ...currentPoster, sort_order: targetPoster.sort_order };
      if (currentPoster.id === targetPoster.id) return { ...currentPoster, sort_order: poster.sort_order };
      return currentPoster;
    }).sort((left, right) => left.sort_order - right.sort_order));
    setAppError("");
    return null;
  }

  async function removeCarouselPoster(poster) {
    if (!supabase) return "Supabase is not configured.";

    const { data, error } = await supabase
      .from("carousel_posters")
      .delete()
      .eq("id", poster.id)
      .select("id")
      .maybeSingle();
    if (error || !data) {
      console.error("Carousel poster metadata could not be deleted.", error || "No matching poster was deleted.");
      return "This poster could not be deleted. Check the carousel poster delete policy.";
    }

    setCarouselPosters((currentPosters) => currentPosters.filter((currentPoster) => currentPoster.id !== poster.id));
    const { error: storageError } = await supabase.storage
      .from("film-posters")
      .remove([poster.poster_path, getCarouselPosterThumbnailPath(poster.poster_path)]);
    if (storageError) {
      console.error("Carousel poster record was deleted, but its image could not be removed from Storage.", storageError);
      return "The poster was removed from the carousel, but its image file could not be deleted from storage.";
    }
    return null;
  }

  async function removeFilm(film) {
    if (!supabase) return "Supabase is not configured.";

    const { data, error } = await supabase
      .from("films")
      .delete()
      .eq("youtube_id", film.id)
      .select("youtube_id")
      .maybeSingle();

    if (error) {
      console.error("The film could not be removed from Supabase.", error);
      return "This video could not be removed. Check the Supabase delete policy and try again.";
    }
    if (!data) {
      console.error("Supabase did not delete the film; no matching row was returned.");
      return "Supabase did not remove this video. Run the admin delete-policy SQL in Supabase, then try again.";
    }

    setFilms((currentFilms) => currentFilms.filter((currentFilm) => currentFilm.id !== film.id));
    if (playingFilm?.id === film.id) setPlayingFilm(null);
    setAppError("");
    return null;
  }

  async function submitContact(message) {
    if (!supabase) {
      return "The contact form is not configured. Add the Supabase settings and run the website-forms SQL setup.";
    }

    const { error } = await supabase
      .from("contact_messages")
      .insert(message);
    if (error) {
      console.error("The contact message could not be saved.", error);
      return "Your message could not be sent right now. Please try again or email us directly.";
    }

    let notificationResponse;
    try {
      notificationResponse = await fetch("/.netlify/functions/contact-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message),
      });
    } catch (notificationError) {
      console.error("The contact message was saved, but its email notification failed.", notificationError);
      return { warning: "Your message was received, but the team email notification failed. Please also email info@filmybrothers.com." };
    }

    if (!notificationResponse.ok) {
      const notificationError = await notificationResponse.json().catch(() => null);
      console.error("The contact message was saved, but its email notification failed.", notificationError);
      return { warning: "Your message was received, but the team email notification failed. Please also email info@filmybrothers.com." };
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
      <Header />
      {showAdminWelcome && (
        <AdminWelcomeScreen />
      )}
      <main>
        <Hero featuredFilm={films[0]} />
        <PosterGallery
          posters={carouselPosters}
          isLoading={postersLoading}
          isAdmin={isAdmin}
          onAddPosters={addCarouselPosters}
          onRemovePoster={removeCarouselPoster}
          onReplacePoster={replaceCarouselPoster}
          onUpdatePoster={updateCarouselPoster}
          onReorderPoster={reorderCarouselPoster}
        />
        <Films
          films={films}
          isAdmin={isAdmin}
          isVideoOpen={Boolean(playingFilm)}
          onPlayFilm={setPlayingFilm}
          onRemoveFilm={removeFilm}
          onReorderFilms={reorderFilms}
          onAddFilm={() => {
            setAppError("");
            setDialogMode("add");
          }}
        />
        <NewsEvents
          items={newsEvents}
          isAdmin={isAdmin}
          isLoading={newsEventsLoading}
          error={newsEventsError}
          onAdd={() => setEditingNewsEvent({ url: "", sort_order: newsEvents.length })}
          onEdit={setEditingNewsEvent}
          onRemove={removeNewsEvent}
          onReorder={reorderNewsEvents}
        />
        {filmsLoading && <p className="storage-error" role="status">Loading films…</p>}
        {appError && <p className="storage-error" role="alert">{appError}</p>}
        <Story />
        <Contact onSubmit={submitContact} onSubscribe={subscribeToNewsletter} />
      </main>
      <Footer
        isAdmin={isAdmin}
        onAdminClick={() => setDialogMode("login")}
        onLogout={logout}
      />
      {editingNewsEvent && (
        <NewsEventDialog
          item={editingNewsEvent}
          onClose={() => setEditingNewsEvent(null)}
          onSave={saveNewsEvent}
        />
      )}
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
