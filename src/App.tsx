import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Inbox } from './pages/Inbox';
import { Drafts } from './pages/Drafts';
import { Followups } from './pages/Followups';
import { Analytics } from './pages/Analytics';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Inbox />} />
          <Route path="/drafts" element={<Drafts />} />
          <Route path="/followups" element={<Followups />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}