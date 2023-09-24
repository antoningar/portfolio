import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import { RobotModel } from "./RobotModel.ts";

const currentWindow = window as any
const gsap = currentWindow.gsap;

let container, clock: THREE.Clock, mixer: THREE.AnimationMixer;
let camera: THREE.PerspectiveCamera, scene: THREE.Scene, renderer: THREE.WebGLRenderer, model;
let models: RobotModel[] = [];

let danceAnimation: THREE.AnimationClip;
let walkClip: THREE.AnimationClip;

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

let robotFocus: RobotModel | null;
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
  y: 2,
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

  // const grid = new THREE.GridHelper(200, 80, 0x000000, 0x000000);
  // grid.material.opacity = 0.2;
  // grid.material.transparent = true;
  // scene.add(grid);

  // model
  const loader = new GLTFLoader();
  loader.load(
    "/discordrobot.glb",
    function (gltf) {
      model = gltf.scene;
      scene.add(model);
      danceAnimation = gltf.animations.find(a => a.name === "Dance")!
      
      walkClip = gltf.animations.find(a => a.name === "Walking")! 
      launchAnimationClip(model, walkClip);

      const name: string = gltf.parser.json.skins[0].name;
      let plan: [string, number, number][] = [
        ["z", 10, 90],
        ["x", 10, 90],
        ["z", 10, 90],
        ["x", 10, 90],
      ]

      const text: string = "Hello!\nMy name is Antonin, I'm into computing since 2016.\nI did a lot of different things so click on any other robots to learn more about me ! ";
      models.push(new RobotModel(model ,plan, name, text))
    },
    undefined,
    function (e) {
      console.error(e);
    }
  );

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  window.addEventListener("resize", onWindowResize);
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

function launchAnimationClip(model: THREE.Group, clip: THREE.AnimationClip){
  mixer = new THREE.AnimationMixer(model);
  const action = mixer.clipAction(clip);
  action.clampWhenFinished = true;
  action.play();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  const dt = clock.getDelta();
  if (mixer) mixer.update(dt);

  requestAnimationFrame(animate);
  renderer.render(scene, camera);

  models.forEach(model => {
    model.move();
  });
}

function click(event: any) {
  if (!focus) {
    
  }

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
  divModal.style.display = "none";
  robotFocus!.isMoving = true;
  launchAnimationClip(robotFocus!.group, walkClip);
  
  robotFocus = null;
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
    duration: 1, 
    onUpdate: function() {
      camera.lookAt(
        direction.x,
        direction.y,
        direction.z);
    }
  })
}

function onClickRobot(robotName: string) {
  const robot: RobotModel = models.find(r => r.name === robotName)!;
  robot.isMoving = false;

  const [position, direction] = robot.getFaceCameraValues();
  moveCamera(position, direction);
  launchAnimationClip(robot.group, danceAnimation);
  printDescription(robot.description);
  
  robotFocus = robot;
}

window.addEventListener( 'click', click);
