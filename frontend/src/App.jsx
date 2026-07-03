import AISdrDemo from "./ai-sdr-lumen-demo";
import DashboardPage from "./dashboard";

function App() {
  const pathname = window.location.pathname.replace(/\/+$/, "") || "/";

  if (pathname === "/dashboard") {
    return <DashboardPage />;
  }

  return <AISdrDemo />;
}

export default App;
