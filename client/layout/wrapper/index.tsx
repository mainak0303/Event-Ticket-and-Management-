import React, {
  ReactNode,
  isValidElement,
  cloneElement,
  ReactElement,
  useState,
} from "react";
import ResponsiveAppBar from "../header";
import Footer from "../footer";

interface Props {
  children: ReactNode;
}

const Wrapper: React.FC<Props> = ({ children }) => {
  const [searchText, setSearchText] = useState("");

  const handleSearchSubmit = (text: string) => {
    setSearchText(text);
  };

  const enhancedChildren = React.Children.map(children, (child) => {
    if (!isValidElement(child)) return child;

    return cloneElement(child as ReactElement<any>, {
      searchText,
    });
  });

  return (
    <>
      <ResponsiveAppBar
        searchText={searchText}
        setSearchText={setSearchText}
        onSearchSubmit={handleSearchSubmit}
      />
      {enhancedChildren}
      <Footer />
    </>
  );
};

export default Wrapper;
