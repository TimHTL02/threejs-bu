import { useEffect, useRef, useState } from 'react';
import { motion, useAnimate } from 'framer-motion';
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

    const {camera, scene, system, renderer, world, keyPressed, isReady, screenSize, isStop, exit, init, stop} = useGame({container: container.current!, ui: ui.current!});

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
        
        if (isStop)
            renderer.setAnimationLoop(null);
        else
            renderer.setAnimationLoop(() => updateGame(scene, world, renderer, system, keyPressed, camera, screenSize))
    }, [isReady, scene, world, renderer, system, keyPressed, camera, screenSize, isStop])

    const [menuType, setMenuType] = useState<string>('all')
    const [roomMenuScope, roomMenuAnimate] = useAnimate();

    const [roomPlayers, setRoomPlayers] = useState<number>(2);

    async function OpenRoomMenuAnimation(){
        roomMenuScope.current.style.display = 'flex';
        roomMenuScope.current.style.opacity = '0';
        await roomMenuAnimate(roomMenuScope.current, {opacity: 1});
    }

    async function CloseRoomMenuAnimation(){
        roomMenuScope.current.style.display = 'flex';
        roomMenuScope.current.style.opacity = '1';
        await roomMenuAnimate(roomMenuScope.current, {opacity: 0});
        roomMenuScope.current.style.display = 'none';
    }

    useEffect(() =>{

        if (openRoomMenu){
            stop(true);
            OpenRoomMenuAnimation();
        } else{
            stop(false);
            CloseRoomMenuAnimation();
        }

    }, [openRoomMenu])

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
                    }}
                >
                    Back
                </motion.div>
            </div>

            <div className=' z-20 w-full h-full absolute flex justify-center items-center select-none pointer-events-none'>
                
                <motion.div ref={roomMenuScope} className=' w-full h-full bg-[#273457] pointer-events-auto p-2 flex-col justify-start items-start gap-3'
                    initial={{opacity: 0}}
                    style={{
                        display: 'none'
                    }}
                >
                    <div className=' w-full flex justify-between items-center text-white font-semibold'>
                        <div className='inline-flex justify-start items-center gap-2'>
                            <div className=' p-1 pl-2 pr-2 rounded-sm cursor-pointer bg-opacity-50'
                                style={{
                                    background: menuType === 'all' ? '#d5d3b8': '#8c96b0'
                                }}
                                onClick={() =>{
                                    setMenuType('all');
                                }}
                            >
                                All Rooms
                            </div>
                            <div className=' p-1 pl-2 pr-2 rounded-sm cursor-pointer bg-opacity-50'
                                style={{
                                    background: menuType === 'create' ? '#d5d3b8': '#8c96b0'
                                }}
                                onClick={() =>{
                                    setMenuType('create')
                                }}
                            >
                                Create New Room
                            </div>
                        </div>
                        <div className=' p-1 pl-2 pr-2 bg-[#8c96b0] rounded-sm cursor-pointer hover:bg-[#9da7bd] bg-opacity-50'
                            onClick={() =>{
                                setOpenRoomMenu(false);
                            }}
                        >
                            Close
                        </div>
                    </div>
                    <hr className=' w-full border-[#6b738a]' />

                    {
                        menuType === 'all' ?
                        <div className=' w-full grid grid-cols-5 text-white font-semibold'>
                            <div className='bg-[#8c96b0] rounded-sm p-2 min-h-[150px] flex flex-col justify-start items-start cursor-pointer hover:bg-[#9da7bd] bg-opacity-50'>
                                <div className='w-full inline-flex justify-between items-center'>
                                    <p>Room Name</p>
                                    <p>1 / 4</p>
                                </div>
                                <hr className=' mt-1 w-full border-[#6b738a]' />
                                <div className=' mt-2 w-full grid grid-cols-5 gap-2'>
                                    <div className='p-2 rounded-full w-[40px] h-[40px] bg-[#646e86] border-white border inline-flex justify-center items-center'>
                                        <p>s</p>
                                    </div>
                                    <div className='p-2 rounded-full w-[40px] h-[40px] bg-[#646e86] border-white border inline-flex justify-center items-center'>
                                        <p>s</p>
                                    </div>
                                    <div className='p-2 rounded-full w-[40px] h-[40px] bg-[#646e86] border-white border inline-flex justify-center items-center'>
                                        <p>s</p>
                                    </div>
                                    <div className='p-2 rounded-full w-[40px] h-[40px] bg-[#646e86] border-white border inline-flex justify-center items-center'>
                                        <p>s</p>
                                    </div>
                                </div>
                            </div>
                        </div> :
                        <div className=' w-full flex justify-center items-center'>
                            <div className=' w-1/3 p-2 bg-[#8c96b0] gap-2 flex flex-col justify-start items-start font-semibold text-white'>
                                <p>Room Name</p>
                                <input className=' w-full p-1 rounded-sm text-black' />
                                <p>Allowed Players</p>
                                <input type='number' value={roomPlayers} className=' w-full p-1 rounded-sm text-black'
                                    onChange={(e) =>{
                                        let val = parseInt(e.target.value);
                                        if (val < 2)
                                            val = 2;
                                        if (val > 4)
                                            val = 4;
                                        setRoomPlayers(val);
                                    }}
                                />
                                <div className=' mt-5 cursor-pointer hover:opacity-80 w-full inline-flex justify-center items-center p-2 bg-[#273457]'>
                                    Create
                                </div>
                            </div>
                        </div>
                    }

                </motion.div>
            </div>

            <GameUILayer forwardedRef={ui} width={screenSize.width} height={screenSize.height} />
            <GameContainerLayer forwardRef={container} />
        </div>
    )
}