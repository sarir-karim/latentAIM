import { useState, useEffect } from "react";

const useActiveTab = (initialTab) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    console.log("App component loaded with activeTab:", activeTab);
  }, [activeTab]);

  return [activeTab, setActiveTab];
};

export default useActiveTab;
