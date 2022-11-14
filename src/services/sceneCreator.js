import * as THREE from "three";

import { GLOBAL_SETTINGS } from "../GameManager";

class WebGLScene {
  constructor(camera, onresize) {
    this.scene = new THREE.Scene();
    this.camera = camera;
    this.onResize = onresize;
    this.scene.add(camera);
  }
}

export class OrthographicScene extends WebGLScene {
  constructor() {
    const camera = new THREE.OrthographicCamera(1, 1, 1, 1, -1, 1);
    camera.name = "ORTHOGRAPHIC_CAMERA";

    const onResize = () => {
      const width = GLOBAL_SETTINGS.domTargetSize[0];
      const height = GLOBAL_SETTINGS.domTargetSize[1];
      camera.left = -width / 2;
      camera.right = width / 2;
      camera.top = height / 2;
      camera.bottom = -height / 2;
      camera.updateProjectionMatrix();
    };
    onResize(); // First tune

    super(camera, onResize);
    this.scene.name = "ORTHOGRAPHIC_SCENE";
  }
}
