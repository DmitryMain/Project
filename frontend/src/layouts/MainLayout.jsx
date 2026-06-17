import { Outlet } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { BrowserNotifications } from "../components/BrowserNotifications";
import styles from "./MainLayout.module.css";

export function MainLayout() {
  return (
    <div className={styles.shell}>
      <BrowserNotifications />
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
