import * as THREE from 'three'
import { OrbitControls } from "https://unpkg.com/three@0.157.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://unpkg.com/three@0.157.0/examples/jsm/loaders/GLTFLoader.js";

import { RobotModel } from "./RobotModel.js";
import { ROBOTS } from "./robots.js";


const currentWindow = window
const gsap = currentWindow.gsap;

let container, clock;
let camera, scene, renderer, model;
let models = [];

let control;
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

let modal = document.getElementById("modal");
let modalTitle = document.getElementById("label-title");
let modalLabel = document.getElementById("label");

//x=width(left/right)
//y=height(top/bottom)
//z=zoom(in/out)
const CameraInitialPosition = {
    x: 25,
    y: 20,
    z: 40
}

const CameraInitialDirection = {
    x: 0,
    y: 0,
    z: 0
}

function init() {
    container = document.createElement("div");
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.25,
        100
    );
    camera.position.set(
        CameraInitialPosition.x,
        CameraInitialPosition.y,
        CameraInitialPosition.z);
    camera.lookAt(
        CameraInitialDirection.x,
        CameraInitialDirection.y,
        CameraInitialDirection.z);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe0e0e0);
    scene.fog = new THREE.Fog(0xe0e0e0, 20, 100);

    clock = new THREE.Clock();

    // lights
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 3);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 3);
    dirLight.position.set(0, 20, 10);
    scene.add(dirLight);

    // model
    ROBOTS.forEach((robot) => {
        const loader = new GLTFLoader();
        loader.load(
            robot.filename,
            function(gltf) {
                model = gltf.scene;
                scene.add(model);

                model.translateX(robot.basePosition.x);
                model.translateY(robot.basePosition.y);
                model.translateZ(robot.basePosition.z);

                const name = gltf.parser.json.nodes.slice(-1)[0].name

                let robotModel = new RobotModel(
                    model, robot.plan, name, robot.text, robot.title, gltf.animations)

                launchAnimationClip(robotModel, robotModel.walkClip);
                models.push(robotModel);
            },
            undefined,
            function(e) {
                console.error(e);
            }
        );
    });

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    setControl();

    window.addEventListener("resize", onWindowResize);
}

function setControl() {
    // Camera control
    control = new OrbitControls(camera, renderer.domElement);

    control.screenSpacePanning = false;
    control.enableZoom = false;

    control.maxPolarAngle = Math.PI / 2;
}

function launchAnimationClip(robot, clip) {
    const mixer = new THREE.AnimationMixer(robot.group);
    const action = mixer.clipAction(clip);
    action.clampWhenFinished = true;
    action.play();
    robot.mixer = mixer;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    const dt = clock.getDelta();

    requestAnimationFrame(animate);
    renderer.render(scene, camera);

    models.forEach(model => {
        model.move();
        model.animate(dt);
    });
}

function click(event) {
    // calculate pointer position in normalized device coordinates
    // (-1 to +1) for both components
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // update the picking ray with the camera and pointer position
    raycaster.setFromCamera(pointer, camera);
    // calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(scene.children);

    for (let i = 0; i < intersects.length; i++) {
        const robotName = getRobotName(intersects[i].object);
        if (robotName) {
            return onClickRobot(robotName);
        }
    }
}

function getRobotName(obj) {
    let currentName = obj.name;
    while (currentName !== "RootNode") {
        if (models.find(r => r.name === currentName)) {
            return currentName;
        } else {
            if (obj.parent) {
                return getRobotName(obj.parent);
            } else {
                return "";
            }
        }
    }
    return "";
}

function printDescription(description, title) {
    modal.style.display = "block";
    modalLabel.innerHTML = description;
    modalTitle.innerHTML = title;
}

function moveCamera(position, direction) {
    gsap.to(camera.position, {
        x: position.x,
        y: position.y,
        z: position.z,
        duration: .3,
        onUpdate: function() {
            camera.lookAt(
                direction.x,
                direction.y,
                direction.z);
        }
    })
}

function onClickRobot(robotName) {
    control.dispose();
    const robot = models.find(r => r.name === robotName);
    models.forEach((robot) => {
        robot.isMoving = false;
        if (robot.name === robotName) {
            launchAnimationClip(robot, robot.danceClip);
        } else {
            launchAnimationClip(robot, robot.idleClip);
        }
    });

    const [position, direction] = robot.getFaceCameraValues();
    moveCamera(position, direction);
    printDescription(robot.description, robot.title);
}

function onClosed() {
    moveCamera(CameraInitialPosition, CameraInitialDirection);
    setControl();
    modal.style.display = "none";
    models.forEach((robot) => {
        robot.isMoving = true;
        launchAnimationClip(robot, robot.walkClip);
    })
}

init();
animate();

document.getElementById("closeModal").onclick = onClosed;
window.addEventListener('mousedown', click);