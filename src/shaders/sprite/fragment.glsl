uniform sampler2D uTexture;
uniform vec2 uResolution;
varying vec2 vUv;

#ifdef ANIMATED
	uniform float uTime;
	uniform float uStartTime;
	uniform float uFPS;
	uniform vec2 uTile;
	uniform bool uAnimate;
	#define tileUv vec2(vUv.x/uTile.x, vUv.y/uTile.y)
	#define tileOffset vec2(1./uTile.x, 1./uTile.y)
	#define totalTile uTile.x * uTile.y
#endif

void main() {
	#ifdef ANIMATED
		vec2 aUv;
		if (uAnimate){
			float progress = floor((uTime - uStartTime) * uFPS);
			float progressY = floor((progress - (totalTile * floor(progress / totalTile))) / uTile.x);
			aUv = vec2(tileUv.x + (progress * tileOffset.x), (tileUv.y - tileOffset.y) - (progressY * tileOffset.y));
		} else {
			aUv = vec2(tileUv.x, tileUv.y - tileOffset.y);
		}
		gl_FragColor = texture2D(uTexture, aUv);
	#else
		gl_FragColor = texture2D(uTexture, vUv);
	#endif
}

// ONE LINE TEXTURE SHEET
// void main() {
//     #ifdef ANIMATED
//         float progress = floor((uTime - uStartTime) * uFPS);
//         vec2 aUv = vec2(tileUv.x + (progress * tileOffset.x), tileUv.y);
//         gl_FragColor = texture2D(uTexture, aUv);
//     #else
//         gl_FragColor = texture2D(uTexture, vUv);
//     #endif
// }