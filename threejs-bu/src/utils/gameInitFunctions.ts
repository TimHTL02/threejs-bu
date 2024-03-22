import * as THREE from 'three';
import * as CANNON from 'cannon-es'
import { initializeEntity } from './initializeEntity';

export type GameObject = {
    [key: string]: any
}
export type Entity = {
    id: string;
    components: Record<string, Component>;
    gameObject: GameObject;
}

export type Component = {
    [key: string]: any
}

export function createEntity(id: string){
    const entity: Entity = {
        id: id,
        components: {},
        gameObject: {}
    }
    return entity;
}
export function insertComponent(entity: Entity, component: Component){
    entity.components[component.id] = component;
}
export function insertEntityToSystem(entity: Entity, system: Record<string, Entity>, scene: THREE.Scene, world: CANNON.World, ui: HTMLDivElement){
    initializeEntity(entity, scene, world, ui);
    system[entity.id] = entity;
}
export function lerp(start: number, end: number, t: number) {
    return start * (1 - t) + end * t;
}
export function worldToScreenPosition(width: number, height: number, x: number, y: number, z: number, camera: THREE.PerspectiveCamera){
    let widthHalf = width / 2;
    let heightHalf = height / 2;
    
    let pos = new THREE.Vector3(x, y, z);
    pos.project(camera);
    pos.x = ( pos.x * widthHalf ) + widthHalf;
    pos.y = - ( pos.y * heightHalf ) + heightHalf;
    return pos;
}