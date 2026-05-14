import { useState } from "react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { RouterButton } from "../components/ui/RouterButton";
import { Select } from "../components/ui/Select";
import { useUserSession } from "../contexts/UserSessionContext";
import { api } from "../services/api";
import styles from "./CreateListingPage.module.css";

const LISTING_PRICE_CACHE_KEY = "listingPriceById";

function saveListingPrice(listingId, price) {
  if (!listingId) return;
  const numericPrice = Number(price);
  if (!Number.isFinite(numericPrice)) return;
  try {
    const raw = localStorage.getItem(LISTING_PRICE_CACHE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[String(listingId)] = numericPrice;
    localStorage.setItem(LISTING_PRICE_CACHE_KEY, JSON.stringify(map));
  } catch (err) {
    console.error(err);
  }
}

export function CreateListingPage() {
  const { userId, setLastListingId } = useUserSession();
  const [submitting, setSubmitting] = useState(false);
  const [modal, setModal] = useState({ open: false, title: "", message: "" });
  const [price, setPrice] = useState("");
  const [photoPreview, setPhotoPreview] = useState(null);

  const closeModal = () => setModal((m) => ({ ...m, open: false }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!userId) {
      setModal({
        open: true,
        title: "Профиль",
        message: "Чтобы добавить лот, нужен профиль."
      });
      return;
    }
    const form = new FormData(e.currentTarget);
    const numericPrice = Number(price);
    if (!Number.isFinite(numericPrice)) {
      setModal({
        open: true,
        title: "Проверка",
        message: "Укажите корректную цену."
      });
      return;
    }
    setSubmitting(true);
    const formElement = e.currentTarget;
    try {
      const formData = new FormData();
      formData.append("sellerId", userId);
      formData.append("title", form.get("title"));
      formData.append("description", form.get("description"));
      formData.append("category", form.get("category"));
      const photoFile = form.get("photo");
      if (photoFile && photoFile.size > 0) {
        formData.append("photo", photoFile);
      }
      formData.append("price", numericPrice);

      const created = await api.createListing(formData);
      setLastListingId(created.id);
      saveListingPrice(created.id, numericPrice);
      setModal({
        open: true,
        title: "Лот создан",
        message: "Лот появился в каталоге."
      });
      if (formElement) {
        formElement.reset();
      }
      setPrice("");
      setPhotoPreview(null);
    } catch (err) {
      console.error(err);
      setModal({ open: true, title: "Ошибка", message: String(err?.message || err) });
    } finally {
      setSubmitting(false);
    }
  }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreview(ev.target.result);
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview(null);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <h1 className={styles.title}>Новый лот</h1>
      </div>

      {!userId ? (
        <div className={styles.gate}>
          <p className={styles.gateTitle}>Нужен профиль</p>
          <p className={styles.gateText}>Создайте профиль, чтобы выставлять лоты.</p>
          <RouterButton to="/profile" variant="primary">
            Перейти в профиль
          </RouterButton>
        </div>
      ) : (
      <form className={styles.card} onSubmit={handleSubmit}>
        <Input label="Название" name="title" required placeholder="iPhone 15 Pro" />
        <div className={styles.full}>
          <label className={styles.areaLabel} htmlFor="listing-description">
            Описание
          </label>
          <textarea
            id="listing-description"
            name="description"
            className={styles.textarea}
            required
            rows={4}
            placeholder="Состояние, комплектация, история"
          />
        </div>
        <Select label="Категория" name="category" defaultValue="SMARTPHONE">
          <option value="SMARTPHONE">Смартфон</option>
          <option value="LAPTOP">Ноутбук</option>
          <option value="TABLET">Планшет</option>
          <option value="ACCESSORY">Аксессуар</option>
          <option value="OTHER">Другое</option>
        </Select>
        <Input
          label="Цена"
          name="price"
          type="number"
          required
          placeholder="1000"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <div className={styles.full}>
          <label className={styles.areaLabel}>Фото товара</label>
          <input
            type="file"
            name="photo"
            accept="image/*"
            required
            onChange={handlePhotoChange}
            className={styles.fileInput}
          />
          {photoPreview && (
            <img src={photoPreview} alt="Preview" className={styles.preview} />
          )}
        </div>
        <div className={styles.actions}>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? "Создание…" : "Создать объявление"}
          </Button>
        </div>
      </form>
      )}

      <Modal open={modal.open} title={modal.title} onClose={closeModal}>
        <p>{modal.message}</p>
      </Modal>
    </div>
  );
}