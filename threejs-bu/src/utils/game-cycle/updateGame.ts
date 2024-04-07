import * as THREE from 'three';
import * as CANNON from 'cannon-es'
import { Entity, lerp, worldToScreenPosition } from '../gameInitFunctions';
import { RealtimeChannel } from '@supabase/supabase-js';

export function updateGame(scene: THREE.Scene, world: CANNON.World, renderer: THREE.WebGLRenderer, system: Record<string, Entity>, keyPressed: Record<string, boolean>, camera: THREE.PerspectiveCamera, screenSize: {width: number, height: number}, room?: RealtimeChannel){
    Object.values(system).forEach((entity) =>{
        Object.values(entity.components).forEach((component) =>{
            switch (component.id){
                case 'dev_hitbox': {
                    const dev_hitbox = entity.gameObject.dev_hitbox;
                    const hitbox = entity.gameObject.hitbox as CANNON.Body;
                    dev_hitbox.position.copy(hitbox.position);
                    break;
                }
                case 'transform': {
                    const hitbox = entity.gameObject.hitbox as CANNON.Body;
                    const model = entity.gameObject.model;

                    let new_position = {
                        x: lerp(model.position.x, hitbox.position.x, component.time_rotate),
                        y: lerp(model.position.y, hitbox.position.y, component.time_rotate),
                        z: lerp(model.position.z, hitbox.position.z, component.time_rotate)
                    };
                    model.position.set(new_position.x, new_position.y, new_position.z);
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
                    if (component.time_rotate < 1){
                        model.setRotationFromQuaternion(new THREE.Quaternion(
                            lerp(model.quaternion.x, hitbox.quaternion.x, component.time_rotate),
                            lerp(model.quaternion.y, hitbox.quaternion.y, component.time_rotate),
                            lerp(model.quaternion.z, hitbox.quaternion.z, component.time_rotate),
                            lerp(model.quaternion.w, hitbox.quaternion.w, component.time_rotate),
                        ));
                        if (component.time_rotate + 0.01 < 1)
                            component.time_rotate += 0.01;
                    }
                    component.x = hitbox.position.x;
                    component.y = hitbox.position.y;
                    component.z = hitbox.position.z;
                    break;
                }
                case 'sync': {
                    component.t++;
                    if (component.t > 5){
                        const transform = entity.components['transform'];
                        const hitbox = entity.gameObject.hitbox as CANNON.Body;
                        component.t = 0;
                        room!.send({
                            type: 'broadcast',
                            event: 't',
                            payload: {
                                id: entity.id,
                                transform: {
                                    quaternion: {
                                        x: hitbox.quaternion.x,
                                        y: hitbox.quaternion.y,
                                        z: hitbox.quaternion.z,
                                        w: hitbox.quaternion.w
                                    },
                                    time_rotate: transform.time_rotate,
                                    position: {
                                        x: hitbox.position.x,
                                        y: hitbox.position.y,
                                        z: hitbox.position.z
                                    },
                                    scale: transform.scale
                                }
                            },
                        })
                    }
                    break;
                }
                case 'controller': {
                    const transform = entity.components['transform'];
                    const physic = entity.components['physic'];

                    const prev = component.previous;

                    if (keyPressed['ArrowLeft']){
                        physic.vel_x -= 0.1;
                        physic.vel_cam_x -= 0.005;
                        if (!prev['ArrowLeft']){
                            transform.time_rotate = 0;
                        }
                    }
                    if (keyPressed['ArrowRight']){
                        physic.vel_x += 0.1;
                        physic.vel_cam_x += 0.005;
                        if (!prev['ArrowRight']){
                            transform.time_rotate = 0;
                        }
                    }
                    if (keyPressed['ArrowUp']){
                        physic.vel_z -= 0.1;
                        physic.vel_cam_z -= 0.005;
                        if (!prev['ArrowUp']){
                            transform.time_rotate = 0;
                        }
                    }
                    if (keyPressed['ArrowDown']){
                        physic.vel_z += 0.1;
                        physic.vel_cam_z += 0.005;
                        if (!prev['ArrowDown']){
                            transform.time_rotate = 0;
                        }
                    }

                    component.previous = keyPressed;

                    if (physic.static){
                        const normalized_vel = new THREE.Vector3(physic.vel_x, physic.vel_y, physic.vel_z).normalize();
                        var mx = new THREE.Matrix4().lookAt(normalized_vel,new THREE.Vector3(0,0,0),new THREE.Vector3(0,1,0));
                        var qt = new THREE.Quaternion().setFromRotationMatrix(mx);
                        
                        physic.rotate_x = qt.x;
                        physic.rotate_y = qt.y;
                        physic.rotate_z = qt.z;
                        physic.rotate_w = qt.w;
                    }
                    break;
                }
                case 'physic': {
                    const hitbox = entity.gameObject.hitbox as CANNON.Body;

                    if (component.static)
                        hitbox.quaternion.set(component.rotate_x, component.rotate_y, component.rotate_z, component.rotate_w);
                    hitbox.velocity.set(component.vel_x, component.vel_y, component.vel_z);
                    component.vel_x *= 0.8;
                    component.vel_y *= 0.8;
                    component.vel_z *= 0.8;
                    component.vel_cam_x *= 0.95;
                    component.vel_cam_y *= 0.95;
                    component.vel_cam_z *= 0.95;
                    break;
                }
                case 'camera': {
                    const transform = entity.components['transform'];
                    const physic = entity.components['physic'];
                    camera.lookAt(new THREE.Vector3(transform.x, transform.y, transform.z));
                    camera.position.x = transform.x + physic.vel_cam_x;
                    camera.position.y = transform.y + physic.vel_cam_y + 0.4;
                    camera.position.z = transform.z + physic.vel_cam_z + 0.6;
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
    world.step(1 / 30);
    renderer.render( scene, camera );
}