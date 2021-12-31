import { lazy } from 'react';
import Loadable from 'ui-component/Loadable';
import MinimalLayout from 'layout/MinimalLayout';

const Trading = Loadable(lazy(() => import('views/trading/Trading')));

const MainRoutes = {
    path: '/',
    element: <MinimalLayout />,
    children: [
        {
            path: '/',
            element: <Trading />
        }
    ]
};

export default MainRoutes;
