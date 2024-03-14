import { Transition } from "./Transition";
import { Cover } from "./Cover";

export function App(){

    return (
    <div className=' relative w-full h-screen overflow-hidden'>
        <Transition />
        <Cover />
    </div>
    )
}