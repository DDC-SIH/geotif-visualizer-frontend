import './App.css'
import MapComponent from './components/MapArea'
import { GeoDataProvider } from './contexts/GeoDataProvider';
// import MenuArea from './components/MenuArea';
import MapSideBar from './components/Sidebar/MapSideBar';
import { Dialog } from './components/ui/dialog';
// import LayerDialog from './components/LayerDialog';

function App() {

  return (
    <div className='relative flex'>
      <Dialog>
      <GeoDataProvider>
        <MapComponent />
        <MapSideBar/>
        {/* <TimelineSlider/> */}
        {/* <LayerDialog/> */}
      </GeoDataProvider>
      </Dialog>
    </div>
  )
}

export default App
