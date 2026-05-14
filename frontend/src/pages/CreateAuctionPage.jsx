import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { RouterButton } from "../components/ui/RouterButton";
import { Select } from "../components/ui/Select";
import { useMarket } from "../contexts/MarketContext";
import { useUserSession } from "../contexts/UserSessionContext";
import { api } from "../services/api";
import styles from "./CreateAuctionPage.module.css";

export function CreateAuctionPage() {
  const navigate = useNavigate();
  const { userId } = useUserSession();
  const { auctions, refreshAuctions } = useMarket();
  const [submitting, setSubmitting] = useState(false);
  const [createdId, setCreatedId] = useState(null);
  const [modal, setModal] = useState({ open: false, title: "", message: "" });
  const [listings, setListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState("");

  const closeModal = () => setModal((m) => ({ ...m, open: false }));

  useEffect(() => {
    let alive = true;
    async function load() {
      if (!userId) return;
      setLoadingListings(true);
      try {
        const data = await api.loadListings();
        if (!alive) return;
        setListings(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!alive) return;
        console.error(err);
        setListings([]);
      } finally {
        if (!alive) return;
        setLoadingListings(false);
      }
    }
    load().catch(console.error);
    return () => {
      alive = false;
    };
  }, [userId]);

  const activeAuctionListingIds = useMemo(
    () => new Set(auctions.filter((a) => !a.finished).map((a) => a?.listing?.id).filter(Boolean)),
    [auctions]
  );

  const myAvailableListings = useMemo(
    () =>
      listings.filter(
        (l) => Number(l?.seller?.id) === Number(userId) && !activeAuctionListingIds.has(l?.id)
      ),
    [listings, userId, activeAuctionListingIds]
  );

  async function handleSubmit(e) {
    e.preventDefault();
    setCreatedId(null);
    if (!userId) {
      setModal({ open: true, title: "Профиль", message: "Чтобы создать аукцион, нужен профиль." });
      return;
    }
    const form = new FormData(e.currentTarget);
    const listingId = Number(selectedListingId);

    if (!listingId || Number.isNaN(listingId)) {
      setModal({
        open: true,
        title: "Лот",
        message: "Выберите объявление для запуска аукциона."
      });
      return;
    }

    const startPrice = Number(form.get("startPrice"));
    const minStep = Number(form.get("minStep"));
    const durationMinutes = Number(form.get("durationMinutes"));

    if ([startPrice, minStep, durationMinutes].some((v) => Number.isNaN(v))) {
      setModal({
        open: true,
        title: "Проверка",
        message: "Проверьте числовые поля: стартовая цена, шаг, длительность."
      });
      return;
    }

    setSubmitting(true);
    try {
      const created = await api.createAuction({
        listingId,
        startPrice,
        minStep,
        durationMinutes
      });
      await refreshAuctions();
      setCreatedId(created.id);
      setModal({
        open: true,
        title: "Аукцион создан",
        message: "Аукцион запущен."
      });
    } catch (err) {
      console.error(err);
      setModal({ open: true, title: "Ошибка", message: String(err?.message || err) });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <h1 className={styles.title}>Новый аукцион</h1>
      </div>

      {!userId ? (
        <div className={styles.gate}>
          <p className={styles.gateTitle}>Нужен профиль</p>
          <p className={styles.gateText}>Создайте профиль, чтобы запускать аукционы.</p>
          <RouterButton to="/profile" variant="primary">
            Перейти в профиль
          </RouterButton>
        </div>
      ) : (
      <form className={styles.card} onSubmit={handleSubmit}>
        <Select
          label="Объявление"
          name="listingId"
          value={selectedListingId}
          onChange={(e) => setSelectedListingId(e.target.value)}
          required
          hint={loadingListings ? "Загружаем ваши объявления..." : undefined}
        >
          <option value="">Выберите лот</option>
          {myAvailableListings.map((l) => (
            <option key={l.id} value={l.id}>
              #{l.id} {l.title}
            </option>
          ))}
        </Select>
        {(!loadingListings && myAvailableListings.length === 0) ? (
          <p className={styles.note}>Нет доступных лотов для запуска аукциона.</p>
        ) : null}
        <Input label="Стартовая цена" name="startPrice" type="number" step="0.01" required />
        <Input label="Минимальный шаг" name="minStep" type="number" step="0.01" required />
        <Input
          label="Длительность (мин.)"
          name="durationMinutes"
          type="number"
          defaultValue={10}
          required
        />
        <div className={styles.actions}>
          <Button
            type="submit"
            variant="primary"
            disabled={submitting || loadingListings || myAvailableListings.length === 0}
          >
            {submitting ? "Создание…" : "Запустить аукцион"}
          </Button>
        </div>
      </form>
      )}

      <Modal
        open={modal.open}
        title={modal.title}
        onClose={closeModal}
        footer={
          <div className={styles.modalFooter}>
            {createdId ? (
              <Button type="button" variant="primary" onClick={() => navigate(`/auctions/${createdId}`)}>
                Открыть аукцион
              </Button>
            ) : null}
            <Button type="button" variant="secondary" onClick={closeModal}>
              Закрыть
            </Button>
          </div>
        }
      >
        <p>{modal.message}</p>
      </Modal>
    </div>
  );
}
