import { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { BidForm } from "../components/BidForm";
import { Button } from "../components/ui/Button";
import { Loader } from "../components/ui/Loader";
import { useMarket } from "../contexts/MarketContext";
import { useTick } from "../hooks/useTick";
import { categoryLabel } from "../utils/categoryLabels";
import { formatRemaining } from "../utils/formatRemaining";
import styles from "./AuctionDetailsPage.module.css";

export function AuctionDetailsPage() {
  const { id } = useParams();
  const numericId = Number(id);
  const { auctions, auctionsLoading, setWatchedAuctionId, refreshAuctions } = useMarket();

  useEffect(() => {
    if (!Number.isFinite(numericId) || numericId <= 0) {
      setWatchedAuctionId(null);
      return undefined;
    }
    setWatchedAuctionId(numericId);
    return () => setWatchedAuctionId(null);
  }, [numericId, setWatchedAuctionId]);

  const auction = useMemo(() => auctions.find((a) => a.id === numericId), [auctions, numericId]);

  const active = auction && !auction.finished;
  useTick(Boolean(active));

  const remaining = auction && !auction.finished ? formatRemaining(auction.endAt) : null;

  const photoPath = auction?.listing?.firstPhotoPath ?? auction?.listing?.photoPath;

  const hasEndedLocally = auction && !auction.finished && new Date(auction.endAt) <= new Date();

  if (auctionsLoading && !auction) {
    return (
      <div className={styles.page}>
        <Loader />
      </div>
    );
  }

  if (!Number.isFinite(numericId) || numericId <= 0) {
    return (
      <div className={styles.page}>
        <p className={styles.bad}>Некорректный идентификатор аукциона.</p>
        <Link to="/auctions" className={styles.back}>
          ← К списку
        </Link>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className={styles.page}>
        <p className={styles.bad}>Аукцион не найден в текущем списке.</p>
        <div className={styles.row}>
          <Button type="button" variant="secondary" onClick={() => refreshAuctions()}>
            Загрузить снова
          </Button>
          <Link to="/auctions" className={styles.back}>
            ← К списку
          </Link>
        </div>
      </div>
    );
  }

  const listing = auction.listing;

  return (
    <div className={styles.page}>
      <Link to="/auctions" className={styles.back}>
        ← Все аукционы
      </Link>

      <div className={styles.layout}>
        <div className={styles.visual}>
          {photoPath ? (
            <img src={`http://localhost:8080${photoPath}`} alt="" className={styles.photo} />
          ) : (
            <div className={styles.photoPlaceholder} aria-hidden />
          )}
        </div>

        <div className={styles.panel}>
          <div className={styles.kicker}>
            <span>{categoryLabel(listing?.category)}</span>
            <span className={styles.dot}>·</span>
            <span>#{auction.id}</span>
          </div>
          <h1 className={styles.title}>{listing?.title ?? "Лот"}</h1>
          {listing?.description ? <p className={styles.desc}>{listing.description}</p> : null}

          <div className={styles.stats}>
            <div>
              <p className={styles.statLabel}>Текущая цена</p>
              <p className={styles.statValue}>{Number(auction.currentPrice).toLocaleString("ru-RU")} ₽</p>
            </div>
            <div>
              <p className={styles.statLabel}>Статус</p>
              <p className={styles.statValue}>
                {auction.finished || hasEndedLocally ? "Завершён" : <span className={styles.live}>Идёт торг</span>}
              </p>
            </div>
            {!(auction.finished || hasEndedLocally) ? (
              <div>
                <p className={styles.statLabel}>До конца</p>
                <p className={styles.statValueMono}>{remaining}</p>
              </div>
            ) : null}
          </div>

          {!(auction.finished || hasEndedLocally) ? (
            <div className={styles.bidBlock}>
              <h2 className={styles.bidTitle}>Ставка</h2>
              <BidForm auctionId={auction.id} />
            </div>
          ) : (
            <p className={styles.endedNote}>Торги завершены, новые ставки недоступны.</p>
          )}
        </div>
      </div>
    </div>
  );
}
