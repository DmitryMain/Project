import { Link } from "react-router-dom";
import { RouterButton } from "../components/ui/RouterButton";
import styles from "./NotFoundPage.module.css";

export function NotFoundPage() {
  return (
    <div className={styles.page}>
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>Страница не найдена</h1>
      <p className={styles.text}>Похоже, ссылка устарела или адрес введён с опечаткой.</p>
      <div className={styles.actions}>
        <RouterButton to="/" variant="primary">
          На главную
        </RouterButton>
        <Link to="/auctions" className={styles.link}>
          Аукционы
        </Link>
      </div>
    </div>
  );
}
