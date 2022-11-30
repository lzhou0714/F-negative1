import { defs, tiny } from '../tiny-graphics-stuff/common.js';
import { Curve_Collider } from '../colliders/CurveCollider.js';
import { Box_Collider } from '../colliders/BoxCollider.js';
import { Base_Scene } from './base-scene.js';
import { BaseMap } from './map.js';

const {
	Vector,
	Vector3,
	vec,
	vec3,
	vec4,
	color,
	hex_color,
	Matrix,
	Mat4,
	Light,
	Texture,
	Shape,
	Material,
	Scene,
} = tiny;

export class GameMap extends BaseMap {
	/**
	 * This Scene object can be added to any display canvas.
	 * We isolate that code so it can be experimented with on its own.
	 * This gives you a very small code sandbox for editing a simple scene, and for
	 * experimenting with matrix transformations.
	 */

	constructor() {
		super();
	}
	draw_environment(context, program_state, model_transform) {
		//surroundings
		let grass_transform = model_transform
			.times(Mat4.translation(0, 0, -0.5))
			.times(Mat4.scale(500, 500, 1));
		this.shapes.plane.draw(
			context,
			program_state,
			grass_transform,
			this.materials.grass
		);
		let sphereTransform = model_transform.times(
			Mat4.scale(500, 500, 500)
		);
		this.shapes.sphere.draw(
			context,
			program_state,
			sphereTransform,
			this.materials.flat.override(hex_color('87ceeb'))
		);

		// // left side straight track
		// let plane_transform = model_transform.times(
		// 	Mat4.rotation(-Math.PI, 0, 0, 1)
		// );

		// let straight1_transform = plane_transform.times(
		// 	Mat4.scale(10, 100, 1)
		// );

		// this.shapes.plane.draw(
		// 	context,
		// 	program_state,
		// 	straight1_transform,
		// 	this.materials.road
		// );

		this.draw_road(context, program_state, true);
		// this.draw_road(context, program_state, 10, 10);
		//r = turn right, l = turn left
		this.draw_curve(context, program_state, 'l');
		this.draw_road(context, program_state, true);
		this.draw_road(context, program_state);
		this.draw_curve(context, program_state, 'r');
		this.draw_road(context, program_state, true);
		this.draw_road(context, program_state);
		this.draw_curve(context, program_state, 'r');
		this.draw_road(context, program_state);
		this.draw_curve(context, program_state, 'l');
		this.draw_road(context, program_state);
		this.draw_curve(context, program_state, 'r');
		this.draw_road(context, program_state);
		this.draw_curve(context, program_state, 'r');
		this.draw_road(context, program_state);
		this.draw_road(context, program_state);
		this.draw_road(context, program_state);
		this.draw_road(context, program_state);
		this.draw_road(context, program_state);
		this.draw_road(context, program_state);
		this.draw_road(context, program_state);
		this.draw_road(context, program_state);
		this.draw_road(context, program_state);
		this.draw_road(context, program_state);
		this.draw_curve(context, program_state, 'r');
		this.draw_curve(context, program_state, 'r');
	}
}
