import { useContext } from "react";
import Headroom from "react-headroom";
import CustomTopNavbar from "@/layout/items/CustomTopNavbar";
import AppContext from "@/context/app/AppContext"

const Stories = () => {
  document.title = "Stories • Flexiyo";

  const { isMobile } = useContext(AppContext);

  const storiesList = [
    {
      id: 1,
      username: "me.23get",
      pfp: "https://i.pravatar.cc/300",
      backThumb: "https://picsum.photos/200/300",
    },
    {
      id: 2,
      username: "kin.tista",
      pfp: "https://i.pravatar.cc/300",
      backThumb: "https://picsum.photos/200/300",
    },
    {
      id: 3,
      username: "hehe.letsgetit",
      pfp: "https://i.pravatar.cc/300",
      backThumb: "https://picsum.photos/200/300",
    },
    {
      id: 4,
      username: "wow.itsyou",
      pfp: "https://i.pravatar.cc/300",
      backThumb: "https://picsum.photos/200/300",
    },
    {
      id: 5,
      username: "uh.itsme",
      pfp: "https://i.pravatar.cc/300",
      backThumb: "https://picsum.photos/200/300",
    },
    {
      id: 6,
      username: "lol.korat",
      pfp: "https://i.pravatar.cc/300",
      backThumb: "https://picsum.photos/200/300",
    },
    {
      id: 7,
      username: "lomta.sis",
      pfp: "https://i.pravatar.cc/300",
      backThumb: "https://picsum.photos/200/300",
    },
    {
      id: 8,
      username: "rizzy.pet",
      pfp: "https://i.pravatar.cc/300",
      backThumb: "https://picsum.photos/200/300",
    },
  ];

  const renderStories = () => {
    return storiesList.map((story, index) => (
      <div className="stories-list--story" key={index}>
        <div
          className="stories-list--story-backthumb"
          style={{ backgroundImage: `url(${story.backThumb})` }}
          title="View Story"
        ></div>
        <img
          className="stories-list--story-pfp"
          src={story.pfp}
          alt={`${story.username}'s Story`}
        />
        <span className="stories-list--story-username">{story.username}</span>
      </div>
    ));
  };
  return (
    <section id="stories">
      {isMobile ? (
        <Headroom>
          <CustomTopNavbar
            navbarPrevPage="/"
            navbarTitle="Stories"
            navbarFirstIcon="fa fa-plus"
            navbarSecondIcon="fa fa-gear"
          />
        </Headroom>
      ) : null}
      <div className="stories-list">{renderStories()}</div>
      <div className="story-templates">
        <div className="story-templates--item story-templates--scratch">
          <i className="fa fa-plus story-templates--scratch-icon"></i>
          <span className="story-templates--scratch-text">Create a Story from Scratch</span>
        </div>
        <div className="story-templates--item">STORY SAMPLE</div>
        <div className="story-templates--item">STORY SAMPLE</div>
        <div className="story-templates--item">STORY SAMPLE</div>
        <div className="story-templates--item">STORY SAMPLE</div>
        <div className="story-templates--item">STORY SAMPLE</div>
        <div className="story-templates--item">STORY SAMPLE</div>
        <div className="story-templates--item">STORY SAMPLE</div>
        <div className="story-templates--item">STORY SAMPLE</div>
      </div>
    </section>
  );
};

export default Stories;
