import { useEffect, useState } from "react";
import Home from "@/pages/Home";
import GaokaoPage from "@/pages/GaokaoPage";

export default function App() {
  const [route, setRoute] = useState<string>(() => window.location.hash || "#/");

  useEffect(() => {
    const onHash = () => {
      setRoute(window.location.hash || "#/");
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // 高考志愿导览路由
  if (route.startsWith("#/gaokao")) {
    return <GaokaoPage />;
  }

  return <Home />;
}
