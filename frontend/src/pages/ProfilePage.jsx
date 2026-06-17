import { useState, useEffect } from "react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { RouterButton } from "../components/ui/RouterButton";
import { Select } from "../components/ui/Select";
import { useUserSession } from "../contexts/UserSessionContext";
import { api } from "../services/api";
import styles from "./ProfilePage.module.css";

export function ProfilePage() {
  const { userId, setUserId } = useUserSession();
  const [submitting, setSubmitting] = useState(false);
  const [modal, setModal] = useState({ open: false, title: "", message: "" });
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [isLogin, setIsLogin] = useState(false);

  const closeModal = () => setModal((m) => ({ ...m, open: false }));

  // Load profile if user is logged in
  useEffect(() => {
    if (!userId) {
      setProfile(null);
      return;
    }
    let alive = true;
    async function load() {
      setLoadingProfile(true);
      try {
        const data = await api.getMe();
        if (alive) setProfile(data);
      } catch (e) {
        console.error("Failed to load profile:", e);
        if (alive) setProfile(null);
      } finally {
        if (alive) setLoadingProfile(false);
      }
    }
    load();
    return () => { alive = false; };
  }, [userId]);

  async function handleRegister(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setSubmitting(true);
    try {
      const created = await api.registerUser({
        email: form.get("email"),
        password: form.get("password"),
        displayName: form.get("displayName"),
        role: form.get("role")
      });
      setUserId(created.id);
      setModal({
        open: true,
        title: "Профиль создан",
        message: "Аккаунт готов. Можно добавлять лоты и участвовать в торгах."
      });
      setIsLogin(false);
    } catch (err) {
      console.error(err);
      setModal({ open: true, title: "Ошибка", message: String(err?.message || err) });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setSubmitting(true);
    try {
      const user = await api.login({
        email: form.get("email"),
        password: form.get("password")
      });
      setUserId(user.id);
      setModal({
        open: true,
        title: "Вход выполнен",
        message: `Добро пожаловать, ${user.displayName}!`
      });
    } catch (err) {
      console.error(err);
      setModal({ open: true, title: "Ошибка", message: "Неверный email или пароль" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogout() {
    try {
      await api.logout();
      setUserId(null);
      setProfile(null);
      setModal({
        open: true,
        title: "Выход",
        message: "Вы вышли из аккаунта."
      });
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <h1 className={styles.title}>Профиль</h1>
      </div>

      <div className={styles.grid}>
        <section className={styles.card}>
          {userId && profile ? (
            <>
              <h2 className={styles.cardTitle}>Аккаунт</h2>
              <div className={styles.profileInfo}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Имя:</span>
                  <span className={styles.infoValue}>{profile.displayName}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Email:</span>
                  <span className={styles.infoValue}>{profile.email}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Роль:</span>
                  <span className={styles.infoValue}>
                    {profile.role === "ADMIN" ? "Администратор" : 
                     profile.role === "SELLER" ? "Продавец" : 
                     profile.role === "STAFF" ? "Сотрудник" : "Покупатель"}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Рейтинг:</span>
                  <span className={styles.infoValue}>{profile.sellerRating ?? 0}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Статус:</span>
                  <span className={styles.infoValue}>
                    {profile.verificationStatus === "VERIFIED" ? "Подтверждён" : "Ожидает"}
                  </span>
                </div>
              </div>
              <div className={styles.actions}>
                {profile.role === "SELLER" && (
                  <>
                    <RouterButton to="/listings/new" variant="primary">
                      Добавить лот
                    </RouterButton>
                    <RouterButton to="/auctions/new" variant="secondary">
                      Создать аукцион
                    </RouterButton>
                  </>
                )}
                {profile.role === "BUYER" && (
                  <p className={styles.copy}>Вы можете просматривать лоты и участвовать в аукционах.</p>
                )}
                {profile.role === "ADMIN" && (
                  <RouterButton to="/moderation" variant="primary">
                    Модерация лотов
                  </RouterButton>
                )}
                {profile.role === "STAFF" && (
                  <RouterButton to="/listings/new" variant="primary">
                    Приём товара
                  </RouterButton>
                )}
                <Button variant="danger" onClick={handleLogout}>
                  Выйти
                </Button>
              </div>
            </>
          ) : userId && loadingProfile ? (
            <p className={styles.copy}>Загрузка профиля...</p>
          ) : (
            <>
              {isLogin ? (
                <>
                  <h2 className={styles.cardTitle}>Вход</h2>
                  <form className={styles.form} onSubmit={handleLogin}>
                    <Input label="Email" name="email" type="email" required autoComplete="email" />
                    <Input label="Пароль" name="password" type="password" required autoComplete="current-password" />
                    <Button type="submit" variant="primary" disabled={submitting}>
                      {submitting ? "Вход..." : "Войти"}
                    </Button>
                  </form>
                  <p className={styles.switch}>
                    Нет аккаунта?{" "}
                    <button type="button" className={styles.linkBtn} onClick={() => setIsLogin(false)}>
                      Зарегистрироваться
                    </button>
                  </p>
                </>
              ) : (
                <>
                  <h2 className={styles.cardTitle}>Создать профиль</h2>
                  <form className={styles.form} onSubmit={handleRegister}>
                    <Input label="Email" name="email" type="email" required autoComplete="email" />
                    <Input label="Пароль" name="password" type="password" required autoComplete="new-password" />
                    <Input label="Имя" name="displayName" required placeholder="Ваше имя" />
                    <Select label="Роль" name="role" defaultValue="BUYER">
                      <option value="BUYER">Покупатель</option>
                      <option value="SELLER">Продавец</option>
                      <option value="STAFF">Сотрудник магазина</option>
                    </Select>
                    <Button type="submit" variant="primary" disabled={submitting}>
                      {submitting ? "Создание…" : "Создать профиль"}
                    </Button>
                  </form>
                  <p className={styles.switch}>
                    Уже есть аккаунт?{" "}
                    <button type="button" className={styles.linkBtn} onClick={() => setIsLogin(true)}>
                      Войти
                    </button>
                  </p>
                </>
              )}
            </>
          )}
        </section>
      </div>

      <Modal open={modal.open} title={modal.title} onClose={closeModal}>
        <p>{modal.message}</p>
      </Modal>
    </div>
  );
}