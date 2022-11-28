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

export class Base_Scene extends Scene {
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

		this.white = new Material(new defs.Basic_Shader());
		this.colors = [];
	}

	display(context, program_state) {
		if (!context.scratchpad.controls) {
			this.children.push(
				(context.scratchpad.controls = new defs.Movement_Controls())
			);
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