import { useMemo, useState } from "react";
import { AuctionCard } from "../components/AuctionCard";
import { Button } from "../components/ui/Button";
import { Loader } from "../components/ui/Loader";
import { Select } from "../components/ui/Select";
import { useMarket } from "../contexts/MarketContext";
import styles from "./AuctionsPage.module.css";

export function AuctionsPage() {
  const { auctions, auctionsLoading, auctionsError, refreshAuctions } = useMarket();
  const [scope, setScope] = useState("ACTIVE");

  const visible = useMemo(() => {
    if (scope === "ALL") return auctions;
    return auctions.filter((a) => !a.finished);
  }, [auctions, scope]);

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <div>
          <h1 className={styles.title}>Аукционы</h1>
        </div>
        <div className={styles.toolbar}>
          <Select label="Показать" name="scope" value={scope} onChange={(e) => setScope(e.target.value)}>
            <option value="ACTIVE">Активные</option>
            <option value="ALL">Все</option>
          </Select>
          <Button type="button" variant="secondary" onClick={() => refreshAuctions()}>
            Обновить
          </Button>
        </div>
      </div>

      {auctionsLoading ? (
        <Loader />
      ) : auctionsError ? (
        <div className={styles.errorBox}>
          <p className={styles.errorTitle}>Не удалось загрузить аукционы</p>
          <p className={styles.errorText}>{auctionsError}</p>
          <Button type="button" variant="primary" onClick={() => refreshAuctions()}>
            Повторить
          </Button>
        </div>
      ) : auctions.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>Пока нет аукционов</p>
          <p className={styles.emptyText}>Создайте лот и аукцион — они появятся здесь.</p>
        </div>
      ) : visible.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>Нет активных аукционов</p>
          <p className={styles.emptyText}>Завершённые торги скрыты.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {visible.map((a) => (
            <AuctionCard key={a.id} auction={a} />
          ))}
        </div>
      )}
    </div>
  );
}
