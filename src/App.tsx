import { useEffect, useState } from "react";
import Home from "@/pages/Home";
import GaokaoPage from "@/pages/GaokaoPage";
import TalentTest from "@/pages/TalentTest";

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

  // 兼容旧链接：#/gaokao 重定向到首页（高考志愿现为首页）
  useEffect(() => {
    if (route.startsWith("#/gaokao")) {
      window.location.replace("#/");
    }
  }, [route]);

  // 天赋星图路由（注意：talent-test 不能被 talent 前缀匹配，需先判断）
  if (route.startsWith("#/talent-test")) {
    return <TalentTest />;
  }

  // 天赋星图路由
  if (route.startsWith("#/talent")) {
    return <Home />;
  }

  // 默认首页：高考志愿导览
  return <GaokaoPage />;
}
