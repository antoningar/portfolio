export class RobotModel {
    group;

    // string: axe
    // number: trarget coords
    // number: end rotation
    plan;
    step = 0;

    name;
    description;
    title;
    repository;

    basePosition;

    isMoving = true;

    mixer = null;
    danceClip;
    walkClip;
    idleClip;

    constructor(
        group,
        plan,
        name,
        description,
        title,
        animations,
        repository) {
        this.group = group;
        this.plan = plan;
        this.name = name;
        this.description = description;
        this.title = title;
        this.basePosition = Object.assign({}, this.group.position);
        this.walkClip = animations.find(a => a.name === "tvwalk");
        this.danceClip = animations.find(a => a.name === "tvwalk");
        this.idleClip = animations.find(a => a.name === "tvwalk");
        this.group.rotateY(Math.PI);
        this.repository = repository;
    }

    move() {
        if (!this.isMoving) {
            return;
        }

        let currentPlan = this.plan[this.step];
        let currentPositionAxe = (currentPlan[0] === 'z') ? this.group.position.z : this.group.position.x;
        let basePositionAxe = (currentPlan[0] === 'z') ? this.basePosition.z : this.basePosition.x;

        if (Math.abs(Math.round(basePositionAxe) - Math.round(currentPositionAxe)) == Math.round(currentPlan[1])) {
            this.group.rotateY(currentPlan[2] * Math.PI / 180);
            this.step++;
            if (this.step == this.plan.length) {
                this.step = 0;
            }
            currentPlan = this.plan[this.step];
            this.basePosition = Object.assign({}, this.group.position);
        }

        this.group.translateZ(-.05);
    }

    animate(dt) {
        if (this.mixer) this.mixer.update(dt);
    }

    getFaceCameraValues() {
        const RECOIL = 26;

        let currentPlan = this.plan[this.step];
        let cameraPosition = {
            x: this.basePosition.x,
            y: this.basePosition.y + 10,
            z: this.basePosition.z
        };
        let cameraDirection = {
            x: this.basePosition.x,
            y: this.basePosition.y + 5,
            z: this.basePosition.z
        };
        if (currentPlan[0] === 'z') {
            if (this.group.position.z < this.basePosition.z) {
                cameraPosition.z -= RECOIL;

            } else {
                cameraPosition.z += RECOIL;
            }
        } else {
            if (this.group.position.x < this.basePosition.x) {
                cameraPosition.x -= RECOIL;

            } else {
                cameraPosition.x += RECOIL;
            }
        }

        return [cameraPosition, cameraDirection];
    };
}