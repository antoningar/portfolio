import * as THREE from "three";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import { RobotModel } from "./RobotModel.ts";

let container, clock: THREE.Clock, mixer: THREE.AnimationMixer;
let camera: THREE.PerspectiveCamera, scene: THREE.Scene, renderer: THREE.WebGLRenderer, model;
let models: RobotModel[] = [];



const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();



init();
animate();

function init() {
  container = document.createElement("div");
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.25,
    100
  );
  camera.position.set(25, 20, 40);
  camera.lookAt(0, 2, 0);

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

  const grid = new THREE.GridHelper(200, 80, 0x000000, 0x000000);
  grid.material.opacity = 0.2;
  grid.material.transparent = true;
  scene.add(grid);

  // model
  const loader = new GLTFLoader();
  loader.load(
    "/discordrobot.glb",
    function (gltf) {
      model = gltf.scene;
      scene.add(model);

      let walkClip = gltf.animations.find(a => a.name === "Walking")!
      launchWalking(model, walkClip);

      const name: string = gltf.parser.json.skins[0].name;
      let plan: [number, string, number, number][] = [
        [0, "z", 10, 90],
        [1, "x", 10, 90],
        [0, "z", 10, 90],
        [1, "x", 10, 90],
      ]
      models.push(new RobotModel(model ,plan, name))
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

function launchWalking(model: THREE.Group, clip: THREE.AnimationClip){
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

function onClickRobot(robotName: string) {
  robot: RobotModel: models.find(r => r.name === robotName);
}

window.addEventListener( 'click', click);
