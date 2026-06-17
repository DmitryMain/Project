import { Link } from "react-router-dom";
import { categoryLabel } from "../utils/categoryLabels";
import styles from "./ListingCard.module.css";

export function ListingCard({ listing }) {
  const title = listing?.title ?? "Лот";
  const description = listing?.description ?? "";
  const photoPath = listing?.firstPhotoPath ?? listing?.photoPath;
  const category = listing?.category;
  const sellerName = listing?.seller?.displayName;
  const approved = Boolean(listing?.approved);
  const rawPrice = Number(listing?.price);
  const hasPrice = Number.isFinite(rawPrice);

  return (
    <Link to={`/listings/${listing?.id}`} className={styles.card}>
      <div className={styles.media}>
        {photoPath ? (
          <img src={`http://localhost:8080${photoPath}`} alt="" className={styles.img} loading="lazy" />
        ) : (
          <div className={styles.placeholder} aria-hidden />
        )}
      </div>
      <div className={styles.body}>
        <div className={styles.topRow}>
          <span className={styles.badge}>{categoryLabel(category)}</span>
          {hasPrice ? (
            <span className={styles.price}>{rawPrice.toLocaleString("ru-RU")} ₽</span>
          ) : (
            <span className={styles.priceMuted}>Цена по запросу</span>
          )}
          {!approved ? <span className={styles.pending}>на модерации</span> : null}
        </div>
        <h3 className={styles.title}>{title}</h3>
        {description ? <p className={styles.desc}>{description}</p> : null}
        {sellerName ? <p className={styles.seller}>Продавец: {sellerName}</p> : null}
      </div>
    </Link>
  );
}
