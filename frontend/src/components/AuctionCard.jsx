import { Link } from "react-router-dom";
import { useTick } from "../hooks/useTick";
import { formatRemaining } from "../utils/formatRemaining";
import { categoryLabel } from "../utils/categoryLabels";
import styles from "./AuctionCard.module.css";

export function AuctionCard({ auction }) {
  useTick(!auction.finished);
  const title = auction.listing?.title ?? "Лот";
  const category = auction.listing?.category;
  const remaining = auction.finished ? null : formatRemaining(auction.endAt);

  return (
    <Link to={`/auctions/${auction.id}`} className={styles.card}>
      <div className={styles.media}>
        {auction.listing?.photoPath ? (
          <img src={`http://localhost:8080${auction.listing.photoPath}`} alt="" className={styles.img} loading="lazy" />
        ) : (
          <div className={styles.placeholder} aria-hidden />
        )}
      </div>
      <div className={styles.body}>
        <span className={styles.badge}>{categoryLabel(category)}</span>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.meta}>
          <span className={styles.price}>{Number(auction.currentPrice).toLocaleString("ru-RU")} ₽</span>
          {auction.finished ? (
            <span className={styles.statusEnded}>Завершён</span>
          ) : (
            <span className={styles.timer}>Осталось {remaining}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
