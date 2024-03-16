import * as THREE from 'three';
import { useEffect, useRef, useState } from 'react';
import { useTransitionStore } from './utils/zustand/useTransitionStore';
import { motion } from 'framer-motion';

interface GameObject {
    [key: string]: any
}
type Entity = {
    id: string;
    components: Record<string, Component>;
    gameObject: GameObject;
}

type Component = {
    [key: string]: any
}

function createEntity(id: string){
    const entity: Entity = {
        id: id,
        components: {},
        gameObject: {}
    }
    return entity;
}
function insertComponent(entity: Entity, component: Component){
    entity.components[component.id] = component;
}
function insertEntityToSystem(entity: Entity, system: Record<string, Entity>, scene: THREE.Scene){
    initializeEntity(entity, scene);
    system[entity.id] = entity;
}
function initializeEntity(entity: Entity, scene: THREE.Scene){
    Object.values(entity.components).forEach((component) =>{
        switch (component.id){
            case 'circle_plane': {
                entity.gameObject.model = new THREE.Mesh( new THREE.CircleGeometry( component.radius, component.segments ), new THREE.MeshBasicMaterial( {color: component.color, side: THREE.DoubleSide} ) );
                break;
            }
            case 'box': {
                entity.gameObject.model = new THREE.Mesh( new THREE.BoxGeometry( component.width, component.height, component.depth ), new THREE.MeshBasicMaterial( {color: component.color} ) );
                break;
            }
        }
    })

    // Apply Transform To Model
    if (entity.gameObject.model){
        scene.add(entity.gameObject.model);

        const model = entity.gameObject.model;
        let transform = entity.components['transform'];

        entity.components['transform'] = {
            ...entity.components['transform'],
            x: transform.x ? transform.x : 0,
            y: transform.y ? transform.y : 0,
            z: transform.z ? transform.z : 0,
            rotate_x: transform.rotate_x ? transform.rotate_x : 0,
            rotate_y: transform.rotate_y ? transform.rotate_y : 0,
            rotate_z: transform.rotate_z ? transform.rotate_z : 0,
            scale: transform.scale ? transform.scale : {x: 0, y: 0, z: 0},
            new_x: transform.x ? transform.x : 0,
            new_y: transform.y ? transform.y : 0,
            new_z: transform.z ? transform.z: 0,
            new_rotate_x: transform.rotate_x ? transform.rotate_x : 0,
            new_rotate_y: transform.rotate_y ? transform.rotate_y : 0,
            new_rotate_z: transform.rotate_z ? transform.rotate_z : 0,
            new_scale: transform.scale ? transform.scale : {x: 1, y: 1, z: 1},
            time_position: 0,
            time_rotation: 0,
            time_scale: 0
        };
        transform = entity.components['transform'];
        model.translateX(transform.x);
        model.translateY(transform.y);
        model.translateZ(transform.z);
        model.rotateX(transform.rotate_x);
        model.rotateY(transform.rotate_y);
        model.rotateZ(transform.rotate_z);
        model.scale.set(transform.scale.x, transform.scale.y, transform.scale.z);

    }

}
function lerp(start: number, end: number, t: number) {
    return start * (1 - t) + end * t;
  }
export function Game(){

    const {setFading} = useTransitionStore();

    const system = useRef<Record<string, Entity>>({});

    const width = useRef<number>(0);
    const height = useRef<number>(0);
    const camera = useRef<THREE.PerspectiveCamera | null>(null);
    const scene = useRef<THREE.Scene | null>(null);
    const renderer = useRef<THREE.WebGLRenderer | null>(null);

    const container = useRef<HTMLDivElement | null>(null);

    function updateGame(){

        Object.values(system.current).forEach((entity) =>{
            Object.values(entity.components).forEach((component) =>{
                switch (component.id){
                    case 'transform': {
                        if (!entity.gameObject.model)
                            break;

                        if (component.time_position < 1){
                            component.x = lerp(component.x, component.new_x, component.time_position);
                            component.y = lerp(component.y, component.new_y, component.time_position);
                            component.z = lerp(component.z, component.new_z, component.time_position);
                            component.time_position += 0.1;
                            if (component.time_position > 1)
                                component.time_position = 1;
                            entity.gameObject.model.translateX(component.new_x - component.x);
                            entity.gameObject.model.translateY(component.new_y - component.y);
                            entity.gameObject.model.translateZ(component.new_z - component.z);
                        }
                        if (component.time_rotation < 1){
                            component.rotate_x = lerp(component.rotate_x, component.new_rotate_x, component.time_rotation);
                            component.rotate_y = lerp(component.rotate_y, component.new_rotate_y, component.time_rotation);
                            component.rotate_z = lerp(component.rotate_z, component.new_rotate_z, component.time_rotation);
                            component.time_rotation += 0.1;
                            if (component.time_rotation > 1)
                                component.time_rotation = 1;
                            entity.gameObject.model.rotateX(component.new_rotate_x - component.rotate_x);
                            entity.gameObject.model.rotateY(component.new_rotate_y - component.rotate_y);
                            entity.gameObject.model.rotateZ(component.new_rotate_z - component.rotate_z);
                        }
                        if (component.time_scale < 1){
                            component.scale = {
                                x: lerp(component.scale.x, component.new_scale.x, component.time_scale),
                                y: lerp(component.scale.y, component.new_scale.y, component.time_scale),
                                z: lerp(component.scale.z, component.new_scale.z, component.time_scale)
                            }
                            component.time_scale += 0.1;
                            if (component.time_scale > 1)
                                component.time_scale = 1;
                            entity.gameObject.model.scale.set(component.scale.x, component.scale.y, component.scale.z);
                        }

                        break;
                    }
                }
            })
        })

        renderer.current!.render( scene.current!, camera.current! );
    }

    // init
    const count = useRef<number>(0);
    const hasInitialized = useRef<boolean>(false);
    useEffect(() =>{
        if (!container.current)
            return;
        if (count.current > 0)
            return;
            count.current = 1;


        camera.current = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );
        
        camera.current.position.y = 0.5;
        camera.current.position.z = 1.5;
        camera.current.rotateX(-0.45);

        scene.current = new THREE.Scene();

        renderer.current = new THREE.WebGLRenderer( { antialias: true } );
        renderer.current.setSize( window.innerWidth, window.innerHeight );
        renderer.current.setClearColor( 0x8FB1D6 );

        container.current.appendChild(renderer.current.domElement);

        setFading(false, '');
        hasInitialized.current = true;
    }, [container.current])

    // resize window
    useEffect(() =>{
        if (!hasInitialized.current)
            return;

        const onresize = () =>{
            if (!camera.current || !renderer.current)
                return;

            width.current = window.innerWidth;
            height.current = window.innerHeight;
            
            let currentAspectRatio =  width.current / height.current;
            let aspectRatio = 16 / 9;

            let newWidth = 0;
            let newHeight = 0;
            if (currentAspectRatio > aspectRatio) {
                // The current aspect ratio is wider than 16:9
                newWidth = height.current * aspectRatio;
                newHeight = height.current;
              } else {
                // The current aspect ratio is taller or equal to 16:9
                newWidth = width.current;
                newHeight = width.current / aspectRatio;
              }

            renderer.current!.setSize(newWidth, newHeight);

        }
        window.addEventListener('resize', onresize);
        onresize();
        return () =>{
            window.removeEventListener('resize', onresize);
        }
    }, [hasInitialized.current])

    // GC
    function Exit(){
        camera.current!.remove();
        scene.current!.remove();
        renderer.current!.dispose();
    }

    // add script here
    useEffect(() =>{
        if (!hasInitialized.current)
            return;
        if (count.current > 1)
            return;
        count.current = 2;
        
        let ground = createEntity('ground');
        insertComponent(ground, {
            id: 'transform',
            rotate_x: 90
        });
        insertComponent(ground, {
            id: 'circle_plane',
            radius: 1,
            segments: 16,
            color: 0xdae1ed
        });
        insertEntityToSystem(ground, system.current, scene.current!);

        let player = createEntity('player');
        insertComponent(player, {id: 'transform'});
        insertComponent(player, {
            id: 'box',
            width: 0.1,
            height: 0.1,
            depth: 0.1,
            color: 0x84a6c9
        });
        insertEntityToSystem(player, system.current, scene.current!);

        renderer.current!.setAnimationLoop(updateGame);
    }, [hasInitialized.current])

    return (
        <div className=' relative w-full h-full'>
            <div className=' absolute z-40 w-full h-full p-2 flex justify-start items-start'>
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
                        Exit();
                        setFading(true, '/');
                    }}
                >
                    <p className=' text-sm'>Back</p>
                </motion.div>   
            </div>
            <div ref={container} className=" absolute z-0 w-full h-full bg-[#84a6c9] flex justify-center items-center">

            </div>
        </div>
    )
}