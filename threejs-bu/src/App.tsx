import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Transition } from "./Transition";
import { Cover } from "./Cover";
import { Lobby } from './scenes/Lobby';

export function App(){

    return (
    <BrowserRouter>
    <div className=' relative w-full h-screen overflow-hidden'>
        <Transition />
            <Routes>
                <Route index element={<Cover />} />
                <Route path='/lobby' element={<Lobby />} />
            </Routes>
        <Cover />
    </div>
    </BrowserRouter>
    )
}