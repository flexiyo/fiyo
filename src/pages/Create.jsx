import { useContext } from "react";
import Headroom from "react-headroom";
import ContentViewport from "@/components/create/ContentViewport";
import ContentSelection from "@/components/create/ContentSelection";
import AppContext from "@/context/app/AppContext";
import CustomTopNavbar from "@/layout/items/CustomTopNavbar";

const Create = () => {
  document.title = "Flexiyo";

  const { isMobile } = useContext(AppContext);

  return (
    <>
    <Headroom>
        <CustomTopNavbar
          navbarPrevPage="/"
          navbarTitle="Create"
          navbarSecondIcon="fa fa-gear"
        />
      </Headroom>
        <section id="create">
      <div
        className="create-container"
        style={{ flexDirection: isMobile ? "column" : "row" }}
      >
        <ContentViewport />
        <ContentSelection />
      </div>
    </section>
    </>
  );
};

export default Create;
