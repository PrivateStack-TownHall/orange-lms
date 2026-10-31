import React from "react";

const TabsContent = ({ activeTab, value, children }) => {
  if (activeTab !== value) {
    return null;
  }

  return children;
};

export default TabsContent;
