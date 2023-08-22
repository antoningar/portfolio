import * as THREE from "three";

export class RobotModel {
    group: THREE.Group;

    // number: step indice
    // string: axe
    // number: trarget coords
    // number: end rotation
    plan: [number, string, number, number][];
    step: number = 0;

    basePosition: any;

    constructor (group: THREE.Group, plan: [number, string, number, number][]){
        this.group = group;
        this.plan = plan;
        this.basePosition = Object.assign({}, this.group.position);
    }

    move(): void {
        let currentPlan: [number, string, number, number] = this.plan[this.step];
        let currentPositionAxe: number = (currentPlan[1] === 'z') ? this.group.position.z : this.group.position.x;
        let basePositionAxe: number = (currentPlan[1] === 'z') ? this.basePosition.z : this.basePosition.x;

        if (Math.abs(Math.round(basePositionAxe) - Math.round(currentPositionAxe)) == Math.round(currentPlan[2])){
            this.group.rotateY(currentPlan[3] * Math.PI / 180);
            this.step++;
            if (this.step == this.plan.length){
                this.step = 0;
            }
            currentPlan = this.plan[this.step];
            this.basePosition = Object.assign({}, this.group.position);
        }
        
        this.group.translateZ(.05);
    }
}