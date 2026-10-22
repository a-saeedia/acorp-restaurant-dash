import { useEffect, useState } from 'react';
import { DemoDock } from './shell/DemoDock';
import { Sidebar, type ScreenId } from './shell/Sidebar';
import { TopBar } from './shell/TopBar';
import { SimulationProvider, useSimulation } from './state/SimulationProvider';
import { Overview } from './screens/Overview';
import { OrdersScreen } from './screens/Orders';
import { KitchenScreen } from './screens/Kitchen';
import { InventoryScreen } from './screens/Inventory';
import { SuppliersScreen } from './screens/Suppliers';
import { AnalyticsScreen } from './screens/Analytics';
import { MarketingScreen } from './screens/Marketing';
import { NotificationPanel } from './screens/NotificationPanel';

function Shell() {
  const [screen, setScreen] = useState<ScreenId>('overview');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { state } = useSimulation();

  /* A freshly submitted demo order is the most interesting thing on screen;
   * surfacing the kitchen keeps the operator in the loop without a modal. */
  useEffect(() => {
    if (state.demoStarted && state.orders.some((order) => order.status === 'preparing')) {
      // no-op: the dock already announces it; kept as the hook for future routing
    }
  }, [state.demoStarted, state.orders]);

  return (
    <div className="app">
      <Sidebar active={screen} onNavigate={setScreen} />
      <div className="app__main">
        <TopBar onOpenNotifications={() => setNotificationsOpen((open) => !open)} />
        <main className="content">
          {screen === 'overview' ? <Overview onNavigate={setScreen} /> : null}
          {screen === 'orders' ? <OrdersScreen /> : null}
          {screen === 'kitchen' ? <KitchenScreen /> : null}
          {screen === 'inventory' ? <InventoryScreen /> : null}
          {screen === 'suppliers' ? <SuppliersScreen /> : null}
          {screen === 'analytics' ? <AnalyticsScreen /> : null}
          {screen === 'marketing' ? <MarketingScreen /> : null}
        </main>
        {notificationsOpen ? (
          <NotificationPanel open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
        ) : null}
        <DemoDock />
      </div>
    </div>
  );
}

export function App() {
  return (
    <SimulationProvider>
      <Shell />
    </SimulationProvider>
  );
}
