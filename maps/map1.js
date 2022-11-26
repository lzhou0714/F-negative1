import { defs, tiny } from '../tiny-graphics-stuff/common.js';
import { Shape_From_File } from '../tiny-graphics-stuff/obj-file-demo.js';
import { Text_Line } from '../tiny-graphics-stuff/text-demo.js';

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

const { Textured_Phong } = defs;

class Collider {}

// Rectangular colliders
class Box_Collider extends Collider {
	constructor(x, y, width, length) {}
}

// 90 degree curve colliders
class Curve_Collider extends Collider {
	// Note - cartesian quadrants: 1 = top right, 2 = top left, 3 = bot left, 4 = bot right
	constructor(x, y, radius, quadrant) {}
}

class Rounded_Edge extends Shape {
	// Build a donut shape.  An example of a surface of revolution.
	constructor(rows, columns, texture_range) {
		super('position', 'normal', 'texture_coord');
		const points_arr = Vector3.cast([-2, 0, 0], [-1, 0, 0]);
		defs.Half_Surface_Of_Revolution.insert_transformed_copy_into(
			this,
			[rows, columns, points_arr, texture_range]
		);
	}
}

class Base_Scene extends Scene {
	/**
	 *  **Base_scene** is a Scene that can be added to any display canvas.
	 *  Setup the shapes, materials, camera, and lighting here.
	 */
	constructor() {
		// constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
		super();
		this.hover = this.swarm = false;
		// At the beginning of our program, load one of each of these shape definitions onto the GPU.
		this.shapes = {
			cube: new defs.Cube(),
			sphere: new defs.Subdivision_Sphere(4),
			plane: new defs.Square(),
			curve: new Rounded_Edge(50, 50),
			axis: new defs.Axis_Arrows(),
			kart: new Shape_From_File('../assets/kart/kart.obj'),
			coin: new Shape_From_File('../assets/collectibles/coin.obj'),
			text: new Text_Line(1),
		};

		// *** Materials
		this.materials = {
			plastic: new Material(new defs.Phong_Shader(), {
				ambient: 0.4,
				diffusivity: 0.6,
				color: hex_color('#ffffff'),
			}),
			flat: new Material(new defs.Phong_Shader(), {
				ambient: 1,
				diffusivity: 0,
				specularity: 0,
				color: hex_color('#ffffff'),
			}),

			road: new Material(new Textured_Phong(), {
				color: hex_color('#ffffff'),
				ambient: 0.5,
				diffusivity: 0.1,
				specularity: 0.1,
				texture: new Texture('assets/road.jpg'),
			}),
			kart: new Material(new Textured_Phong(), {
				color: hex_color('#000000'),
				ambient: 1,
				diffusivity: 0.2,
				specularity: 1,
				texture: new Texture('assets/kart/kart_b_bc.png'),
			}),
			kartM: new Material(new Textured_Phong(), {
				color: hex_color('#000000'),
				ambient: 0.1,
				diffusivity: 0.2,
				specularity: 1,
				texture: new Texture('assets/kart/kart_m.png'),
			}),
			kartR: new Material(new Textured_Phong(), {
				color: hex_color('#000000'),
				ambient: 1,
				diffusivity: 0,
				specularity: 0,
				texture: new Texture('assets/kart/kart_r.png'),
			}),

			coin: new Material(new defs.Phong_Shader(), {
				color: hex_color('F7FF00'),
				ambient: 0.7,
				diffusivity: 0.5,
				specularity: 1,
			}),
			text: new Material(new defs.Phong_Shader(1), {
				ambient: 1,
				diffusivity: 0,
				specularity: 0,
				texture: new Texture('assets/text.png'),
			}),
		};
		// The white material and basic shader are used for drawing the outline.
		this.white = new Material(new defs.Basic_Shader());
		this.colors = [];
	}

	display(context, program_state) {
		// display():  Called once per frame of animation. Here, the base class's display only does
		// some initial setup.

		// Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
		if (!context.scratchpad.controls) {
			this.children.push(
				(context.scratchpad.controls = new defs.Movement_Controls())
			);
			// Define the global camera and projection matrices, which are stored in program_state.
			program_state.set_camera(Mat4.translation(5, -10, -30));
		}
		program_state.projection_transform = Mat4.perspective(
			Math.PI / 4,
			context.width / context.height,
			1,
			700
		);

		// *** Lights: *** Values of vector or point lights.
		const light_position = vec4(0, 50, 50, 1);
		program_state.lights = [
			new Light(light_position, color(1, 1, 1, 1), 10 ** 10),
		];
	}
}

export class GameMap extends Base_Scene {
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
		this.num_coins = 5;
		this.rad = 1.25;
		this.coin_collected = new Array(this.num_coins).fill(false);
		this.score = 0;

		// Key presses
		this.keyListeners = {};

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
		// Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
		this.key_triggered_button(
			'Change Colors',
			['c'],
			this.set_colors
		);
		// Add a button for controlling the scene.
		this.key_triggered_button('Outline', ['o'], () => {
			// TODO:  Requirement 5b:  Set a flag here that will toggle your outline on and off
			this.outline = !this.outline;
		});
		this.key_triggered_button('Sit still', ['m'], () => {
			// TODO:  Requirement 3d:  Set a flag here that will toggle your swaying motion on and off.
			this.sway = !this.sway;
		});

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
		let angle = 0;

		if (this.sway) {
			angle =
				((0.05 * Math.PI * index) / 7) *
				(1 +
					Math.cos(
						(program_state.animation_time * Math.PI * 2) / 3000
					));
		} else {
			angle = ((0.05 * Math.PI * index) / 7) * 2;
		}

		model_transform = model_transform
			.times(Mat4.translation(-1, 1.5, 0))
			.times(Mat4.rotation(angle, 45, 0, 1))
			.times(Mat4.translation(1, 1.5, 0))
			.times(Mat4.scale(1, 1.5, 1)); // Scale the size (Req 7)
		if (!this.outline) {
			if (index % 2 != 0) {
				this.shapes.triangle.draw(
					context,
					program_state,
					model_transform,
					this.materials.plastic.override({
						color: this.colors[index],
					}),
					'TRIANGLE_STRIP'
				);
			} else {
				this.shapes.cube.draw(
					context,
					program_state,
					model_transform,
					this.materials.plastic.override({
						color: this.colors[index],
					})
				);
			}
		} else {
			this.shapes.outline.draw(
				context,
				program_state,
				model_transform,
				this.white,
				'LINES'
			);
		}

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

	detect_collision(deltax, deltay) {}
	sphere_collider(radius, x, y) {
		let dist = Math.sqrt(
			Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2)
		);
		console.log(dist);
		if (dist < radius + this.rad) {
			return true;
		}
		return false;
	}

	collect_coin(radius, x, y, index) {
		if (this.sphere_collider(radius, x, y)) {
			this.score += 1;
			this.coin_collected[index] = true;
		}
	}

	// draw_text (context, program_state, model_transform) {
	//     model_transform = model_transform.times(Mat4.rotation(Math.PI/2, 1, 0, 0))

	//     let text = 'Score: ' + this.score;
	//     this.shapes.text.set_string(text, context.context);
	//     this.shapes.text.draw(context, program_state, model_transform, this.materials.text);
	// }

	draw_car(context, program_state, model_transform) {
		// model_transform = model_transform.times(Mat4.translation(this.x, this.y, this.z));
		this.vely = Math.max(Math.min(this.vely, 0.06), -0.01);

		// Linear Interpolation (for smoothing)
		let lerp_factor = 0.1;
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
		this.x += deltax;
		this.y += deltay;
		// this.z += this.velz * program_state.animation_delta_time

		model_transform = Mat4.identity();
		// model_transform = model_transform.times(Mat4.rotation(Math.PI/2,1,0,0))
		model_transform = model_transform.times(
			Mat4.translation(0, 0, -0.45)
		);
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

	draw_environment(context, program_state, model_transform) {
		//light
		let light_mat = model_transform.times(
			Mat4.translation(50, 50, 50)
		);
		this.shapes.sphere.draw(
			context,
			program_state,
			light_mat,
			this.materials.flat
		);

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

		//curve back
		let curve1_transform = model_transform
			.times(Mat4.rotation(0, 0, 0, 1))
			.times(Mat4.rotation(Math.PI, 0, 1, 0))
			.times(Mat4.translation(-30, -100, 0))
			.times(Mat4.scale(20, 20, 10));
		this.shapes.curve.draw(
			context,
			program_state,
			curve1_transform,
			this.materials.road
		);

		//left side straight track
		let plane_transform = model_transform.times(
			Mat4.rotation(-Math.PI, 0, 0, 1)
		);
		let straight1_transform = plane_transform.times(
			Mat4.scale(10, 100, 1)
		);
		this.shapes.plane.draw(
			context,
			program_state,
			straight1_transform,
			this.materials.road
		);

		//curve front
		let curve2_transform = model_transform
			.times(Mat4.rotation(Math.PI, 0, 0, 1))
			.times(Mat4.rotation(Math.PI, 0, 1, 0))
			.times(Mat4.translation(30, -100, 0))
			.times(Mat4.scale(20, 20, 10));
		this.shapes.curve.draw(
			context,
			program_state,
			curve2_transform,
			this.materials.road
		);

		//left side straight track
		let straight2_transform = plane_transform.times(
			Mat4.translation(-60, 0, 0).times(Mat4.scale(10, 100, 1))
		);
		this.shapes.plane.draw(
			context,
			program_state,
			straight2_transform,
			this.materials.road
		);
	}

	display(context, program_state) {
		super.display(context, program_state);
		const blue = hex_color('#1a9ffa');
		let t, dt;
		(t = program_state.animation_time / 1000),
			(dt = program_state.animation_delta_time / 1000);
		let model_transform = Mat4.identity();

		//for reference
		this.shapes.axis.draw(
			context,
			program_state,
			model_transform,
			this.materials.plastic
		);

		this.draw_environment(context, program_state, model_transform);
		//player

		this.draw_car(context, program_state, model_transform);

		//radius of coin = 1.3
		let cy = 20,
			cx = 0;
		let coin_init = model_transform.times(
			Mat4.translation(cx, cy, 1.35)
		);
		let coin_pos = new Array(this.num_coins).fill(coin_init);
		for (let i = 0; i < this.num_coins; i++) {
			coin_pos[i] = coin_pos[i].times(Mat4.translation(0, 5 * i, 0));
			cy += i * 5;
			coin_pos[i] = coin_pos[i].times(Mat4.rotation(t, 0, 0, 1));
			this.collect_coin(1.3, cx, cy, i);
			if (!this.coin_collected[i]) {
				this.draw_coins(context, program_state, coin_pos[i]);
			}
		}

		// this.draw_text(context, program_state, model_transform);
	}
}