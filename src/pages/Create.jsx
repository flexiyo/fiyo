import { useContext } from "react";
import ContentViewport from "@/components/create/ContentViewport";
import ContentSelection from "@/components/create/ContentSelection";
import AppContext from "@/context/app/AppContext";

const Create = () => {
  document.title = "Flexiyo";

  const { isMobile } = useContext(AppContext);

  return (
    <section id="create">
      <div
        className="create-container"
        style={{ flexDirection: isMobile ? "column" : "row" }}
      >
        <ContentViewport />
        <ContentSelection />
      </div>
    </section>
  );
};

export default Create;
