import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./Components/Layout";
import Home from "./Components/Home";
import About from "./Components/About";
import TandC from "./Components/TandC";
import Privacy from "./Components/Privacy";
import NotFound from "./Components/NotFound";
import { AppThemeProvider } from "./context/ThemeContext";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/about", element: <About /> },
      { path: "/t-and-c", element: <TandC /> },
      { path: "/privacy-policy", element: <Privacy /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

export default function App() {
  return (
    <AppThemeProvider>
      <RouterProvider router={router} />
    </AppThemeProvider>
  );
}
