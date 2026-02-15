/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import About from './pages/About';
import App from './pages/App';
import ArchivedHabits from './pages/ArchivedHabits';
import DailyReview from './pages/DailyReview';
import DailyReviewHistory from './pages/DailyReviewHistory';
import DecisionCriterionDetail from './pages/DecisionCriterionDetail';
import DecisionCriterionNew from './pages/DecisionCriterionNew';
import DecisionDetail from './pages/DecisionDetail';
import DecisionNew from './pages/DecisionNew';
import DecisionOptionDetail from './pages/DecisionOptionDetail';
import DecisionOptionNew from './pages/DecisionOptionNew';
import Decisions from './pages/Decisions';
import Disclaimer from './pages/Disclaimer';
import Features from './pages/Features';
import HabitDetail from './pages/HabitDetail';
import HabitNew from './pages/HabitNew';
import Habits from './pages/Habits';
import Home from './pages/Home';
import Insights from './pages/Insights';
import Journal from './pages/Journal';
import JournalDetail from './pages/JournalDetail';
import JournalEdit from './pages/JournalEdit';
import JournalNew from './pages/JournalNew';
import Landing from './pages/Landing';
import Onboarding from './pages/Onboarding';
import Pricing from './pages/Pricing';
import Privacy from './pages/Privacy';
import Settings from './pages/Settings';
import Demo from './pages/Demo';
import __Layout from './Layout.jsx';


export const PAGES = {
    "About": About,
    "App": App,
    "ArchivedHabits": ArchivedHabits,
    "DailyReview": DailyReview,
    "DailyReviewHistory": DailyReviewHistory,
    "DecisionCriterionDetail": DecisionCriterionDetail,
    "DecisionCriterionNew": DecisionCriterionNew,
    "DecisionDetail": DecisionDetail,
    "DecisionNew": DecisionNew,
    "DecisionOptionDetail": DecisionOptionDetail,
    "DecisionOptionNew": DecisionOptionNew,
    "Decisions": Decisions,
    "Disclaimer": Disclaimer,
    "Features": Features,
    "HabitDetail": HabitDetail,
    "HabitNew": HabitNew,
    "Habits": Habits,
    "Home": Home,
    "Insights": Insights,
    "Journal": Journal,
    "JournalDetail": JournalDetail,
    "JournalEdit": JournalEdit,
    "JournalNew": JournalNew,
    "Landing": Landing,
    "Onboarding": Onboarding,
    "Pricing": Pricing,
    "Privacy": Privacy,
    "Settings": Settings,
    "Demo": Demo,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};