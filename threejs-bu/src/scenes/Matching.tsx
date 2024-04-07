import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useTransitionStore } from '../utils/zustand/useTransitionStore';
import { useGame } from '../utils/useGame';
import { createEntity, insertComponent, insertEntityToSystem } from '../utils/gameInitFunctions';
import { updateGame } from '../utils/game-cycle/updateGame';
import { GameUILayer } from '../utils/GameUILayer';
import { GameContainerLayer } from '../utils/GameContainerLayer';
import { useParams } from 'react-router-dom';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '..';
import { useAccountStore } from '../utils/zustand/useAccountStore';
import { useGMStore } from '../utils/zustand/useGMStore';
import * as CANNON from 'cannon-es'


export function Matching(){

    const {id} = useParams();
    const {setFading} = useTransitionStore();
    const {allowed_players, current_players, room_id, room_name, password, clearGMState} = useGMStore();
    const {account, is_host, setHost} = useAccountStore();

    const [_current_players, _set_current_players] = useState<number>(0);

    const container = useRef<HTMLDivElement | null>(null);
    const ui = useRef<HTMLDivElement | null>(null);

    const {camera, scene, system, renderer, world, keyPressed, isReady, screenSize, isStop, exit, init, stop} = useGame({container: container.current!, ui: ui.current!});

    const room = useRef<RealtimeChannel | null>(null);
    useEffect(() =>{
        if (container.current && ui.current)
            init(true);
    }, [container.current, ui.current])

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

        setFading(false, '');
    }, [isReady])

    useEffect(() =>{
        if (!renderer)
            return;
        if (!isReady)
            return;
        
        if (isStop)
            renderer.setAnimationLoop(null);
        else
            renderer.setAnimationLoop(() => updateGame(scene, world, renderer, system, keyPressed, camera, screenSize, room.current!))
    }, [isReady, scene, world, renderer, system, keyPressed, camera, screenSize, isStop])

    useEffect(() =>{
        if (!is_host)
            return;
        if (!rooms.current)
            return;
        if (_current_players === 0)
            return;

        const f = async() =>{
            console.log(_current_players)
            await rooms.current!.track({
                allowed_players: allowed_players,
                current_players: _current_players,
                room_id: room_id,
                password: password,
                room_name: room_name,
                host_id: account.user_id
            });
        };
        f();
    }, [_current_players])

    const [players, setPlayers] = useState<Record<string, any>>({});
    const rooms = useRef<RealtimeChannel | null>(null);
    useEffect(() =>{
        if (!id)
            return;
        if (!isReady)
            return;
        if (room.current)
            return;

        room.current = supabase.channel(`room_${id}`, {
            config: {
                broadcast: { self: false },
                presence: {
                    key: account.user_id
                },
            },
        });

        if (is_host){
            rooms.current = supabase.channel('rooms', {
                config: {
                    presence: {
                        key: account.user_id
                    },
                },
            });

            rooms.current
            .subscribe(async(status) => {
                if (status !== 'SUBSCRIBED')
                    return;

                _set_current_players(current_players);
            });
        }

        room.current
        .on('presence', { event: 'sync' }, async() => {
            const new_state = room.current!.presenceState();
            let dict = players;
            Object.entries(new_state).forEach(([client, data]) =>{
                dict[client] = data[0];
                setPlayers({... dict});
            })
        })
        .on('presence', { event: 'join' }, async ({ key, newPresences }) => {
            if (is_host){
                _set_current_players((_current_players) => _current_players + 1);
            }

            let player = createEntity(key);
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
                text: newPresences[0].username,
                y: 0.15,
                size: 24,
                color: '#ffffff'
            });
            if (key === account.user_id){
                insertComponent(player, {id: 'physic', static: true});
                insertComponent(player, {id: 'controller'});
                insertComponent(player, {id: 'camera'});
                insertComponent(player, {id: 'sync'});
            }
            await insertEntityToSystem(player, system, scene, world, ui.current!);
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
            let player = players[key];
            if (player){
                if (player.is_host){
                    exit();
                    setHost(false);
                    clearGMState();
                    setFading(true, '/lobby');
                    return;
                }
            }

            if (is_host){
                _set_current_players((_current_players) => _current_players - 1);
            }

            let dict = players;
            delete dict[key];
            setPlayers({...dict});

            let entity = system[key];
            if (!entity)
                return;
            scene.remove(entity.gameObject.model);
            world.removeBody(entity.gameObject.hitbox);
            if (entity.gameObject.text){
                entity.gameObject.text.remove();
            }
            delete system[key];
        })
        .on(
            'broadcast',
            { event: 't' },
            (data) => {
                let entity_id = data.payload.id;
                let entity = system[entity_id];
                if (!entity)
                    return;
                let transform = data.payload.transform;
                let self_transform = entity.components['transform'];
                let hitbox = system[entity_id].gameObject.hitbox as CANNON.Body;
                hitbox.position.set(transform.position.x, transform.position.y, transform.position.z);
                hitbox.quaternion.set(transform.quaternion.x, transform.quaternion.y, transform.quaternion.z, transform.quaternion.w);
                self_transform.scale = transform.scale;
                self_transform.time_rotate = transform.time_rotate;
            }
        )
        .subscribe( async(status) =>{
            if (status !== 'SUBSCRIBED')
                return;

            // initial
            await room.current!.track({
                is_host: is_host,
                username: account.username
            });
        });

        return () => {
            if (room.current){
                room.current.untrack();
                room.current.unsubscribe();
            }
            if (rooms.current){
                rooms.current.untrack();
                rooms.current.unsubscribe();
            }
        }
    }, [isReady])

    return (
        <div className=" relative w-full h-full bg-[#84a6c9] flex justify-center items-center">
            
            <div className='z-20 w-full h-full flex justify-start items-start pointer-events-none p-2'>
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
                    clearGMState();
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