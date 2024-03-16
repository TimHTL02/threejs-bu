import { motion, useAnimate } from "framer-motion";
import { useEffect, useState } from "react";
import { useTransitionStore } from "./utils/zustand/useTransitionStore";
import { useNavigate } from "react-router-dom";



export function Transition(){

    const [slideScope, slideAnimate] = useAnimate();
    const [windowWidth, setWindowWidth] = useState<number>(0);

    const {fade, navigate} = useTransitionStore();

    const navigateFunction = useNavigate();

    async function SlideCover(){
        slideScope.current.style.display = 'block';
        await slideAnimate(slideScope.current, {x: 0}, {ease: 'easeInOut'});
        if (navigate !== '')
            navigateFunction(navigate);
    }

    async function SlideOut(){
        await slideAnimate(slideScope.current, {x: -windowWidth});
        slideScope.current.style.display = 'none';
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

        if (fade){
            SlideCover();
        } else {
            SlideOut();
        }
    }, [slideScope.current, fade])

    return (
        <motion.div ref={slideScope} className=" z-50 absolute w-full h-full bg-[#9cbada] select-none"
            initial={{x: -window.innerWidth}}
        >
            
        </motion.div> 
    )
}