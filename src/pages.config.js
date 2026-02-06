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
import Home from './pages/Home';
import Journal from './pages/Journal';
import Habits from './pages/Habits';
import Decisions from './pages/Decisions';
import Insights from './pages/Insights';
import JournalNew from './pages/JournalNew';
import JournalDetail from './pages/JournalDetail';
import JournalEdit from './pages/JournalEdit';
import HabitNew from './pages/HabitNew';
import HabitDetail from './pages/HabitDetail';
import DecisionNew from './pages/DecisionNew';
import DecisionDetail from './pages/DecisionDetail';
import DecisionOptionNew from './pages/DecisionOptionNew';
import DecisionCriterionNew from './pages/DecisionCriterionNew';
import DecisionOptionDetail from './pages/DecisionOptionDetail';
import DecisionCriterionDetail from './pages/DecisionCriterionDetail';


export const PAGES = {
    "Home": Home,
    "Journal": Journal,
    "Habits": Habits,
    "Decisions": Decisions,
    "Insights": Insights,
    "JournalNew": JournalNew,
    "JournalDetail": JournalDetail,
    "JournalEdit": JournalEdit,
    "HabitNew": HabitNew,
    "HabitDetail": HabitDetail,
    "DecisionNew": DecisionNew,
    "DecisionDetail": DecisionDetail,
    "DecisionOptionNew": DecisionOptionNew,
    "DecisionCriterionNew": DecisionCriterionNew,
    "DecisionOptionDetail": DecisionOptionDetail,
    "DecisionCriterionDetail": DecisionCriterionDetail,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
};