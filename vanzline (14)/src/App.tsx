/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Progress } from './pages/Progress';
import { Timeline } from './pages/Timeline';
import { MaterialRequest } from './pages/MaterialRequest';
import { Personil } from './pages/Personil';
import { Settings } from './pages/Settings';
import { initFirebaseSync } from './store/useStore';

export default function App() {
  useEffect(() => {
    initFirebaseSync();
  }, []);

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<></>} />
          <Route path="progress" element={<Progress />} />
          <Route path="timeline" element={<Timeline />} />
          <Route path="material" element={<MaterialRequest />} />
          <Route path="personil" element={<Personil />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
