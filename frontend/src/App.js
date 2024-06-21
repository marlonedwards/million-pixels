import logo from './logo.svg';
import './App.css';

import 'react-image-crop/dist/ReactCrop.css';
import Crop from './components/Crop';
import './components/Crop.css';
import CropComponent from './components/Crop';

import { canvasPreview } from './components/canvasPreview.ts';
import { useDebounceEffect } from './components/useDebounceEffects.ts';


function App() {
  return (
    <div className="App">
      
        <Crop/>
    </div>
  );
}

export default App;
