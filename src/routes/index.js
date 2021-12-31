import { useRoutes } from 'react-router-dom';
import DashboardRoutes from './DashboardRoutes';
import MainRoutes from './MainRoutes';
import config from 'config';

export default function ThemeRoutes() {
    return useRoutes([MainRoutes, DashboardRoutes], config.basename);
}
