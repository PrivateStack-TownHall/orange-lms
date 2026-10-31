import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";

import store from "./store";
import router from "./routes";

import PopupProvider from "./providers/PopupProvider";

function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />

      <PopupProvider />
    </Provider>
  );
}

export default App;
