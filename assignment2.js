import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;

class Cube extends Shape {
    constructor() {
        super("position", "normal",);
        // Loop 3 times (for each axis), and inside loop twice (for opposing cube sides):
        this.arrays.position = Vector3.cast(
            [-1, -1, -1], [1, -1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, -1], [-1, 1, -1], [1, 1, 1], [-1, 1, 1],
            [-1, -1, -1], [-1, -1, 1], [-1, 1, -1], [-1, 1, 1], [1, -1, 1], [1, -1, -1], [1, 1, 1], [1, 1, -1],
            [-1, -1, 1], [1, -1, 1], [-1, 1, 1], [1, 1, 1], [1, -1, -1], [-1, -1, -1], [1, 1, -1], [-1, 1, -1]);
        this.arrays.normal = Vector3.cast(
            [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0],
            [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0],
            [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1]);
        // Arrange the vertices into a square shape in texture space too:
        this.indices.push(0, 1, 2, 1, 3, 2, 4, 5, 6, 5, 7, 6, 8, 9, 10, 9, 11, 10, 12, 13,
            14, 13, 15, 14, 16, 17, 18, 17, 19, 18, 20, 21, 22, 21, 23, 22);
    }
}

class Cube_Outline extends Shape {
    constructor() {
        super("position", "color");
        //  TODO (Requirement 5).
        // When a set of lines is used in graphics, you should think of the list entries as
        // broken down into pairs; each pair of vertices will be drawn as a line segment.
        // Note: since the outline is rendered with Basic_shader, you need to redefine the position and color of each vertex
        this.arrays.position = Vector3.cast(
            [-1, -1, -1], [1, -1, -1], 
            [-1, -1, -1], [-1, -1, 1], 
            [-1, -1, -1], [-1, 1, -1], 
            [1, -1, 1], [-1, -1, 1],
            [1, -1, 1], [1, 1, 1],
            [1, -1, 1], [1, -1, -1],
            [1, 1, -1], [-1, 1, -1],
            [1, 1, -1], [1, -1, -1],
            [1, 1, -1], [1, 1, 1],
            [-1, 1, 1], [1, 1, 1],
            [-1, 1, 1], [-1, -1, 1],
            [-1, 1, 1], [-1, 1, -1]);
        this.arrays.color = Array(24).fill(0).map((x) => color(1, 1, 1, 1));
        
/*
  .cast([1, 1, 1, 1], [1, 1, 1, 1],[1, 1, 1, 1],[1, 1, 1, 1],[1, 1, 1, 1],
                                      [1, 1, 1, 1],[1, 1, 1, 1],[1, 1, 1, 1],[1, 1, 1, 1],[1, 1, 1, 1],
                                     [1, 1, 1, 1],[1, 1, 1, 1],[1, 1, 1, 1],[1, 1, 1, 1],[1, 1, 1, 1],
                                     [1, 1, 1, 1],[1, 1, 1, 1],[1, 1, 1, 1],[1, 1, 1, 1],[1, 1, 1, 1],
                                     [1, 1, 1, 1],[1, 1, 1, 1],[1, 1, 1, 1],[1, 1, 1, 1]);      
*/      
        this.indices = false;
    }
}

class Cube_Single_Strip extends Shape {
    constructor() {
        super("position", "normal");
        // TODO (Requirement 6)
        this.arrays.position = Vector3.cast(
			[1, 1, 1],
			[-1, 1, 1],
			[1, -1, 1],
			[-1, -1, 1],
			[1, 1, -1],
			[-1, 1, -1],
			[1, -1, -1],
			[-1, -1, -1]
		);
        this.arrays.normal = Vector3.cast(
			[1, 1, 1], 
			[-1, 1, 1], 
			[1, -1, 1], 
			[-1, -1, 1], 
			[1, 1, -1], 
			[-1, 1, -1], 
			[1, -1, -1], 
			[-1, -1, -1] 
		);
        this.indices = [
            4, 5, 0, 1, 3, 5, 7, 4, 6, 0, 2, 3, 6, 7
        ]
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
            'cube': new Cube(),
            'outline': new Cube_Outline(),
            'triangle': new Cube_Single_Strip(),
        };

        // *** Materials
        this.materials = {
            plastic: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#ffffff")}),
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
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(Mat4.translation(5, -10, -30));
        }
        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, 1, 100);

        // *** Lights: *** Values of vector or point lights.
        const light_position = vec4(0, 5, 5, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];
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
		this.z = 0;
		this.y = 1;
		this.rotx = 0
		this.roty = 0;
		this.rotz = 0;

		this.lastrotx = 0;

		// Physics (Local space)
		this.velx = 0;
		this.vely = 0;
		this.velz = 0;
    }
    
    set_colors() {
        // TODO:  Create a class member variable to store your cube's colors.
        // Hint:  You might need to create a member variable at somewhere to store the colors, using `this`.
        // Hint2: You can consider add a constructor for class Assignment2, or add member variables in Base_Scene's constructor.
        this.colors = [];
        this.colors.push(color(Math.random(), Math.random(), Math.random(), 1));
        for (let i = 1; i < 8; i++) {
            let new_color = color(Math.random(), Math.random(), Math.random(), 1);
            while (color === this.colors[i - 1]) {
                new_color = color(Math.random(), Math.random(), Math.random(), 1);
            }
            this.colors.push(new_color);
        }
    }

    make_control_panel() {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
        this.key_triggered_button("Change Colors", ["c"], this.set_colors);
        // Add a button for controlling the scene.
        this.key_triggered_button("Outline", ["o"], () => {
            // TODO:  Requirement 5b:  Set a flag here that will toggle your outline on and off
            this.outline = !this.outline;
        });
        this.key_triggered_button("Sit still", ["m"], () => {
            // TODO:  Requirement 3d:  Set a flag here that will toggle your swaying motion on and off.
			this.sway = !this.sway;
        });


		// Movement
		this.key_triggered_button("Accelerate", ["w"], () => {
			this.vely += 0.002;
        });
		this.key_triggered_button("Brake", ["s"], () => {
			this.vely -= 0.002;
        });
		this.key_triggered_button("Steer Left", ["a"], () => {
			// this.x -= 0.2;
			this.rotx += Math.PI / 32;
        });
		this.key_triggered_button("Steer Right", ["d"], () => {
			// this.x += 0.2;
			this.rotx -= Math.PI / 32;
        });
    }

    draw_box(context, program_state, model_transform, index) {
        // TODO:  Helper function for requirement 3 (see hint).
        //        This should make changes to the model_transform matrix, draw the next box, and return the newest model_transform.
        // Hint:  You can add more parameters for this function, like the desired color, index of the box, etc.
        let angle = 0;

		if (this.sway) {
			angle = 0.05 * Math.PI * index / 7 * (1 + Math.cos(program_state.animation_time * Math.PI * 2 / 3000));
		} else {
			angle = 0.05 * Math.PI * index / 7 * 2;
		}
		
        model_transform = model_transform.times(Mat4.translation(-1, 1.5, 0))
            .times(Mat4.rotation(angle, 45, 0, 1))
            .times(Mat4.translation(1, 1.5, 0))
            .times(Mat4.scale(1, 1.5, 1))  // Scale the size (Req 7)
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
        
        return model_transform.times(Mat4.scale(1, 1/1.5, 1));  // Unscale before return
    }

	draw_car(context, program_state, model_transform) {
		// model_transform = model_transform.times(Mat4.translation(this.x, this.y, this.z));
		this.vely = Math.max(Math.min(this.vely, 0.06), -0.01);

		// Linear Interpolation (for smoothing)
		let lerp_factor = 0.1;
		let lerp_rotx = this.lastrotx * (1 - lerp_factor) + this.rotx * lerp_factor;
		
		// Physics based movement: position calculations based on velocity (on xy plane)
		let deltax = this.vely * program_state.animation_delta_time * Math.sin(-1 * lerp_rotx);
		let deltay = this.vely * program_state.animation_delta_time * Math.cos(lerp_rotx);
		
		this.x += deltax;
		this.y += deltay;
		// this.z += this.velz * program_state.animation_delta_time
		
		model_transform = Mat4.identity();
		model_transform = model_transform.times(Mat4.translation(this.x, this.y, this.z));
		model_transform = model_transform.times(Mat4.rotation(lerp_rotx, 0, 0, 1));
		this.shapes.cube.draw(
			context,
			program_state,
			model_transform,
			this.materials.plastic.override({
				color: color(1, 0, 0, 1),
			})
		); 

		// program_state.set_camera(model_transform.times(Mat4.translation(15, 0, -10)));

		let camFollowx = -1 * Math.sin(-1 * lerp_rotx);
		let camFollowy = -1 * Math.cos(lerp_rotx);
		let camFollowDistance = 16;

		// look_at(P_eye, P_ref, P_top)
		let init_pos = Mat4.look_at(vec3(this.x + camFollowx * camFollowDistance, this.y + camFollowy * camFollowDistance, 5), vec3(this.x, this.y, this.z), vec3(0, 0, 1));
		program_state.set_camera(init_pos);

		
		this.lastrotx = lerp_rotx;
		// program_state.set_camera(model_transform.times(Mat4.translation(0, 5, -10)).times(Mat4.look_at(vec3(0, 5, 20), vec3(0, 0, 0), vec3(0, 1, 0))));
	}

    display(context, program_state) {
        super.display(context, program_state);
        const blue = hex_color("#1a9ffa");
        let model_transform = Mat4.identity();

        // Example for drawing a cube, you can remove this line if needed
        // this.shapes.cube.draw(context, program_state, model_transform, this.materials.plastic.override({color:this.colors[0]}));
        // TODO:  Draw your entire scene here.  Use this.draw_box( graphics_state, model_transform ) to call your helper.
        for (let i = 0; i < 8; i++) { 
            model_transform = this.draw_box(context, program_state, model_transform, i);
        }

		// Movement test
		model_transform = Mat4.identity();
		this.draw_car(context, program_state, model_transform);
		
        
    }
}