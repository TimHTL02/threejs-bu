import * as THREE from 'three';
import * as CANNON from 'cannon-es'
import { useEffect, useRef, useState } from 'react';
import { useTransitionStore } from './utils/zustand/useTransitionStore';
import { motion } from 'framer-motion';
import { useAccountStore } from './utils/zustand/useAccountStore';

type GameObject = {
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
function insertEntityToSystem(entity: Entity, system: Record<string, Entity>, scene: THREE.Scene, world: CANNON.World, ui: HTMLDivElement){
    initializeEntity(entity, scene, world, ui);
    system[entity.id] = entity;
}
function initializeEntity(entity: Entity, scene: THREE.Scene, world: CANNON.World, ui: HTMLDivElement){
    let transform = entity.components['transform'];
    let _scale = {x: 1, y: 1, z: 1};
    if (transform.scale){
        _scale = transform.scale;
    }

    Object.values(entity.components).forEach((component) =>{
        switch (component.id){
            case 'circle_plane': {
                entity.gameObject.model = new THREE.Mesh( new THREE.CylinderGeometry(component.radius * _scale.x, component.radius * _scale.x, 0.2, component.segments), new THREE.MeshBasicMaterial( {color: component.color, side: THREE.DoubleSide} ) );
                const circle_plane = new CANNON.Body({mass: 0})
                circle_plane.addShape(new CANNON.Cylinder(component.radius * _scale.x, component.radius * _scale.x, 0.2, component.segments));
                circle_plane.shapes[0].material = new CANNON.Material({friction: 0});;
                entity.gameObject.hitbox = circle_plane;
                break;
            }
            case 'box': {
                entity.gameObject.model = new THREE.Mesh( new THREE.BoxGeometry( component.width, component.height, component.depth ), new THREE.MeshBasicMaterial( {color: component.color} ) );
                const box = new CANNON.Body({mass: 0})
                box.fixedRotation = true;
                box.addShape(new CANNON.Box(new CANNON.Vec3(component.width * _scale.x * 0.5, component.height * _scale.y * 0.5, component.depth * _scale.z * 0.5)));
                box.shapes[0].material = new CANNON.Material({friction: 0});
                entity.gameObject.hitbox = box;
                break;
            }
            case 'physic': {
                if (!entity.gameObject.hitbox)
                    break;
                component.vel_x = 0;
                component.vel_y = 0;
                component.vel_z = 0;

                let hitbox = entity.gameObject.hitbox as CANNON.Body;
                hitbox.mass = component.mass ? component.mass : 1;
                hitbox.type = CANNON.Body.DYNAMIC;
                hitbox.updateMassProperties();
                break;
            }
            case 'text': {
                component.x = component.x ? component.x : 0;
                component.y = component.y ? component.y : 0;
                component.z = component.z ? component.z : 0;
                component.size = component.size ? component.size : 12;
                component.screen_x = component.text.length * component.size * -0.2;
                let text = document.createElement('p');
                text.innerText = component.text;
                text.style.position = 'absolute';
                text.style.left = '0px';
                text.style.top = '0px';
                text.style.fontSize = `${component.size}px`;
                text.style.color = component.color ? component.color : '#000000';
                text.style.userSelect = 'none';
                if (component.onClick){
                    text.style.cursor = 'pointer';
                    text.onclick = component.onClick;
                }
                ui.appendChild(text);
                entity.gameObject.text = text;
            }
        }
    })

    // Apply Transform To Model
    if (entity.gameObject.model){
        scene.add(entity.gameObject.model);

        const model = entity.gameObject.model;

        entity.components['transform'] = {
            ...entity.components['transform'],
            x: transform.x ? transform.x : 0,
            y: transform.y ? transform.y : 0,
            z: transform.z ? transform.z : 0,
            rotate_x: transform.rotate_x ? transform.rotate_x : 0,
            rotate_y: transform.rotate_y ? transform.rotate_y : 0,
            rotate_z: transform.rotate_z ? transform.rotate_z : 0,
            scale: _scale,
            time_scale: 0
        };
        transform = entity.components['transform'];
        model.translateX(transform.x);
        model.translateY(transform.y);
        model.translateZ(transform.z);
        model.rotateX(transform.rotate_x);
        model.rotateY(transform.rotate_y);
        model.rotateZ(transform.rotate_z);
        model.scale.set(0, 0, 0);

    }

    if (entity.gameObject.hitbox){
        world.addBody(entity.gameObject.hitbox);

        const transform = entity.components['transform'];
        const hitbox = entity.gameObject.hitbox as CANNON.Body;
        hitbox.position.set(transform.x, transform.y, transform.z);
        hitbox.quaternion.setFromEuler(transform.rotate_x, transform.rotate_y, transform.rotate_z);

    }

}
function lerp(start: number, end: number, t: number) {
    return start * (1 - t) + end * t;
}
function worldToScreenPosition(width: number, height: number, x: number, y: number, z: number, camera: THREE.PerspectiveCamera){
    let widthHalf = width / 2;
    let heightHalf = height / 2;
    
    let pos = new THREE.Vector3(x, y, z);
    pos.project(camera);
    pos.x = ( pos.x * widthHalf ) + widthHalf;
    pos.y = - ( pos.y * heightHalf ) + heightHalf;
    return pos;
}
const TIME_STEP = 1/60;

function updateGame(scene: THREE.Scene, world: CANNON.World, renderer: THREE.WebGLRenderer, system: Record<string, Entity>, keyPressed: Record<string, boolean>, camera: THREE.PerspectiveCamera, width: number, height: number){

    Object.values(system).forEach((entity) =>{
        Object.values(entity.components).forEach((component) =>{
            switch (component.id){
                case 'transform': {
                    const hitbox = entity.gameObject.hitbox as CANNON.Body;
                    const model = entity.gameObject.model;

                    model.position.copy(hitbox.position);
                    model.quaternion.copy(hitbox.quaternion);
                    if (component.time_scale < 1){
                        let new_scale = {
                            x: lerp(model.scale.x, component.scale.x, component.time_scale),
                            y: lerp(model.scale.y, component.scale.y, component.time_scale),
                            z: lerp(model.scale.z, component.scale.z, component.time_scale)
                        };
                        model.scale.set(new_scale.x, new_scale.y, new_scale.z);
                        if (component.time_scale + 0.05 < 1)
                            component.time_scale += 0.05;
                    }
                    component.x = hitbox.position.x;
                    component.y = hitbox.position.y;
                    component.z = hitbox.position.z;
                    break;
                }
                case 'controller': {
                    const physic = entity.components['physic'];
                    if (keyPressed['ArrowLeft'])
                        physic.vel_x -= 0.1;
                    if (keyPressed['ArrowRight'])
                        physic.vel_x += 0.1;
                    if (keyPressed['ArrowUp'])
                        physic.vel_z -= 0.1;
                    if (keyPressed['ArrowDown'])
                        physic.vel_z += 0.1;
                    break;
                }
                case 'physic': {
                    const hitbox = entity.gameObject.hitbox as CANNON.Body;
                    hitbox.velocity.set(component.vel_x, component.vel_y, component.vel_z);
                    component.vel_x *= 0.8;
                    component.vel_y *= 0.8;
                    component.vel_z *= 0.8;
                    break;
                }
                case 'camera': {
                    const transform = entity.components['transform'];
                    camera.lookAt(new THREE.Vector3(transform.x, transform.y, transform.z));
                    camera.position.set(transform.x, transform.y + 0.5, transform.z + 0.5)
                    break;
                }
                case 'text': {
                    const transform = entity.components['transform'];
                    let pos = worldToScreenPosition(width, height, transform.x + component.x, transform.y + component.y, transform.z + component.z, camera);
                    const text = entity.gameObject.text as HTMLParagraphElement;
                    text.style.left = `${pos.x + component.screen_x}px`;
                    text.style.top = `${pos.y}px`;
                }
            }
        })
    })

    world.step(TIME_STEP);
    renderer.render( scene, camera );
}

export function Game(){

    const {account} = useAccountStore();
    const {setFading} = useTransitionStore();

    const system = useRef<Record<string, Entity>>({});

    const width = useRef<number>(0);
    const height = useRef<number>(0);
    const camera = useRef<THREE.PerspectiveCamera | null>(null);
    const scene = useRef<THREE.Scene | null>(null);
    const renderer = useRef<THREE.WebGLRenderer | null>(null);

    const world = useRef<CANNON.World | null>(null);
    const container = useRef<HTMLDivElement | null>(null);
    const ui = useRef<HTMLDivElement | null>(null);

    const [keyPressed, setKeyPressed] = useState<Record<string, boolean>>({});

    const [openLobby, setOpenLobby] = useState<boolean>(false);

    // init
    const count = useRef<number>(0);
    useEffect(() =>{
        if (!container.current)
            return;
        if (count.current !== 0)
            return;
            count.current = 1;

        
        // init THREEjs starts
        camera.current = new THREE.PerspectiveCamera( 70, 16 / 9, 0.01, 10 );
        
        camera.current.position.y = 0.5;
        camera.current.position.z = 1;
        camera.current.rotateX(-0.4);

        scene.current = new THREE.Scene();

        renderer.current = new THREE.WebGLRenderer( { antialias: true } );
        renderer.current.setSize( window.innerWidth, window.innerHeight );
        renderer.current.setClearColor( 0x8FB1D6 );

        container.current.appendChild(renderer.current.domElement);

        // init THREEjs ends

        // init CANNONjs starts

        world.current = new CANNON.World();
        world.current.gravity.set(0,-9.81,0);
        world.current.broadphase = new CANNON.NaiveBroadphase();

        // init CANNONjs ends

        setFading(false, '');

    }, [container.current])

    // resize window
    useEffect(() =>{

        const onresize = () =>{
            if (!renderer.current)
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
        const onkeydown = (e: KeyboardEvent) => {
            let dict = keyPressed;
            dict[e.key] = true;
            setKeyPressed({...dict});
        }
        const onkeyup = (e: KeyboardEvent) => {
            let dict = keyPressed;
            delete dict[e.key];
            setKeyPressed({...dict});
        }
        window.addEventListener('resize', onresize);
        window.addEventListener('keydown', onkeydown);
        window.addEventListener('keyup', onkeyup);
        onresize();
        return () =>{
            window.removeEventListener('resize', onresize);
            window.removeEventListener('keydown', onkeydown);
            window.removeEventListener('keyup', onkeyup);
        }
    }, [])

    // GC
    function Exit(){
        camera.current!.remove();
        scene.current!.remove();
        renderer.current!.dispose();
        ui.current!.innerHTML = '';
    }

    // add script here
    useEffect(() =>{
        if (count.current !== 1)
            return;
        count.current = 2;
        
        let ground = createEntity('ground');
        insertComponent(ground, {id: 'transform', rotate_x: 0});
        insertComponent(ground, {
            id: 'circle_plane',
            radius: 1,
            segments: 16,
            color: 0xdae1ed
        });
        insertEntityToSystem(ground, system.current, scene.current!, world.current!, ui.current!);

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
        insertEntityToSystem(player, system.current, scene.current!, world.current!, ui.current!);

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
            onClick: () =>{
                setOpenLobby(true);
            }
        })
        insertEntityToSystem(lobby, system.current, scene.current!, world.current!, ui.current!);


        renderer.current!.setAnimationLoop(() => updateGame(scene.current!, world.current!, renderer.current!, system.current!, keyPressed, camera.current!, width.current!, height.current!));
    }, [count.current])


    useEffect(() =>{
        console.log(openLobby);
    }, [openLobby])

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
                        Exit();
                        setFading(true, '/');
                    }}
                >
                    <p className=' text-sm'>Back</p>
                </motion.div>   
                <div className=' absolute w-full h-full flex justify-center items-center pointer-events-none'>

                </div>
            </div>
            <div ref={container} className=" absolute z-0 w-full h-full bg-[#84a6c9] flex justify-center items-center">

            </div>
        </div>
    )
}