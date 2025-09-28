import { createBrowserRouter, RouterProvider } from "react-router-dom";
import About from "./Components/About";
import AppWrapper from "./Components/AppWrapper";
import Home from "./Components/Home";
import Contact from './Components/Contact'
import TandC from './Components/TandC'
import Privacy from "./Components/Privacy"
import './App.css'


const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: 'home',
    element: <div>Home page</div>,
  },
  {
    path: '/about',
    element: <About />,
  },
  {
    path: '/contact',
    element: <Contact />
  },
  {
    path: 't-and-c',
    element: <TandC />
  },
  {
    path: 'privacy-policy',
    element: <Privacy />
  }
]);

function App() {

  return (
    <AppWrapper>
      <RouterProvider router={router} />
    </AppWrapper>
  )
}

export default App
