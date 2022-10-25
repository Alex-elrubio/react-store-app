import styles from "styles/App.module.scss";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import clsx from "clsx";

// PAGES
import Home from "pages/Home";
import Detail from "pages/Detail";
import Category from "pages/Category";

// COMPONENTS
import Header from "components/Header";
import BasketSidebar from "components/BasketSidebar";
import Footer from "components/Footer";

// HOOKS
import useMobileDetect from "hooks/useMobileDetect";


const App = () => {
  const device = useMobileDetect();

  return (
    <Router>
      <div className={clsx(device.type === "mobile" && styles.paddingForMobile, styles.container)}>
        <Header />
        <main className={styles.main}>
          <Switch>
            <Route path="/" exact>
              <Home />
            </Route>
            <Route path="/product/:_id">
              <Detail />
            </Route>
            <Route path="/category/:_id">
              <Category />
            </Route>
          </Switch>
        </main>
        <Footer />
      </div>
      <BasketSidebar />
    </Router>
  );
};

export default App;
