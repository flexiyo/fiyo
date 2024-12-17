import { useContext } from "react";
import TodayPicks from "@/components/home/TodayPicks";
import Post from "@/components/home/Post";
import HomeNavbar from "@/layout/items/HomeNavbar";
import AppContext from "@/context/app/AppContext";
export default function Home() {
  document.title = "Flexiyo";

  const { isMobile } = useContext(AppContext);

  return (
    <>
      <section id="home">
      {isMobile ? <HomeNavbar /> : null}
        <div className="home-container">
          <TodayPicks />
          <Post />
          <Post />
          <Post />
          <Post />
          <Post />
        </div>
      </section>
    </>
  );
}
