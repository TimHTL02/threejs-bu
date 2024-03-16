import * as THREE from 'three';
import { useEffect, useRef, useState } from 'react';
import { useTransitionStore } from './utils/zustand/useTransitionStore';


export function Game(){

    const {setFading} = useTransitionStore();

    const width = useRef<number>(0);
    const height = useRef<number>(0);
    const camera = useRef<THREE.PerspectiveCamera | null>(null);
    const scene = useRef<THREE.Scene | null>(null);
    const renderer = useRef<THREE.WebGLRenderer | null>(null);

    const container = useRef<HTMLDivElement | null>(null);

    const gameUpdate = () =>{
        renderer.current!.render( scene.current!, camera.current! );
    }

    const counted = useRef<boolean>(false);
    const hasInitialized = useRef<boolean>(false);
    useEffect(() =>{
        if (!container.current)
            return;
        if (counted.current)
            return;
            counted.current = true;


        camera.current = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );
        camera.current.position.z = 1;

        scene.current = new THREE.Scene();

        renderer.current = new THREE.WebGLRenderer( { antialias: true } );
        renderer.current.setSize( window.innerWidth, window.innerHeight );
        renderer.current.setClearColor( 0x8FB1D6 );
        renderer.current.setAnimationLoop( gameUpdate );

        container.current.appendChild(renderer.current.domElement);

        setFading(false, '');
        hasInitialized.current = true;
    }, [container.current])

    useEffect(() =>{
        if (!hasInitialized.current)
            return;

        const onresize = () =>{
            if (!camera.current || !renderer.current)
                return;

            width.current = window.innerWidth;
            height.current = window.innerHeight;
            camera.current!.aspect = width.current / height.current;
            renderer.current!.setSize(width.current, height.current);
        }
        window.addEventListener('resize', onresize);
        onresize();
        return () =>{
            window.removeEventListener('resize', onresize);
        }
    }, [hasInitialized.current])

    useEffect(() =>{
        if (!hasInitialized.current)
            return;

        const geometry = new THREE.PlaneGeometry( 1, 2 );
        const material = new THREE.MeshBasicMaterial( {color: 0xdae1ed, side: THREE.DoubleSide} );
        const plane = new THREE.Mesh( geometry, material );
        plane.rotateX(90);
        scene.current!.add( plane );

    }, [hasInitialized.current])

    return (
        <div ref={container} className=" w-full h-full">

        </div>
    )
}