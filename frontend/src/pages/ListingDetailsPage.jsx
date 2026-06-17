import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { RouterButton } from "../components/ui/RouterButton";
import { useUserSession } from "../contexts/UserSessionContext";
import { api } from "../services/api";
import { categoryLabel } from "../utils/categoryLabels";
import styles from "./ListingDetailsPage.module.css";

export function ListingDetailsPage() {
  const { id } = useParams();
  const listingId = Number(id);
  const { userId } = useUserSession();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [listings, setListings] = useState([]);

  useEffect(() => {
    let alive = true;
    async function run() {
      setError(null);
      setLoading(true);
      try {
        const data = await api.loadListings();
        if (!alive) return;
        setListings(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!alive) return;
        console.error(e);
        setError(e?.message ?? String(e));
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }
    run().catch(console.error);
    return () => {
      alive = false;
    };
  }, []);

  const listing = useMemo(() => listings.find((l) => l.id === listingId), [listings, listingId]);

  if (!Number.isFinite(listingId) || listingId <= 0) {
    return (
      <div className={styles.page}>
        <p className={styles.bad}>РќРµРєРѕСЂСЂРµРєС‚РЅС‹Р№ С‚РѕРІР°СЂ.</p>
        <Link to="/" className={styles.back}>
          в†ђ РќР°Р·Р°Рґ
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Link to="/" className={styles.back}>
        в†ђ РљР°С‚Р°Р»РѕРі
      </Link>

      {loading ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>Р—Р°РіСЂСѓР·РєР°вЂ¦</p>
        </div>
      ) : error ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>РќРµ СѓРґР°Р»РѕСЃСЊ Р·Р°РіСЂСѓР·РёС‚СЊ С‚РѕРІР°СЂ</p>
          <p className={styles.emptyText}>{error}</p>
          <Button type="button" variant="secondary" onClick={() => window.location.reload()}>
            РћР±РЅРѕРІРёС‚СЊ СЃС‚СЂР°РЅРёС†Сѓ
          </Button>
        </div>
      ) : !listing ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>РўРѕРІР°СЂ РЅРµ РЅР°Р№РґРµРЅ</p>
          <p className={styles.emptyText}>Р’РѕР·РјРѕР¶РЅРѕ, РѕРЅ Р±С‹Р» СѓРґР°Р»С‘РЅ РёР»Рё СЃРєСЂС‹С‚.</p>
        </div>
      ) : (
        <div className={styles.layout}>
          <div className={styles.visual}>
            {listing.firstPhotoPath ?? listing.photoPath ? (
              <img src={`http://localhost:8080${listing.firstPhotoPath ?? listing.photoPath}`} alt="" className={styles.photo} />
            ) : (
              <div className={styles.photoPlaceholder} aria-hidden />
            )}
          </div>
          <div className={styles.panel}>
            <div className={styles.kicker}>
              <span>{categoryLabel(listing.category)}</span>
              <span className={styles.dot}>В·</span>
              <span>#{listing.id}</span>
            </div>
            <h1 className={styles.title}>{listing.title}</h1>
            <p className={styles.desc}>{listing.description}</p>

            <div className={styles.actions}>
              {userId ? (
                <RouterButton to="/auctions/new" variant="primary">
                  РЎРѕР·РґР°С‚СЊ Р°СѓРєС†РёРѕРЅ
                </RouterButton>
              ) : (
                <RouterButton to="/profile" variant="primary">
                  РЎРѕР·РґР°С‚СЊ РїСЂРѕС„РёР»СЊ
                </RouterButton>
              )}
              <RouterButton to="/auctions" variant="secondary">
                РђСѓРєС†РёРѕРЅС‹
              </RouterButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

