import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Transition } from "./Transition";
import { Cover } from "./Cover";
import { Game } from './Game';

export function App(){

    return (
    <BrowserRouter>
    <div className=' relative w-full h-screen overflow-hidden'>
        <Transition />
            <Routes>
                <Route index element={<Cover />} />
                <Route path='/game' element={<Game />} />
            </Routes>
        <Cover />
    </div>
    </BrowserRouter>
    )
}