import logo from './logo.svg';
import './App.css';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import * as Pages from './pages';

import 'react-image-crop/dist/ReactCrop.css';
import Crop from './components/Crop';
import './components/Crop.css';
import CropComponent from './components/Crop';
import CanvasComponent from './components/CanvasComponent.js';

import { canvasPreview } from './components/canvasPreview.ts';
import { useDebounceEffect } from './components/useDebounceEffects.ts';

// function App() {
//   return (
//     <div className="App">
//         <CanvasComponent/>
//         <Crop/>
//     </div>
//   );
// }

// export default App;

export default function App() {
    return (
      <BrowserRouter>
        <Routes>
            <Route path="/" element={<Pages.Canvas />} />
            <Route path="/purchase-pixels/:row_col" element={<Pages.Purchase />} />
        </Routes>
      </BrowserRouter>
    )
}