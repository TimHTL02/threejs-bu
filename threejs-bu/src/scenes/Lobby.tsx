import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../utils/useGame';
import { createEntity, insertComponent, insertEntityToSystem } from '../utils/gameInitFunctions';
import { updateGame } from '../utils/updateGame';
import { useAccountStore } from '../utils/zustand/useAccountStore';
import { useTransitionStore } from '../utils/zustand/useTransitionStore';
import { FaHouse } from "react-icons/fa6";

export function Lobby(){

    const {account} = useAccountStore();
    const {setFading} = useTransitionStore();

    const container = useRef<HTMLDivElement | null>(null);
    const ui = useRef<HTMLDivElement | null>(null);

    const {camera, scene, system, renderer, world, keyPressed, isReady, exit, init} = useGame({container: container.current!, ui: ui.current!});

    useEffect(() =>{
        if (container.current && ui.current)
            init(true);
    }, [container.current, ui.current])

    const [openRoomMenu, setOpenRoomMenu] = useState<boolean>(false);

    // add script here
    const counted = useRef<boolean>(false);
    useEffect(() =>{
        if (counted.current)
            return;
        if (!isReady)
            return;
        counted.current = true; 

        let ground = createEntity('ground');
        insertComponent(ground, {id: 'transform', rotate_x: 0});
        insertComponent(ground, {
            id: 'circle_plane',
            radius: 1,
            segments: 16,
            color: 0xdae1ed
        });
        insertEntityToSystem(ground, system, scene, world, ui.current!);

        let player = createEntity('player');
        insertComponent(player, {id: 'transform', y: 0.5});
        insertComponent(player, {
            id: 'box',
            width: 0.1,
            height: 0.1,
            depth: 0.1,
            color: 0x84a6c9
        });
        insertComponent(player, {
            id: 'text',
            text: account.username,
            y: 0.15,
            size: 24,
            color: '#ffffff'
        })
        insertComponent(player, {id: 'physic'});
        insertComponent(player, {id: 'controller'});
        insertComponent(player, {id: 'camera'});
        insertEntityToSystem(player, system, scene, world, ui.current!);

        let lobby = createEntity('lobby');
        insertComponent(lobby, {
            id: 'transform',
            x: 0, y: 0.15, z: -0.8
        })
        insertComponent(lobby, {
            id: 'box',
            width: 0.3,
            height: 0.1,
            depth: 0.1,
            color: 0x84a6c9
        });
        insertComponent(lobby, {
            id: 'text',
            text: 'Lobby',
            y: 0.1,
            size: 24,
            color: '#ffffff',
            onClick: () => setOpenRoomMenu(openRoomMenu => !openRoomMenu)
        })
        insertEntityToSystem(lobby, system, scene, world, ui.current!);

        renderer.setAnimationLoop(() => updateGame(scene, world, renderer, system, keyPressed, camera, window.innerWidth, window.innerHeight));
        setFading(false, '');
    }, [isReady])

    useEffect(() =>{
        console.log(openRoomMenu)
    }, [openRoomMenu])

    return (
        <div className=' relative w-full h-full'>
            <div ref={ui} className=' absolute z-40 w-full h-full p-2 flex justify-start items-start'>
                <motion.div
                    className=" mb-5 text-2xl font-semibold p-1 pl-2 pr-2 border-2 border-white rounded-md select-none text-white cursor-pointer"
                    initial={{ scale: 1, color: "#ffffff" }}
                    whileHover={{ scale: 1.5, color: "#000000" }}
                    transition={{
                    type: "spring",
                    bounce: 0.6,
                    }}
                    whileTap={{ scale: 0.8, rotateZ: 0 }}
                    onClick={() =>{
                        exit();
                        setFading(true, '/');
                    }}
                >
                    <p className=' text-sm'>Back</p>
                </motion.div>   
                <div className=' absolute w-full h-full flex justify-center items-center pointer-events-none'>
                    {
                        openRoomMenu ?
                        <div className=' pointer-events-auto w-full md:w-1/2 p-1 pl-4 pr-4 flex flex-col justify-center items-center bg-[#283543] text-white rounded-md'>
                            <FaHouse />
                            <p className=' font-semibold text-xl'>Room Menu</p>
                            <div className='w-full inline-flex justify-start'>
                                <div className=' p-1 bg-[#425366] rounded-md cursor-pointer hover:opacity-80'>
                                    Create Room
                                </div>
                            </div>
                            <div className=' p-1 bg-[#425366] rounded-md cursor-pointer hover:opacity-80'
                                onClick={() =>{
                                    setOpenRoomMenu(!openRoomMenu);
                                }}
                            >
                                Close
                            </div>
                        </div>
                        : <></>
                    }
                </div>
            </div>
            <div ref={container} className=" absolute z-0 w-full h-full bg-[#84a6c9] flex justify-center items-center">

            </div>
        </div>
    )
}