import { useEffect, useMemo, useState } from "react";
import { AuctionCard } from "../components/AuctionCard";
import { ListingCard } from "../components/ListingCard";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { RouterButton } from "../components/ui/RouterButton";
import { Select } from "../components/ui/Select";
import { useMarket } from "../contexts/MarketContext";
import { api } from "../services/api";
import styles from "./HomePage.module.css";

const LISTING_PRICE_CACHE_KEY = "listingPriceById";

function readListingPriceMap() {
  try {
    const raw = localStorage.getItem(LISTING_PRICE_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error(err);
    return {};
  }
}

export function HomePage() {
  const { auctions, auctionsLoading } = useMarket();

  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [listings, setListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [listingsError, setListingsError] = useState(null);

  async function loadListings(next = {}) {
    setListingsError(null);
    setListingsLoading(true);
    try {
      const data = await api.loadListings(next);
      const priceMap = readListingPriceMap();
      const normalized = Array.isArray(data)
        ? data.map((listing) => ({
            ...listing,
            price:
              listing?.price !== undefined && listing?.price !== null
                ? listing.price
                : priceMap[String(listing?.id)]
          }))
        : [];
      setListings(normalized);
    } catch (e) {
      console.error(e);
      setListingsError(e?.message ?? String(e));
      setListings([]);
    } finally {
      setListingsLoading(false);
    }
  }

  useEffect(() => {
    loadListings({ q, category: category || undefined }).catch(console.error);
  }, []);

  const activeAuctions = useMemo(() => auctions.filter((a) => !a.finished), [auctions]);
  const activeAuctionListingIds = useMemo(
    () => new Set(activeAuctions.map((a) => a?.listing?.id).filter(Boolean)),
    [activeAuctions]
  );
  const saleListings = useMemo(() => {
    const filtered = listings.filter((l) => !activeAuctionListingIds.has(l.id));
    return filtered.slice().sort((a, b) => {
      const pa = Number(a?.price);
      const pb = Number(b?.price);
      const hasPa = Number.isFinite(pa);
      const hasPb = Number.isFinite(pb);
      if (hasPa && hasPb) return pa - pb;
      if (hasPa) return -1;
      if (hasPb) return 1;
      return String(a?.title ?? "").localeCompare(String(b?.title ?? ""), "ru");
    });
  }, [listings, activeAuctionListingIds]);
  const auctionsPeek = activeAuctions
    .slice()
    .sort((a, b) => new Date(a.endAt).getTime() - new Date(b.endAt).getTime())
    .slice(0, 3);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>Аукционы · гаджеты · прозрачные правила</p>
          <h1 className={styles.title}>Каталог</h1>
        </div>
      </section>

      <section className={styles.listings}>
        <div className={styles.inner}>
          <div className={styles.head}>
            <div>
              <h2 className={styles.title2}>Товары на продажу</h2>
              <p className={styles.sub2}>Подборка актуальных лотов</p>
            </div>
            <RouterButton to="/listings/new" variant="secondary" className={styles.cta}>
              Добавить лот
            </RouterButton>
          </div>

          <div className={styles.filters}>
            <Input
              label="Поиск"
              name="q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Название товара"
            />
            <Select
              label="Категория"
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Все</option>
              <option value="SMARTPHONE">Смартфон</option>
              <option value="LAPTOP">Ноутбук</option>
              <option value="TABLET">Планшет</option>
              <option value="ACCESSORY">Аксессуар</option>
              <option value="OTHER">Другое</option>
            </Select>
            <div className={styles.filterActions}>
              <Button
                variant="primary"
                type="button"
                onClick={() => loadListings({ q, category: category || undefined })}
                disabled={listingsLoading}
              >
                {listingsLoading ? "Поиск…" : "Показать"}
              </Button>
              <Button
                variant="ghost"
                type="button"
                onClick={() => {
                  setQ("");
                  setCategory("");
                  loadListings({}).catch(console.error);
                }}
                disabled={listingsLoading}
              >
                Сброс
              </Button>
            </div>
          </div>

          {listingsLoading ? (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>Загрузка…</p>
              <p className={styles.emptyText}>Получаем список лотов.</p>
            </div>
          ) : listingsError ? (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>Не удалось загрузить лоты</p>
              <p className={styles.emptyText}>{listingsError}</p>
              <Button variant="secondary" type="button" onClick={() => loadListings({ q, category: category || undefined })}>
                Повторить
              </Button>
            </div>
          ) : saleListings.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>Ничего не найдено</p>
              <p className={styles.emptyText}>Попробуйте другой запрос или снимите фильтры.</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {saleListings.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className={styles.auctionsSecondary}>
        <div className={styles.inner}>
          <div className={styles.head}>
            <div>
              <h2 className={styles.title2}>Активные аукционы</h2>
            </div>
            <RouterButton to="/auctions" variant="secondary" className={styles.cta}>
              Все аукционы
            </RouterButton>
          </div>

          {auctionsLoading ? (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>Загрузка…</p>
              <p className={styles.emptyText}>Получаем список аукционов.</p>
            </div>
          ) : auctionsPeek.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>Нет активных аукционов</p>
              <p className={styles.emptyText}>Создайте лот и запустите аукцион — он появится в разделе «Аукционы».</p>
            </div>
          ) : (
            <div className={styles.gridSmall}>
              {auctionsPeek.map((a) => (
                <AuctionCard key={a.id} auction={a} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
