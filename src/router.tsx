import { createBrowserRouter } from 'react-router';
import RootLayout from './layouts/RootLayout';
import GalleryPage from './pages/GalleryPage';
import CollectionPage from './pages/CollectionPage';
import ExhibitionPage from './pages/ExhibitionPage';
import ExhibitionEditPage from './pages/ExhibitionEditPage';
import AboutPage from './pages/AboutPage';
import ArtworkDetailPage from './pages/ArtworkDetailPage';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        
        path: '/',
        element: <GalleryPage />,
        children: [{ path: 'artwork/:id', element: <ArtworkDetailPage /> }],
      },
      {
       
        path: 'collection',
        element: <CollectionPage />,
        children: [{ path: 'artwork/:id', element: <ArtworkDetailPage /> }],
      },
      { path: 'exhibition', element: <ExhibitionPage /> },
      { path: 'exhibition/:id', element: <ExhibitionEditPage /> },
      { path: 'about', element: <AboutPage /> },
    ],
  },
]);