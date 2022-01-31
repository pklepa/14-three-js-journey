import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import * as dat from 'lil-gui';
import gsap from 'gsap';

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

// Cursor
const cursor = {
	x: 0,
	y: 0,
};

window.addEventListener('mousemove', (e) => {
	cursor.x = e.clientX / sizes.width - 0.5;
	cursor.y = -(e.clientY / sizes.height - 0.5);
});

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const matcapTexture = textureLoader.load('textures/matcaps/8.png');
const matcapTexture2 = textureLoader.load('textures/matcaps/2.png');
const matcapTexture3 = textureLoader.load('textures/matcaps/3.png');
const matcapTexture4 = textureLoader.load('textures/matcaps/4.png');

/**
 * Globals
 */
const donutsAmount = 100;
const donuts = [];
const donutsRotationsModifiers = new Array(donutsAmount)
	.fill(0)
	.map((x) => Math.random());
console.log(donutsRotationsModifiers);

/**
 * Fonts
 */
const fontLoader = new FontLoader();

fontLoader.load('/fonts/helvetiker_regular.typeface.json', (font) => {
	// Material
	const material = new THREE.MeshMatcapMaterial({ matcap: matcapTexture });
	gui.add(material, 'matcap', {
		matcapTexture,
		matcapTexture2,
		matcapTexture3,
		matcapTexture4,
	});

	// Text
	const textGeometry = new TextGeometry('Hello Three.js', {
		font: font,
		size: 0.5,
		height: 0.2,
		curveSegments: 12,
		bevelEnabled: true,
		bevelThickness: 0.03,
		bevelSize: 0.02,
		bevelOffset: 0,
		bevelSegments: 5,
	});
	textGeometry.center();

	const text = new THREE.Mesh(textGeometry, material);

	scene.add(text);

	// Donuts
	const donutGeometry = new THREE.TorusGeometry(0.3, 0.2, 32, 64);

	for (let i = 0; i < donutsAmount; i++) {
		const donut = new THREE.Mesh(donutGeometry, material);
		donut.position.x = (Math.random() - 0.5) * 10;
		donut.position.y = (Math.random() - 0.5) * 10;
		donut.position.z = (Math.random() - 0.5) * 10;
		donut.rotation.x = Math.random() * Math.PI;
		donut.rotation.y = Math.random() * Math.PI;
		const scale = Math.min(Math.random() + 0.2, 1);
		donut.scale.set(scale, scale, scale);

		donuts.push(donut);
		scene.add(donut);
	}
});

/**
 * Sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

window.addEventListener('resize', () => {
	// Update sizes
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Update camera
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Update renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
	75,
	sizes.width / sizes.height,
	0.1,
	100
);

const cameraLimits = {
	x: {
		start: -4,
		end: 3,
	},
	y: {
		start: -1,
		end: 2,
	},
	z: {
		start: 1.8,
		end: 5,
	},
};

const cameraInitialPosition = {
	x: 2.79,
	y: 1.93,
	z: 5,
};
camera.position.set(
	cameraInitialPosition.x,
	cameraInitialPosition.y,
	cameraInitialPosition.z
);
scene.add(camera);

// const gui_camera = gui.addFolder('Camera Position');
// gui_camera.add(camera.position, 'x').min(-5).max(5);
// gui_camera.add(camera.position, 'y').min(-5).max(5);
// gui_camera.add(camera.position, 'z').min(-5).max(5);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

gsap.fromTo(
	camera.position,
	{ x: cameraLimits.x.start, y: cameraLimits.y.start, z: cameraLimits.z.start },
	{
		x: cameraLimits.x.end,
		y: cameraLimits.y.end,
		z: cameraLimits.z.end,
		duration: 10,
		repeat: -1,
		yoyo: true,
		yoyoEase: 'power2.inOut',
	}
);

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
	const elapsedTime = clock.getElapsedTime();

	// Rotate Donuts
	donuts.forEach((donut, index) => {
		if (donut) {
			donut.rotation.x =
				elapsedTime * Math.PI * donutsRotationsModifiers[index];
			donut.rotation.y =
				elapsedTime * Math.PI * donutsRotationsModifiers[index];
		}
	});

	// Update controls
	controls.update();

	// Render
	renderer.render(scene, camera);

	// Call tick again on the next frame
	window.requestAnimationFrame(tick);
};

tick();
