import { useEffect, useRef, useState } from "react";
import { Entity } from "./gameInitFunctions";
import * as THREE from 'three';
import * as CANNON from 'cannon-es'

export function useGame(props: {container: HTMLDivElement, ui: HTMLDivElement}){
    const width = useRef<number>(0);
    const height = useRef<number>(0);
    const system = useRef<Record<string, Entity>>({});
    const camera = useRef<THREE.PerspectiveCamera | null>(null);
    const scene = useRef<THREE.Scene | null>(null);
    const renderer = useRef<THREE.WebGLRenderer | null>(null);

    const world = useRef<CANNON.World | null>(null);

    const [keyPressed, setKeyPressed] = useState<Record<string, boolean>>({});

    const [isReady, setIsReady] = useState<boolean>(false);

    // GC
    function Exit(){
        camera.current!.remove();
        scene.current!.remove();
        renderer.current!.dispose();
        props.ui.innerHTML = '';
    }

    const [init, setInit] = useState<boolean>(false);
    const counted = useRef<boolean>(false);
    useEffect(() =>{
        if (counted.current)
            return;
        if (!init)
            return;
        if (!props.container)
            return;
        if (!props.ui)
            return;
        counted.current = true;

        // init THREEjs starts
        camera.current = new THREE.PerspectiveCamera( 70, 16 / 9, 0.01, 10 );
        
        camera.current.position.y = 0.5;
        camera.current.position.z = 1;
        camera.current.rotateX(-0.4);

        scene.current = new THREE.Scene();

        renderer.current = new THREE.WebGLRenderer( { antialias: true } );
        renderer.current.setSize( window.innerWidth, window.innerHeight );
        renderer.current.setClearColor( 0x8FB1D6 );

        props.container.appendChild(renderer.current.domElement);

        // init THREEjs ends

        // init CANNONjs starts

        world.current = new CANNON.World();
        world.current.gravity.set(0,-9.81,0);
        world.current.broadphase = new CANNON.NaiveBroadphase();

        // init CANNONjs ends
        
        onresize();
        setIsReady(true);

    }, [init])

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

    // resize window
    useEffect(() =>{
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

    return ({
        width: width,
        height: height,
        system: system.current!,
        camera: camera.current!,
        scene: scene.current!,
        renderer: renderer.current!,
        world: world.current!,
        keyPressed: keyPressed,
        isReady: isReady,
        exit: Exit,
        init: setInit
    })
}