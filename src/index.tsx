import {
  LocationProvider,
  Router,
  Route,
  hydrate,
  prerender as ssr,
} from "preact-iso";

import { Home } from "./pages/Home/index.jsx";
import { NotFound } from "./pages/_404.jsx";
import { Footer } from "./components/Footer.js";
import "./style.css";

export function App() {
  return (
    <LocationProvider>
      <div className="relative min-h-screen w-screen overflow-x-hidden">
        <Router>
          <Route path="/" component={Home} />
          <Route default component={NotFound} />
        </Router>
        <Footer />
      </div>
    </LocationProvider>
  );
}

if (typeof window !== "undefined") {
  hydrate(<App />, document.getElementById("app"));
}

export async function prerender(data) {
  return await ssr(<App {...data} />);
}
