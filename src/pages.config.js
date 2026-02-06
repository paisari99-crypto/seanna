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
import DecisionCriterionDetail from './pages/DecisionCriterionDetail';
import DecisionCriterionNew from './pages/DecisionCriterionNew';
import DecisionDetail from './pages/DecisionDetail';
import DecisionNew from './pages/DecisionNew';
import DecisionOptionDetail from './pages/DecisionOptionDetail';
import DecisionOptionNew from './pages/DecisionOptionNew';
import Decisions from './pages/Decisions';
import HabitDetail from './pages/HabitDetail';
import HabitNew from './pages/HabitNew';
import Habits from './pages/Habits';
import Home from './pages/Home';
import Insights from './pages/Insights';
import Journal from './pages/Journal';
import JournalDetail from './pages/JournalDetail';
import JournalEdit from './pages/JournalEdit';
import JournalNew from './pages/JournalNew';
import Settings from './pages/Settings';
import About from './pages/About';
import Privacy from './pages/Privacy';
import Disclaimer from './pages/Disclaimer';
import Onboarding from './pages/Onboarding';


export const PAGES = {
    "DecisionCriterionDetail": DecisionCriterionDetail,
    "DecisionCriterionNew": DecisionCriterionNew,
    "DecisionDetail": DecisionDetail,
    "DecisionNew": DecisionNew,
    "DecisionOptionDetail": DecisionOptionDetail,
    "DecisionOptionNew": DecisionOptionNew,
    "Decisions": Decisions,
    "HabitDetail": HabitDetail,
    "HabitNew": HabitNew,
    "Habits": Habits,
    "Home": Home,
    "Insights": Insights,
    "Journal": Journal,
    "JournalDetail": JournalDetail,
    "JournalEdit": JournalEdit,
    "JournalNew": JournalNew,
    "Settings": Settings,
    "About": About,
    "Privacy": Privacy,
    "Disclaimer": Disclaimer,
    "Onboarding": Onboarding,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
};