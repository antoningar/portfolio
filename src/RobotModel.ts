import * as THREE from "three";

export class RobotModel {
    group: THREE.Group;

    // string: axe
    // number: trarget coords
    // number: end rotation
    plan: [string, number, number][];
    step: number = 0;

    name: string;
    description: string;

    basePosition: any;

    isMoving: boolean = true;

    mixer: THREE.AnimationMixer | null = null;
    danceClip: THREE.AnimationClip;
    walkClip: THREE.AnimationClip;

    constructor (
        group: THREE.Group,
        plan: [string, number, number][],
        name: string,
        description: string,
        walkClip: THREE.AnimationClip,
        danceClip: THREE.AnimationClip ){
            this.group = group;
            this.plan = plan;
            this.name = name;
            this.description = description;
            this.basePosition = Object.assign({}, this.group.position);
            this.walkClip = walkClip;
            this.danceClip = danceClip;
        }

    move(): void {
        if (!this.isMoving){
            return;
        }

        let currentPlan: [string, number, number] = this.plan[this.step];
        let currentPositionAxe: number = (currentPlan[0] === 'z') ? this.group.position.z : this.group.position.x;
        let basePositionAxe: number = (currentPlan[0] === 'z') ? this.basePosition.z : this.basePosition.x;

        if (Math.abs(Math.round(basePositionAxe) - Math.round(currentPositionAxe)) == Math.round(currentPlan[1])){
            this.group.rotateY(currentPlan[2] * Math.PI / 180);
            this.step++;
            if (this.step == this.plan.length){
                this.step = 0;
            }
            currentPlan = this.plan[this.step];
            this.basePosition = Object.assign({}, this.group.position);
        }
        
        this.group.translateZ(.05);
    }

    animate(dt: number): void {
        if (this.mixer) this.mixer.update(dt);
    }

    getFaceCameraValues(): [any, any]{
        const RECOIL: number = 20;

        let currentPlan: [string, number, number] = this.plan[this.step];
        let cameraPosition = {
            x: this.basePosition.x,
            y: this.basePosition.y,
            z: this.basePosition.z
        };
        let cameraDirection = {
            x: this.basePosition.x,
            y: this.basePosition.y + 7,
            z: this.basePosition.z
        };
        if (currentPlan[0] === 'z') {
            if (this.group.position.z < this.basePosition.z) {
                cameraPosition.z -= RECOIL;

            } else {
                cameraPosition.z += RECOIL;
            }
        }
        else {
            if (this.group.position.x < this.basePosition.x) {
                cameraPosition.x -= RECOIL;
                
            } else {
                cameraPosition.x += RECOIL;
            }
        }

        return [cameraPosition, cameraDirection];
    };
}