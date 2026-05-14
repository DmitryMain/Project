import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { MarketProvider } from "./contexts/MarketContext";
import { UserSessionProvider } from "./contexts/UserSessionContext";
import { MainLayout } from "./layouts/MainLayout";
import { AuctionDetailsPage } from "./pages/AuctionDetailsPage";
import { AuctionsPage } from "./pages/AuctionsPage";
import { CreateAuctionPage } from "./pages/CreateAuctionPage";
import { CreateListingPage } from "./pages/CreateListingPage";
import { HomePage } from "./pages/HomePage";
import { ListingDetailsPage } from "./pages/ListingDetailsPage";
import { ModerationPage } from "./pages/ModerationPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ProfilePage } from "./pages/ProfilePage";

export default function App() {
  return (
    <BrowserRouter>
      <UserSessionProvider>
        <MarketProvider>
          <Routes>
            <Route element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="auctions" element={<AuctionsPage />} />
              <Route path="auctions/new" element={<CreateAuctionPage />} />
              <Route path="auctions/:id" element={<AuctionDetailsPage />} />
              <Route path="listings/new" element={<CreateListingPage />} />
              <Route path="listings/:id" element={<ListingDetailsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="moderation" element={<ModerationPage />} />
              <Route path="home" element={<Navigate to="/" replace />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </MarketProvider>
      </UserSessionProvider>
    </BrowserRouter>
  );
}