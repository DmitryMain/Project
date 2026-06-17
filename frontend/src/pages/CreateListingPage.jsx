import { useState } from "react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { RouterButton } from "../components/ui/RouterButton";
import { Select } from "../components/ui/Select";
import { useUserSession } from "../contexts/UserSessionContext";
import { api } from "../services/api";
import styles from "./CreateListingPage.module.css";

export function CreateListingPage() {
  const { userId, userRole, setLastListingId } = useUserSession();
  const [submitting, setSubmitting] = useState(false);
  const [modal, setModal] = useState({ open: false, title: "", message: "" });
  const [sellerEmail, setSellerEmail] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("SMARTPHONE");
  const [photos, setPhotos] = useState([]);

  const closeModal = () => setModal((m) => ({ ...m, open: false }));

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handlePhotoChange(e) {
    const files = Array.from(e.target.files || []);
    const remaining = 5 - photos.length;
    const toAdd = files.slice(0, remaining);

    const base64Photos = [];
    for (const file of toAdd) {
      try {
        const base64 = await fileToBase64(file);
        base64Photos.push(base64);
      } catch (err) {
        console.error("Failed to convert file to base64:", err);
      }
    }

    setPhotos((prev) => [...prev, ...base64Photos]);
  }

  function removePhoto(index) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

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
    if (!sellerEmail.trim()) {
      setModal({
        open: true,
        title: "Проверка",
        message: "Укажите email продавца."
      });
      return;
    }
    if (!title.trim()) {
      setModal({
        open: true,
        title: "Проверка",
        message: "Введите название товара."
      });
      return;
    }
    if (photos.length === 0) {
      setModal({
        open: true,
        title: "Проверка",
        message: "Добавьте хотя бы одну фотографию."
      });
      return;
    }
    setSubmitting(true);
    try {
      await api.createListing({
        sellerEmail: sellerEmail.trim(),
        createdBy: userId,
        title: title.trim(),
        description: description.trim(),
        category: selectedCategory,
        photos: photos
      });
      setModal({
        open: true,
        title: "Лот создан",
        message: "Карточка товара создана и отправлена на модерацию."
      });
      setSellerEmail("");
      setTitle("");
      setDescription("");
      setSelectedCategory("SMARTPHONE");
      setPhotos([]);
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
        <h1 className={styles.title}>Приём товара</h1>
        <p className={styles.subtitle}>Создание карточки товара от продавца</p>
      </div>

      {!userId ? (
        <div className={styles.gate}>
          <p className={styles.gateTitle}>Нужен профиль</p>
          <p className={styles.gateText}>Создайте профиль сотрудника, чтобы принимать товары.</p>
          <RouterButton to="/profile" variant="primary">
            Перейти в профиль
          </RouterButton>
        </div>
      ) : userRole !== "STAFF" ? (
        <div className={styles.gate}>
          <p className={styles.gateTitle}>Только для сотрудников</p>
          <p className={styles.gateText}>Приём товаров доступен только сотрудникам магазина.</p>
          <RouterButton to="/profile" variant="primary">
            Назад к профилю
          </RouterButton>
        </div>
      ) : (
      <form className={styles.card} onSubmit={handleSubmit}>
        <Input
          label="Email продавца" 
          name="sellerEmail" 
          type="email"
          required
          placeholder="seller@example.com"
          value={sellerEmail}
          onChange={(e) => setSellerEmail(e.target.value)}
        />
        <Input label="Название товара" name="title" required placeholder="iPhone 15 Pro" value={title} onChange={(e) => setTitle(e.target.value)} />
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
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <Select 
          label="Категория" 
          name="category" 
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="SMARTPHONE">Смартфон</option>
          <option value="LAPTOP">Ноутбук</option>
          <option value="TABLET">Планшет</option>
          <option value="ACCESSORY">Аксессуар</option>
          <option value="OTHER">Другое</option>
        </Select>
        <div className={styles.full}>
          <label className={styles.areaLabel}>Фото товара ({photos.length}/5)</label>
          <input
            type="file"
            name="photo"
            accept="image/*"
            multiple
            required
            onChange={handlePhotoChange}
            className={styles.fileInput}
          />
          {photos.length > 0 && (
            <div className={styles.photoGrid}>
              {photos.map((base64, index) => (
                <div key={index} className={styles.photoItem}>
                  <img src={base64} alt={`Фото ${index + 1}`} className={styles.photoThumb} />
                  <button
                    type="button"
                    className={styles.photoRemove}
                    onClick={() => removePhoto(index)}
                    title="Удалить"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className={styles.actions}>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? "Создание…" : "Создать карточку товара"}
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
