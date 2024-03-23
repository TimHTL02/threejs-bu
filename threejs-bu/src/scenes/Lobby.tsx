import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../utils/useGame';
import { createEntity, downloadFile, insertComponent, insertEntityToSystem } from '../utils/gameInitFunctions';
import { updateGame } from '../utils/game-cycle/updateGame';
import { useAccountStore } from '../utils/zustand/useAccountStore';
import { useTransitionStore } from '../utils/zustand/useTransitionStore';
import { GameUILayer } from '../utils/GameUILayer';
import { GameContainerLayer } from '../utils/GameContainerLayer';
import { loader } from '../utils/game-cycle/initializeEntity';

export function Lobby(){

    const {account} = useAccountStore();
    const {setFading} = useTransitionStore();

    const container = useRef<HTMLDivElement | null>(null);
    const ui = useRef<HTMLDivElement | null>(null);

    const {camera, scene, system, renderer, world, keyPressed, isReady, screenSize, exit, init} = useGame({container: container.current!, ui: ui.current!});

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

        const f = async() =>{
            let ground = createEntity('ground');
            insertComponent(ground, {id: 'transform', rotate_x: 0});
            insertComponent(ground, {
                id: 'circle_plane',
                radius: 1,
                segments: 16,
                color: 0xdae1ed
            });
            await insertEntityToSystem(ground, system, scene, world, ui.current!);
    
            let player = createEntity('player');
            insertComponent(player, {id: 'transform', y: 0.5});
            insertComponent(player, {
                id: 'model',
                bucket: 'characters',
                file: 'players/knight3.glb',
                scale: {x: 0.001, y: 0.001, z: 0.001}
            })
            insertComponent(player, {
                id: 'hitbox',
                width: 0.1,
                height: 0.1,
                depth: 0.1
            });
            insertComponent(player, {
                id: 'text',
                text: account.username,
                y: 0.15,
                size: 24,
                color: '#ffffff'
            })
            insertComponent(player, {id: 'physic', static: true});
            insertComponent(player, {id: 'controller'});
            insertComponent(player, {id: 'camera'});
            await insertEntityToSystem(player, system, scene, world, ui.current!);

            let lobby = createEntity('lobby');
            insertComponent(lobby, {
                id: 'transform',
                x: 0, y: 0.45, z: -0.5
            })
            insertComponent(lobby, {
                id: 'box',
                width: 0.3,
                height: 0.1,
                depth: 0.1,
                color: 0x84a6c9
            });
            insertComponent(lobby, {id: 'physic'});
            insertComponent(lobby, {
                id: 'text',
                text: 'Lobby',
                y: 0.1,
                size: 24,
                color: '#ffffff',
                onClick: () => setOpenRoomMenu(openRoomMenu => !openRoomMenu)
            })
            await insertEntityToSystem(lobby, system, scene, world, ui.current!);
    
            setFading(false, '');
        };
        f();
    }, [isReady])

    useEffect(() =>{
        if (!isReady)
            return;
        
        renderer.setAnimationLoop(() => updateGame(scene, world, renderer, system, keyPressed, camera, screenSize))
    }, [isReady, scene, world, renderer, system, keyPressed, camera, screenSize])

    return (
        <div className=" relative w-full h-full bg-[#84a6c9] flex justify-center items-center">
            
            <div className=' z-20 w-full h-full flex justify-start items-start pointer-events-none p-2'>
                <motion.div className=" pointer-events-auto text-sm font-semibold p-1 pl-2 pr-2 border-2 border-white rounded-md select-none text-white cursor-pointer"
                initial={{ scale: 1, color: "#ffffff" }}
                whileHover={{ scale: 1.2, color: "#000000" }}
                transition={{
                  type: "spring",
                  bounce: 0.6,
                }}
                whileTap={{ scale: 0.8, rotateZ: 0 }}
                onClick={() =>{
                    exit();
                    setFading(true, '/');
                }}>
                    Back
                </motion.div>
            </div>

            <GameUILayer forwardedRef={ui} width={screenSize.width} height={screenSize.height} />
            <GameContainerLayer forwardRef={container} />
        </div>
    )
}