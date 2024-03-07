import { motion, useAnimate } from "framer-motion";
import { useEffect, useState } from "react";



export function Transition(){

    const [slideScope, slideAnimate] = useAnimate();
    const [windowWidth, setWindowWidth] = useState<number>(0);

    async function SlideCover(){
        await slideAnimate(slideScope.current, {x: 0});
    }

    async function SlideOut(){
        await slideAnimate(slideScope.current, {x: -windowWidth});
    }

    useEffect(() =>{
        const onresize = () =>{
            setWindowWidth(window.innerWidth);
        }
        window.addEventListener('resize', onresize);
        onresize();

        return () =>{
            window.removeEventListener('resize', onresize);
        }
    }, [])

    useEffect(() =>{
        if (!slideScope.current)
            return;

        SlideOut();
    }, [slideScope.current])

    return (
        <motion.div ref={slideScope} className=" z-50 absolute w-full h-full bg-[#67829f] select-none"
            initial={{x: -window.innerWidth}}
        >
            
        </motion.div> 
    )
}