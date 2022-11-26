import { defs, tiny } from './examples/common.js';
import { Box_Collider } from './colliders/BoxCollider.js';
import { Curve_Collider } from './colliders/CurveCollider.js';

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

// All colliders treat the car as a sphere collider

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

class Particle {
    constructor(vx, vy, vz) {
        this.vx = vx;
        this.vy = vy;
        this.vz = vz;
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.age = 0;
    }

    move(anim_time) {
        this.x += this.vx * anim_time;
        this.y += this.vy * anim_time;
        this.z += this.vz * anim_time;
        this.age += anim_time;
    }

    get_info() {
        return {x: this.x, y: this.y, z: this.z, age: this.age}
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
			car: new Material(new Textured_Phong(), {
				color: hex_color('#ffffff'),
				ambient: 0.5,
				diffusivity: 0.1,
				specularity: 0.1,
				texture: new Texture('assets/stars.png'),
			}),
			road: new Material(new Textured_Phong(), {
				color: hex_color('#ffffff'),
				ambient: 0.5,
				diffusivity: 0.1,
				specularity: 0.1,
				texture: new Texture('assets/road.jpg'),
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

export class Assignment2 extends Base_Scene {
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

		// Key presses
		this.keyListeners = {};
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

	move_with_collision(deltax, deltay) {
		let newx = this.x + deltax;
		let newy = this.y + deltay;
		let len = this.colliders.length;
		for (let i = 0; i < len; i++) {
			// console.log(this.colliders[i]);
			let res = this.colliders[i].check_collision(newx, newy);

			if (res.resx != newx || res.resy != newy) {
				console.log(res);
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
		this.shapes.cube.draw(
			context,
			program_state,
			model_transform,
			this.materials.car
		);

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

		//curve front
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

		let curve1l_collider = new Curve_Collider(30, -100, 41, 2, 3);
		let curve1r_collider = new Curve_Collider(30, -100, 41, 2, 4);
		this.colliders[0] = curve1l_collider;
		this.colliders[1] = curve1r_collider;

		let curve2l_collider = new Curve_Collider(30, -100, 19, 2, 3);
		let curve2r_collider = new Curve_Collider(30, -100, 19, 2, 4);
		this.colliders[2] = curve2l_collider;
		this.colliders[3] = curve2r_collider;

		//curve back
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

		let curve3l_collider = new Curve_Collider(30, 100, 41, 2, 2);
		let curve3r_collider = new Curve_Collider(30, 100, 41, 2, 1);
		this.colliders[4] = curve3l_collider;
		this.colliders[5] = curve3r_collider;

		let curve4l_collider = new Curve_Collider(30, 100, 19, 2, 2);
		let curve4r_collider = new Curve_Collider(30, 100, 19, 2, 1);
		this.colliders[6] = curve4l_collider;
		this.colliders[7] = curve4r_collider;

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
		let track1l_collider = new Box_Collider(-11, -101, 2, 202);
		let track1r_collider = new Box_Collider(9, -101, 2, 202);
		this.colliders[8] = track1l_collider;
		this.colliders[9] = track1r_collider;

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
		let track2l_collider = new Box_Collider(49, -101, 2, 202);
		let track2r_collider = new Box_Collider(69, -101, 2, 202);
		this.colliders[10] = track2l_collider;
		this.colliders[11] = track2r_collider;
	}

    spawn_particles() {
        
    }

	display(context, program_state) {
		super.display(context, program_state);
		const blue = hex_color('#1a9ffa');
		let model_transform = Mat4.identity();
		this.draw_environment(context, program_state, model_transform);
		//player

		this.draw_car(context, program_state, model_transform);
	}
}
