import * as THREE from "three";
import {
  GLOBAL_PREFABS,
  GLOBAL_TEXTURES,
  GLOBAL_UNIFORMS,
  GLOBAL_MATERIALS,
  GLOBAL_SETTINGS
} from "../GameManager";

import spriteVertex from "../shaders/sprite/vertex.glsl";
import spriteFragment from "../shaders/sprite/fragment.glsl";

export class PrefabCreator {
  createPrefabs(prefabs) {
    for (let i = 0; i < prefabs.length; i++) {
      switch (prefabs[i].type) {
        case "sprite":
          this.createSprite(prefabs[i]);
          break;
        default:
          break;
      }
    }
  }

  /**
   * SPRITE PREFABS
   */
  createSprite(options) {
    /** SEARCH FOR TEXTURE */
    const texture = GLOBAL_TEXTURES.find(
      (texture) => texture.name === options.texture
    );
    if (!texture) {
      console.warn(`Texture '${options.texture}' could'nt be found`);
      return;
    }

    /** CREATE SHADER UNIFORMS & DEFINES */
    const uniforms = {};
    const defines = {};

    defines.ANIMATED = "";

    uniforms.uTexture = { value: texture };
    uniforms.uTime = GLOBAL_UNIFORMS.uTime;
    uniforms.uStartTime = { value: GLOBAL_UNIFORMS.uTime.value };
    uniforms.uFPS = { value: options.fps };
    uniforms.uTile = {
      value: new THREE.Vector2(options.tile[0], options.tile[1])
    };
    uniforms.uAnimate = { value: false };

    /** CREATE MATERIAL */
    const material = new THREE.ShaderMaterial({
      transparent: options.transparent || false,
      defines: defines,
      uniforms: uniforms,
      vertexShader: spriteVertex,
      fragmentShader: spriteFragment
    });
    material.name = `${options.id}Material`;
    GLOBAL_MATERIALS.push(material);

    /** CREATE MESH */
    const defaultWidth = texture.image.width / uniforms.uTile.value.x;
    const defaultHeight = texture.image.height / uniforms.uTile.value.y;
    const ratio = defaultWidth / defaultHeight;

    const sprite = new THREE.Sprite(material);
    sprite.name = options.id;
    sprite.userData = {
      defaultWidth: defaultWidth,
      defaultHeight: defaultHeight,
      ratio: parseFloat(ratio.toFixed(2)), // (width / height)
      width: options.width,
      position: options.position || undefined,
      origin: options.position ? options.position.origin : undefined,
      z: options.z || 0,
      onResize: () => this.alignSprite(sprite)
    };
    GLOBAL_PREFABS.push(sprite);

    /** SET POSITION & SCALE */
    sprite.userData.onResize(); // First align

    return sprite;
  }

  alignSprite(sprite) {
    const sceneSizes = {
      width: GLOBAL_SETTINGS.domTargetSize[0],
      height: GLOBAL_SETTINGS.domTargetSize[1]
    };

    let width, height;

    if (sprite.userData.width === "cover") {
      const widthDiff = sceneSizes.width - sprite.userData.defaultWidth;
      const heightDiff = sceneSizes.height - sprite.userData.defaultHeight;

      if (widthDiff > heightDiff) {
        width = sceneSizes.width;
        height = width / sprite.userData.ratio;
      } else {
        height = sceneSizes.height;
        width = height / sprite.userData.ratio;
      }

      sprite.scale.set(width, height, 1);
      sprite.position.set(0, 0, sprite.userData.z);
    } else {
      let left, top;

      width = (sceneSizes.width / 100) * sprite.userData.width;
      height = width / sprite.userData.ratio;

      // Screen space top:0, left:0 value
      const zeroX = sceneSizes.width / -2 + width / 2;
      const zeroY = sceneSizes.height / 2 + height / -2;

      // Add offset by origin
      left =
        (sceneSizes.width / 100) * sprite.userData.position.left -
        width * sprite.userData.origin[0];
      top =
        (sceneSizes.height / 100) * sprite.userData.position.top -
        height * sprite.userData.origin[1];

      sprite.scale.set(width, height, 1);
      sprite.position.set(zeroX + left, zeroY - top, sprite.userData.z);
    }
  }
}
