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

	draw_environment(context, program_state, model_transform) {
		//surroundings
		let sphereTransform = model_transform.times(
			Mat4.scale(500, 500, 500)
		);
		this.shapes.sphere.draw(
			context,
			program_state,
			sphereTransform,
			this.materials.flat.override(hex_color('87CEEB'))
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

		this.draw_road(context, program_state, 10, 50);
		this.draw_road(context, program_state, 10, 50);
		this.draw_curve(context, program_state);
		// let track1l_collider = new Box_Collider(-11, -101, 2, 202);
		// let track1r_collider = new Box_Collider(9, -101, 2, 202);
		// this.colliders[8] = track1l_collider;
		// this.colliders[9] = track1r_collider;

		// //curve front
		// let curve1_transform = model_transform
		// 	.times(Mat4.rotation(Math.PI, 0, 1, 0))
		// 	.times(Mat4.translation(-30, -100, 0))
		// 	.times(Mat4.scale(20, 20, 10));
		// this.shapes.curve.draw(
		// 	context,
		// 	program_state,
		// 	curve1_transform,
		// 	this.materials.road
		// );

		// let curve1l_collider = new Curve_Collider(30, -100, 41, 2, 3);
		// let curve1r_collider = new Curve_Collider(30, -100, 41, 2, 4);
		// this.colliders[0] = curve1l_collider;
		// this.colliders[1] = curve1r_collider;

		// let curve2l_collider = new Curve_Collider(30, -100, 19, 2, 3);
		// let curve2r_collider = new Curve_Collider(30, -100, 19, 2, 4);
		// this.colliders[2] = curve2l_collider;
		// this.colliders[3] = curve2r_collider;

		// //right side straight track
		// let straight2_transform = plane_transform.times(
		// 	Mat4.translation(-60, 0, 0).times(Mat4.scale(10, 100, 1))
		// );
		// this.shapes.plane.draw(
		// 	context,
		// 	program_state,
		// 	straight2_transform,
		// 	this.materials.road
		// );
		// let track2l_collider = new Box_Collider(49, -101, 2, 202);
		// let track2r_collider = new Box_Collider(69, -101, 2, 202);
		// this.colliders[10] = track2l_collider;
		// this.colliders[11] = track2r_collider;

		// //curve back
		// let curve2_transform = model_transform
		// 	.times(Mat4.rotation(Math.PI, 0, 0, 1))
		// 	.times(Mat4.rotation(Math.PI, 0, 1, 0))
		// 	.times(Mat4.translation(30, -100, 0))
		// 	.times(Mat4.scale(20, 20, 10));
		// this.shapes.curve.draw(
		// 	context,
		// 	program_state,
		// 	curve2_transform,
		// 	this.materials.road
		// );

		// let curve3l_collider = new Curve_Collider(30, 100, 41, 2, 2);
		// let curve3r_collider = new Curve_Collider(30, 100, 41, 2, 1);
		// this.colliders[4] = curve3l_collider;
		// this.colliders[5] = curve3r_collider;

		// let curve4l_collider = new Curve_Collider(30, 100, 19, 2, 2);
		// let curve4r_collider = new Curve_Collider(30, 100, 19, 2, 1);
		// this.colliders[6] = curve4l_collider;
		// this.colliders[7] = curve4r_collider;
	}
}
