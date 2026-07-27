import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import apiFetch from "../../services/api";

function formatPrixMAD(prix) {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 0,
  }).format(prix);
}

function BadgeEco({ compact = false }) {
  return (
    <span
      className={`absolute left-2 top-2 flex items-center gap-1 rounded-full bg-cedre font-medium text-cream shadow-sm ${
        compact ? "px-1.5 py-0.5 text-xs" : "px-2 py-1 text-sm"
      }`}
    >
      <svg className="h-3 w-3 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2C7 2 3 6 3 11c0 5.5 4.5 9.5 8.3 10.9.4.15.9.15 1.3 0C16.5 20.5 21 16.5 21 11c0-5-4-9-9-9zm-.9 14.6l-3.2-3.2 1.06-1.06 2.14 2.14 4.7-4.7 1.06 1.06-5.76 5.76z" />
      </svg>
      Éco
    </span>
  );
}

function Note({ valeur }) {
  return (
    <div className="flex items-center gap-1 text-sm text-ink">
      <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.448a1 1 0 00-.364 1.118l1.286 3.957c.3.922-.755 1.688-1.539 1.118l-3.367-2.447a1 1 0 00-1.175 0l-3.367 2.447c-.784.57-1.838-.196-1.539-1.118l1.286-3.957a1 1 0 00-.364-1.118L2.063 9.385c-.783-.57-.38-1.81.588-1.81h4.163a1 1 0 00.95-.69l1.285-3.958z" />
      </svg>
      <span className="font-medium">{valeur.toFixed(1)}</span>
    </div>
  );
}

export default function ActiviteCard({
  activite,
  estFavori = false,
  variant = "grille",
  onToggleFavori,
}) {
  const { id, titre, region, prix_mad, note_moyenne, photo, badge_eco } = activite;
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isFavori, setIsFavori] = useState(estFavori);
  const [isTogglingFavori, setIsTogglingFavori] = useState(false);
  const [showConfirmRetrait, setShowConfirmRetrait] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    setIsFavori(estFavori);
  }, [estFavori]);

  async function toggleFavori(action) {
    if (isTogglingFavori) return;
    setIsTogglingFavori(true);

    try {
      if (action === "retirer") {
        await apiFetch("/favoris", {
          method: "DELETE",
          body: JSON.stringify({ id_voyageur: user.id, id_activite: id }),
        });
        setIsFavori(false);
        onToggleFavori?.(id, false);
      } else {
        await apiFetch("/favoris", {
          method: "POST",
          body: JSON.stringify({ id_voyageur: user.id, id_activite: id }),
        });
        setIsFavori(true);
        onToggleFavori?.(id, true);
        showToast("Ajoutée à Favoris");
      }
    } catch {
      // Échec silencieux : le cœur reste dans son état précédent.
    } finally {
      setIsTogglingFavori(false);
    }
  }

  function handleHeartClick(event) {
    event.preventDefault();
    event.stopPropagation();

    if (!user) {
      navigate("/login");
      return;
    }

    if (isFavori) {
      setShowConfirmRetrait(true);
      return;
    }

    toggleFavori("ajouter");
  }

  function handleAnnulerRetrait(event) {
    event.preventDefault();
    event.stopPropagation();
    setShowConfirmRetrait(false);
  }

  function handleConfirmerRetrait(event) {
    event.preventDefault();
    event.stopPropagation();
    setShowConfirmRetrait(false);
    toggleFavori("retirer");
  }

  const boutonCoeur = (positionClassName) => (
    <button
      type="button"
      onClick={handleHeartClick}
      disabled={isTogglingFavori}
      aria-label={isFavori ? "Retirer des favoris" : "Ajouter aux favoris"}
      aria-pressed={isFavori}
      className={`${positionClassName} flex h-9 w-9 items-center justify-center rounded-full bg-white/70 shadow-sm backdrop-blur-sm transition-colors hover:bg-white disabled:cursor-not-allowed`}
    >
      <Heart
        className={`h-5 w-5 ${isFavori ? "text-red-600" : "text-ink/70"}`}
        fill={isFavori ? "currentColor" : "none"}
        strokeWidth={1.75}
        aria-hidden="true"
      />
    </button>
  );

  const modalConfirmation = showConfirmRetrait && (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4"
      onClick={handleAnnulerRetrait}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
      >
        <p className="font-medium text-ink">Voulez-vous retirer cette activité de vos favoris ?</p>
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleAnnulerRetrait}
            className="rounded-full px-4 py-2 text-base font-medium text-ink/70 transition-colors hover:bg-ink/5"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleConfirmerRetrait}
            disabled={isTogglingFavori}
            className="rounded-full bg-red-600 px-4 py-2 text-base font-medium text-cream shadow-sm transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );

  if (variant === "liste") {
    return (
      <Link
        to={`/activites/${id}`}
        className="relative flex gap-4 rounded-2xl border border-ink/10 bg-cream p-3 font-sans shadow-sm transition-shadow hover:shadow-md"
      >
        <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl bg-sable sm:h-28 sm:w-40">
          {photo ? (
            <img
              src={photo}
              alt={titre}
              loading="lazy"
              onLoad={() => setIsImageLoaded(true)}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
                isImageLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-price via-orange-400 to-ink" />
          )}

          {Boolean(badge_eco) && <BadgeEco compact />}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center py-1 pr-10">
          <h3 className="line-clamp-2 text-base font-semibold text-ink">{titre}</h3>
          <p className="mt-1 truncate text-sm text-ink/70">{region}</p>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-sm font-semibold text-price">{formatPrixMAD(prix_mad)}</span>
            {typeof note_moyenne === "number" && <Note valeur={note_moyenne} />}
          </div>
        </div>

        {boutonCoeur("absolute right-3 top-3")}
        {modalConfirmation}
      </Link>
    );
  }

  return (
    <Link
      to={`/activites/${id}`}
      className="block font-sans bg-cream border border-ink/10 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="relative h-48 w-full overflow-hidden bg-sable">
        {photo ? (
          <img
            src={photo}
            alt={titre}
            loading="lazy"
            onLoad={() => setIsImageLoaded(true)}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
              isImageLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-price via-orange-400 to-ink" />
        )}

        {boutonCoeur("absolute right-2 top-2")}
        {modalConfirmation}

        {Boolean(badge_eco) && <BadgeEco />}
      </div>

      <div className="p-4 space-y-2">
        <h3 className="text-base font-semibold text-ink leading-snug">
          {titre}
        </h3>

        <p className="text-sm text-ink/70">{region}</p>

        <div className="flex items-center justify-between pt-1">
          <span className="text-sm font-semibold text-price">
            {formatPrixMAD(prix_mad)}
          </span>

          {typeof note_moyenne === "number" && <Note valeur={note_moyenne} />}
        </div>
      </div>
    </Link>
  );
}
