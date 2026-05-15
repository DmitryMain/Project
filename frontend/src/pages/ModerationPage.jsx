import { useState, useEffect } from "react";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { api } from "../services/api";
import styles from "./ModerationPage.module.css";

export function ModerationPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, title: "", message: "" });
  const [error, setError] = useState(null);

  const closeModal = () => setModal((m) => ({ ...m, open: false }));

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.loadUnapprovedListings();
        if (alive) setListings(Array.isArray(data) ? data : []);
      } catch (e) {
        if (alive) {
          console.error(e);
          setError(e?.message || "Ошибка загрузки");
        }
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, []);

  async function handleApprove(listingId) {
    try {
      await api.approveListing(listingId);
      setListings((prev) => prev.filter((l) => l.id !== listingId));
      setModal({ open: true, title: "Готово", message: "Лот одобрен!" });
    } catch (e) {
      setModal({ open: true, title: "Ошибка", message: e?.message || "Не удалось одобрить лот" });
    }
  }

  async function handleReject(listingId) {
    try {
      await api.rejectListing(listingId);
      setListings((prev) => prev.filter((l) => l.id !== listingId));
      setModal({ open: true, title: "Готово", message: "Лот отклонён." });
    } catch (e) {
      setModal({ open: true, title: "Ошибка", message: e?.message || "Не удалось отклонить лот" });
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <h1 className={styles.title}>Модерация лотов</h1>
        <p className={styles.subtitle}>Лоты, ожидающие подтверждения</p>
      </div>

      {loading ? (
        <p className={styles.emptyText}>Загрузка...</p>
      ) : error ? (
        <p className={styles.errorText}>{error}</p>
      ) : listings.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>Нет лотов на модерации</p>
          <p className={styles.emptyText}>Все лоты проверены.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {listings.map((listing) => (
            <div key={listing.id} className={styles.card}>
              <div className={styles.cardLayout}>
                {listing.photoPath && (
                  <div className={styles.photoWrap}>
                    <img 
                      src={`http://localhost:8080${listing.photoPath}`} 
                      alt="" 
                      className={styles.photo} 
                    />
                  </div>
                )}
                <div className={styles.cardContent}>
                  <div className={styles.cardHead}>
                    <span className={styles.badge}>#{listing.id}</span>
                    <span className={styles.badgeCategory}>{listing.category}</span>
                  </div>
                  <h3 className={styles.cardTitle}>{listing.title}</h3>
                  {listing.description && (
                    <p className={styles.cardDesc}>{listing.description}</p>
                  )}
                  {listing.seller && (
                    <p className={styles.seller}>Продавец: {listing.seller.displayName}</p>
                  )}
                  <div className={styles.actions}>
                    <Button variant="primary" onClick={() => handleApprove(listing.id)}>
                      ✅ Одобрить
                    </Button>
                    <Button variant="danger" onClick={() => handleReject(listing.id)}>
                      ❌ Отклонить
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal.open} title={modal.title} onClose={closeModal}>
        <p>{modal.message}</p>
      </Modal>
    </div>
  );
}