import * as THREE from "three";
import { OrthographicScene } from "./services/sceneCreator";
import { PrefabCreator } from "./services/prefabCreator";

export const GLOBAL_UNIFORMS = {
  uTime: { value: 0 }
};
export const GLOBAL_PREFABS = [];
export const GLOBAL_MATERIALS = [];
export const GLOBAL_TEXTURES = [];
export const GLOBAL_SETTINGS = {
  domTarget: null,
  domTargetSize: [0, 0]
};

/**
 * GAME MANAGER
 *
 * Initializes Game on the given dom element.
 *
 * @param domTarget The DOM element that you want to initialize game to
 * @param options Game options
 *
 */
export class GameManager {
  constructor() {
    /** RENDERER */
    this.webGLRenderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false
    });
    this.webGLRenderer.debug.checkShaderErrors = true;
    this.webGLRenderer.outputEncoding = THREE.sRGBEncoding;

    /** CLOCK */
    this.clock = new THREE.Clock();

    this.textureLoader = new THREE.TextureLoader();
    this.prefabCreator = new PrefabCreator();

    /** SCENES */
    this.allScenes = [];
    this.activeScenes = [];

    /** PROGRAM TICK */
    this.lastRenderRequest = null;

    window.addEventListener("resize", this.resizeScenes.bind(this));
  }

  /** INITIZATION */
  async createGame(domTarget, options) {
    try {
      GLOBAL_SETTINGS.domTarget = domTarget;
      GLOBAL_SETTINGS.domTargetSize = [
        domTarget.clientWidth,
        domTarget.clientHeight
      ];
      GLOBAL_SETTINGS.domTarget.appendChild(this.webGLRenderer.domElement);
      this.webGLRenderer.setSize(
        GLOBAL_SETTINGS.domTargetSize[0],
        GLOBAL_SETTINGS.domTargetSize[1]
      );

      await this.loadResources(options.resources);
      this.prefabCreator.createPrefabs(options.prefabs);

      const sceneWrapper = new OrthographicScene();
      for (let i = 0; i < GLOBAL_PREFABS.length; i++) {
        sceneWrapper.scene.add(GLOBAL_PREFABS[i]);
      }

      this.allScenes.push(sceneWrapper);
      this.activeScenes.push(sceneWrapper);

      if (this.lastRenderRequest == null) this.tick();
    } catch (error) {
      console.error(`Game Manager could'nt finished.`, error);
    }
  }

  async loadResources(resources) {
    try {
      for (let i = 0; i < resources.textures.length; i++) {
        const texture = await this.textureLoader.loadAsync(
          resources.textures[i].url
        );
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.name = resources.textures[i].id;
        GLOBAL_TEXTURES.push(texture);
      }
    } catch (error) {
      console.log("Load error", error);
    }
  }
  /** END INITIZATION */

  resizeScenes() {
    GLOBAL_SETTINGS.domTargetSize = [
      GLOBAL_SETTINGS.domTarget.clientWidth,
      GLOBAL_SETTINGS.domTarget.clientHeight
    ];
    this.webGLRenderer.setSize(
      GLOBAL_SETTINGS.domTargetSize[0],
      GLOBAL_SETTINGS.domTargetSize[1]
    );
    for (let i = 0; i < GLOBAL_PREFABS.length; i++) {
      GLOBAL_PREFABS[i].userData.onResize &&
        GLOBAL_PREFABS[i].userData.onResize();
    }
    for (let i = 0; i < this.allScenes.length; i++) {
      this.allScenes[i].onResize();
    }
  }

  getPrefab(id) {
    const prefab = GLOBAL_PREFABS.find((prefab) => prefab.name === id);
    if (!prefab) {
      console.warn(`Prefab ${id} doesn't exist.`);
      return false;
    }
    return prefab;
  }

  startAnimation(id) {
    const prefab = this.getPrefab(id);
    prefab.material.uniforms.uAnimate.value = true;
    prefab.material.uniforms.uStartTime.value = GLOBAL_UNIFORMS.uTime.value;
  }

  stopAnimation(id) {
    const prefab = this.getPrefab(id);
    prefab.material.uniforms.uAnimate.value = false;
  }

  debug() {
    console.log("Materials", GLOBAL_MATERIALS);
    console.log("Textures", GLOBAL_TEXTURES);
    console.log("Prefabs", GLOBAL_PREFABS);
    console.log("WebGL Renderer Info", this.webGLRenderer.info);
  }

  tick() {
    GLOBAL_UNIFORMS.uTime.value = this.clock.getElapsedTime();
    for (let i = 0; i < this.activeScenes.length; i++) {
      this.webGLRenderer.render(
        this.activeScenes[i].scene,
        this.activeScenes[i].camera
      );
    }
    this.lastRenderRequest = window.requestAnimationFrame(this.tick.bind(this));
  }
}
