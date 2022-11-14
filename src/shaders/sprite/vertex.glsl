varying vec2 vUv;

void main() {
	vUv = uv;

	vec2 scale = vec2(length(modelMatrix[0]), length(modelMatrix[1]));
	vec2 aPosition = position.xy * scale;

	vec4 mvPosition = modelViewMatrix * vec4(0., 0., 0., 1.);
	mvPosition.xy += aPosition;

	gl_Position = projectionMatrix * mvPosition;
}