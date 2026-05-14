import { useState } from "react";
import { api } from "../services/api";
import { useMarket } from "../contexts/MarketContext";
import { useUserSession } from "../contexts/UserSessionContext";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Modal } from "./ui/Modal";
import styles from "./BidForm.module.css";

export function BidForm({ auctionId }) {
  const { userId } = useUserSession();
  const { refreshAuctions } = useMarket();
  const [amount, setAmount] = useState("");
  const [autoBidLimit, setAutoBidLimit] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [modal, setModal] = useState({ open: false, title: "", message: "" });

  const showModal = (title, message) => setModal({ open: true, title, message });
  const closeModal = () => setModal((m) => ({ ...m, open: false }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!auctionId) {
      showModal("Аукцион", "Не выбран аукцион.");
      return;
    }
    if (!userId) {
      showModal("Профиль", "Создайте пользователя в разделе «Профиль», чтобы делать ставки.");
      return;
    }
    const amt = Number(amount);
    const limitRaw = autoBidLimit.trim();
    const autoLimit = limitRaw === "" ? null : Number(limitRaw);

    if (Number.isNaN(amt)) {
      showModal("Проверка", "Укажите корректную сумму ставки.");
      return;
    }
    if (limitRaw !== "" && Number.isNaN(autoLimit)) {
      showModal("Проверка", "Проверьте лимит автоставки.");
      return;
    }

    setSubmitting(true);
    try {
      await api.placeBid(auctionId, {
        bidderId: userId,
        amount: amt,
        autoBidLimit: autoLimit
      });
      await refreshAuctions();
      setAmount("");
      setAutoBidLimit("");
      showModal("Готово", "Ставка отправлена.");
    } catch (err) {
      console.error(err);
      showModal("Ошибка", String(err?.message || err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <form className={styles.form} onSubmit={handleSubmit}>
        <Input
          label="Сумма ставки"
          name="amount"
          type="number"
          step="0.01"
          required
          value={amount}
          onChange={(ev) => setAmount(ev.target.value)}
          placeholder="0.00"
        />
        <Input
          label="Лимит автоставки"
          name="autoBidLimit"
          type="number"
          step="0.01"
          value={autoBidLimit}
          onChange={(ev) => setAutoBidLimit(ev.target.value)}
          placeholder="Необязательно"
          hint="Оставьте пустым, если не нужен"
        />
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? "Отправка…" : "Сделать ставку"}
        </Button>
      </form>
      <Modal open={modal.open} title={modal.title} onClose={closeModal}>
        <p>{modal.message}</p>
      </Modal>
    </>
  );
}
