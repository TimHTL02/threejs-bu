import { motion, useAnimate } from "framer-motion";
import { useEffect } from "react";
import { useTransitionStore } from "./utils/zustand/useTransitionStore";
import { useNavigate } from "react-router-dom";
import { GiDeathSkull } from "react-icons/gi";



export function Transition(){

    const [slideScope, slideAnimate] = useAnimate();

    const {fade, navigate} = useTransitionStore();

    const navigateFunction = useNavigate();

    async function SlideCover(){
        slideScope.current.style.display = 'flex';
        await slideAnimate(slideScope.current, {x: -window.innerWidth}, {duration: 0});
        await slideAnimate(slideScope.current, {x: 0}, {ease: 'easeInOut', duration: 1});
        if (navigate !== '')
            navigateFunction(navigate);
    }

    async function SlideOut(){
        slideScope.current.style.display = 'flex';
        await slideAnimate(slideScope.current, {x: window.innerWidth}, {ease: 'easeInOut', duration: 1});
        slideScope.current.style.display = 'none';
    }

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
        <motion.div ref={slideScope} className=" z-50 absolute text-white w-full h-full bg-[#9cbada] select-none justify-center items-center"
            style={{
                display: 'none'
            }}
            initial={{x: -window.innerWidth}}
        >
            <GiDeathSkull className=" text-9xl" />
        </motion.div> 
    )
}