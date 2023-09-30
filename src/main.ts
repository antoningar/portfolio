import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import { RobotModel } from "./RobotModel.ts";
import { ROBOTS } from "./robots.ts";

import { OrbitControls } from "./OrbitControl.js";

const currentWindow = window as any
const gsap = currentWindow.gsap;

let container, clock: THREE.Clock;
let camera: THREE.PerspectiveCamera, scene: THREE.Scene, renderer: THREE.WebGLRenderer, model;
let models: RobotModel[] = [];

let control: OrbitControls;
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

let divModal: HTMLDivElement = document.createElement('div');
let divLabel: HTMLDivElement = document.createElement('div');

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

init();
animate();
initModal();

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
  ROBOTS.forEach((robot: any) => {
    const loader = new GLTFLoader();
    loader.load(
      robot.filename,
      function (gltf) {
        model = gltf.scene;
        scene.add(model);

        model.translateX(robot.basePosition.x);
        model.translateY(robot.basePosition.y);
        model.translateZ(robot.basePosition.z);
  
        const name: string = gltf.parser.json.skins[0].name;  
        let robotModel: RobotModel = new RobotModel(model, robot.plan, name, robot.text, gltf.animations) 

        launchAnimationClip(robotModel, robotModel.walkClip);
        models.push(robotModel);
      },
      undefined,
      function (e) {
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
  control = new OrbitControls( camera, renderer.domElement );

  control.screenSpacePanning = false;
  control.enableZoom = false;

  control.maxPolarAngle = Math.PI / 2;
}

function initModal() {
  divModal.className = "label-modal";
  divModal.style.display = "none";

  let divContainer: HTMLDivElement = document.createElement('div');
  divContainer.className = "label-container";

  divLabel.className = "label";

  let divOutline: HTMLDivElement = document.createElement('div');
  divOutline.className = "label-outline";

  let btnClosed: HTMLButtonElement = document.createElement('button');
  btnClosed.innerHTML = "CLOSE X";
  btnClosed.className = "label-close";
  btnClosed.onclick = onClosed;

  divOutline.appendChild(divLabel);
  divContainer.appendChild(divOutline);
  divModal.appendChild(divContainer);
  divModal.appendChild(btnClosed);
  document.body.appendChild(divModal);
}

function launchAnimationClip(robot: RobotModel | null, clip: THREE.AnimationClip){
  const mixer = new THREE.AnimationMixer(robot!.group);
  const action = mixer.clipAction(clip);
  action.clampWhenFinished = true;
  action.play();
  robot!.mixer = mixer;
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

function click(event: any) {
	// calculate pointer position in normalized device coordinates
	// (-1 to +1) for both components
	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  // update the picking ray with the camera and pointer position
  raycaster.setFromCamera(pointer, camera);
  // calculate objects intersecting the picking ray
  const intersects = raycaster.intersectObjects(scene.children);

  for ( let i = 0; i < intersects.length; i ++ ) {
    const robotName: string = getRobotName(intersects[i].object);
    if (robotName){
      return onClickRobot(robotName);
    }
  }
}

function getRobotName(obj: THREE.Object3D<THREE.Event>): string {
  let currentName:string = obj.name;
  while (currentName !== "RootNode") {
    if (models.find(r => r.name === currentName)){
      return currentName;
    }
    else {
      if (obj.parent) {
        return getRobotName(obj.parent!);
      }
      else {
        return "";
      }
    }
  }
  return "";
}

function onClosed() {
  moveCamera(CameraInitialPosition, CameraInitialDirection);
  setControl();
  divModal.style.display = "none";
  models.forEach((robot) => {
    robot.isMoving = true;
    launchAnimationClip(robot, robot.walkClip);
  })
}

function printDescription(description: string) {
  divModal.style.display = "block";
  divLabel.innerHTML = description;
}

function moveCamera(position: any, direction: any) {
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

function onClickRobot(robotName: string) {
  control.dispose();
  const robot: RobotModel = models.find(r => r.name === robotName)!;
  models.forEach((robot) => {
    robot.isMoving = false;
    if (robot.name === robotName){
      launchAnimationClip(robot, robot.danceClip);
    } else {
      launchAnimationClip(robot, robot.idleClip);
    }
  });

  const [position, direction] = robot.getFaceCameraValues();
  moveCamera(position, direction);
  printDescription(robot.description);
}

window.addEventListener( 'mousedown', click);
