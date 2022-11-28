import { defs, tiny } from '../tiny-graphics-stuff/common.js';
import { Curve_Collider } from '../colliders/CurveCollider.js';
import { Box_Collider } from '../colliders/BoxCollider.js';
import { Base_Scene } from './base-scene.js';

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

export class BaseMap extends Base_Scene {
	/**
	 * This Scene object can be added to any display canvas.
	 * We isolate that code so it can be experimented with on its own.
	 * This gives you a very small code sandbox for editing a simple scene, and for
	 * experimenting with matrix transformations.
	 */

	constructor() {
		super();
		this.set_colors();
		this.outline = false;
		this.sway = true;

		// Transform

		this.x = 0;
		this.z = 1;
		this.y = 0;
		this.rotx = 0;
		this.roty = 0;
		this.rotz = 0;

		this.lastrotx = 0;

		// Physics (Local space)
		this.velx = 0;
		this.vely = 0;
		this.velz = 0;

		// Colliders
		this.colliders = new Array();

		// Coins
		this.num_coins = 5;
		this.rad = 1.25;
		this.coin_collected = new Array(this.num_coins).fill(false);
		this.score = 0;

		// Key presses
		this.keyListeners = {};

		// Transformation matrix for building roads
		this.model_transform = Mat4.identity();

		// This sets up traction for the car
		// If w or d is pressed ignore traction
		window.setInterval(() => {
			if (!this.keyListeners['w'] && this.vely > 0) {
				this.vely -= 0.005;
				if (this.vely < 0) {
					this.vely = 0;
				}
			} else if (!this.keyListeners['d'] && this.vely < 0) {
				this.vely += 0.005;
				if (this.vely > 0) {
					this.vely = 0;
				}
			}
		}, 500);
	}

	set_colors() {
		// TODO:  Create a class member variable to store your cube's colors.
		// Hint:  You might need to create a member variable at somewhere to store the colors, using `this`.
		// Hint2: You can consider add a constructor for class Assignment2, or add member variables in Base_Scene's constructor.
		this.colors = [];
		this.colors.push(
			color(Math.random(), Math.random(), Math.random(), 1)
		);
		for (let i = 1; i < 8; i++) {
			let new_color = color(
				Math.random(),
				Math.random(),
				Math.random(),
				1
			);
			while (color === this.colors[i - 1]) {
				new_color = color(
					Math.random(),
					Math.random(),
					Math.random(),
					1
				);
			}
			this.colors.push(new_color);
		}
	}

	make_control_panel() {
		this.addHoldKey(
			'w',
			() => (this.vely += 0.002),
			'Accelerate',
			125
		);

		this.addHoldKey('s', () => (this.vely -= 0.002), 'Brake', 125);
		this.addHoldKey(
			'd',
			() => {
				this.rotx -= Math.PI / 32;
				if (this.vely > 0) {
					this.vely -= 0.00075;
					if (this.vely < 0) {
						this.vely = 0;
					}
				}
			},
			'Steer Right',
			125
		);
		this.addHoldKey(
			'a',
			() => {
				this.rotx += Math.PI / 32;
				if (this.vely > 0) {
					this.vely -= 0.00075;
					if (this.vely < 0) {
						this.vely = 0;
					}
				} else if (this.vely < 0) {
					this.vely += 0.00075;
					if (this.vely > 0) {
						this.vely = 0;
					}
				}
			},
			'Steer Left',
			125
		);
	}

	// addHoldKey - add a key to the control panel that is meant for holding down
	// Parameters
	// key - key pressed
	// callback - what you want to happen when the key is held down
	// name - name you want to give the button
	// interval - how often you want the callback to be called in ms
	addHoldKey(key, callback, name, interval = 100) {
		this.key_triggered_button(name, [key], () => {});

		window.setInterval(() => {
			if (this.keyListeners[name]) {
				callback();
			}
		}, interval);

		document.addEventListener('keydown', (e) => {
			if (e.key === key) {
				this.keyListeners[name] = true;
			}
		});

		document.addEventListener('keyup', (e) => {
			if (e.key == key) {
				this.keyListeners[name] = false;
			}
		});
	}

	draw_box(context, program_state, model_transform, index) {
		const angle = ((0.05 * Math.PI * index) / 7) * 2;

		model_transform = model_transform
			.times(Mat4.translation(-1, 1.5, 0))
			.times(Mat4.rotation(angle, 45, 0, 1))
			.times(Mat4.translation(1, 1.5, 0))
			.times(Mat4.scale(1, 1.5, 1)); // Scale the size (Req 7)

		this.shapes.triangle.draw(
			context,
			program_state,
			model_transform,
			this.materials.plastic.override({
				color: this.colors[index],
			}),
			'TRIANGLE_STRIP'
		);

		return model_transform.times(Mat4.scale(1, 1 / 1.5, 1)); // Unscale before return
	}

	draw_coins(context, program_state, model_transform) {
		this.shapes.coin.draw(
			context,
			program_state,
			model_transform,
			this.materials.coin
		);
	}

	sphere_collider(radius, x, y) {
		let dist = Math.sqrt(
			Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2)
		);

		if (dist < radius + this.rad) {
			return true;
		}
		return false;
	}

	collect_coin(radius, x, y, index) {
		if (
			this.sphere_collider(radius, x, y) &&
			!this.coin_collected[index]
		) {
			this.score += 1;
			this.coin_collected[index] = true;
		}
	}

	// draw_text (context, program_state, model_transform) {
	//     model_transform = model_transform.times(Mat4.rotation(Math.PI/2, 1, 0, 0))

	//     let text = 'Score: ' + this.score;
	//     this.shapes.text.set_string(text, context.context);
	//     this.shapes.text.draw(context, program_state, model_transform, this.materials.text);
	// }w

	move_with_collision(deltax, deltay) {
		let newx = this.x + deltax;
		let newy = this.y + deltay;
		let len = this.colliders.length;
		for (let i = 0; i < len; i++) {
			// console.log(this.colliders[i]);
			let res = this.colliders[i].check_collision(newx, newy);

			if (res.resx != newx || res.resy != newy) {
				this.x = res.resx;
				this.y = res.resy;
				return;
			}
		}
		this.x = newx;
		this.y = newy;
	}

	draw_car(context, program_state, model_transform) {
		// model_transform = model_transform.times(Mat4.translation(this.x, this.y, this.z));
		this.vely = Math.max(Math.min(this.vely, 0.06), -0.01);

		// Linear Interpolation (for smoothing)
		let lerp_factor = 0.03;
		let lerp_rotx =
			this.lastrotx * (1 - lerp_factor) + this.rotx * lerp_factor;

		// Physics based movement: position calculations based on velocity (on xy plane)
		let deltax =
			this.vely *
			program_state.animation_delta_time *
			Math.sin(-1 * lerp_rotx);
		let deltay =
			this.vely *
			program_state.animation_delta_time *
			Math.cos(lerp_rotx);

		// Actual movement happens - Collision detection will occur here
		//this.x += deltax;
		//this.y += deltay;
		this.move_with_collision(deltax, deltay);
		// this.z += this.velz * program_state.animation_delta_time

		model_transform = Mat4.identity();
		model_transform = model_transform.times(
			Mat4.translation(this.x, this.y, this.z)
		);
		model_transform = model_transform.times(
			Mat4.rotation(lerp_rotx, 0, 0, 1)
		);

		for (let i of [0, 1, 2]) {
			let materials;
			//load texture and normal map for car
			if (i == 0) materials = this.materials.kart;
			else if (i == 1) materials = this.materials.kartM;
			else materials = this.materials.kartR;

			this.shapes.kart.draw(
				context,
				program_state,
				model_transform,
				materials
			);
		}

		// program_state.set_camera(model_transform.times(Mat4.translation(15, 0, -10)));

		let camFollowx = -1 * Math.sin(-1 * lerp_rotx);
		let camFollowy = -1 * Math.cos(lerp_rotx);
		let camFollowDistance = 16;

		// look_at(P_eye, P_ref, P_top)
		let init_pos = Mat4.look_at(
			vec3(
				this.x + camFollowx * camFollowDistance,
				this.y + camFollowy * camFollowDistance,
				5
			),
			vec3(this.x, this.y, this.z),
			vec3(0, 0, 1)
		);

		///////////COMMENTED OUT TO SEE TRACK////////////////
		program_state.set_camera(init_pos);

		this.lastrotx = lerp_rotx;
		// program_state.set_camera(model_transform.times(Mat4.translation(0, 5, -10)).times(Mat4.look_at(vec3(0, 5, 20), vec3(0, 0, 0), vec3(0, 1, 0))));
	}

	draw_road(context, program_state, width = 10, length = 10) {
		this.model_transform = this.model_transform.times(
			Mat4.translation(0, length, 0)
		);

		const road = this.model_transform.times(
			Mat4.scale(width, length, 1)
		);

		this.shapes.plane.draw(
			context,
			program_state,
			road,
			this.materials.road
		);

		const x =
			this.model_transform[0][this.model_transform.length - 1];
		const y =
			this.model_transform[1][this.model_transform.length - 1];
		const z =
			this.model_transform[2][this.model_transform.length - 1];

		this.colliders.push(
			new Box_Collider(
				x - width - 1,
				y - length - 1,
				2,
				length * 2 + 10
			)
		);

		this.colliders.push(
			new Box_Collider(
				x + width - 1,
				y - length - 1,
				2,
				length * 2 + 10
			)
		);

		this.model_transform = this.model_transform.times(
			Mat4.translation(0, length, 0)
		);
	}

	draw_curve(context, program_state,direction) {
		let xScale,xTrans,adjustAngle, adjustX;
		
		if (direction == 'r'){ //turn right config
			xTrans = 30
			xScale = 20;
			adjustAngle = -Math.PI/2;
			adjustX = -30	
			
		}
		else {//turn leftw config
			xTrans = -30;
			xScale = -20;
			adjustAngle = Math.PI/2;
			adjustX = 30;
		}
	
		this.model_transform = this.model_transform
				.times(Mat4.translation(xTrans,0, 0))
				

			this.shapes.quarter_curve.draw(
				context,
				program_state,
				this.model_transform.times(Mat4.scale(xScale, -20, 1)),
				this.materials.curve
			);

			//adjust for next track
			//change orientation
			//change position
			this.model_transform = this.model_transform
				.times(Mat4.rotation(adjustAngle, 0, 0, 1)) 
				.times(Mat4.translation(adjustX, 0, 0));


	}

	display(context, program_state) {
		super.display(context, program_state);
		let t, dt;
		(t = program_state.animation_time / 1000),
			(dt = program_state.animation_delta_time / 1000);
		let model_transform = Mat4.identity();

		this.draw_environment(context, program_state, model_transform);
		//player

		this.draw_car(context, program_state, model_transform);
		//radius of coin = 1.3
		let cy = 20,
			cx = 0;
		let coin_init = model_transform.times(
			Mat4.translation(cx, cy, 1.35)
		);

		for (let i = 0; i < this.num_coins; i++) {
			let coin_pos = coin_init
				.times(Mat4.translation(0, 5 * i, 0))
				.times(Mat4.rotation(t, 0, 0, 1));

			this.collect_coin(1.3, cx, cy + i * 5, i);
			if (!this.coin_collected[i]) {
				this.draw_coins(context, program_state, coin_pos);
			}
		}

		this.model_transform = Mat4.identity();
		const score = document.querySelector('.score');
		score.textContent = `Score: ${this.score}`;

		this.model_transform = Mat4.identity();
	}
}
