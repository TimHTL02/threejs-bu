import * as THREE from 'three';
import * as CANNON from 'cannon-es'
import { Entity, lerp, worldToScreenPosition } from './gameInitFunctions';

export function updateGame(scene: THREE.Scene, world: CANNON.World, renderer: THREE.WebGLRenderer, system: Record<string, Entity>, keyPressed: Record<string, boolean>, camera: THREE.PerspectiveCamera, screenSize: {width: number, height: number}){
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
                    let pos = worldToScreenPosition(screenSize.width, screenSize.height, transform.x + component.x, transform.y + component.y, transform.z + component.z, camera);
                    const text = entity.gameObject.text as HTMLParagraphElement;
                    text.style.left = `${pos.x + component.screen_x}px`;
                    text.style.top = `${pos.y}px`;
                }
            }
        })
    })

    world.step(1 / 60);
    renderer.render( scene, camera );
}