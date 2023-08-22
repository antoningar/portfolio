import * as THREE from "three";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import { RobotModel } from "./RobotModel.ts";

let container, clock: THREE.Clock, mixer: THREE.AnimationMixer;
let camera: THREE.PerspectiveCamera, scene: THREE.Scene, renderer: THREE.WebGLRenderer, model;
let models: RobotModel[] = [];

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

      let plan: [number, string, number, number][] = [
        [0, "z", 10, 90],
        [1, "x", 10, 90],
        [0, "z", 10, 90],
        [1, "x", 10, 90],
      ]
      models.push(new RobotModel(model ,plan))
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
